// src/App.jsx
import React from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Share from './pages/Share';
import Listings from './pages/Listings';
import ItemDetail from './pages/ItemDetail';
import MyListings from './pages/MyListings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ResetPassword from './pages/ResetPassword';
import Impact from './pages/Impact';
import ProtectedRoute from './routes/ProtectedRoute';
import { Routes, Route, Navigate } from 'react-router-dom';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/listings/:id" element={<ItemDetail />} />
          <Route path="/impact" element={<ProtectedRoute><Impact /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/share" element={<ProtectedRoute><Share /></ProtectedRoute>} />
          <Route path="/my-listings" element={<ProtectedRoute><MyListings /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
