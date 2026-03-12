import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, LayoutDashboard, Search, Cpu, FileText, User, Settings, LogOut, Upload } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await authAPI.getCurrentUser()
      setUser(response.data)
    } catch (error) {
      console.error('Failed to fetch user')
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Search, label: 'Search Papers', path: '/search' },
    { icon: Cpu, label: 'AI Tools', path: '/ai-tools' },
    { icon: Upload, label: 'Upload PDF', path: '/upload' }, // ADD THIS
    { icon: FileText, label: 'DocSpace', path: '/docspace' },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-violet-600">ResearchHub AI</h1>
        </div>
        <nav className="px-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition ${
                location.pathname === item.path
                  ? 'bg-violet-100 text-violet-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-end">
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-gray-900">
                    {user?.name || 'User Account'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user?.email || 'Loading...'}
                  </div>
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-3 hover:bg-gray-50 text-gray-700"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <User className="w-5 h-5 mr-3" />
                    <span className="font-medium">Profile</span>
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-3 hover:bg-gray-50 text-gray-700"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <Settings className="w-5 h-5 mr-3" />
                    <span className="font-medium">Settings</span>
                  </Link>
                  <hr className="my-2" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 hover:bg-red-50 text-red-600"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}


