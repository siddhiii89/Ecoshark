import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiMenu, FiX, FiPlusCircle, FiGrid, FiHome, FiUser, FiLogOut, FiLogIn, FiUserPlus, FiBell } from 'react-icons/fi';
import { fetchNotificationsForUser } from '../services/notificationService';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) {
        setNotifications([]);
        return;
      }
      const data = await fetchNotificationsForUser(user.id);
      setNotifications(data);
    };

    loadNotifications();
  }, [user]);

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
      { to: "/share", icon: <FiPlusCircle className="mr-2" />, text: "Donate an Item" },
      { to: "/profile", icon: <FiUser className="mr-2" />, text: "Profile" },
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
              <>
                <button
                  type="button"
                  className="relative mr-2 text-gray-600 hover:text-emerald-700"
                  onClick={() => setShowNotifications((prev) => !prev)}
                >
                  <FiBell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white bg-red-500 rounded-full">
                      {notifications.length}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-4 top-16 w-72 bg-white border border-emerald-100 rounded-xl shadow-lg z-20">
                    <div className="px-4 py-2 border-b border-emerald-100 text-sm font-semibold text-emerald-900">
                      Notifications
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-3 text-xs text-gray-500">No notifications yet.</div>
                      ) : (
                        notifications.map((n) => (
                          <button
                            key={n.id}
                            onClick={() => {
                              setShowNotifications(false);
                              if (n.link) {
                                let target = n.link;
                                let emailParam = "";
                                if (n.description) {
                                  const firstWord = n.description.split(" ")[0];
                                  if (firstWord.includes("@")) {
                                    emailParam = `from=${encodeURIComponent(firstWord)}`;
                                  }
                                }
                                const chatParam = "openChat=1";
                                const query = emailParam
                                  ? `${chatParam}&${emailParam}`
                                  : chatParam;
                                target += target.includes("?") ? `&${query}` : `?${query}`;
                                navigate(target);
                              }
                            }}
                            className="w-full text-left px-4 py-3 text-xs border-b border-emerald-50 hover:bg-emerald-50"
                          >
                            <div className="font-semibold text-gray-800 mb-0.5">{n.title}</div>
                            <div className="text-gray-600 mb-1">{n.description}</div>
                            <div className="text-[10px] text-gray-400">
                              {new Date(n.created_at).toLocaleString()}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
                <div className="text-sm text-gray-700 mr-4 hidden lg:block">
                  Welcome, <span className="font-medium">{user.email.split('@')[0]}</span>
                </div>
              </>
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
