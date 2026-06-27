import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import { jwtDecode } from 'jwt-decode'

const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@supportdesk.com', color: 'text-red-400 border-red-800 hover:bg-red-950' },
  { label: 'Team Lead', email: 'teamlead@supportdesk.com', color: 'text-purple-400 border-purple-800 hover:bg-purple-950' },
  { label: 'Agent', email: 'agent@supportdesk.com', color: 'text-blue-400 border-blue-800 hover:bg-blue-950' },
  { label: 'Customer', email: 'customer@supportdesk.com', color: 'text-green-400 border-green-800 hover:bg-green-950' },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(null)
  const [slowWarning, setSlowWarning] = useState(false)
  const slowTimerRef = useRef(null)

  const isLoading = loading || demoLoading !== null

  // Start slow warning timer whenever a login is in progress
  useEffect(() => {
    if (isLoading) {
      slowTimerRef.current = setTimeout(() => setSlowWarning(true), 4000)
    } else {
      clearTimeout(slowTimerRef.current)
      setSlowWarning(false)
    }
    return () => clearTimeout(slowTimerRef.current)
  }, [isLoading])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const doLogin = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    const decoded = jwtDecode(data.accessToken)
    setAuth(data.accessToken, { email: decoded.sub, role: decoded.role ?? 'CUSTOMER' })
    navigate('/')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await doLogin(form.email, form.password)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async (email) => {
    setError(null)
    setDemoLoading(email)
    try {
      await doLogin(email, 'password123')
    } catch (err) {
      setError('Demo login failed — make sure the backend is running')
    } finally {
      setDemoLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-white">NexusDesk</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Slow warning banner */}
        {slowWarning && (
          <div className="bg-yellow-950 border border-yellow-800 text-yellow-400 text-sm rounded-lg px-4 py-3 mb-4 text-center">
            The server is waking up from sleep — this can take up to 2 minutes on the free tier. Hang tight!
          </div>
        )}

        {/* Demo accounts */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-4">
          <p className="text-xs font-medium text-gray-500 mb-3">Try a demo account</p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                onClick={() => handleDemoLogin(account.email)}
                disabled={isLoading}
                className={`text-sm font-medium px-4 py-2.5 rounded-lg border transition disabled:opacity-50 disabled:cursor-not-allowed ${account.color}`}
              >
                {demoLoading === account.email ? 'Signing in...' : account.label}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-800" />
          <span className="text-xs text-gray-600">or sign in manually</span>
          <div className="flex-1 h-px bg-gray-800" />
        </div>

        {/* Login form */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {error && (
              <div className="bg-red-950 border border-red-800 text-red-400 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg px-4 py-2.5 text-sm transition"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 transition">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}