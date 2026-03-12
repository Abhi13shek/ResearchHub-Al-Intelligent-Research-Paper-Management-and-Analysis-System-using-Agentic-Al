import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Loader2 } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'spline-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        url?: string
      }
    }
  }
}

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })

  const [registerData, setRegisterData] = useState({
    email: '',
    name: '',
    password: '',
    institution: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (isLogin) {
  const formData = new FormData()
  formData.append('username', loginData.email)
  formData.append('password', loginData.password)

  const response = await axios.post('http://127.0.0.1:8000/auth/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
  
  const { access_token } = response.data
  
  // Store token properly
  localStorage.setItem('auth_token', access_token)
  localStorage.setItem('token', access_token)
  
  // If you have useAuthStore
  if (login) {
    login(access_token)
  }
  
  toast.success('Login successful!')
  navigate('/home')
} else {
        // Register - send as JSON
        const response = await axios.post('http://127.0.0.1:8000/auth/register', registerData)
        toast.success('Registration successful! Please login.')
        setIsLogin(true)
        setLoginData({ email: registerData.email, password: '' })
      }
    } catch (err: any) {
      console.error('Auth error:', err)
      const errorMessage = err.response?.data?.detail || 'Authentication failed'
      setError(errorMessage)
      toast.error(String(errorMessage)) // ✅ Convert to string
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#090712]">
      {/* Spline Background */}
      <div className="absolute inset-0 bg-black bg-opacity-60 z-0 pointer-events-none">
        <div className="absolute inset-0 z-10">
          <spline-viewer url="https://prod.spline.design/VeZ7-uCiZTMBx4tE/scene.splinecode"></spline-viewer>
        </div>
      </div>

      {/* Login Form */}
      <div className="relative z-10 w-full max-w-md mx-4 ml-auto mr-8">
        <div className="bg-black/40 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-300">
              {isLogin ? 'Sign in to continue to ResearchHub AI' : 'Join ResearchHub AI today'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={isLogin ? loginData.email : registerData.email}
                onChange={(e) => isLogin 
                  ? setLoginData({ ...loginData, email: e.target.value })
                  : setRegisterData({ ...registerData, email: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={isLogin ? loginData.password : registerData.password}
                onChange={(e) => isLogin
                  ? setLoginData({ ...loginData, password: e.target.value })
                  : setRegisterData({ ...registerData, password: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Institution (Optional)
                </label>
                <input
                  type="text"
                  value={registerData.institution}
                  onChange={(e) => setRegisterData({ ...registerData, institution: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="Your University"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-violet-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
              }}
              className="text-violet-300 hover:text-violet-200 text-sm transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}




