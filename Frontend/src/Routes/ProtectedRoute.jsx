import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../../Context/UserContext';

/**
 * ProtectedRoute component that requires authentication
 * @param {Object} props - Component props
 * @param {React.Component} props.children - Child components to render if authenticated
 * @param {string[]} [props.requiredRoles] - Optional array of roles required to access this route
 * @returns {React.Component} Protected route component
 */
const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { isAuthenticated, isLoading, user, hasRole } = useUser();
  const location = useLocation();

  if (isLoading) {
    // Return loading state while checking authentication
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-t-4 border-indigo-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If roles are specified, check if user has required role
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => hasRole(role));
    
    if (!hasRequiredRole) {
      // User doesn't have required role - redirect to dashboard or unauthorized page
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // User is authenticated and has required role (if specified)
  return children;
};

export default ProtectedRoute;