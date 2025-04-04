import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to conditionally join class names together
 * This is similar to the clsx or classnames libraries
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        // Bad request
        return data.error || data.message || 'Invalid request';
      case 401:
        // Unauthorized - handled by axios interceptor
        return 'Please login to continue';
      case 403:
        // Forbidden
        return data.error || 'You do not have permission to perform this action';
      case 404:
        // Not found
        return data.error || 'Resource not found';
      case 409:
        // Conflict
        return data.error || 'This resource already exists';
      case 422:
        // Validation error
        return data.error || 'Invalid input data';
      case 429:
        // Rate limit exceeded
        return 'Too many requests. Please try again later';
      case 500:
        // Server error
        return 'An unexpected error occurred. Please try again later';
      default:
        return data.error || 'Something went wrong';
    }
  }

  if (error.request) {
    // Request was made but no response
    return 'Unable to connect to server. Please check your internet connection';
  }

  // Something else went wrong
  return error.message || 'An unexpected error occurred';
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDuration = (minutes) => {
  if (!minutes) return '0m';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return hours ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes}m`;
};

export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};