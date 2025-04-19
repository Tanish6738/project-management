import { createContext, useState, useEffect, useContext } from 'react';
import { userService } from '../../api';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
      
      // Fetch the latest user data
      fetchUserProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await userService.getProfile();
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError(err.message);
      // Handle token expiration
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setIsLoading(true);
      const response = await userService.login(credentials);
      
      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      setUser(response.data.user);
      setIsAuthenticated(true);
      return response;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      const response = await userService.register(userData);
      
      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      setUser(response.data.user);
      setIsAuthenticated(true);
      return response;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      // Call the logout API
      await userService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Reset state
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  const updateProfile = async (userData) => {
    try {
      setIsLoading(true);
      const response = await userService.updateProfile(userData);
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      return response;
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (preferences) => {
    try {
      setIsLoading(true);
      const response = await userService.updatePreferences(preferences);
      // Update user object with new preferences
      setUser(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          ...preferences
        }
      }));
      localStorage.setItem('user', JSON.stringify(user));
      return response;
    } catch (err) {
      setError(err.message || 'Failed to update preferences');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const hasRole = (role) => {
    if (!user) return false;
    return user.role === role || 
      (Array.isArray(user.roles) && user.roles.includes(role));
  };

  const fetchUserNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await userService.getNotifications();
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      setIsLoading(true);
      const response = await userService.markNotificationRead(notificationId);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to mark notification as read');
      console.error('Error marking notification as read:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        error,
        isAuthenticated,
        login,
        register,
        logout,
        updateProfile,
        updatePreferences,
        fetchUserProfile,
        hasRole,
        fetchUserNotifications,
        markNotificationAsRead
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;