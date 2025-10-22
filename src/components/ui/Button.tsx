import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation';

  const variants = {
    primary: 'bg-ios-light-accent dark:bg-ios-dark-accent text-white hover:opacity-90 shadow-ios-sm active:scale-95 rounded-ios-lg',
    secondary: 'bg-ios-light-card dark:bg-ios-dark-elevated text-ios-light-text dark:text-ios-dark-text border border-ios-light-border dark:border-ios-dark-border hover:bg-ios-light-border dark:hover:bg-ios-dark-border active:scale-95 rounded-ios-lg',
    outline: 'border-2 border-ios-light-accent dark:border-ios-dark-accent text-ios-light-accent dark:text-ios-dark-accent hover:bg-ios-light-accent/10 dark:hover:bg-ios-dark-accent/10 active:scale-95 rounded-ios-lg',
    ghost: 'text-ios-light-secondary dark:text-ios-dark-secondary hover:bg-ios-light-border/50 dark:hover:bg-ios-dark-border/50 active:scale-95 rounded-ios-lg'
  };

  const sizes = {
    sm: 'px-4 py-2 text-ios-sm',
    md: 'px-5 py-2.5 text-ios-base',
    lg: 'px-6 py-3.5 text-ios-lg'
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent mr-2" />
      ) : null}
      {children}
    </motion.button>
  );
};
