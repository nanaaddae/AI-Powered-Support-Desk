import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import api from '../../lib/api'

const statusColors = {
  OPEN: 'bg-blue-950 text-blue-400 border-blue-800',
  IN_PROGRESS: 'bg-yellow-950 text-yellow-400 border-yellow-800',
  RESOLVED: 'bg-green-950 text-green-400 border-green-800',
  CLOSED: 'bg-gray-800 text-gray-400 border-gray-700',
}

const priorityColors = {
  LOW: 'text-gray-400',
  MEDIUM: 'text-blue-400',
  HIGH: 'text-orange-400',
  CRITICAL: 'text-red-400',
}

// Filter options
const STATUS_OPTIONS = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']
const PRIORITY_OPTIONS = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const CATEGORY_OPTIONS = ['ALL', 'BILLING', 'TECHNICAL', 'ACCOUNT', 'SECURITY', 'OTHER']

export default function AllTickets() {
  const [data, setData] = useState({ content: [], totalPages: 0, totalElements: 0 })
  const [agents, setAgents] = useState([])
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [assigningId, setAssigningId] = useState(null)
  
  // Filter states
  const [filters, setFilters] = useState({
    status: 'ALL',
    priority: 'ALL',
    category: 'ALL',
    search: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    let isCancelled = false

    const fetchData = async () => {
      setLoading(true)
      try {
        // Build query params
        const params = new URLSearchParams({
          page: page,
          size: 10
        })
        
        // Add filters if not 'ALL'
        if (filters.status !== 'ALL') params.append('status', filters.status)
        if (filters.priority !== 'ALL') params.append('priority', filters.priority)
        if (filters.category !== 'ALL') params.append('category', filters.category)
        if (filters.search.trim()) params.append('search', filters.search.trim())
        
        const [ticketsRes, agentsRes] = await Promise.all([
          api.get(`/tickets/all?${params.toString()}`),
          api.get('/users?role=AGENT'),
        ])
        if (!isCancelled) {
          setData(ticketsRes.data)
          setAgents(agentsRes.data)
        }
      } catch (error) {
        console.error('Error fetching tickets:', error)
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isCancelled = true
    }
  }, [page, filters]) // Re-fetch when page or filters change

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(0) // Reset to first page when filter changes
  }

  const clearFilters = () => {
    setFilters({
      status: 'ALL',
      priority: 'ALL',
      category: 'ALL',
      search: ''
    })
    setPage(0)
  }

  const handleAssign = async (ticketId, agentId) => {
    setAssigningId(ticketId)
    try {
      const { data: updated } = await api.patch(`/tickets/${ticketId}/assign`, { agentId })
      setData((prev) => ({
        ...prev,
        content: prev.content.map((t) => t.id === ticketId ? updated : t)
      }))
    } finally {
      setAssigningId(null)
    }
  }

  // Count active filters
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'search') return value.trim().length > 0
    return value !== 'ALL'
  }).length

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white">All Tickets</h1>
              <p className="text-gray-400 text-sm mt-1">
                {data.totalElements} ticket{data.totalElements !== 1 ? 's' : ''} total
                {activeFilterCount > 0 && ` · ${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active`}
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:text-white hover:border-gray-600 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mb-6 p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Search</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Title, description, or email..."
                  className="w-full bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {STATUS_OPTIONS.map(status => (
                    <option key={status} value={status}>
                      {status === 'ALL' ? 'All Statuses' : status.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {PRIORITY_OPTIONS.map(priority => (
                    <option key={priority} value={priority}>
                      {priority === 'ALL' ? 'All Priorities' : priority}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {CATEGORY_OPTIONS.map(category => (
                    <option key={category} value={category}>
                      {category === 'ALL' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-700">
              <button
                onClick={clearFilters}
                className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg border border-gray-700 hover:border-gray-600 transition"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="text-sm px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="px-5 py-16 text-center text-gray-500 text-sm">Loading...</div>
          ) : data.content.length === 0 ? (
            <div className="px-5 py-16 text-center text-gray-500 text-sm">
              No tickets found
              {activeFilterCount > 0 && ' matching your filters'}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Title</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Customer</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Category</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Priority</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Status</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Assigned to</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {data.content.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-gray-800 transition">
                        <td className="px-5 py-3.5">
                          <Link to={`/admin/tickets/${ticket.id}`} className="text-white hover:text-indigo-400 transition">
                            {ticket.title}
                          </Link>
                        </td>
                        <td className="px-5 py-3.5 text-gray-400">{ticket.customerName}</td>
                        <td className="px-5 py-3.5 text-gray-400">{ticket.category}</td>
                        <td className={`px-5 py-3.5 font-medium ${priorityColors[ticket.priority]}`}>
                          {ticket.priority}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full border whitespace-nowrap inline-block ${statusColors[ticket.status]}`}>
                            {ticket.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <select
                            value={ticket.assignedAgentId ?? ''}
                            onChange={(e) => handleAssign(ticket.id, e.target.value)}
                            disabled={assigningId === ticket.id}
                            className="bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                          >
                            <option value="">Unassigned</option>
                            {agents.map((agent) => (
                              <option key={agent.id} value={agent.id}>{agent.firstName} {agent.lastName}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data.totalPages > 1 && (
                <div className="px-5 py-4 border-t border-gray-800 flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Page {page + 1} of {data.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => p - 1)}
                      disabled={page === 0}
                      className="text-xs px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      Previous
                    </button>
                    {Array.from({ length: data.totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                          page === i
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page === data.totalPages - 1}
                      className="text-xs px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}