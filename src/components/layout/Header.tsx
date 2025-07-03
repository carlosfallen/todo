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
  
  const hasActiveFilters = filter.important || filter.completed || filter.search;
  
  return (
    <header className="surface-container shadow-elevation-1 p-4 md:p-6 flex flex-col gap-4 transition-all duration-200 border-b divider">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button 
            className="btn-icon md:hidden"
            onClick={toggleSidebar}
            aria-label="Abrir menu"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-headline-medium text-on-surface truncate">
              {activeList ? activeList.name : 'Todas as Tarefas'}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            className="btn-icon md:hidden"
            onClick={() => setShowSearchBar(!showSearchBar)}
            aria-label="Buscar"
          >
            <Search size={20} />
          </button>
          
          <button
            className="btn-icon"
            onClick={() => setShowImporter(true)}
            aria-label="Importar tarefas"
          >
            <Upload size={20} />
          </button>

          <div className="relative hidden md:block">
            <div className="relative">
              <Search 
                size={18} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant" 
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
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors ripple p-1 rounded-full"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="relative">
            <button
              className={`btn-icon ${
                showFilterMenu || hasActiveFilters
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                  : ''
              }`}
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              aria-label="Filtrar tarefas"
            >
              <Filter size={20} />
              {hasActiveFilters && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-600 rounded-full"></div>
              )}
            </button>
            
            {showFilterMenu && (
              <div 
                ref={filterMenuRef}
                className="absolute right-0 mt-2 w-80 card-elevated z-20 animate-scale-in"
              >
                <div className="p-6">
                  <h3 className="text-title-medium text-on-surface mb-4">
                    Ordenar por
                  </h3>
                  <div className="space-y-1 mb-6">
                    {[
                      { key: 'importance', icon: Star, label: 'Importância' },
                      { key: 'dueDate', icon: Calendar, label: 'Data de vencimento' },
                      { key: 'alphabetical', icon: () => <span className="text-lg font-medium">A-Z</span>, label: 'Alfabética' },
                      { key: 'createdAt', icon: () => <span className="text-lg font-medium">+</span>, label: 'Data de criação' }
                    ].map(({ key, icon: Icon, label }) => (
                      <button
                        key={key}
                        className={`flex items-center justify-between w-full p-3 rounded-xl transition-all duration-200 ripple ${
                          filter.sortBy === key 
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                            : 'hover:bg-surface-100 dark:hover:bg-surface-800 text-on-surface'
                        }`}
                        onClick={() => handleSortChange(key as TaskSortOption)}
                      >
                        <span className="flex items-center gap-3">
                          <Icon size={16} />
                          <span className="text-body-large">{label}</span>
                        </span>
                        {filter.sortBy === key && <ArrowUpDown size={16} />}
                      </button>
                    ))}
                  </div>
                  
                  <div className="border-t divider pt-4">
                    <h3 className="text-title-medium text-on-surface mb-4">
                      Filtros
                    </h3>
                    <div className="space-y-2">
                      <label
                        className={`flex items-center w-full p-3 rounded-xl cursor-pointer transition-all duration-200 ripple ${
                          filter.important 
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                            : 'hover:bg-surface-100 dark:hover:bg-surface-800 text-on-surface'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={filter.important}
                          onChange={handleImportantFilterToggle}
                          className="mr-3 h-4 w-4 text-primary-600 rounded border-surface-300 focus:ring-primary-500"
                        />
                        <span className="text-body-large">Apenas tarefas importantes</span>
                      </label>
                      
                      <label
                        className={`flex items-center w-full p-3 rounded-xl cursor-pointer transition-all duration-200 ripple ${
                          filter.completed 
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                            : 'hover:bg-surface-100 dark:hover:bg-surface-800 text-on-surface'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={filter.completed}
                          onChange={handleCompletedFilterToggle}
                          className="mr-3 h-4 w-4 text-primary-600 rounded border-surface-300 focus:ring-primary-500"
                        />
                        <span className="text-body-large">Tarefas concluídas</span>
                      </label>
                    </div>
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
            <span className="hidden md:ml-2 md:inline text-label-large">Nova Tarefa</span>
          </button>
        </div>
      </div>
      
      {showSearchBar && (
        <div className="relative md:hidden animate-slide-down">
          <Search 
            size={18} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant" 
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
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors ripple p-1 rounded-full"
            >
              <X size={16} />
            </button>
          ) : (
            <button
              onClick={() => setShowSearchBar(false)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors ripple p-1 rounded-full"
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