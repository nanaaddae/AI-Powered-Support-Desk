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

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/admin')
      .then((r) => setData(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <Layout>
      <div className="p-8 text-gray-500 text-sm">Loading...</div>
    </Layout>
  )

  return (
    <Layout>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">System-wide overview</p>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-2xl font-semibold text-white">{data?.totalTickets ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">Total tickets</p>
          </div>
          {Object.entries(data?.ticketsByStatus ?? {}).map(([status, count]) => (
            <div key={status} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-2xl font-semibold text-white">{count}</p>
              <p className="text-xs text-gray-500 mt-1">{status.replace('_', ' ')}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          {/* By priority */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-sm font-medium text-white mb-4">By priority</h2>
            <div className="space-y-2">
              {Object.entries(data?.ticketsByPriority ?? {}).map(([priority, count]) => (
                <div key={priority} className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${priorityColors[priority]}`}>{priority}</span>
                  <span className="text-sm text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* By category */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-sm font-medium text-white mb-4">By category</h2>
            <div className="space-y-2">
              {Object.entries(data?.ticketsByCategory ?? {}).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{category}</span>
                  <span className="text-sm text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Agent workloads */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl mb-6">
          <div className="px-5 py-4 border-b border-gray-800">
            <h2 className="text-sm font-medium text-white">Agent workload</h2>
          </div>
          {data?.agentWorkloads?.length === 0 ? (
            <div className="px-5 py-8 text-center text-gray-500 text-sm">No agents yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Agent</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Open</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">In Progress</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {data?.agentWorkloads?.map((agent) => (
                  <tr key={agent.agentId}>
                    <td className="px-5 py-3.5 text-white">{agent.agentName}</td>
                    <td className="px-5 py-3.5 text-blue-400">{agent.openTickets}</td>
                    <td className="px-5 py-3.5 text-yellow-400">{agent.inProgressTickets}</td>
                    <td className="px-5 py-3.5 text-gray-400">{agent.totalAssigned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent tickets */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-sm font-medium text-white">Recent tickets</h2>
            <Link to="/admin/tickets" className="text-xs text-indigo-400 hover:text-indigo-300 transition">
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-800">
            {data?.recentTickets?.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm text-white">{ticket.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{ticket.customerName} · {ticket.category}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[ticket.status]}`}>
                  {ticket.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}