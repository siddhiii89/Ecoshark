import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiMenu, FiX, FiPlusCircle, FiGrid, FiHome, FiUser, FiLogOut, FiLogIn, FiUserPlus } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to log out', error);
    }
  }

  const navLinks = [
    { to: "/", icon: <FiHome className="mr-2" />, text: "Home" },
    { to: "/listings", icon: <FiGrid className="mr-2" />, text: "Browse Listings" },
    ...(user ? [
      { to: "/impact", icon: <FiGrid className="mr-2" />, text: "Impact" },
      { to: "/share", icon: <FiPlusCircle className="mr-2" />, text: "Donate an Item" },
      { to: "/my-listings", icon: <FiUser className="mr-2" />, text: "My Listings" },
    ] : [])
  ];

  const authLinks = user ? [
    { onClick: handleLogout, icon: <FiLogOut className="mr-2" />, text: "Logout" }
  ] : [
    { to: "/login", icon: <FiLogIn className="mr-2" />, text: "Login" },
    { to: "/signup", icon: <FiUserPlus className="mr-2" />, text: "Sign Up" }
  ];

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-extrabold bg-gradient-to-r from-emerald-300 to-sky-300 bg-clip-text text-transparent">
                EcoShare
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors duration-200 flex items-center"
              >
                {link.icon}
                {link.text}
              </Link>
            ))}
          </div>

          {/* User/Auth Buttons - Desktop */}
          <div className="hidden md:ml-4 md:flex md:items-center space-x-3">
            {user && (
              <div className="text-sm text-gray-700 mr-4 hidden lg:block">
                Welcome, <span className="font-medium">{user.email.split('@')[0]}</span>
              </div>
            )}
            {authLinks.map((link, index) => (
              link.to ? (
                <Link
                  key={index}
                  to={link.to}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    link.text === 'Sign Up'
                      ? 'bg-gradient-to-r from-emerald-300 to-sky-300 text-emerald-900 hover:from-emerald-200 hover:to-sky-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                      : 'text-gray-700 hover:bg-emerald-50'
                  }`}
                >
                  {link.icon}
                  <span>{link.text}</span>
                </Link>
              ) : (
                <button
                  key={index}
                  onClick={link.onClick}
                  className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-emerald-50 flex items-center transition-colors duration-200"
                >
                  {link.icon}
                  <span>{link.text}</span>
                </button>
              )
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <FiX className="block h-6 w-6" /> : <FiMenu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="pt-2 pb-3 space-y-1 bg-white shadow-lg rounded-b-lg mx-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 border-b border-gray-100 last:border-0 transition-colors duration-200"
            >
              <div className="flex items-center">
                {link.icon}
                {link.text}
              </div>
            </Link>
          ))}

          {user && (
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="text-sm text-gray-500 mb-2">Logged in as:</div>
              <div className="font-medium text-gray-900 truncate">{user.email}</div>
            </div>
          )}

          <div className="px-2 pt-2 pb-3 space-y-1">
            {authLinks.map((link, index) => (
              link.to ? (
                <Link
                  key={index}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-md text-base font-medium ${
                    link.text === 'Sign Up'
                      ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white text-center shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    {link.icon}
                    {link.text}
                  </div>
                </Link>
              ) : (
                <button
                  key={index}
                  onClick={() => {
                    setIsOpen(false);
                    link.onClick();
                  }}
                  className="w-full text-left px-4 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  {link.icon}
                  {link.text}
                </button>
              )
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
