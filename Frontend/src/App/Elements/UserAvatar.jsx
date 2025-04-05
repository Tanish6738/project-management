import React from 'react';
import { useUser } from '../Context/UserContext';

/**
 * UserAvatar component displays the user's avatar or initials
 * @param {Object} props - Component props
 * @param {string} [props.size='md'] - Size of the avatar (sm, md, lg, xl)
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} UserAvatar component
 */
const UserAvatar = ({ size = 'md', className = '' }) => {
  const { user } = useUser();
  
  // Size classes mapping
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-16 w-16 text-lg',
    xl: 'h-24 w-24 text-3xl'
  };
  
  // Get user initials - up to two characters
  const getInitials = () => {
    if (!user || !user.name) return '?';
    
    const nameParts = user.name.split(' ').filter(part => part.length > 0);
    
    if (nameParts.length === 0) return '?';
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };
  
  // If user has an avatar image
  if (user?.avatar) {
    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden ${className}`}>
        <img 
          src={user.avatar} 
          alt={user.name || 'User'} 
          className="h-full w-full object-cover"
        />
      </div>
    );
  }
  
  // If no avatar, show initials
  return (
    <div className={`${sizeClasses[size]} rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 ${className}`}>
      {getInitials()}
    </div>
  );
};

export default UserAvatar;