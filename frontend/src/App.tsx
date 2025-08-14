// import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Simulation from './pages/Simulation'
import Drivers from './pages/Drivers'
import RoutesPage from './pages/Routes'
import Orders from './pages/Orders'
import ProtectedRoute from './components/ProtectedRoute'


function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
      } />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="simulation" element={<Simulation />} />
        <Route path="drivers" element={<Drivers />} />
        <Route path="routes" element={<RoutesPage />} />
        <Route path="orders" element={<Orders />} />
      </Route>
      
      {/* Catch-all route for any undefined routes */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
