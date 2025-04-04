import { Navigate } from 'react-router-dom';
import { useAuth } from '../App/Context/AuthContext';
import AppLayout from '../App/Layout/AppLayout';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <AppLayout>{children}</AppLayout>;
};

export default ProtectedRoute;