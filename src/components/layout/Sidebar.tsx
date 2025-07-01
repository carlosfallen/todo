import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Plus,
  Calendar,
  Star,
  Home,
  Moon,
  Sun,
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
  
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);
  
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
  
  const handleDeleteList = async (listId: string) => {
    if (listId === 'default') {
      alert('A lista padrão não pode ser deletada.');
      return;
    }
    
    try {
      await deleteList(listId);
      setShowDeleteConfirm(null);
      
      if (activeListId === listId) {
        setActiveListId('all');
      }
    } catch (error) {
      console.error('Falha ao deletar lista:', error);
      alert('Falha ao deletar a lista. Tente novamente.');
    }
  };
  
  const getIncompleteTaskCount = (listId: string) => {
    return allTasks.filter(task => task.listId === listId && !task.completed).length;
  };
  
  const importantTasksCount = allTasks.filter(task => task.important && !task.completed).length;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const plannedTasksCount = allTasks.filter(task => {
    if (!task.dueDate || task.completed) return false;
    const dueDate = new Date(task.dueDate);
    return dueDate >= today;
  }).length;
  
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
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-30 transition-opacity animate-fade-in"
          onClick={toggleSidebar}
        />
      )}
    
      <aside
        id="mobile-sidebar"
        className={`nav-rail fixed left-0 top-0 h-full w-80 z-40 transition-all duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 overflow-y-auto`}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-500 rounded-2xl flex items-center justify-center">
                <ClipboardList className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-medium text-surface-900 dark:text-surface-50">
                  TaskMaster
                </h1>
                <p className="text-sm text-surface-600 dark:text-surface-400">
                  Organize suas tarefas
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleTheme} 
                className="p-2 rounded-xl hover:bg-surface-200 dark:hover:bg-surface-800 text-surface-700 dark:text-surface-300 transition-colors ripple"
                aria-label="Alternar tema"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              
              <button
                className="md:hidden p-2 rounded-xl hover:bg-surface-200 dark:hover:bg-surface-800 text-surface-700 dark:text-surface-300 transition-colors ripple"
                onClick={toggleSidebar}
                aria-label="Fechar menu"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          <div className="space-y-2 mb-8">
            <button
              className={`nav-item w-full ${
                activeListId === 'all' ? 'nav-item-active' : ''
              } ripple`}
              onClick={() => handleListSelect('all')}
            >
              <Home size={20} />
              <span className="flex-1 text-left">Todas as Tarefas</span>
              <span className="text-xs bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-300 px-2 py-1 rounded-full">
                {allTasks.filter(task => !task.completed).length}
              </span>
            </button>
            
            <button
              className={`nav-item w-full ${
                activeListId === 'important' ? 'nav-item-active' : ''
              } ripple`}
              onClick={() => handleListSelect('important')}
            >
              <Star size={20} className="text-amber-500" />
              <span className="flex-1 text-left">Importantes</span>
              {importantTasksCount > 0 && (
                <span className="text-xs bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-300 px-2 py-1 rounded-full">
                  {importantTasksCount}
                </span>
              )}
            </button>
            
            <button
              className={`nav-item w-full ${
                activeListId === 'planned' ? 'nav-item-active' : ''
              } ripple`}
              onClick={() => handleListSelect('planned')}
            >
              <Calendar size={20} className="text-blue-500" />
              <span className="flex-1 text-left">Planejadas</span>
              {plannedTasksCount > 0 && (
                <span className="text-xs bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-300 px-2 py-1 rounded-full">
                  {plannedTasksCount}
                </span>
              )}
            </button>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-surface-600 dark:text-surface-400 uppercase tracking-wide">
                Minhas Listas
              </h2>
              <button 
                className="p-2 rounded-xl hover:bg-surface-200 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-400 transition-colors ripple"
                onClick={() => setShowNewListForm(true)}
                aria-label="Criar nova lista"
              >
                <Plus size={16} />
              </button>
            </div>
            
            {showNewListForm && (
              <div className="mb-4 animate-slide-down">
                <NewListForm onCancel={() => setShowNewListForm(false)} />
              </div>
            )}
            
            <div className="space-y-1">
              {lists.map(list => (
                <div key={list.id} className="relative group">
                  {showDeleteConfirm === list.id ? (
                    <div className="card p-4 border border-error-200 dark:border-error-800 animate-scale-in">
                      <p className="text-sm text-error-700 dark:text-error-400 mb-3">
                        Deletar esta lista?
                      </p>
                      <div className="flex gap-2">
                        <button
                          className="btn-text text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20 text-sm px-3 py-1"
                          onClick={() => handleDeleteList(list.id)}
                        >
                          Deletar
                        </button>
                        <button
                          className="btn-text text-surface-600 dark:text-surface-400 text-sm px-3 py-1"
                          onClick={() => setShowDeleteConfirm(null)}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`nav-item ${
                        activeListId === list.id ? 'nav-item-active' : ''
                      } group-hover:bg-surface-200 dark:group-hover:bg-surface-800`}
                    >
                      <button
                        className="flex items-center gap-3 flex-1 min-w-0 ripple"
                        onClick={() => handleListSelect(list.id)}
                      >
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: list.color || '#6750a4' }}
                        />
                        <span className="truncate">{list.name}</span>
                      </button>
                      
                      <div className="flex items-center gap-2">
                        {getIncompleteTaskCount(list.id) > 0 && (
                          <span className="text-xs bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-300 px-2 py-1 rounded-full">
                            {getIncompleteTaskCount(list.id)}
                          </span>
                        )}
                        
                        <button
                          className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-surface-300 dark:hover:bg-surface-700 text-surface-500 dark:text-surface-400 hover:text-error-500 dark:hover:text-error-400 transition-all ripple"
                          onClick={() => setShowDeleteConfirm(list.id)}
                          aria-label={`Deletar lista ${list.name}`}
                          disabled={list.id === 'default'}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-auto">
            <button
              className="nav-item w-full ripple"
            >
              <Settings size={20} />
              <span>Configurações</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;