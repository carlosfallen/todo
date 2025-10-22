import React from 'react';
import { CheckSquare, FileText, User, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  activeTab: 'tasks' | 'notes' | 'profile';
  onTabChange: (tab: 'tasks' | 'notes' | 'profile') => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isOpen,
  onToggle
}) => {
  const menuItems = [
    { id: 'tasks', label: 'Tarefas', icon: CheckSquare, color: 'from-purple-500 to-purple-600' },
    { id: 'notes', label: 'Notas', icon: FileText, color: 'from-cyan-500 to-cyan-600' },
    { id: 'profile', label: 'Perfil', icon: User, color: 'from-orange-500 to-orange-600' }
  ] as const;

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isOpen ? 0 : -280,
          width: isOpen ? 290 : 80
        }}
        className={`
          fixed left-0 top-0 h-full bg-white dark:bg-gray-800 
          border-r border-gray-200 dark:border-gray-700 z-50
          transition-all duration-300 ease-in-out
          ${isOpen ? 'w-72' : 'w-20'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="full-logo"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">P</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                      Productivity
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Organize-se melhor</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="mini-logo"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg mx-auto"
                >
                  <span className="text-white font-bold text-lg">P</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map(({ id, label, icon: Icon, color }) => (
              <motion.button
                key={id}
                onClick={() => onTabChange(id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl
                  transition-all duration-200 group relative overflow-hidden
                  ${activeTab === id
                    ? 'bg-gradient-to-r ' + color + ' text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                {activeTab === id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r"
                    style={{ background: `linear-gradient(to right, ${color})` }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon size={22} className="relative z-10 flex-shrink-0" />
                <AnimatePresence>
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="font-medium relative z-10"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onToggle}
              className="w-full flex items-center justify-center p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isOpen ? <X size={20} className="text-gray-600 dark:text-gray-400" /> : <Menu size={20} className="text-gray-600 dark:text-gray-400" />}
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};