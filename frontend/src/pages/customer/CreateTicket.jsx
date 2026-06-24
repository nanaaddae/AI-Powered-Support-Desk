import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import api from '../../lib/api'

const categories = ['BILLING', 'TECHNICAL', 'ACCOUNT', 'SECURITY', 'OTHER']

const loadingSteps = [
  'Creating your ticket...',
  'Analyzing your issue with AI...',
  'Applying category and priority...',
]

export default function CreateTicket() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', description: '', category: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setLoadingStep(0)

    try {
      // Step 1
      setLoadingStep(0)
      const { data } = await api.post('/tickets', form)

      // Step 2 — AI is running server-side, simulate the visual steps
      setLoadingStep(1)
      await new Promise((res) => setTimeout(res, 1200))

      // Step 3
      setLoadingStep(2)
      await new Promise((res) => setTimeout(res, 900))

      navigate(`/customer/tickets/${data.id}`)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to create ticket')
      setLoading(false)
    }
  }

  return (
    <Layout>
      {/* AI Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
            {/* Spinner */}
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 rounded-full border-4 border-gray-700 border-t-indigo-500 animate-spin" />
            </div>

            {/* Step text */}
            <p className="text-white font-medium text-base mb-2">
              {loadingSteps[loadingStep]}
            </p>
            <p className="text-gray-500 text-sm">
              This will just take a moment
            </p>

            {/* Step dots */}
            <div className="flex justify-center gap-2 mt-6">
              {loadingSteps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === loadingStep
                      ? 'w-6 bg-indigo-500'
                      : i < loadingStep
                      ? 'w-1.5 bg-indigo-800'
                      : 'w-1.5 bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="p-8 max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">New ticket</h1>
          <p className="text-gray-400 text-sm mt-1">Describe your issue and we'll get back to you</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-950 border border-red-800 text-red-400 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Title</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="Brief summary of your issue"
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={6}
                placeholder="Describe your issue in detail..."
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg px-5 py-2.5 text-sm transition"
              >
                Submit ticket
              </button>
              <button
                type="button"
                onClick={() => navigate('/customer/tickets')}
                className="text-gray-400 hover:text-white text-sm transition"
              />
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}