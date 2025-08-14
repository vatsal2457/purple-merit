import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { ordersAPI, routesAPI } from '../services/api'
import DataTable from '../components/DataTable'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'

interface Order {
  _id: string
  orderId: string
  value: number
  assignedRoute: string
  deliveryTimestamp: string
  assignedDriver?: string
  actualDeliveryTime?: string
  isDelivered?: boolean
  deliveryStatus?: string
  isHighValue?: boolean
}

interface OrderForm {
  orderId: string
  value: number
  assignedRoute: string
  deliveryTimestamp: string
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [routes, setRoutes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OrderForm>()

  useEffect(() => {
    fetchOrders()
    fetchRoutes()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getAll()
      setOrders(response.data.data)
    } catch (error) {
      toast.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const fetchRoutes = async () => {
    try {
      const response = await routesAPI.getAll()
      setRoutes(response.data.data)
    } catch (error) {
      console.error('Failed to fetch routes')
    }
  }

  const onSubmit = async (data: OrderForm) => {
    try {
      if (editingOrder) {
        await ordersAPI.update(editingOrder._id, data)
        toast.success('Order updated successfully')
      } else {
        await ordersAPI.create(data)
        toast.success('Order created successfully')
      }
      fetchOrders()
      closeModal()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed')
    }
  }

  const handleEdit = (order: Order) => {
    setEditingOrder(order)
    reset({
      orderId: order.orderId,
      value: order.value,
      assignedRoute: order.assignedRoute,
      deliveryTimestamp: order.deliveryTimestamp.split('T')[0] + 'T' + order.deliveryTimestamp.split('T')[1].substring(0, 5),
    })
    setShowModal(true)
  }

  const handleDelete = async (order: Order) => {
    try {
      await ordersAPI.delete(order._id)
      toast.success('Order deleted successfully')
      fetchOrders()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete order')
    }
  }

  const handleAdd = () => {
    setEditingOrder(null)
    reset({
      orderId: '',
      value: 0,
      assignedRoute: '',
      deliveryTimestamp: '',
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingOrder(null)
    reset()
  }

  const columns = [
    { key: 'orderId', label: 'Order ID' },
    { key: 'value', label: 'Value (₹)', render: (value: number) => `₹${value.toLocaleString()}` },
    { key: 'assignedRoute', label: 'Route' },
    {
      key: 'deliveryTimestamp',
      label: 'Delivery Time',
      render: (value: string,row: Order) => new Date(value).toLocaleString(),
    },
    {
      key: 'deliveryStatus',
      label: 'Status',
      render: (value: boolean, row: Order) => {
        if (row.isDelivered) {
          const isOnTime = new Date(row.actualDeliveryTime || '') <= new Date(row.deliveryTimestamp)
          return (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              isOnTime ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isOnTime ? 'Delivered (On Time)' : 'Delivered (Late)'}
            </span>
          )
        }
        return (
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
            Pending
          </span>
        )
      },
    },
    {
      key: 'isHighValue',
      label: 'Type',
      render: (value: boolean, row: Order) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          row.value > 1000 ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {row.value > 1000 ? 'High Value' : 'Standard'}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage delivery orders and their status
        </p>
      </div>

      <DataTable
        data={orders}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        title="Orders"
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
                    {editingOrder ? 'Edit Order' : 'Add New Order'}
                  </h3>
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label htmlFor="orderId" className="block text-sm font-medium text-gray-700">
                      Order ID
                    </label>
                    <input
                      type="text"
                      id="orderId"
                      {...register('orderId', {
                        required: 'Order ID is required',
                        pattern: { value: /^[A-Z0-9]+$/, message: 'Order ID must be uppercase letters and numbers' },
                      })}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm ${
                        errors.orderId ? 'border-red-300' : ''
                      }`}
                      placeholder="e.g., O001"
                    />
                    {errors.orderId && (
                      <p className="mt-1 text-sm text-red-600">{errors.orderId.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="value" className="block text-sm font-medium text-gray-700">
                      Order Value (₹)
                    </label>
                    <input
                      type="number"
                      id="value"
                      {...register('value', {
                        required: 'Order value is required',
                        min: { value: 1, message: 'Order value must be at least ₹1' },
                        max: { value: 100000, message: 'Order value cannot exceed ₹100,000' },
                      })}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm ${
                        errors.value ? 'border-red-300' : ''
                      }`}
                      placeholder="Enter order value"
                    />
                    {errors.value && (
                      <p className="mt-1 text-sm text-red-600">{errors.value.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="assignedRoute" className="block text-sm font-medium text-gray-700">
                      Assigned Route
                    </label>
                    <select
                      id="assignedRoute"
                      {...register('assignedRoute', { required: 'Assigned route is required' })}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm ${
                        errors.assignedRoute ? 'border-red-300' : ''
                      }`}
                    >
                      <option value="">Select a route</option>
                      {routes.map((route) => (
                        <option key={route._id} value={route.routeId}>
                          {route.routeId} - {route.distance}km ({route.trafficLevel})
                        </option>
                      ))}
                    </select>
                    {errors.assignedRoute && (
                      <p className="mt-1 text-sm text-red-600">{errors.assignedRoute.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="deliveryTimestamp" className="block text-sm font-medium text-gray-700">
                      Delivery Timestamp
                    </label>
                    <input
                      type="datetime-local"
                      id="deliveryTimestamp"
                      {...register('deliveryTimestamp', { required: 'Delivery timestamp is required' })}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm ${
                        errors.deliveryTimestamp ? 'border-red-300' : ''
                      }`}
                    />
                    {errors.deliveryTimestamp && (
                      <p className="mt-1 text-sm text-red-600">{errors.deliveryTimestamp.message}</p>
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
                      {editingOrder ? 'Update' : 'Create'}
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

export default Orders
