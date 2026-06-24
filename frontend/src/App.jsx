import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import ProtectedRoute from './components/ProtectedRoute'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import UnauthorizedPage from './pages/UnauthorizedPage'

import CustomerDashboard from './pages/customer/Dashboard'

import MyTickets from './pages/customer/MyTickets'
import CreateTicket from './pages/customer/CreateTicket'
import TicketDetail from './pages/customer/TicketDetail'


import AgentDashboard from './pages/agent/Dashboard'

import AgentTickets from './pages/agent/AgentTickets'
import AgentTicketDetail from './pages/agent/TicketDetail'



import AdminDashboard from './pages/admin/Dashboard'

import AllTickets from './pages/admin/AllTickets'
import UserManagement from './pages/admin/UserManagement'
import KnowledgeBase from './pages/admin/KnowledgeBase'
import AdminTicketDetail from './pages/admin/TicketDetail'

import AuditLogs from './pages/admin/AuditLogs'


function RoleRedirect() {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  switch (user.role) {
    case 'CUSTOMER': return <Navigate to="/customer/dashboard" replace />
    case 'AGENT': return <Navigate to="/agent/dashboard" replace />
    case 'TEAM_LEAD':
    case 'ADMIN': return <Navigate to="/admin/dashboard" replace />
    default: return <Navigate to="/login" replace />
  }
}
 
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

       
        <Route path="/" element={<RoleRedirect />} />


        <Route path="/customer/dashboard" element={
          <ProtectedRoute roles={['CUSTOMER']}><CustomerDashboard /></ProtectedRoute>
        } />

        
        <Route path="/customer/tickets" element={
          <ProtectedRoute roles={['CUSTOMER']}><MyTickets /></ProtectedRoute>
        } />
        <Route path="/customer/tickets/new" element={
          <ProtectedRoute roles={['CUSTOMER']}><CreateTicket /></ProtectedRoute>
        } />
        <Route path="/customer/tickets/:id" element={
          <ProtectedRoute roles={['CUSTOMER']}><TicketDetail /></ProtectedRoute>
        } />
          
        
        <Route path="/agent/dashboard" element={
          <ProtectedRoute roles={['AGENT']}><AgentDashboard /></ProtectedRoute>
        } />

        
        <Route path="/agent/tickets" element={
          <ProtectedRoute roles={['AGENT']}><AgentTickets /></ProtectedRoute>
        } />
        <Route path="/agent/tickets/:id" element={
          <ProtectedRoute roles={['AGENT']}><AgentTicketDetail /></ProtectedRoute>
        } />
          
       
        <Route path="/admin/dashboard" element={
          <ProtectedRoute roles={['ADMIN', 'TEAM_LEAD']}><AdminDashboard /></ProtectedRoute>
        } />

          
        <Route path="/admin/tickets" element={
          <ProtectedRoute roles={['ADMIN', 'TEAM_LEAD']}><AllTickets /></ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute roles={['ADMIN', 'TEAM_LEAD']}><UserManagement /></ProtectedRoute>
        } />
        <Route path="/admin/knowledgebase" element={
          <ProtectedRoute roles={['ADMIN']}><KnowledgeBase /></ProtectedRoute>
        } />

        <Route path="/admin/tickets/:id" element={
          <ProtectedRoute roles={['ADMIN', 'TEAM_LEAD']}><AdminTicketDetail /></ProtectedRoute>
        } />

        <Route path="/admin/audit" element={
  <ProtectedRoute roles={['ADMIN']}><AuditLogs /></ProtectedRoute>
} />  
        
      </Routes>
    </BrowserRouter>
  )
}