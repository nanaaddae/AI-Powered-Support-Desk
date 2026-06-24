import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import api from '../../lib/api'
 
const actionColors = {
  TICKET_CREATED: 'bg-blue-950 text-blue-400 border-blue-800',
  TICKET_STATUS_CHANGED: 'bg-yellow-950 text-yellow-400 border-yellow-800',
  TICKET_ASSIGNED: 'bg-purple-950 text-purple-400 border-purple-800',
  TICKET_PRIORITY_CHANGED: 'bg-orange-950 text-orange-400 border-orange-800',
  TICKET_CLOSED: 'bg-gray-800 text-gray-400 border-gray-700',
  TICKET_REOPENED: 'bg-green-950 text-green-400 border-green-800',
  COMMENT_ADDED: 'bg-indigo-950 text-indigo-400 border-indigo-800',
  COMMENT_DELETED: 'bg-red-950 text-red-400 border-red-800',
  USER_REGISTERED: 'bg-green-950 text-green-400 border-green-800',
  USER_ROLE_CHANGED: 'bg-orange-950 text-orange-400 border-orange-800',
  AI_TICKET_CLASSIFIED: 'bg-violet-950 text-violet-400 border-violet-800',
  AI_TICKET_SUMMARIZED: 'bg-violet-950 text-violet-400 border-violet-800',
  AI_RESPONSE_SUGGESTED: 'bg-violet-950 text-violet-400 border-violet-800',
}
 
const ALL_ACTIONS = [
  'TICKET_CREATED', 'TICKET_STATUS_CHANGED', 'TICKET_ASSIGNED',
  'TICKET_PRIORITY_CHANGED', 'TICKET_CLOSED', 'TICKET_REOPENED',
  'COMMENT_ADDED', 'COMMENT_DELETED', 'USER_REGISTERED', 'USER_ROLE_CHANGED',
  'AI_TICKET_CLASSIFIED', 'AI_TICKET_SUMMARIZED', 'AI_RESPONSE_SUGGESTED',
]
 
export default function AuditLogs() {
  const [data, setData] = useState({ content: [], totalPages: 0, totalElements: 0 })
  const [page, setPage] = useState(0)
  const [selectedAction, setSelectedAction] = useState('ALL')
  const [loading, setLoading] = useState(true)
  

  useEffect(() => {
    let isCancelled = false
    
    const fetchLogs = async () => {
      setLoading(true)
      try {
        const response = await api.get(`/audit?page=${page}&size=10`)
        if (!isCancelled) {
          setData(response.data)
        }
      } catch (error) {
        console.error('Error fetching logs:', error)
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }
    
    fetchLogs()
    
    return () => {
      isCancelled = true
    }
  }, [page])
 
  // Filter client-side since audit logs are already paginated by date
  const filtered = selectedAction === 'ALL'
    ? data.content
    : data.content.filter((l) => l.action === selectedAction)
 
  const handleFilterChange = (action) => {
    setSelectedAction(action)
    setPage(0)
  }
 
  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">Audit Logs</h1>
          <p className="text-gray-400 text-sm mt-1">{data.totalElements} total event{data.totalElements !== 1 ? 's' : ''}</p>
        </div>
 
        {/* Filter */}
        <div className="mb-5 flex gap-2 flex-wrap">
          <button
            onClick={() => handleFilterChange('ALL')}
            className={`text-xs px-3 py-1.5 rounded-lg border transition ${
              selectedAction === 'ALL'
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
            }`}
          >
            All
          </button>
          {ALL_ACTIONS.map((action) => (
            <button
              key={action}
              onClick={() => handleFilterChange(action)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                selectedAction === action
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
              }`}
            >
              {action.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
 
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="px-5 py-16 text-center text-gray-500 text-sm">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="px-5 py-16 text-center text-gray-500 text-sm">No audit logs found.</div>
          ) : (
            /* Added overflow container layer */
            <div className="overflow-x-auto w-full">
              {/* Forced min-w width matrix threshold to prevent text crushing */}
              <table className="w-full text-sm min-w-[900px]">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Actor</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Action</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Entity</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Details</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filtered.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-800 transition">
                      <td className="px-5 py-3.5 text-gray-300">{log.actorEmail}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs px-2 py-1 rounded-full border whitespace-nowrap inline-block ${actionColors[log.action] ?? 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-gray-400">{log.entityType}</span>
                        <span className="text-xs text-gray-600 ml-1 font-mono">{log.entityId.slice(0, 8)}...</span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 text-xs max-w-xs truncate">{log.details ?? '—'}</td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
 
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
        </div>
      </div>
    </Layout>
  )
}