import { useUser } from '../Context/UserContext';

/**
 * RoleBasedAccess component for conditional rendering based on user roles
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if user has required role
 * @param {Array<string>} props.requiredRoles - Array of role names required to access content
 * @param {React.ReactNode} [props.fallback] - Optional fallback UI to show if user doesn't have required roles
 * @returns {React.ReactNode} Children if user has role, fallback or null otherwise
 */
const RoleBasedAccess = ({ children, requiredRoles, fallback = null }) => {
  const { user, hasRole } = useUser();

  // If no required roles are specified or the array is empty, render children
  if (!requiredRoles || requiredRoles.length === 0) {
    return children;
  }

  // Check if user has any of the required roles
  const hasRequiredRole = requiredRoles.some(role => hasRole(role));
  
  // Render children if user has required role, otherwise render fallback or null
  return hasRequiredRole ? children : fallback;
};

export default RoleBasedAccess;