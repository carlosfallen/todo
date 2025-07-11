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
  Trash2,
  FileText,
  LogOut
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import NewListForm from '../lists/NewListForm';

const Sidebar: React.FC = () => {
  const { 
    lists, 
    activeListId, 
    setActiveListId, 
    allTasks,
    sidebarOpen,
    toggleSidebar,
    deleteList,
    viewMode,
    setViewMode
  } = useApp();
  
  const { user, signOut } = useAuth();
  
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
    setViewMode('tasks');
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };
  
  const handleViewChange = (mode: 'tasks' | 'notes' | 'settings') => {
    setViewMode(mode);
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
    try {
      // Get the first available list to move tasks to
      const targetList = lists.find(l => l.id !== listId);
      
      if (targetList) {
        await deleteList(listId, targetList.id);
      } else {
        // If no other lists, just delete (tasks will be deleted too)
        await deleteList(listId);
      }
      
      setShowDeleteConfirm(null);
      
      if (activeListId === listId) {
        setActiveListId('all');
      }
    } catch (error) {
      console.error('Falha ao deletar lista:', error);
      alert('Falha ao deletar a lista. Tente novamente.');
    }
  };
  
  const handleSignOut = async () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      await signOut();
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
    
    if (window.innerWidth < 768) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen, toggleSidebar]);
  
  const CountBadge: React.FC<{ count: number }> = ({ count }) => {
    if (count === 0) return null;
    
    return (
      <span className="text-label-small bg-surface-200 dark:bg-surface-700 text-on-surface-variant px-2 py-1 rounded-full min-w-[1.5rem] text-center">
        {count > 99 ? '99+' : count}
      </span>
    );
  };
  
  return (
    <>
      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-30 transition-opacity animate-fade-in"
          onClick={toggleSidebar}
        />
      )}
    
      <aside
        id="mobile-sidebar"
        className={`nav-rail fixed md:static left-0 top-0 h-full md:min-h-screen w-80 z-40 
          transition-transform duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          md:translate-x-0 md:block md:flex-shrink-0
          overflow-y-auto
        `}
      >
        <div className="flex flex-col h-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-2xl flex items-center justify-center">
                <ClipboardList className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-title-large text-on-surface">
                  TaskMaster
                </h1>
                <p className="text-body-small text-on-surface-variant">
                  {user?.displayName || user?.email?.split('@')[0] || 'Usuário'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleTheme} 
                className="btn-icon"
                aria-label="Alternar tema"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              
              <button
                className="md:hidden btn-icon"
                onClick={toggleSidebar}
                aria-label="Fechar menu"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="space-y-2 mb-8">
            <button
              className={`nav-item w-full ${
                viewMode === 'tasks' && activeListId === 'all' ? 'nav-item-active' : ''
              } ripple`}
              onClick={() => handleListSelect('all')}
            >
              <Home size={20} />
              <span className="flex-1 text-left text-body-large">Todas as Tarefas</span>
              <CountBadge count={allTasks.filter(task => !task.completed).length} />
            </button>
            
            <button
              className={`nav-item w-full ${
                viewMode === 'tasks' && activeListId === 'important' ? 'nav-item-active' : ''
              } ripple`}
              onClick={() => handleListSelect('important')}
            >
              <Star size={20} className="text-amber-500" />
              <span className="flex-1 text-left text-body-large">Importantes</span>
              <CountBadge count={importantTasksCount} />
            </button>
            
            <button
              className={`nav-item w-full ${
                viewMode === 'tasks' && activeListId === 'planned' ? 'nav-item-active' : ''
              } ripple`}
              onClick={() => handleListSelect('planned')}
            >
              <Calendar size={20} className="text-blue-500" />
              <span className="flex-1 text-left text-body-large">Planejadas</span>
              <CountBadge count={plannedTasksCount} />
            </button>
            
            <button
              className={`nav-item w-full ${
                viewMode === 'notes' ? 'nav-item-active' : ''
              } ripple`}
              onClick={() => handleViewChange('notes')}
            >
              <FileText size={20} className="text-green-500" />
              <span className="flex-1 text-left text-body-large">Notas</span>
            </button>
          </div>
          
          {/* Custom Lists */}
          {viewMode === 'tasks' && (
            <div className="mb-6 flex-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-label-large text-on-surface-variant uppercase tracking-wide">
                  Minhas Listas
                </h2>
                <button 
                  className="btn-icon"
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
                      <div className="card p-4 border-t divider border-error-200 dark:border-error-800 animate-scale-in">
                        <p className="text-body-medium text-error-700 dark:text-error-400 mb-3">
                          Deletar esta lista?
                        </p>
                        <div className="flex gap-2">
                          <button
                            className="btn-text text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20 text-label-medium px-3 py-1"
                            onClick={() => handleDeleteList(list.id)}
                          >
                            Deletar
                          </button>
                          <button
                            className="btn-text text-on-surface-variant text-label-medium px-3 py-1"
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
                        } group-hover:bg-surface-100 dark:group-hover:bg-surface-800`}
                      >
                        <button
                          className="flex items-center gap-3 flex-1 min-w-0 ripple"
                          onClick={() => handleListSelect(list.id)}
                        >
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: list.color || '#6750a4' }}
                          />
                          <span className="truncate text-body-large">{list.name}</span>
                        </button>
                        
                        <div className="flex items-center gap-2">
                          <CountBadge count={getIncompleteTaskCount(list.id)} />
                          
                          <button
                            className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-surface-300 dark:hover:bg-surface-700 text-on-surface-variant hover:text-error-500 dark:hover:text-error-400 transition-all ripple"
                            onClick={() => setShowDeleteConfirm(list.id)}
                            aria-label={`Deletar lista ${list.name}`}
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
          )}
          
          {/* Bottom Navigation */}
          <div className="mt-auto space-y-2">
            <button 
              className={`nav-item w-full ripple ${
                viewMode === 'settings' ? 'nav-item-active' : ''
              }`}
              onClick={() => handleViewChange('settings')}
            >
              <Settings size={20} />
              <span className="text-body-large">Configurações</span>
            </button>
            
            <button 
              className="nav-item w-full ripple text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20"
              onClick={handleSignOut}
            >
              <LogOut size={20} />
              <span className="text-body-large">Sair</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;