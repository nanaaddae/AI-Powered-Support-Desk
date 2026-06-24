import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import api from '../../lib/api'
import { useAuthStore } from '../../store/authStore'

const roles = ['CUSTOMER', 'AGENT', 'TEAM_LEAD', 'ADMIN']

const roleColors = {
  CUSTOMER: 'bg-gray-800 text-gray-400 border-gray-700',
  AGENT: 'bg-blue-950 text-blue-400 border-blue-800',
  TEAM_LEAD: 'bg-purple-950 text-purple-400 border-purple-800',
  ADMIN: 'bg-red-950 text-red-400 border-red-800',
}

export default function UserManagement() {
  const { user: currentUser } = useAuthStore()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/users')
      .then((r) => setUsers(r.data))
      .finally(() => setLoading(false))
  }, [])

  const handleRoleChange = async (userId, role) => {
    setUpdatingId(userId)
    setError(null)
    try {
      const { data } = await api.patch(`/users/${userId}/role`, { role })
      setUsers(users.map((u) => u.id === userId ? data : u))
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to update role')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    setDeletingId(userId)
    setError(null)
    try {
      await api.delete(`/users/${userId}`)
      setUsers(users.filter((u) => u.id !== userId))
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to delete user')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) return (
    <Layout>
      <div className="p-8 text-gray-500 text-sm">Loading...</div>
    </Layout>
  )

  return (
    <Layout>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">User Management</h1>
          <p className="text-gray-400 text-sm mt-1">{users.length} user{users.length !== 1 ? 's' : ''} total</p>
        </div>

        {error && (
          <div className="bg-red-950 border border-red-800 text-red-400 text-sm rounded-lg px-4 py-3 mb-5">
            {error}
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Name</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Email</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Role</th>
                {currentUser?.role === 'ADMIN' && (
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-800 transition">
                  <td className="px-5 py-3.5 text-white">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-5 py-3.5 text-gray-400">{user.email}</td>
                  <td className="px-5 py-3.5">
                    {currentUser?.role === 'ADMIN' && user.email !== currentUser.email ? (
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={updatingId === user.id}
                        className="bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        {roles.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${roleColors[user.role]}`}>
                        {user.role}
                      </span>
                    )}
                  </td>
                  {currentUser?.role === 'ADMIN' && (
                    <td className="px-5 py-3.5">
                      {user.email !== currentUser.email && (
                        <button
                          onClick={() => handleDelete(user.id)}
                          disabled={deletingId === user.id}
                          className="text-xs text-gray-500 hover:text-red-400 disabled:opacity-50 transition"
                        >
                          {deletingId === user.id ? 'Deleting...' : 'Delete'}
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}