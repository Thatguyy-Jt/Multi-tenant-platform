import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/shared/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import AcceptInvitation from './pages/auth/AcceptInvitation';
import Dashboard from './pages/Dashboard';

import Projects from './pages/dashboard/Projects';
import Tasks from './pages/dashboard/Tasks';
import Organization from './pages/dashboard/Organization';
import Team from './pages/dashboard/Team';
import Billing from './pages/dashboard/Billing';

// Placeholder pages for dashboard routes (will be built in later phases)
const AdminPage = () => <div className="p-6"><h1 className="text-2xl font-semibold text-white mb-4">Admin Dashboard</h1><p className="text-zinc-400">Coming in Phase 9</p></div>;

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/accept-invitation/:token" element={<AcceptInvitation />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="organization" element={<Organization />} />
            <Route path="team" element={<Team />} />
            <Route path="projects" element={<Projects />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="billing" element={<Billing />} />
            <Route path="admin" element={<AdminPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
