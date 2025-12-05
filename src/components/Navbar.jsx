import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate("/");
  };

  const avatar = user?.email ? user.email[0].toUpperCase() : "U";

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-green-700 font-semibold">
          <span className="w-8 h-8 rounded-md bg-green-100 flex items-center justify-center">🌿</span>
          <span>EcoShare</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/listings" className="text-gray-700 hover:text-gray-900">Listings</Link>
          <Link to="/share" className="bg-green-700 text-white px-3 py-1.5 rounded-md hover:bg-green-800">Share & Donate</Link>
          {!user ? (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-gray-700 hover:text-gray-900">Login</Link>
              <Link to="/signup" className="text-gray-700 hover:text-gray-900">Sign Up</Link>
            </div>
          ) : (
            <div className="relative">
              <button className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center" onClick={() => setOpen(!open)}>{avatar}</button>
              {open && (
                <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-md w-40">
                  <Link to="/my-listings" className="block px-3 py-2 hover:bg-gray-50" onClick={()=>setOpen(false)}>My Listings</Link>
                  <button className="block w-full text-left px-3 py-2 hover:bg-gray-50" onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
