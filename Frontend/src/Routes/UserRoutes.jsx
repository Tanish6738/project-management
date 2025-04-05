import { Routes, Route } from 'react-router-dom';
import Login from '../App/Pages/Auth/Login';
import Register from '../App/Pages/Auth/Register';
import Unauthorized from '../App/Pages/Auth/Unauthorized';
import Profile from '../App/Pages/User/Profile';
import Settings from '../App/Pages/User/Settings';
import ProtectedRoute from './ProtectedRoute';

/**
 * UserRoutes component that defines all user-related routes
 * @returns {JSX.Element} Routes component with user-related routes
 */
const UserRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="unauthorized" element={<Unauthorized />} />
      
      {/* Protected routes */}
      <Route path="profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      
      <Route path="settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default UserRoutes;