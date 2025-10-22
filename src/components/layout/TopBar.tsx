import React from 'react';
import { Bell, CheckSquare } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { motion } from 'framer-motion';

interface TopBarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  title?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ darkMode, onToggleDarkMode, title = 'Produtividade' }) => {
  return (
    <div className="fixed top-0 left-0 right-0 ios-glass border-b border-ios-light-border dark:border-ios-dark-border safe-area-top z-50">
      <div className="flex items-center justify-between px-4 py-3">
        <motion.div
          className="flex items-center space-x-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-ios-light-accent to-blue-600 dark:from-ios-dark-accent dark:to-blue-500 rounded-ios flex items-center justify-center shadow-ios-sm">
            <CheckSquare size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-ios-xl font-bold text-ios-light-text dark:text-ios-dark-text tracking-tight">
            {title}
          </h1>
        </motion.div>

        <div className="flex items-center space-x-1">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="p-2.5 rounded-ios-lg text-ios-light-secondary dark:text-ios-dark-secondary hover:bg-ios-light-border/50 dark:hover:bg-ios-dark-border transition-colors"
          >
            <Bell size={22} strokeWidth={2} />
          </motion.button>
          <ThemeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />
        </div>
      </div>
    </div>
  );
};
