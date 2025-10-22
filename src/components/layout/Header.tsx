import React from 'react';
import { Sun, Moon, Menu, Bell, Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onMenuClick: () => void;
  sidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ darkMode, onToggleDarkMode, onMenuClick, sidebarOpen }) => {
  return (
    <header className={`fixed top-0 right-0 h-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 z-30 transition-all duration-300 ${sidebarOpen ? 'left-0 lg:left-72' : 'left-0 lg:left-0'}`}>
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between max-w-full">
        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
          <button
            onClick={onMenuClick}
            className="flex-shrink-0 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Menu size={22} className="text-gray-600 dark:text-gray-400" />
          </button>

          <div className="hidden sm:flex items-center space-x-3 bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2.5 flex-1 max-w-md">
            <Search size={18} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Pesquisar..."
              className="bg-transparent border-none outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 text-sm w-full"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors relative"
          >
            <Bell size={20} className="text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleDarkMode}
            className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 transition-all shadow-lg"
          >
            {darkMode ? (
              <Sun size={20} className="text-white" />
            ) : (
              <Moon size={20} className="text-white" />
            )}
          </motion.button>
        </div>
      </div>
    </header>
  );
};