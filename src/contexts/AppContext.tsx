import React, { createContext, useContext, useState, ReactNode } from 'react';
import useTasks from '../hooks/useTasks';
import useTaskLists from '../hooks/useTaskLists';
import { Task, TaskList, TaskFilter } from '../types';

type AppContextType = {
  // Task operations
  tasks: Task[];
  allTasks: Task[];
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Task>;
  updateTask: (taskId: string, task: Partial<Task>) => Promise<Task>;
  deleteTask: (taskId: string) => Promise<boolean>;
  toggleTaskCompletion: (taskId: string) => Promise<Task | undefined>;
  toggleTaskImportance: (taskId: string) => Promise<Task | undefined>;
  
  // List operations
  lists: TaskList[];
  createList: (list: Omit<TaskList, 'id' | 'createdAt' | 'updatedAt'>) => Promise<TaskList>;
  updateList: (listId: string, list: Partial<TaskList>) => Promise<TaskList>;
  deleteList: (listId: string) => Promise<boolean>;
  
  // Filter operations
  filter: TaskFilter;
  setFilter: React.Dispatch<React.SetStateAction<TaskFilter>>;
  
  // Active list
  activeListId: string;
  setActiveListId: (listId: string) => void;
  activeList: TaskList | undefined;
  
  // UI state
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  isAddingTask: boolean;
  setIsAddingTask: (isAdding: boolean) => void;
  
  // Loading states
  tasksLoading: boolean;
  listsLoading: boolean;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Task and list hooks
  const {
    tasks,
    allTasks,
    loading: tasksLoading,
    filter,
    setFilter,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    toggleTaskImportance,
    fetchTasks, // Make sure this is exported from your useTasks hook
  } = useTasks();
  
  const {
    lists,
    loading: listsLoading,
    activeListId,
    setActiveListId,
    createList,
    updateList,
    deleteList: deleteListFromHook,
  } = useTaskLists();
  
  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [isAddingTask, setIsAddingTask] = useState(false);
  
  // Helpers
  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const activeList = lists.find(list => list.id === activeListId);
  
  // Enhanced deleteList function that also refreshes tasks
  const deleteList = async (listId: string) => {
    try {
      const success = await deleteListFromHook(listId);
      
      if (success) {
        // Refresh tasks after list deletion
        fetchTasks();
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting list:', error);
      throw error;
    }
  };
  
  const value = {
    // Task operations
    tasks,
    allTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    toggleTaskImportance,
    
    // List operations
    lists,
    createList,
    updateList,
    deleteList,
    
    // Filter operations
    filter,
    setFilter,
    
    // Active list
    activeListId,
    setActiveListId,
    activeList,
    
    // UI state
    sidebarOpen,
    toggleSidebar,
    isAddingTask,
    setIsAddingTask,
    
    // Loading states
    tasksLoading,
    listsLoading,
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}