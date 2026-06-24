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

export default function MyTickets() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/tickets/my')
      .then((r) => setTickets(r.data))
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
            <h1 className="text-2xl font-semibold text-white">My Tickets</h1>
            <p className="text-gray-400 text-sm mt-1">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''} total</p>
          </div>
          <Link
            to="/customer/tickets/new"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            New ticket
          </Link>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {tickets.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <p className="text-gray-400 text-sm mb-4">You haven't submitted any tickets yet.</p>
              <Link
                to="/customer/tickets/new"
className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition"              >
                Create your first ticket
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Title</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Category</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Priority</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-800 transition cursor-pointer">
                    <td className="px-5 py-3.5">
                      <Link to={`/customer/tickets/${ticket.id}`} className="text-white hover:text-indigo-400 transition">
                        {ticket.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400">{ticket.category}</td>
                    <td className={`px-5 py-3.5 font-medium ${priorityColors[ticket.priority]}`}>
                      {ticket.priority}
                    </td>
                    <td className="px-5 py-3.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full border whitespace-nowrap inline-block ${statusColors[ticket.status]}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  )
}