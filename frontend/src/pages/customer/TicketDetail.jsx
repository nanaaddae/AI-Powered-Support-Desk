import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
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

export default function TicketDetail() {
  const { id } = useParams()
  const [ticket, setTicket] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [summary, setSummary] = useState(null)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get(`/tickets/${id}`),
      api.get(`/tickets/${id}/comments`),
    ]).then(([ticketRes, commentsRes]) => {
      setTicket(ticketRes.data)
      setComments(commentsRes.data)
    }).finally(() => setLoading(false))
  }, [id])

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setSubmitting(true)
    try {
      const { data } = await api.post(`/tickets/${id}/comments`, { content: newComment })
      setComments([...comments, data])
      setNewComment('')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    await api.delete(`/tickets/${id}/comments/${commentId}`)
    setComments(comments.filter((c) => c.id !== commentId))
  }

  const handleGetSummary = async () => {
    setLoadingSummary(true)
    try {
      const { data } = await api.get(`/tickets/${id}/ai/summarize`)
      setSummary(data.summary)
    } finally {
      setLoadingSummary(false)
    }
  }

  if (loading) return (
    <Layout>
      <div className="p-8 text-gray-500 text-sm">Loading...</div>
    </Layout>
  )

  return (
    <Layout>
      <div className="p-8 max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-semibold text-white">{ticket.title}</h1>
            <span className={`text-xs px-2 py-1 rounded-full border flex-shrink-0 ${statusColors[ticket.status]}`}>
              {ticket.status.replace('_', ' ')}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span>{ticket.category}</span>
            <span className={`font-medium ${priorityColors[ticket.priority]}`}>{ticket.priority}</span>
            <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Description */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-5">
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
        </div>

        {/* AI Summary */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm1 11H9v-2h2v2zm0-4H9V7h2v2z" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-white">AI Summary</h3>
            </div>
            <button
              onClick={handleGetSummary}
              disabled={loadingSummary}
              className="text-xs text-indigo-400 hover:text-indigo-300 disabled:opacity-50 transition"
            >
              {loadingSummary ? 'Generating...' : summary ? 'Refresh' : 'Generate summary'}
            </button>
          </div>
          {summary ? (
            <p className="text-sm text-gray-300 leading-relaxed">{summary}</p>
          ) : (
            <p className="text-sm text-gray-500">Click "Generate summary" to get an AI overview of this ticket.</p>
          )}
        </div>

        {/* Comments */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl">
          <div className="px-5 py-4 border-b border-gray-800">
            <h3 className="text-sm font-medium text-white">Comments ({comments.length})</h3>
          </div>

          {comments.length === 0 ? (
            <div className="px-5 py-8 text-center text-gray-500 text-sm">No comments yet.</div>
          ) : (
            <div className="divide-y divide-gray-800">
              {comments.map((comment) => (
                <div key={comment.id} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-white">{comment.authorName}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-xs text-gray-600 hover:text-red-400 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">{comment.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* Add comment */}
          <div className="px-5 py-4 border-t border-gray-800">
            <form onSubmit={handleAddComment} className="flex gap-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition"
              >
                {submitting ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  )
}