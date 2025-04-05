import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../App/Pages/Auth/Login';
import Register from '../App/Pages/Auth/Register';
import Unauthorized from '../App/Pages/Auth/Unauthorized';
import Dashboard from '../App/Pages/Dashboard/Dashboard';
import ProjectList from '../App/Pages/Projects/ProjectList';
import ProjectDetail from '../App/Pages/Projects/ProjectDetail';
import Landing from '../LandingPage/Landing';
import AppLayout from '../App/Layout/AppLayout';
import TeamList from '../App/Pages/Teams/TeamList';
import TeamDetail from '../App/Pages/Teams/TeamDetail';
import TaskDetail from '../App/Pages/Tasks/TaskDetail';
import Profile from '../App/Pages/User/Profile';
import Settings from '../App/Pages/User/Settings';
import { useUser } from '../App/Context/UserContext';

// Protected route component that includes layout
const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { isAuthenticated, user, hasRole } = useUser();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Role-based access check
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => hasRole(role));
    
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" />;
    }
  }
  
  return <AppLayout>{children}</AppLayout>;
};

// Public route that redirects to dashboard if already authenticated
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useUser();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } 
      />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Protected routes - all wrapped in AppLayout */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/projects" 
        element={
          <ProtectedRoute>
            <ProjectList />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/projects/:projectId" 
        element={
          <ProtectedRoute>
            <ProjectDetail />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/teams" 
        element={
          <ProtectedRoute>
            <TeamList />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/teams/:teamId" 
        element={
          <ProtectedRoute>
            <TeamDetail />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tasks/:taskId" 
        element={
          <ProtectedRoute>
            <TaskDetail />
          </ProtectedRoute>
        } 
      />
      
      {/* User management routes */}
      <Route 
        path="/user/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/user/settings" 
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } 
      />
      
      {/* Admin routes - require admin role */}
      <Route 
        path="/admin/users" 
        element={
          <ProtectedRoute requiredRoles={['admin']}>
            <div>User Administration (placeholder)</div>
          </ProtectedRoute>
        } 
      />
      
      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
