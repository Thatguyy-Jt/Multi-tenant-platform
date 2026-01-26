import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  CheckSquare, 
  Building2, 
  CreditCard,
  Settings,
  Shield,
  LogOut
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Logo from '../ui/Logo';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isSuperAdmin = user?.role === 'super_admin';

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navigation = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Organization', path: '/dashboard/organization', icon: Building2 },
    { name: 'Team', path: '/dashboard/team', icon: Users },
    { name: 'Projects', path: '/dashboard/projects', icon: FolderKanban },
    { name: 'Tasks', path: '/dashboard/tasks', icon: CheckSquare },
    { name: 'Billing', path: '/dashboard/billing', icon: CreditCard },
    ...(isSuperAdmin ? [{ name: 'Admin', path: '/dashboard/admin', icon: Shield }] : []),
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-50",
          "w-64 bg-[#0F0F11] border-r border-white/5",
          "flex flex-col flex-shrink-0",
          "transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <Logo />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 px-2">
            Platform
          </div>
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                onClick={() => {
                  // Close mobile sidebar on navigation
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    "group",
                    isActive
                      ? "bg-white/5 text-white"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        "w-5 h-5 flex-shrink-0",
                        isActive ? "text-teal-400" : "text-zinc-500 group-hover:text-zinc-300"
                      )}
                    />
                    <span>{item.name}</span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-500" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Info Card & Logout */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <div className="p-3 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-sm font-semibold">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.email || 'User'}
                </p>
                <p className="text-xs text-zinc-500 capitalize">
                  {user?.role || 'Member'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              "text-red-400 hover:text-red-300 hover:bg-red-500/10",
              "border border-red-500/20 hover:border-red-500/40"
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
