import React from 'react';

export const Loading = ({ size = 'default', center = false }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    default: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  return (
    <div className={`flex ${center ? 'items-center justify-center min-h-[200px]' : ''}`}>
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-t-indigo-600 border-r-indigo-600 border-b-indigo-200 border-l-indigo-200`}></div>
    </div>
  );
};