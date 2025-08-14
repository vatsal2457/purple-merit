import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { simulationAPI } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Play, RefreshCw, TrendingUp, Clock, DollarSign, Users, Package } from 'lucide-react'
import toast from 'react-hot-toast'

interface SimulationForm {
  availableDrivers: number
  startTime: string
  maxHoursPerDay: number
}

interface SimulationResult {
  totalProfit: number
  efficiencyScore: number
  onTimeDeliveries: number
  lateDeliveries: number
  fuelCost: number
  penalties: number
  bonuses: number
  driverAssignments: any[]
  orderResults: any[]
}

const Simulation = () => {
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SimulationForm>({
    defaultValues: {
      availableDrivers: 5,
      startTime: '08:00',
      maxHoursPerDay: 10,
    },
  })

  const onSubmit = async (data: SimulationForm) => {
    setIsRunning(true)
    try {
      const response = await simulationAPI.run(data)
      setResult(response.data.data)
      setShowResults(true)
      toast.success('Simulation completed successfully!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Simulation failed')
    } finally {
      setIsRunning(false)
    }
  }

  const resetSimulation = () => {
    setResult(null)
    setShowResults(false)
    reset()
  }

  const deliveryData = result ? [
    { name: 'On Time', value: result.onTimeDeliveries, color: '#10b981' },
    { name: 'Late', value: result.lateDeliveries, color: '#ef4444' },
  ] : []

  const costBreakdown = result ? [
    { name: 'Fuel Cost', value: result.fuelCost, color: '#f59e0b' },
    { name: 'Penalties', value: result.penalties, color: '#ef4444' },
    { name: 'Bonuses', value: result.bonuses, color: '#10b981' },
  ] : []

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Simulation</h1>
        <p className="mt-1 text-sm text-gray-500">
          Run delivery simulations to optimize your logistics operations
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Simulation Form */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Simulation Parameters</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="availableDrivers" className="block text-sm font-medium text-gray-700">
                Available Drivers
              </label>
              <input
                type="number"
                id="availableDrivers"
                {...register('availableDrivers', {
                  required: 'Available drivers is required',
                  min: { value: 1, message: 'Must be at least 1' },
                  max: { value: 50, message: 'Cannot exceed 50' },
                })}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm ${
                  errors.availableDrivers ? 'border-red-300' : ''
                }`}
                placeholder="Enter number of drivers"
              />
              {errors.availableDrivers && (
                <p className="mt-1 text-sm text-red-600">{errors.availableDrivers.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                Start Time
              </label>
              <input
                type="time"
                id="startTime"
                {...register('startTime', {
                  required: 'Start time is required',
                })}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm ${
                  errors.startTime ? 'border-red-300' : ''
                }`}
              />
              {errors.startTime && (
                <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="maxHoursPerDay" className="block text-sm font-medium text-gray-700">
                Max Hours Per Day
              </label>
              <input
                type="number"
                id="maxHoursPerDay"
                {...register('maxHoursPerDay', {
                  required: 'Max hours per day is required',
                  min: { value: 1, message: 'Must be at least 1' },
                  max: { value: 24, message: 'Cannot exceed 24' },
                })}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm ${
                  errors.maxHoursPerDay ? 'border-red-300' : ''
                }`}
                placeholder="Enter max hours per day"
              />
              {errors.maxHoursPerDay && (
                <p className="mt-1 text-sm text-red-600">{errors.maxHoursPerDay.message}</p>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isRunning}
                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRunning ? (
                  <div className="flex items-center justify-center">
                    <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                    Running...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Play className="h-4 w-4 mr-2" />
                    Run Simulation
                  </div>
                )}
              </button>
              <button
                type="button"
                onClick={resetSimulation}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Results Summary */}
        {showResults && result && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Simulation Results</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">₹{result.totalProfit.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Total Profit</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{result.efficiencyScore}%</div>
                <div className="text-sm text-gray-500">Efficiency Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{result.onTimeDeliveries}</div>
                <div className="text-sm text-gray-500">On Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{result.lateDeliveries}</div>
                <div className="text-sm text-gray-500">Late</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Charts */}
      {showResults && result && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Delivery Performance */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deliveryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deliveryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cost Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={costBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ₹${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {costBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Driver Assignments Table */}
      {showResults && result && result.driverAssignments && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Driver Assignments</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Distance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {result.driverAssignments.map((driver, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {driver.driverName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {driver.assignedOrders.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {driver.totalHours.toFixed(1)}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {driver.totalDistance.toFixed(1)}km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        driver.isFatigued
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {driver.isFatigued ? 'Fatigued' : 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Simulation
