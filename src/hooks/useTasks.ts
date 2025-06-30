import { useState, useEffect, useCallback } from 'react';
import { Task, TaskFilter } from '../types';
import { taskStorage } from '../services/localStorage';
import { taskAPI } from '../services/taskAPI';
 
export default function useTasks(listId?: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TaskFilter>({
    search: '',
    completed: false,
    important: false,
    dueDate: null,
    sortBy: 'createdAt'
  });

  // Fetch tasks from API or localStorage if API fails
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const allTasks = await taskAPI.getAllTasks();
      setTasks(allTasks);
    } catch (err) {
      console.error('Failed to fetch tasks from API, falling back to localStorage', err);
      try {
        // Fall back to localStorage
        const localTasks = taskStorage.getAllTasks();
        setTasks(localTasks);
      } catch (localErr) {
        setError('Failed to load tasks');
        console.error('Failed to load tasks from localStorage', localErr);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Create a new task
  const createTask = useCallback(async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTask = await taskAPI.createTask(task);
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (err) {
      console.error('Failed to create task with API, falling back to localStorage', err);
      try {
        // Fall back to localStorage
        const localTask = taskStorage.createTask(task);
        setTasks(prev => [...prev, localTask]);
        return localTask;
      } catch (localErr) {
        setError('Failed to create task');
        console.error('Failed to create task in localStorage', localErr);
        throw localErr;
      }
    }
  }, []);

  // Update a task
  const updateTask = useCallback(async (taskId: string, updatedTask: Partial<Task>) => {
    try {
      const updated = await taskAPI.updateTask(taskId, updatedTask);
      setTasks(prev => prev.map(task => task.id === taskId ? updated : task));
      return updated;
    } catch (err) {
      console.error('Failed to update task with API, falling back to localStorage', err);
      try {
        // Fall back to localStorage
        const localUpdated = taskStorage.updateTask(taskId, updatedTask);
        setTasks(prev => prev.map(task => task.id === taskId ? localUpdated : task));
        return localUpdated;
      } catch (localErr) {
        setError('Failed to update task');
        console.error('Failed to update task in localStorage', localErr);
        throw localErr;
      }
    }
  }, []);

  // Delete a task
  const deleteTask = useCallback(async (taskId: string) => {
    try {
      await taskAPI.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      return true;
    } catch (err) {
      console.error('Failed to delete task with API, falling back to localStorage', err);
      try {
        // Fall back to localStorage
        const success = taskStorage.deleteTask(taskId);
        if (success) {
          setTasks(prev => prev.filter(task => task.id !== taskId));
        }
        return success;
      } catch (localErr) {
        setError('Failed to delete task');
        console.error('Failed to delete task in localStorage', localErr);
        throw localErr;
      }
    }
  }, []);

  // Toggle task completion
  const toggleTaskCompletion = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    return updateTask(taskId, { completed: !task.completed });
  }, [tasks, updateTask]);

  // Toggle task importance
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
    fetchTasks 
  };
}