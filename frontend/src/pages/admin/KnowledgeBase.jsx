import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import api from '../../lib/api'

export default function KnowledgeBase() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', content: '' })
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/knowledgebase')
      .then((r) => setDocuments(r.data))
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const { data } = await api.post('/knowledgebase', form)
      setDocuments([data, ...documents])
      setForm({ title: '', content: '' })
      setShowForm(false)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to create document')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this document?')) return
    setDeletingId(id)
    try {
      await api.delete(`/knowledgebase/${id}`)
      setDocuments(documents.filter((d) => d.id !== id))
      if (searchResults) setSearchResults(searchResults.filter((d) => d.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setSearching(true)
    try {
      const { data } = await api.get(`/knowledgebase/search?query=${encodeURIComponent(searchQuery)}`)
      setSearchResults(data)
    } finally {
      setSearching(false)
    }
  }

  const displayedDocs = searchResults ?? documents

  if (loading) return (
    <Layout>
      <div className="p-8 text-gray-500 text-sm">Loading...</div>
    </Layout>
  )

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Knowledge Base</h1>
            <p className="text-gray-400 text-sm mt-1">{documents.length} document{documents.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            {showForm ? 'Cancel' : 'New document'}
          </button>
        </div>

        {error && (
          <div className="bg-red-950 border border-red-800 text-red-400 text-sm rounded-lg px-4 py-3 mb-5">
            {error}
          </div>
        )}

        {/* Create form */}
        {showForm && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-sm font-medium text-white mb-4">New document</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="Document title"
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Content</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  required
                  rows={8}
                  placeholder="Write your knowledge base article..."
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition"
              >
                {submitting ? 'Saving...' : 'Save document'}
              </button>
            </form>
          </div>
        )}

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              if (!e.target.value) setSearchResults(null)
            }}
            placeholder="Search documents..."
            className="flex-1 bg-gray-900 border border-gray-800 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
          <button
            type="submit"
            disabled={searching}
            className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 text-sm font-medium px-4 py-2.5 rounded-lg border border-gray-700 transition"
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {searchResults && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-400">{searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"</p>
            <button
              onClick={() => { setSearchResults(null); setSearchQuery('') }}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition"
            >
              Clear
            </button>
          </div>
        )}

        {/* Documents list */}
        <div className="space-y-4">
          {displayedDocs.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-16 text-center text-gray-500 text-sm">
              {searchResults ? 'No results found.' : 'No documents yet. Create your first one.'}
            </div>
          ) : (
            displayedDocs.map((doc) => (
              <div key={doc.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="text-sm font-medium text-white">{doc.title}</h3>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    disabled={deletingId === doc.id}
                    className="text-xs text-gray-500 hover:text-red-400 disabled:opacity-50 transition flex-shrink-0"
                  >
                    {deletingId === doc.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">{doc.content}</p>
                <p className="text-xs text-gray-600 mt-3">
                  {doc.authorName} · {new Date(doc.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}