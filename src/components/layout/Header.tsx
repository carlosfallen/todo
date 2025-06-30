import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, X, Calendar, Star, ArrowDownUp, Filter, Menu, Upload } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { TaskSortOption } from '../../types';
import TaskImporter from '../tasks/TaskImporter';

const Header: React.FC = () => {
  const { 
    activeList,
    filter, 
    setFilter,
    setIsAddingTask,
    sidebarOpen,
    toggleSidebar
  } = useApp();
  
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  useEffect(() => {
    if (showSearchBar && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearchBar]);
  
  const handleClearSearch = () => {
    setFilter(prev => ({ ...prev, search: '' }));
    if (window.innerWidth < 768) {
      setShowSearchBar(false);
    }
  };
  
  const handleSortChange = (sortBy: TaskSortOption) => {
    setFilter(prev => ({ ...prev, sortBy }));
    setShowFilterMenu(false);
  };
  
  const handleImportantFilterToggle = () => {
    setFilter(prev => ({ ...prev, important: !prev.important }));
  };
  
  const handleCompletedFilterToggle = () => {
    setFilter(prev => ({ ...prev, completed: !prev.completed }));
  };
  
  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm p-3 md:p-4 flex flex-col gap-3 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Mobile sidebar toggle integrated in header */}
          <button 
            className="md:hidden p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-gray-800 transition-colors"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Menu size={20} className="text-gray-700 dark:text-gray-300" />
          </button>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-neutral-800 dark:text-gray-100 truncate transition-colors">
              {activeList ? activeList.name : 'All Tasks'}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Mobile search button */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setShowSearchBar(!showSearchBar)}
            aria-label="Toggle search"
          >
            <Search size={20} className="text-gray-700 dark:text-gray-300" />
          </button>
          
          {/* Import button */}
          <button
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setShowImporter(true)}
            aria-label="Import tasks"
          >
            <Upload size={20} className="text-gray-700 dark:text-gray-300" />
          </button>

          {/* Desktop search bar - always visible */}
          <div className="relative hidden md:block">
            <Search 
              size={18} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-gray-500" 
            />
            <input
              type="text"
              placeholder="Search tasks..."
              value={filter.search}
              onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10 pr-8 py-2 w-60 rounded-full border border-neutral-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-400 bg-neutral-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
            />
            {filter.search && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-gray-500 hover:text-neutral-600 dark:hover:text-gray-300 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="relative">
            <button
              className={`p-2 rounded-full transition-colors ${
                showFilterMenu || Object.values(filter).some(Boolean) 
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' 
                  : 'hover:bg-neutral-100 dark:hover:bg-gray-800'
              }`}
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              aria-label="Filter tasks"
            >
              <Filter size={20} className={showFilterMenu || Object.values(filter).some(Boolean) ? '' : 'text-gray-700 dark:text-gray-300'} />
            </button>
            
            {showFilterMenu && (
              <div 
                ref={filterMenuRef}
                className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-neutral-200 dark:border-gray-700 z-20 transition-colors"
              >
                <div className="p-3">
                  <h3 className="text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">Sort by</h3>
                  <div className="space-y-2">
                    <button
                      className={`flex items-center justify-between w-full p-2 rounded-md transition-colors ${
                        filter.sortBy === 'importance' 
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                          : 'hover:bg-neutral-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                      onClick={() => handleSortChange('importance')}
                    >
                      <span className="flex items-center">
                        <Star size={16} className="mr-2" />
                        Importance
                      </span>
                      {filter.sortBy === 'importance' && <ArrowDownUp size={16} />}
                    </button>
                    
                    <button
                      className={`flex items-center justify-between w-full p-2 rounded-md transition-colors ${
                        filter.sortBy === 'dueDate' 
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                          : 'hover:bg-neutral-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                      onClick={() => handleSortChange('dueDate')}
                    >
                      <span className="flex items-center">
                        <Calendar size={16} className="mr-2" />
                        Due date
                      </span>
                      {filter.sortBy === 'dueDate' && <ArrowDownUp size={16} />}
                    </button>
                    
                    <button
                      className={`flex items-center justify-between w-full p-2 rounded-md transition-colors ${
                        filter.sortBy === 'alphabetical' 
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                          : 'hover:bg-neutral-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                      onClick={() => handleSortChange('alphabetical')}
                    >
                      <span className="flex items-center">
                        <span className="mr-2 text-lg">A-Z</span>
                        Alphabetical
                      </span>
                      {filter.sortBy === 'alphabetical' && <ArrowDownUp size={16} />}
                    </button>
                    
                    <button
                      className={`flex items-center justify-between w-full p-2 rounded-md transition-colors ${
                        filter.sortBy === 'createdAt' 
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                          : 'hover:bg-neutral-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                      onClick={() => handleSortChange('createdAt')}
                    >
                      <span className="flex items-center">
                        <span className="mr-2 text-lg">+</span>
                        Creation date
                      </span>
                      {filter.sortBy === 'createdAt' && <ArrowDownUp size={16} />}
                    </button>
                  </div>
                </div>
                
                <div className="border-t border-neutral-200 dark:border-gray-700 p-3">
                  <h3 className="text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">Filter</h3>
                  <div className="space-y-2">
                    <button
                      className={`flex items-center w-full p-2 rounded-md transition-colors ${
                        filter.important 
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                          : 'hover:bg-neutral-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                      onClick={handleImportantFilterToggle}
                    >
                      <input
                        type="checkbox"
                        checked={filter.important}
                        onChange={handleImportantFilterToggle}
                        className="mr-2 h-4 w-4 text-primary-600 dark:text-primary-400 rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                      />
                      <span>Important tasks only</span>
                    </button>
                    
                    <button
                      className={`flex items-center w-full p-2 rounded-md transition-colors ${
                        filter.completed 
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                          : 'hover:bg-neutral-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                      onClick={handleCompletedFilterToggle}
                    >
                      <input
                        type="checkbox"
                        checked={filter.completed}
                        onChange={handleCompletedFilterToggle}
                        className="mr-2 h-4 w-4 text-primary-600 dark:text-primary-400 rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                      />
                      <span>Completed tasks</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <button
            className="flex items-center justify-center w-10 h-10 md:w-auto md:h-auto md:px-3 md:py-2 rounded-full bg-primary-600 dark:bg-primary-700 text-white hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors"
            onClick={() => setIsAddingTask(true)}
            aria-label="Add task"
          >
            <Plus size={18} />
            <span className="hidden md:ml-1 md:inline">Add Task</span>
          </button>
        </div>
      </div>
      
      {/* Mobile search bar - conditionally visible */}
      {showSearchBar && (
        <div className="relative md:hidden">
          <Search 
            size={18} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-gray-500" 
          />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search tasks..."
            value={filter.search}
            onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
            className="pl-10 pr-8 py-2 w-full rounded-full border border-neutral-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-400 bg-neutral-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
          />
          {filter.search ? (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-gray-500 hover:text-neutral-600 dark:hover:text-gray-300 transition-colors"
            >
              <X size={16} />
            </button>
          ) : (
            <button
              onClick={() => setShowSearchBar(false)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-gray-500 hover:text-neutral-600 dark:hover:text-gray-300 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {/* Task importer modal */}
      {showImporter && <TaskImporter onClose={() => setShowImporter(false)} />}
    </header>
  );
};

export default Header;