import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import useTasks from '../hooks/useTasks';
import useTaskLists from '../hooks/useTaskLists';
import useOptimisticNotes from '../hooks/useOptimisticNotes';
import { Task, TaskList, Note, TaskFilter, ViewMode } from '../types';

type AppContextType = {
  // View mode
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  
  // Task operations
  tasks: Task[];
  allTasks: Task[];
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<Task>;
  updateTask: (taskId: string, task: Partial<Task>) => Promise<Task>;
  deleteTask: (taskId: string) => Promise<boolean>;
  toggleTaskCompletion: (taskId: string) => Promise<Task | undefined>;
  toggleTaskImportance: (taskId: string) => Promise<Task | undefined>;
  
  // List operations
  lists: TaskList[];
  createList: (list: Omit<TaskList, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<TaskList>;
  updateList: (listId: string, list: Partial<TaskList>) => Promise<TaskList>;
  deleteList: (listId: string, moveTasksToListId?: string) => Promise<boolean>;
  
  // Note operations
  notes: Note[];
  createNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<Note>;
  updateNote: (noteId: string, note: Partial<Note>) => Promise<Note>;
  deleteNote: (noteId: string) => Promise<boolean>;
  importNoteFromMarkdown: (content: string, title: string) => Promise<Note>;
  
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
  notesLoading: boolean;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('tasks');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Only initialize hooks if user is authenticated
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
  } = useTasks(user?.uid);
  
  const {
    lists,
    loading: listsLoading,
    activeListId,
    setActiveListId,
    createList,
    updateList,
    deleteList,
  } = useTaskLists(user?.uid);

  const {
    notes,
    loading: notesLoading,
    createNote,
    updateNote,
    deleteNote,
    importNoteFromMarkdown,
  } = useOptimisticNotes(user?.uid);
  
  // Helpers
  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const activeList = lists.find(list => list.id === activeListId);
  
  const value = {
    // View mode
    viewMode,
    setViewMode,
    
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
    
    // Note operations
    notes,
    createNote,
    updateNote,
    deleteNote,
    importNoteFromMarkdown,
    
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
    notesLoading,
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