import { useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Bell, Search } from 'lucide-react'

const Header = () => {
  const location = useLocation()
  const { user } = useAuth()

  const getPageTitle = () => {
    const path = location.pathname
    switch (path) {
      case '/dashboard':
        return 'Dashboard'
      case '/simulation':
        return 'Simulation'
      case '/drivers':
        return 'Drivers'
      case '/routes':
        return 'Routes'
      case '/orders':
        return 'Orders'
      default:
        return 'Dashboard'
    }
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="relative flex flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="search"
            placeholder="Search..."
            className="block h-full w-full border-0 py-0 pl-10 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
          />
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
          >
            <Bell className="h-6 w-6" />
          </button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />

          {/* Profile dropdown */}
          <div className="flex items-center gap-x-4">
            <div className="hidden sm:flex sm:flex-col sm:items-end">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-purple-600 font-medium text-sm">
                {user?.name?.charAt(0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
