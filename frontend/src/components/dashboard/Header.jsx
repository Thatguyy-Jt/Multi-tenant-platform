import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Search, LogOut, User, Settings as SettingsIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import { fadeIn, scaleIn } from '../../lib/animations';

const Header = ({ onMenuClick, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0F0F11]/80 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left: Menu & Search */}
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Right: Notifications & User Menu */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {/* Notification badge */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-teal-500 rounded-full"></span>
            </button>

            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={scaleIn}
                  className="absolute right-0 mt-2 w-80 rounded-xl bg-[#0F0F11] border border-white/10 shadow-2xl overflow-hidden"
                >
                  <div className="p-4 border-b border-white/5">
                    <h3 className="text-sm font-semibold text-white">Notifications</h3>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-zinc-400 text-center py-4">
                      No new notifications
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="User menu"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-sm font-semibold">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={scaleIn}
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0F0F11] border border-white/10 shadow-2xl overflow-hidden"
                >
                  <div className="p-4 border-b border-white/5">
                    <p className="text-sm font-medium text-white truncate">
                      {user?.email || 'User'}
                    </p>
                    <p className="text-xs text-zinc-500 capitalize mt-0.5">
                      {user?.role || 'Member'}
                    </p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => {
                        navigate('/dashboard/organization');
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        navigate('/dashboard/organization');
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <SettingsIcon className="w-4 h-4" />
                      Settings
                    </button>
                    <div className="my-1 border-t border-white/5" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
