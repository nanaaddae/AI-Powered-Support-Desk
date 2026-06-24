import { Link } from 'react-router-dom'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-indigo-400 text-sm font-medium mb-2">403</p>
        <h1 className="text-3xl font-semibold text-white mb-3">Access denied</h1>
        <p className="text-gray-400 text-sm mb-8">You don't have permission to view this page.</p>
        <Link
          to="/"
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}