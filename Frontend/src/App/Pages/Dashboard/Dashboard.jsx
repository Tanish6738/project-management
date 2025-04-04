import { useState, useEffect } from 'react';
import { userService } from '../../../api';
import TaskList from './TaskList';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Function to fetch current user data
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await userService.getCurrentUser();
        setUser(response.data);
        setError('');
      } catch (err) {
        setError('Failed to load user data. Please try again later.');
        console.error('Error fetching user data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4" role="alert">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Welcome, {user?.name}!
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Here's your task dashboard.
          </p>
        </div>
      </div>
      
      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/projects" className="bg-indigo-50 hover:bg-indigo-100 transition-colors p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-indigo-700 mb-2">Projects</h3>
          <p className="text-sm text-gray-600">View and manage all your projects</p>
        </Link>
        
        <Link to="/dashboard" className="bg-green-50 hover:bg-green-100 transition-colors p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-green-700 mb-2">My Tasks</h3>
          <p className="text-sm text-gray-600">View and update your assigned tasks</p>
        </Link>
        
        <div className="bg-purple-50 hover:bg-purple-100 transition-colors p-6 rounded-lg shadow-sm cursor-pointer" onClick={() => {}}>
          <h3 className="text-lg font-medium text-purple-700 mb-2">Team</h3>
          <p className="text-sm text-gray-600">Manage your team members</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Tasks</h2>
          <TaskList />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Activity Feed</h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <p className="text-gray-500 text-sm">
                Recent activity will appear here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;