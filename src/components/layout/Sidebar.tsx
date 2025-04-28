import React, { useState, useEffect } from 'react';
import {
  ListTodo,
  Plus,
  Calendar,
  Star,
  Home,
  SunMoon,
  X,
  Settings
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
    toggleSidebar
  } = useApp();
  
  const [showNewListForm, setShowNewListForm] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
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
      return newTheme;
    });
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
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        />
      )}
    
      {/* Sidebar */}
      <aside
        id="mobile-sidebar"
        className={`fixed left-0 top-0 h-full bg-neutral-50 w-64 shadow-md z-40 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 overflow-y-auto`}
        style={{ maxHeight: '100vh' }}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-6 pt-1">
            <h1 className="text-xl font-bold text-primary-700 flex items-center">
              <ListTodo className="mr-2" size={24} />
              TaskMaster
            </h1>
            <div className="flex items-center">
              <button 
                onClick={toggleTheme} 
                className="p-2 rounded-full hover:bg-neutral-200"
                aria-label="Toggle theme"
              >
                <SunMoon size={20} />
              </button>
              
              {/* Close button visible only on mobile when sidebar is open */}
              <button
                className="md:hidden p-2 rounded-full hover:bg-neutral-200 ml-1"
                onClick={toggleSidebar}
                aria-label="Close sidebar"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          <div className="space-y-1 mb-6">
            <button
              className={`w-full flex items-center justify-between p-2 rounded-lg text-left ${
                activeListId === 'all' ? 'bg-primary-100 text-primary-700' : 'hover:bg-neutral-200'
              }`}
              onClick={() => handleListSelect('all')}
            >
              <div className="flex items-center">
                <Home size={18} className="mr-3" />
                <span>All Tasks</span>
              </div>
              <span className="text-sm bg-neutral-200 px-2 py-0.5 rounded-full">
                {allTasks.filter(task => !task.completed).length}
              </span>
            </button>
            
            <button
              className={`w-full flex items-center justify-between p-2 rounded-lg text-left ${
                activeListId === 'important' ? 'bg-primary-100 text-primary-700' : 'hover:bg-neutral-200'
              }`}
              onClick={() => handleListSelect('important')}
            >
              <div className="flex items-center">
                <Star size={18} className="mr-3 text-accent-500" />
                <span>Important</span>
              </div>
              {importantTasksCount > 0 && (
                <span className="text-sm bg-neutral-200 px-2 py-0.5 rounded-full">
                  {importantTasksCount}
                </span>
              )}
            </button>
            
            <button
              className={`w-full flex items-center justify-between p-2 rounded-lg text-left ${
                activeListId === 'planned' ? 'bg-primary-100 text-primary-700' : 'hover:bg-neutral-200'
              }`}
              onClick={() => handleListSelect('planned')}
            >
              <div className="flex items-center">
                <Calendar size={18} className="mr-3 text-primary-500" />
                <span>Planned</span>
              </div>
              {plannedTasksCount > 0 && (
                <span className="text-sm bg-neutral-200 px-2 py-0.5 rounded-full">
                  {plannedTasksCount}
                </span>
              )}
            </button>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-medium text-neutral-500 uppercase">My Lists</h2>
              <button 
                className="p-1.5 rounded-full hover:bg-neutral-200 text-neutral-600"
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
                <button
                  key={list.id}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left ${
                    activeListId === list.id ? 'bg-primary-100 text-primary-700' : 'hover:bg-neutral-200'
                  }`}
                  onClick={() => handleListSelect(list.id)}
                >
                  <div className="flex items-center max-w-[80%]">
                    <div 
                      className="min-w-[12px] w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: list.color || '#3B82F6' }}
                    />
                    <span className="truncate">{list.name}</span>
                  </div>
                  {getIncompleteTaskCount(list.id) > 0 && (
                    <span className="text-sm bg-neutral-200 px-2 py-0.5 rounded-full">
                      {getIncompleteTaskCount(list.id)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mt-auto pb-2">
            <button
              className="w-full flex items-center p-2 rounded-lg text-left hover:bg-neutral-200"
            >
              <Settings size={18} className="mr-3 text-neutral-600" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;