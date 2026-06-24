
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from "../../components/Layout";
import api from "../../lib/api";
const statusColors = {
  OPEN: 'bg-blue-950 text-blue-400 border-blue-800',
  IN_PROGRESS: 'bg-yellow-950 text-yellow-400 border-yellow-800',
  RESOLVED: 'bg-green-950 text-green-400 border-green-800',
  CLOSED: 'bg-gray-800 text-gray-400 border-gray-700',
}

export default function CustomerDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/customer')
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
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Overview of your support tickets</p>
          </div>
          <Link
            to="/customer/tickets/new"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            New ticket
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {Object.entries(data?.ticketsByStatus ?? {}).map(([status, count]) => (
            <div key={status} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-2xl font-semibold text-white">{count}</p>
              <p className="text-xs text-gray-500 mt-1">{status.replace('_', ' ')}</p>
            </div>
          ))}
        </div>

        {/* Recent tickets */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-sm font-medium text-white">Recent tickets</h2>
            <Link to="/customer/tickets" className="text-xs text-indigo-400 hover:text-indigo-300 transition">
              View all
            </Link>
          </div>
          {data?.recentTickets?.length === 0 ? (
            <div className="px-5 py-10 text-center text-gray-500 text-sm">
              No tickets yet.{' '}
              <Link to="/customer/tickets/new" className="text-indigo-400 hover:text-indigo-300">
                Create your first one.
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {data?.recentTickets?.map((ticket) => (
                <Link
                  key={ticket.id}
                  to={`/customer/tickets/${ticket.id}`}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-800 transition"
                >
                  <div>
                    <p className="text-sm text-white">{ticket.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{ticket.category}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[ticket.status]}`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
