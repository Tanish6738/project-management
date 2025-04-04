import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../App/Pages/Auth/Login';
import Register from '../App/Pages/Auth/Register';
import Dashboard from '../App/Pages/Dashboard/Dashboard';
import ProjectList from '../App/Pages/Projects/ProjectList';
import ProjectDetail from '../App/Pages/Projects/ProjectDetail';
import Landing from '../LandingPage/Landing';
import AppLayout from '../App/Layout/AppLayout';

// Protected route component that includes layout
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <AppLayout>{children}</AppLayout>;
};

// Public route that redirects to dashboard if already authenticated
const PublicRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  
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
      
      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
