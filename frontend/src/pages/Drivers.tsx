import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { driversAPI } from '../services/api'
import DataTable from '../components/DataTable'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'

interface Driver {
  _id: string
  name: string
  currentShiftHours: number
  pastWeekHours: number
  totalWeekHours?: number
  isFatigued?: boolean
}

interface DriverForm {
  name: string
  currentShiftHours: number
  pastWeekHours: number
}

const Drivers = () => {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DriverForm>()

  useEffect(() => {
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
    try {
      const response = await driversAPI.getAll()
      setDrivers(response.data.data)
    } catch (error) {
      toast.error('Failed to fetch drivers')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: DriverForm) => {
    try {
      if (editingDriver) {
        await driversAPI.update(editingDriver._id, data)
        toast.success('Driver updated successfully')
      } else {
        await driversAPI.create(data)
        toast.success('Driver created successfully')
      }
      fetchDrivers()
      closeModal()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed')
    }
  }

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver)
    reset({
      name: driver.name,
      currentShiftHours: driver.currentShiftHours,
      pastWeekHours: driver.pastWeekHours,
    })
    setShowModal(true)
  }

  const handleDelete = async (driver: Driver) => {
    try {
      await driversAPI.delete(driver._id)
      toast.success('Driver deleted successfully')
      fetchDrivers()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete driver')
    }
  }

  const handleAdd = () => {
    setEditingDriver(null)
    reset({
      name: '',
      currentShiftHours: 0,
      pastWeekHours: 0,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingDriver(null)
    reset()
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'currentShiftHours', label: 'Current Shift Hours' },
    { key: 'pastWeekHours', label: 'Past Week Hours' },
    {
      key: 'totalWeekHours',
      label: 'Total Week Hours',
      render: (value: number, row: Driver) => (row.pastWeekHours + row.currentShiftHours).toFixed(1),
    },
    {
      key: 'isFatigued',
      label: 'Status',
      render: (value: boolean, row: Driver) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            row.currentShiftHours > 8
              ? 'bg-red-100 text-red-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {row.currentShiftHours > 8 ? 'Fatigued' : 'Active'}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Drivers</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your delivery drivers and their work schedules
        </p>
      </div>

      {/* Data Table */}
      <DataTable
        data={drivers}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        title="Drivers"
        loading={loading}
      />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingDriver ? 'Edit Driver' : 'Add New Driver'}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      {...register('name', {
                        required: 'Name is required',
                        minLength: { value: 2, message: 'Name must be at least 2 characters' },
                      })}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm ${
                        errors.name ? 'border-red-300' : ''
                      }`}
                      placeholder="Enter driver name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="currentShiftHours" className="block text-sm font-medium text-gray-700">
                      Current Shift Hours
                    </label>
                    <input
                      type="number"
                      id="currentShiftHours"
                      {...register('currentShiftHours', {
                        required: 'Current shift hours is required',
                        min: { value: 0, message: 'Must be at least 0' },
                        max: { value: 24, message: 'Cannot exceed 24' },
                      })}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm ${
                        errors.currentShiftHours ? 'border-red-300' : ''
                      }`}
                      placeholder="Enter current shift hours"
                    />
                    {errors.currentShiftHours && (
                      <p className="mt-1 text-sm text-red-600">{errors.currentShiftHours.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="pastWeekHours" className="block text-sm font-medium text-gray-700">
                      Past Week Hours
                    </label>
                    <input
                      type="number"
                      id="pastWeekHours"
                      {...register('pastWeekHours', {
                        required: 'Past week hours is required',
                        min: { value: 0, message: 'Must be at least 0' },
                        max: { value: 168, message: 'Cannot exceed 168' },
                      })}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm ${
                        errors.pastWeekHours ? 'border-red-300' : ''
                      }`}
                      placeholder="Enter past week hours"
                    />
                    {errors.pastWeekHours && (
                      <p className="mt-1 text-sm text-red-600">{errors.pastWeekHours.message}</p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      {editingDriver ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Drivers
