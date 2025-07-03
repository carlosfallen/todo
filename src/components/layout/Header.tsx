import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, X, Calendar, Star, ArrowUpDown, Filter, Menu, Upload } from 'lucide-react';
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
    <header className="bg-surface-50 dark:bg-surface-900 shadow-elevation-1 p-4 md:p-6 flex flex-col gap-4 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            className="p-2 rounded-xl hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors ripple md:hidden"
            onClick={toggleSidebar}
            aria-label="Abrir menu"
          >
            <Menu size={20} className="text-surface-700 dark:text-surface-300" />
          </button>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-medium text-surface-900 dark:text-surface-50 truncate">
              {activeList ? activeList.name : 'Todas'}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-xl hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors ripple md:hidden"
            onClick={() => setShowSearchBar(!showSearchBar)}
            aria-label="Buscar"
          >
            <Search size={20} className="text-surface-700 dark:text-surface-300" />
          </button>
          
          <button
            className="p-2 rounded-xl hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors ripple"
            onClick={() => setShowImporter(true)}
            aria-label="Importar tarefas"
          >
            <Upload size={20} className="text-surface-700 dark:text-surface-300" />
          </button>

          <div className="relative hidden md:block">
            <Search 
              size={18} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400" 
            />
            <input
              type="text"
              placeholder="Buscar tarefas..."
              value={filter.search}
              onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
              className="input-field pl-10 pr-10 py-3 w-64 rounded-3xl"
            />
            {filter.search && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors ripple"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="relative">
            <button
              className={`p-2 rounded-xl transition-colors ripple ${
                showFilterMenu || Object.values(filter).some(Boolean) 
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                  : 'hover:bg-surface-200 dark:hover:bg-surface-800 text-surface-700 dark:text-surface-300'
              }`}
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              aria-label="Filtrar tarefas"
            >
              <Filter size={20} />
            </button>
            
            {showFilterMenu && (
              <div 
                ref={filterMenuRef}
                className="absolute right-0 mt-2 w-72 card-elevated z-20 animate-slide-down"
              >
                <div className="p-4">
                  <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
                    Ordenar por
                  </h3>
                  <div className="space-y-1">
                    <button
                      className={`flex items-center justify-between w-full p-3 rounded-xl transition-colors ripple ${
                        filter.sortBy === 'importance' 
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                          : 'hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-700 dark:text-surface-300'
                      }`}
                      onClick={() => handleSortChange('importance')}
                    >
                      <span className="flex items-center gap-3">
                        <Star size={16} />
                        Importância
                      </span>
                      {filter.sortBy === 'importance' && <ArrowUpDown size={16} />}
                    </button>
                    
                    <button
                      className={`flex items-center justify-between w-full p-3 rounded-xl transition-colors ripple ${
                        filter.sortBy === 'dueDate' 
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                          : 'hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-700 dark:text-surface-300'
                      }`}
                      onClick={() => handleSortChange('dueDate')}
                    >
                      <span className="flex items-center gap-3">
                        <Calendar size={16} />
                        Data de vencimento
                      </span>
                      {filter.sortBy === 'dueDate' && <ArrowUpDown size={16} />}
                    </button>
                    
                    <button
                      className={`flex items-center justify-between w-full p-3 rounded-xl transition-colors ripple ${
                        filter.sortBy === 'alphabetical' 
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                          : 'hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-700 dark:text-surface-300'
                      }`}
                      onClick={() => handleSortChange('alphabetical')}
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-lg font-medium">A-Z</span>
                        Alfabética
                      </span>
                      {filter.sortBy === 'alphabetical' && <ArrowUpDown size={16} />}
                    </button>
                    
                    <button
                      className={`flex items-center justify-between w-full p-3 rounded-xl transition-colors ripple ${
                        filter.sortBy === 'createdAt' 
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                          : 'hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-700 dark:text-surface-300'
                      }`}
                      onClick={() => handleSortChange('createdAt')}
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-lg font-medium">+</span>
                        Data de criação
                      </span>
                      {filter.sortBy === 'createdAt' && <ArrowUpDown size={16} />}
                    </button>
                  </div>
                </div>
                
                <div className="border-t border-outline-variant/20 p-4">
                  <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
                    Filtros
                  </h3>
                  <div className="space-y-2">
                    <label
                      className={`flex items-center w-full p-3 rounded-xl cursor-pointer transition-colors ripple ${
                        filter.important 
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                          : 'hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-700 dark:text-surface-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={filter.important}
                        onChange={handleImportantFilterToggle}
                        className="mr-3 h-4 w-4 text-primary-600 rounded border-outline focus:ring-primary-500"
                      />
                      <span>Apenas tarefas importantes</span>
                    </label>
                    
                    <label
                      className={`flex items-center w-full p-3 rounded-xl cursor-pointer transition-colors ripple ${
                        filter.completed 
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                          : 'hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-700 dark:text-surface-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={filter.completed}
                        onChange={handleCompletedFilterToggle}
                        className="mr-3 h-4 w-4 text-primary-600 rounded border-outline focus:ring-primary-500"
                      />
                      <span>Tarefas concluídas</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <button
            className="btn-fab w-12 h-12 md:w-auto md:h-auto md:px-6 md:py-3 md:rounded-3xl"
            onClick={() => setIsAddingTask(true)}
            aria-label="Adicionar tarefa"
          >
            <Plus size={18} />
            <span className="hidden md:ml-2 md:inline">Nova Tarefa</span>
          </button>
        </div>
      </div>
      
      {showSearchBar && (
        <div className="relative md:hidden animate-slide-down">
          <Search 
            size={18} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400" 
          />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar tarefas..."
            value={filter.search}
            onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
            className="input-field pl-10 pr-10 py-3 w-full rounded-3xl"
          />
          {filter.search ? (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors ripple"
            >
              <X size={16} />
            </button>
          ) : (
            <button
              onClick={() => setShowSearchBar(false)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors ripple"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {showImporter && <TaskImporter onClose={() => setShowImporter(false)} />}
    </header>
  );
};

export default Header;