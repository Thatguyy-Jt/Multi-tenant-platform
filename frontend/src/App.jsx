import React, { Suspense, lazy } from 'react';
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

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Projects = lazy(() => import('./pages/dashboard/Projects'));
const Tasks = lazy(() => import('./pages/dashboard/Tasks'));
const Organization = lazy(() => import('./pages/dashboard/Organization'));
const Team = lazy(() => import('./pages/dashboard/Team'));
const Billing = lazy(() => import('./pages/dashboard/Billing'));
const Admin = lazy(() => import('./pages/dashboard/Admin'));
const AuditLog = lazy(() => import('./pages/dashboard/AuditLog'));
const Analytics = lazy(() => import('./pages/dashboard/Analytics'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={
          <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center">
            <div className="animate-pulse text-zinc-500">Loading…</div>
          </div>
        }>
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
              <Route path="audit-log" element={<AuditLog />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="admin" element={<Admin />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;
