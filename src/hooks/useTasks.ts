import { useState, useEffect, useCallback } from 'react';
import { Task, TaskFilter } from '../types';
import { enhancedTaskAPI } from '../services/enhancedTaskAPI';
 
export default function useTasks(userId?: string, listId?: string) {
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
      setTasks(allTasks);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError('Falha ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Create a new task
  const createTask = useCallback(async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!userId) throw new Error('Usuário não autenticado');

    try {
      const newTask = await enhancedTaskAPI.createTask(task, userId);
      setTasks(prev => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      console.error('Failed to create task:', err);
      setError('Falha ao criar tarefa');
      throw err;
    }
  }, [userId]);

  // Update a task
  const updateTask = useCallback(async (taskId: string, taskUpdates: Partial<Task>) => {
    if (!userId) throw new Error('Usuário não autenticado');

    try {
      const updated = await enhancedTaskAPI.updateTask(taskId, taskUpdates, userId);
      setTasks(prev => prev.map(task => task.id === taskId ? updated : task));
      return updated;
    } catch (err) {
      console.error('Failed to update task:', err);
      setError('Falha ao atualizar tarefa');
      throw err;
    }
  }, [userId]);

  // Delete a task
  const deleteTask = useCallback(async (taskId: string) => {
    if (!userId) throw new Error('Usuário não autenticado');

    try {
      await enhancedTaskAPI.deleteTask(taskId, userId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      return true;
    } catch (err) {
      console.error('Failed to delete task:', err);
      setError('Falha ao deletar tarefa');
      throw err;
    }
  }, [userId]);

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