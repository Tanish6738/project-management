import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../Context/UserContext';

const NotificationsWidget = () => {
  const { currentUser, fetchUserNotifications, markNotificationAsRead } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const response = await fetchUserNotifications();
        
        if (response && response.notifications) {
          // Response contains a notifications array
          const notificationsArray = response.notifications;
          
          // Sort by date (newest first)
          notificationsArray.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          );
          
          setNotifications(notificationsArray);
        } else {
          // Handle case where response structure is different
          setNotifications([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading notifications:", error);
        setLoading(false);
      }
    };
    
    loadNotifications();
  }, [fetchUserNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };
  
  // Function to format relative time
  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - notificationTime) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    }
    
    return notificationTime.toLocaleDateString();
  };
  
  // Function to determine notification icon based on action
  const getNotificationIcon = (notification) => {
    const iconClasses = 'h-5 w-5';
    
    switch (notification.action) {
      case 'assigned':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={`${iconClasses} text-indigo-500`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 006-6 6 6 0 00-1.08 11.915A5 5 0 0010 11z" clipRule="evenodd" />
          </svg>
        );
      case 'completed':
      case 'status':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={`${iconClasses} text-green-500`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'comment':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={`${iconClasses} text-blue-500`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
        );
      case 'mention':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={`${iconClasses} text-yellow-500`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M14.243 5.757a6 6 0 10-.986 9.284 1 1 0 111.087 1.678A8 8 0 1118 10a3 3 0 01-4.8 2.401A4 4 0 1114 10a1 1 0 102 0c0-1.537-.586-3.07-1.757-4.243zM12 10a2 2 0 10-4 0 2 2 0 004 0z" clipRule="evenodd" />
          </svg>
        );
      case 'deadline':
      case 'reminder':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={`${iconClasses} text-red-500`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={`${iconClasses} text-gray-500`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-6">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (!notifications || notifications.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No notifications
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.slice(0, 5).map(notification => (
        <div 
          key={notification._id} 
          className={`flex items-start p-3 ${
            !notification.isRead ? 'bg-indigo-50 rounded-lg' : ''
          }`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {getNotificationIcon(notification)}
          </div>
          
          <div className="ml-3 flex-1">
            <div className="text-sm text-gray-800">
              {notification.message}
            </div>
            
            <div className="mt-1 flex justify-between items-center text-xs">
              <div className="text-gray-500">
                {getRelativeTime(notification.createdAt)}
              </div>
              
              {!notification.isRead && (
                <button
                  onClick={() => handleMarkAsRead(notification._id)}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  Mark as read
                </button>
              )}
            </div>
            
            {notification.link && (
              <div className="mt-1">
                <Link 
                  to={notification.link} 
                  className="text-xs text-indigo-600 hover:text-indigo-900"
                >
                  View details
                </Link>
              </div>
            )}
          </div>
        </div>
      ))}
      
      {notifications.length > 5 && (
        <div className="text-center pt-2">
          <Link 
            to="/notifications" 
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            View all ({notifications.length})
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationsWidget;