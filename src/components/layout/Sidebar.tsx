import React, { useState, useEffect } from 'react';
import {
  ListTodo,
  Plus,
  Calendar,
  Star,
  Home,
  SunMoon,
  X,
  Settings,
  Trash2
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import NewListForm from '../lists/NewListForm';

const Sidebar: React.FC = () => {
  const { 
    lists, 
    activeListId, 
    setActiveListId, 
    allTasks,
    sidebarOpen,
    toggleSidebar,
    deleteList
  } = useApp();
  
  const [showNewListForm, setShowNewListForm] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Inicializa o tema baseado na preferência do sistema ou localStorage
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme as 'light' | 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  // Aplicar tema inicial
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // Close sidebar on mobile when a list is selected
  const handleListSelect = (listId: string) => {
    setActiveListId(listId);
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };
  
  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };
  
  // Handle list deletion
  const handleDeleteList = async (listId: string) => {
    if (listId === 'default') {
      // Default list cannot be deleted as per backend logic
      alert('The default list cannot be deleted.');
      return;
    }
    
    // Delete the list
    try {
      await deleteList(listId);
      setShowDeleteConfirm(null);
      
      // If the deleted list was active, switch to 'all' list
      if (activeListId === listId) {
        setActiveListId('all');
      }
    } catch (error) {
      console.error('Failed to delete list:', error);
      alert('Failed to delete the list. Please try again.');
    }
  };
  
  // Count incomplete tasks for each list
  const getIncompleteTaskCount = (listId: string) => {
    return allTasks.filter(task => task.listId === listId && !task.completed).length;
  };
  
  // Count important tasks
  const importantTasksCount = allTasks.filter(task => task.important && !task.completed).length;
  
  // Count tasks due today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const plannedTasksCount = allTasks.filter(task => {
    if (!task.dueDate || task.completed) return false;
    const dueDate = new Date(task.dueDate);
    return dueDate >= today;
  }).length;
  
  // Handle click outside to close sidebar on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('mobile-sidebar');
      const toggleButton = document.getElementById('sidebar-toggle');
      
      if (
        sidebarOpen &&
        sidebar && 
        !sidebar.contains(event.target as Node) && 
        toggleButton && 
        !toggleButton.contains(event.target as Node)
      ) {
        toggleSidebar();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen, toggleSidebar]);
  
  return (
    <>
      {/* Sidebar backdrop for mobile */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-30 transition-opacity"
          onClick={toggleSidebar}
        />
      )}
    
      {/* Sidebar */}
      <aside
        id="mobile-sidebar"
        className={`fixed left-0 top-0 h-full bg-neutral-50 dark:bg-gray-900 w-64 shadow-md dark:shadow-gray-800 z-40 transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 overflow-y-auto`}
        style={{ maxHeight: '100vh' }}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-6 pt-1">
            <h1 className="text-xl font-bold text-primary-700 dark:text-primary-400 flex items-center transition-colors">
              <ListTodo className="mr-2" size={24} />
              TaskMaster
            </h1>
            <div className="flex items-center">
              <button 
                onClick={toggleTheme} 
                className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                aria-label="Toggle theme"
                title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                <SunMoon size={20} />
              </button>
              
              {/* Close button visible only on mobile when sidebar is open */}
              <button
                className="md:hidden p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-gray-800 ml-1 text-gray-700 dark:text-gray-300 transition-colors"
                onClick={toggleSidebar}
                aria-label="Close sidebar"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          <div className="space-y-1 mb-6">
            <button
              className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                activeListId === 'all' 
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' 
                  : 'hover:bg-neutral-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
              onClick={() => handleListSelect('all')}
            >
              <div className="flex items-center">
                <Home size={18} className="mr-3" />
                <span>All Tasks</span>
              </div>
              <span className="text-sm bg-neutral-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">
                {allTasks.filter(task => !task.completed).length}
              </span>
            </button>
            
            <button
              className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                activeListId === 'important' 
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' 
                  : 'hover:bg-neutral-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
              onClick={() => handleListSelect('important')}
            >
              <div className="flex items-center">
                <Star size={18} className="mr-3 text-accent-500 dark:text-accent-400" />
                <span>Important</span>
              </div>
              {importantTasksCount > 0 && (
                <span className="text-sm bg-neutral-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">
                  {importantTasksCount}
                </span>
              )}
            </button>
            
            <button
              className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                activeListId === 'planned' 
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' 
                  : 'hover:bg-neutral-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
              onClick={() => handleListSelect('planned')}
            >
              <div className="flex items-center">
                <Calendar size={18} className="mr-3 text-primary-500 dark:text-primary-400" />
                <span>Planned</span>
              </div>
              {plannedTasksCount > 0 && (
                <span className="text-sm bg-neutral-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">
                  {plannedTasksCount}
                </span>
              )}
            </button>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-medium text-neutral-500 dark:text-gray-400 uppercase">My Lists</h2>
              <button 
                className="p-1.5 rounded-full hover:bg-neutral-200 dark:hover:bg-gray-800 text-neutral-600 dark:text-gray-400 transition-colors"
                onClick={() => setShowNewListForm(true)}
                aria-label="Create new list"
              >
                <Plus size={16} />
              </button>
            </div>
            
            {showNewListForm && (
              <NewListForm onCancel={() => setShowNewListForm(false)} />
            )}
            
            <div className="space-y-1">
              {lists.map(list => (
                <div key={list.id} className="relative group">
                  {showDeleteConfirm === list.id ? (
                    <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-700 dark:text-red-400 mb-2">Delete this list?</p>
                      <div className="flex justify-between">
                        <button
                          className="px-3 py-1 bg-red-500 dark:bg-red-600 text-white text-sm rounded hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
                          onClick={() => handleDeleteList(list.id)}
                        >
                          Delete
                        </button>
                        <button
                          className="px-3 py-1 bg-neutral-300 dark:bg-gray-600 text-neutral-700 dark:text-gray-300 text-sm rounded hover:bg-neutral-400 dark:hover:bg-gray-500 transition-colors"
                          onClick={() => setShowDeleteConfirm(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                        activeListId === list.id 
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' 
                          : 'hover:bg-neutral-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <button
                        className="flex items-center max-w-[80%] flex-grow"
                        onClick={() => handleListSelect(list.id)}
                      >
                        <div 
                          className="min-w-[12px] w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: list.color || '#3B82F6' }}
                        />
                        <span className="truncate">{list.name}</span>
                      </button>
                      
                      <div className="flex items-center">
                        {getIncompleteTaskCount(list.id) > 0 && (
                          <span className="text-sm bg-neutral-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full mr-2">
                            {getIncompleteTaskCount(list.id)}
                          </span>
                        )}
                        
                        {/* Delete button (hidden by default, visible on hover) */}
                        <button
                          className="p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-neutral-200 dark:hover:bg-gray-700 text-neutral-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all"
                          onClick={() => setShowDeleteConfirm(list.id)}
                          aria-label={`Delete ${list.name} list`}
                          disabled={list.id === 'default'}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-auto pb-2">
            <button
              className="w-full flex items-center p-2 rounded-lg text-left hover:bg-neutral-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
            >
              <Settings size={18} className="mr-3 text-neutral-600 dark:text-gray-400" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;