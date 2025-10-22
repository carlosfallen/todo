import React from 'react';
import { CheckSquare, FileText, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface BottomNavigationProps {
  activeTab: 'tasks' | 'notes' | 'profile';
  onTabChange: (tab: 'tasks' | 'notes' | 'profile') => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange
}) => {
  const tabs = [
    { id: 'tasks', label: 'Tarefas', icon: CheckSquare },
    { id: 'notes', label: 'Notas', icon: FileText },
    { id: 'profile', label: 'Perfil', icon: User }
  ] as const;

  return (
    <div className="fixed bottom-0 left-0 right-0 ios-glass border-t border-ios-light-border dark:border-ios-dark-border safe-area-bottom z-50">
      <div className="flex items-center justify-around px-2 py-1">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <motion.button
              key={id}
              onClick={() => onTabChange(id)}
              className={`
                relative flex flex-col items-center justify-center py-2 px-6 rounded-ios-lg transition-all duration-200
                ${isActive ? 'text-ios-light-accent dark:text-ios-dark-accent' : 'text-ios-light-secondary dark:text-ios-dark-secondary'}
              `}
              whileTap={{ scale: 0.9 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-ios-light-accent/10 dark:bg-ios-dark-accent/10 rounded-ios-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon
                size={28}
                strokeWidth={isActive ? 2.5 : 2}
                className="relative z-10 mb-1"
              />
              <span className={`relative z-10 text-ios-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
