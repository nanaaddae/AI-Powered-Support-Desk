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

const priorityBadgeColors = {
  LOW: 'bg-gray-800 text-gray-400 border-gray-700',
  MEDIUM: 'bg-blue-950 text-blue-400 border-blue-800',
  HIGH: 'bg-orange-950 text-orange-400 border-orange-800',
  CRITICAL: 'bg-red-950 text-red-400 border-red-800',
}

const statuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']

export default function AgentTicketDetail() {
  const { id } = useParams()
  const [ticket, setTicket] = useState(null)
  const [comments, setComments] = useState([])
  const [kbSuggestions, setKbSuggestions] = useState([])
  const [newComment, setNewComment] = useState('')
  const [summary, setSummary] = useState(null)
  const [classification, setClassification] = useState(null)
  const [suggestions, setSuggestions] = useState(null)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [loadingClassify, setLoadingClassify] = useState(false)
  const [loadingSuggest, setLoadingSuggest] = useState(false)
  const [loadingKb, setLoadingKb] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [expandedKb, setExpandedKb] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get(`/tickets/${id}`),
      api.get(`/tickets/${id}/comments`),
    ]).then(([ticketRes, commentsRes]) => {
      setTicket(ticketRes.data)
      setComments(commentsRes.data)
    }).finally(() => setLoading(false))
  }, [id])

  const handleStatusChange = async (status) => {
    const { data } = await api.patch(`/tickets/${id}/status`, { status })
    setTicket(data)
  }

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

  const handleClassify = async () => {
    setLoadingClassify(true)
    try {
      const { data } = await api.post(`/tickets/${id}/ai/classify`)
      setClassification(data)
      // Update ticket display with new category/priority
      setTicket((prev) => ({ ...prev, category: data.category, priority: data.priority }))
    } finally {
      setLoadingClassify(false)
    }
  }

  const handleSummarize = async () => {
    setLoadingSummary(true)
    try {
      const { data } = await api.get(`/tickets/${id}/ai/summarize`)
      setSummary(data.summary)
    } finally {
      setLoadingSummary(false)
    }
  }

  const handleSuggest = async () => {
    setLoadingSuggest(true)
    try {
      const { data } = await api.get(`/tickets/${id}/ai/suggest-response`)
      setSuggestions(data.options)
    } finally {
      setLoadingSuggest(false)
    }
  }

  const handleKbSuggestions = async () => {
    setLoadingKb(true)
    try {
      const { data } = await api.get(`/tickets/${id}/knowledgebase/suggestions`)
      setKbSuggestions(data)
    } finally {
      setLoadingKb(false)
    }
  }

  const copyToComment = (text) => {
    setNewComment(text)
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
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
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="text-xs text-gray-500">{ticket.customerName}</span>
            <span className="text-xs text-gray-600">·</span>
            <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded">{ticket.category}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityBadgeColors[ticket.priority]}`}>
              {ticket.priority}
            </span>
            <span className="text-xs text-gray-600">·</span>
            <span className="text-xs text-gray-500">{new Date(ticket.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Description */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-5">
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
        </div>

        {/* Status update */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-5">
          <h3 className="text-sm font-medium text-white mb-3">Update status</h3>
          <div className="flex gap-2 flex-wrap">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                  ticket.status === s
                    ? statusColors[s]
                    : 'border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white'
                }`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* AI Tools */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm1 11H9v-2h2v2zm0-4H9V7h2v2z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-white">AI Tools</h3>
          </div>

          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              onClick={handleClassify}
              disabled={loadingClassify}
              className="text-xs bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 px-3 py-1.5 rounded-lg border border-gray-700 transition"
            >
              {loadingClassify ? 'Classifying...' : 'Classify ticket'}
            </button>
            <button
              onClick={handleSummarize}
              disabled={loadingSummary}
              className="text-xs bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 px-3 py-1.5 rounded-lg border border-gray-700 transition"
            >
              {loadingSummary ? 'Summarizing...' : 'Summarize'}
            </button>
            <button
              onClick={handleSuggest}
              disabled={loadingSuggest}
              className="text-xs bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 px-3 py-1.5 rounded-lg border border-gray-700 transition"
            >
              {loadingSuggest ? 'Generating...' : 'Suggest response'}
            </button>
          </div>

          {/* Classification result */}
          {classification && (
            <div className="bg-gray-800 rounded-lg p-4 mb-3">
              <p className="text-xs font-medium text-gray-400 mb-2">Classification applied</p>
              <div className="flex gap-3 mb-2">
                <span className="text-xs bg-indigo-950 text-indigo-400 border border-indigo-800 px-2 py-0.5 rounded-full">
                  {classification.category}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityBadgeColors[classification.priority]}`}>
                  {classification.priority}
                </span>
              </div>
              <p className="text-xs text-gray-400">{classification.reasoning}</p>
            </div>
          )}

          {/* Summary result */}
          {summary && (
            <div className="bg-gray-800 rounded-lg p-4 mb-3">
              <p className="text-xs font-medium text-gray-400 mb-2">Summary</p>
              <p className="text-sm text-gray-300 leading-relaxed">{summary}</p>
            </div>
          )}

          {/* Response suggestions */}
          {suggestions && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-gray-400">Suggested responses</p>
              {suggestions.map((option, i) => (
                <div key={i} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-indigo-400">{option.label}</span>
                    <button
                      onClick={() => copyToComment(option.response)}
                      className="text-xs text-gray-500 hover:text-white transition"
                    >
                      Use this
                    </button>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">{option.response}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Knowledge Base Suggestions */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-emerald-700 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-white">Knowledge Base</h3>
            </div>
            <button
              onClick={handleKbSuggestions}
              disabled={loadingKb}
              className="text-xs text-emerald-400 hover:text-emerald-300 disabled:opacity-50 transition"
            >
              {loadingKb ? 'Loading...' : kbSuggestions.length > 0 ? 'Refresh' : 'Find relevant articles'}
            </button>
          </div>

          {kbSuggestions.length === 0 ? (
            <p className="text-sm text-gray-500">
              Click "Find relevant articles" to surface knowledge base articles related to this ticket.
            </p>
          ) : (
            <div className="space-y-2">
              {kbSuggestions.map((doc) => (
                <div key={doc.id} className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-white">{doc.title}</p>
                    <button
                      onClick={() => setExpandedKb(expandedKb === doc.id ? null : doc.id)}
                      className="text-xs text-gray-500 hover:text-white transition ml-3 flex-shrink-0"
                    >
                      {expandedKb === doc.id ? 'Collapse' : 'Read'}
                    </button>
                  </div>
                  {expandedKb === doc.id ? (
                    <p className="text-sm text-gray-300 leading-relaxed mt-2">{doc.content}</p>
                  ) : (
                    <p className="text-xs text-gray-500 line-clamp-2">{doc.content}</p>
                  )}
                </div>
              ))}
            </div>
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