import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { routesAPI } from '../services/api'
import DataTable from '../components/DataTable'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'

interface Route {
  _id: string
  routeId: string
  distance: number
  trafficLevel: 'Low' | 'Medium' | 'High'
  baseTime: number
  fuelCost?: number
  adjustedTime?: number
}

interface RouteForm {
  routeId: string
  distance: number
  trafficLevel: 'Low' | 'Medium' | 'High'
  baseTime: number
}

const Routes = () => {
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRoute, setEditingRoute] = useState<Route | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RouteForm>()

  useEffect(() => {
    fetchRoutes()
  }, [])

  const fetchRoutes = async () => {
    try {
      const response = await routesAPI.getAll()
      setRoutes(response.data.data)
    } catch (error) {
      toast.error('Failed to fetch routes')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: RouteForm) => {
    try {
      if (editingRoute) {
        await routesAPI.update(editingRoute._id, data)
        toast.success('Route updated successfully')
      } else {
        await routesAPI.create(data)
        toast.success('Route created successfully')
      }
      fetchRoutes()
      closeModal()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed')
    }
  }

  const handleEdit = (route: Route) => {
    setEditingRoute(route)
    reset({
      routeId: route.routeId,
      distance: route.distance,
      trafficLevel: route.trafficLevel,
      baseTime: route.baseTime,
    })
    setShowModal(true)
  }

  const handleDelete = async (route: Route) => {
    try {
      await routesAPI.delete(route._id)
      toast.success('Route deleted successfully')
      fetchRoutes()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete route')
    }
  }

  const handleAdd = () => {
    setEditingRoute(null)
    reset({
      routeId: '',
      distance: 0,
      trafficLevel: 'Medium',
      baseTime: 0,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingRoute(null)
    reset()
  }

  const columns = [
    { key: 'routeId', label: 'Route ID' },
    { key: 'distance', label: 'Distance (km)' },
    { key: 'trafficLevel', label: 'Traffic Level' },
    { key: 'baseTime', label: 'Base Time (min)' },
    {
      key: 'fuelCost',
      label: 'Fuel Cost (₹)',
      render: (value: number, row: Route) => {
        const baseCost = row.distance * 5
        const surcharge = row.trafficLevel === 'High' ? row.distance * 2 : 0
        return (baseCost + surcharge).toFixed(0)
      },
    },
    {
      key: 'adjustedTime',
      label: 'Adjusted Time (min)',
      render: (value: number, row: Route) => {
        const multipliers = { Low: 1.0, Medium: 1.2, High: 1.5 }
        return Math.round(row.baseTime * multipliers[row.trafficLevel])
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Routes</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage delivery routes and their specifications
        </p>
      </div>

      <DataTable
        data={routes}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        title="Routes"
        loading={loading}
      />

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
                    {editingRoute ? 'Edit Route' : 'Add New Route'}
                  </h3>
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label htmlFor="routeId" className="block text-sm font-medium text-gray-700">
                      Route ID
                    </label>
                    <input
                      type="text"
                      id="routeId"
                      {...register('routeId', {
                        required: 'Route ID is required',
                        pattern: { value: /^[A-Z0-9]+$/, message: 'Route ID must be uppercase letters and numbers' },
                      })}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm ${
                        errors.routeId ? 'border-red-300' : ''
                      }`}
                      placeholder="e.g., R001"
                    />
                    {errors.routeId && (
                      <p className="mt-1 text-sm text-red-600">{errors.routeId.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="distance" className="block text-sm font-medium text-gray-700">
                      Distance (km)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      id="distance"
                      {...register('distance', {
                        required: 'Distance is required',
                        min: { value: 0.1, message: 'Distance must be greater than 0' },
                        max: { value: 1000, message: 'Distance cannot exceed 1000 km' },
                      })}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm ${
                        errors.distance ? 'border-red-300' : ''
                      }`}
                      placeholder="Enter distance in km"
                    />
                    {errors.distance && (
                      <p className="mt-1 text-sm text-red-600">{errors.distance.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="trafficLevel" className="block text-sm font-medium text-gray-700">
                      Traffic Level
                    </label>
                    <select
                      id="trafficLevel"
                      {...register('trafficLevel', { required: 'Traffic level is required' })}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm ${
                        errors.trafficLevel ? 'border-red-300' : ''
                      }`}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                    {errors.trafficLevel && (
                      <p className="mt-1 text-sm text-red-600">{errors.trafficLevel.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="baseTime" className="block text-sm font-medium text-gray-700">
                      Base Time (minutes)
                    </label>
                    <input
                      type="number"
                      id="baseTime"
                      {...register('baseTime', {
                        required: 'Base time is required',
                        min: { value: 1, message: 'Base time must be at least 1 minute' },
                        max: { value: 480, message: 'Base time cannot exceed 480 minutes' },
                      })}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm ${
                        errors.baseTime ? 'border-red-300' : ''
                      }`}
                      placeholder="Enter base time in minutes"
                    />
                    {errors.baseTime && (
                      <p className="mt-1 text-sm text-red-600">{errors.baseTime.message}</p>
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
                      {editingRoute ? 'Update' : 'Create'}
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

export default Routes
