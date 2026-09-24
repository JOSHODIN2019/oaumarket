import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Welcome from './pages/Welcome'
import Register from './pages/Register'
import Login from './pages/Login'
import Home from './pages/Home'
import Notifications from './pages/Notifications'
import ProductDetail from './pages/ProductDetail'
import SellerProfile from './pages/SellerProfile'
import Messages from './pages/Messages'
import SellItem from './pages/SellItem'
import MyListings from './pages/MyListings'
import MyOffers from './pages/MyOffers'
import MyTransactions from './pages/MyTransactions'
import SavedItems from './pages/SavedItems'
import EditProfile from './pages/EditProfile'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminModeration from './pages/admin/AdminModeration'
import AdminTransactions from './pages/admin/AdminTransactions'
import AdminCategories from './pages/admin/AdminCategories'
import AdminAuditLogs from './pages/admin/AdminAuditLogs'
import RequireAuth from './components/RequireAuth'
import RequireAdminAuth from './components/RequireAdminAuth'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<Welcome />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/register"  element={<Register />} />
        <Route path="/home"      element={<RequireAuth><Home /></RequireAuth>} />
        <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
        <Route path="/product/:id"   element={<RequireAuth><ProductDetail /></RequireAuth>} />
        <Route path="/seller/:id"    element={<RequireAuth><SellerProfile /></RequireAuth>} />
        <Route path="/messages"      element={<RequireAuth><Messages /></RequireAuth>} />
        <Route path="/sell"          element={<RequireAuth><SellItem /></RequireAuth>} />
        <Route path="/my-listings"   element={<RequireAuth><MyListings /></RequireAuth>} />
        <Route path="/offers"        element={<RequireAuth><MyOffers /></RequireAuth>} />
        <Route path="/transactions"  element={<RequireAuth><MyTransactions /></RequireAuth>} />
        <Route path="/saved"         element={<RequireAuth><SavedItems /></RequireAuth>} />
        <Route path="/profile/edit"  element={<RequireAuth><EditProfile /></RequireAuth>} />

        <Route path="/admin/login"        element={<AdminLogin />} />
        <Route path="/admin"              element={<RequireAdminAuth><AdminDashboard /></RequireAdminAuth>} />
        <Route path="/admin/moderation"   element={<RequireAdminAuth><AdminModeration /></RequireAdminAuth>} />
        <Route path="/admin/transactions" element={<RequireAdminAuth><AdminTransactions /></RequireAdminAuth>} />
        <Route path="/admin/categories"   element={<RequireAdminAuth><AdminCategories /></RequireAdminAuth>} />
        <Route path="/admin/audit-logs"   element={<RequireAdminAuth><AdminAuditLogs /></RequireAdminAuth>} />

        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
