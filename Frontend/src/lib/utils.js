/**
 * Utility function to conditionally join class names together
 * This is similar to the clsx or classnames libraries
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}