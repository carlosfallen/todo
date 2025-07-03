import { useState, useEffect, useCallback } from 'react';
import { TaskList } from '../types';
import { enhancedTaskListAPI } from '../services/enhancedTaskAPI';
 
export default function useTaskLists(userId?: string) {
  const [lists, setLists] = useState<TaskList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeListId, setActiveListId] = useState<string>('all');

  // Fetch lists from API
  const fetchLists = useCallback(async () => {
    if (!userId) {
      setLists([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const allLists = await enhancedTaskListAPI.getAllTaskLists(userId);
      setLists(allLists);
    } catch (err) {
      console.error('Failed to fetch lists:', err);
      setError('Falha ao carregar listas');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  // Create a new list
  const createList = useCallback(async (list: Omit<TaskList, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!userId) throw new Error('Usuário não autenticado');

    try {
      const newList = await enhancedTaskListAPI.createTaskList(list, userId);
      setLists(prev => [...prev, newList]);
      return newList;
    } catch (err) {
      console.error('Failed to create list:', err);
      setError('Falha ao criar lista');
      throw err;
    }
  }, [userId]);

  // Update a list
  const updateList = useCallback(async (listId: string, updatedList: Partial<TaskList>) => {
    if (!userId) throw new Error('Usuário não autenticado');

    try {
      const updated = await enhancedTaskListAPI.updateTaskList(listId, updatedList, userId);
      setLists(prev => prev.map(list => list.id === listId ? updated : list));
      return updated;
    } catch (err) {
      console.error('Failed to update list:', err);
      setError('Falha ao atualizar lista');
      throw err;
    }
  }, [userId]);

  // Delete a list
  const deleteList = useCallback(async (listId: string, moveTasksToListId?: string) => {
    if (!userId) throw new Error('Usuário não autenticado');

    try {
      await enhancedTaskListAPI.deleteTaskList(listId, userId, moveTasksToListId);
      setLists(prev => prev.filter(list => list.id !== listId));
      
      // If we deleted the active list, set the active list to 'all'
      if (activeListId === listId) {
        setActiveListId('all');
      }
      
      return true;
    } catch (err) {
      console.error('Failed to delete list:', err);
      setError('Falha ao deletar lista');
      throw err;
    }
  }, [userId, activeListId]);

  return {
    lists,
    loading,
    error,
    activeListId,
    setActiveListId,
    createList,
    updateList,
    deleteList,
    refreshLists: fetchLists,
  };
}