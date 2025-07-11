import { useState, useCallback, useRef } from 'react';
import { Task, TaskFilter } from '../types';
import { enhancedTaskAPI } from '../services/enhancedTaskAPI';

interface OptimisticTask extends Task {
  isOptimistic?: boolean;
  isDeleting?: boolean;
  error?: string;
  syncStatus?: 'pending' | 'syncing' | 'synced' | 'error';
}

interface UseOptimisticTasksReturn {
  tasks: OptimisticTask[];
  allTasks: OptimisticTask[];
  loading: boolean;
  error: string | null;
  filter: TaskFilter;
  setFilter: React.Dispatch<React.SetStateAction<TaskFilter>>;
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<Task>;
  updateTask: (taskId: string, task: Partial<Task>) => Promise<Task>;
  deleteTask: (taskId: string) => Promise<boolean>;
  toggleTaskCompletion: (taskId: string) => Promise<Task | undefined>;
  toggleTaskImportance: (taskId: string) => Promise<Task | undefined>;
  refreshTasks: () => Promise<void>;
}

export default function useOptimisticTasks(userId?: string, listId?: string): UseOptimisticTasksReturn {
  const [tasks, setTasks] = useState<OptimisticTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TaskFilter>({
    search: '',
    completed: false,
    important: false,
    dueDate: null,
    sortBy: 'createdAt'
  });
  const optimisticCounter = useRef(0);
  const syncQueue = useRef<Map<string, () => Promise<void>>>(new Map());

  // Fetch tasks from API
  const fetchTasks = useCallback(async () => {
    if (!userId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const allTasks = await enhancedTaskAPI.getAllTasks(userId);
      setTasks(allTasks.map(task => ({ ...task, syncStatus: 'synced' })));
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError('Falha ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Process sync queue
  const processSyncQueue = useCallback(async () => {
    const entries = Array.from(syncQueue.current.entries());
    
    for (const [taskId, syncFn] of entries) {
      try {
        // Mark as syncing
        setTasks(prev => prev.map(task => 
          task.id === taskId 
            ? { ...task, syncStatus: 'syncing' }
            : task
        ));

        await syncFn();
        
        // Mark as synced
        setTasks(prev => prev.map(task => 
          task.id === taskId 
            ? { ...task, syncStatus: 'synced', isOptimistic: false, error: undefined }
            : task
        ));
        
        syncQueue.current.delete(taskId);
      } catch (error) {
        console.error(`Sync failed for task ${taskId}:`, error);
        
        // Mark as error
        setTasks(prev => prev.map(task => 
          task.id === taskId 
            ? { ...task, syncStatus: 'error', error: 'Falha ao sincronizar' }
            : task
        ));
      }
    }
  }, []);

  // Add to sync queue
  const addToSyncQueue = useCallback((taskId: string, syncFn: () => Promise<void>) => {
    syncQueue.current.set(taskId, syncFn);
    
    // Process queue after a short delay to batch operations
    setTimeout(processSyncQueue, 100);
  }, [processSyncQueue]);

  // Create a new task with optimistic updates
  const createTask = useCallback(async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!userId) throw new Error('Usuário não autenticado');

    // Create optimistic task
    const optimisticId = `optimistic-${++optimisticCounter.current}`;
    const now = new Date().toISOString();
    const optimisticTask: OptimisticTask = {
      id: optimisticId,
      ...task,
      userId,
      createdAt: now,
      updatedAt: now,
      isOptimistic: true,
      syncStatus: 'pending',
    };

    // Add optimistic task immediately
    setTasks(prev => [optimisticTask, ...prev]);

    // Add to sync queue
    addToSyncQueue(optimisticId, async () => {
      const createdTask = await enhancedTaskAPI.createTask(task, userId);
      
      // Replace optimistic task with real task
      setTasks(prev => prev.map(t => 
        t.id === optimisticId 
          ? { ...createdTask, syncStatus: 'synced' }
          : t
      ));
      
      return createdTask;
    });

    return optimisticTask as Task;
  }, [userId, addToSyncQueue]);

  // Update a task with optimistic updates
  const updateTask = useCallback(async (taskId: string, taskUpdates: Partial<Task>) => {
    if (!userId) throw new Error('Usuário não autenticado');

    // Apply optimistic update immediately
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            ...taskUpdates, 
            updatedAt: new Date().toISOString(),
            syncStatus: 'pending',
            isOptimistic: true 
          }
        : task
    ));

    // Add to sync queue
    addToSyncQueue(taskId, async () => {
      const updated = await enhancedTaskAPI.updateTask(taskId, taskUpdates, userId);
      
      // Update with real data
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...updated, syncStatus: 'synced' }
          : task
      ));
      
      return updated;
    });

    // Return the optimistically updated task
    const updatedTask = tasks.find(t => t.id === taskId);
    return { ...updatedTask, ...taskUpdates } as Task;
  }, [userId, tasks, addToSyncQueue]);

  // Delete a task with optimistic updates
  const deleteTask = useCallback(async (taskId: string) => {
    if (!userId) throw new Error('Usuário não autenticado');

    // Mark as deleting optimistically
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, isDeleting: true, syncStatus: 'pending' }
        : task
    ));

    // Add to sync queue
    addToSyncQueue(taskId, async () => {
      await enhancedTaskAPI.deleteTask(taskId, userId);
      
      // Remove from state
      setTasks(prev => prev.filter(task => task.id !== taskId));
    });

    return true;
  }, [userId, addToSyncQueue]);

  // Toggle task completion with optimistic updates
  const toggleTaskCompletion = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    return updateTask(taskId, { completed: !task.completed });
  }, [tasks, updateTask]);

  // Toggle task importance with optimistic updates
  const toggleTaskImportance = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    return updateTask(taskId, { important: !task.important });
  }, [tasks, updateTask]);

  // Filter and sort tasks
  const filteredTasks = useCallback(() => {
    let filtered = tasks;
    
    // Filter by list if listId is provided
    if (listId) {
      filtered = filtered.filter(task => task.listId === listId);
    }
    
    // Apply search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchLower) || 
        (task.notes && task.notes.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply completed filter
    if (filter.completed) {
      filtered = filtered.filter(task => task.completed);
    }
    
    // Apply important filter
    if (filter.important) {
      filtered = filtered.filter(task => task.important);
    }
    
    // Apply due date filter
    if (filter.dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(task => {
        if (!task.dueDate) return false;
        
        const dueDate = new Date(task.dueDate);
        
        if (filter.dueDate === 'today') {
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          return dueDate >= today && dueDate < tomorrow;
        }
        
        if (filter.dueDate === 'upcoming') {
          return dueDate >= today;
        }
        
        if (filter.dueDate === 'overdue') {
          return dueDate < today && !task.completed;
        }
        
        return true;
      });
    }
    
    // Sort tasks
    return filtered.sort((a, b) => {
      // Always show incomplete tasks first, then sort by the selected option
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      
      switch (filter.sortBy) {
        case 'dueDate':
          // Tasks without due dates go to the bottom
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          
        case 'importance':
          return a.important === b.important ? 0 : a.important ? -1 : 1;
          
        case 'alphabetical':
          return a.title.localeCompare(b.title);
          
        case 'createdAt':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [tasks, listId, filter]);

  return {
    tasks: filteredTasks(),
    allTasks: tasks,
    loading,
    error,
    filter,
    setFilter,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    toggleTaskImportance,
    refreshTasks: fetchTasks,
  };
}