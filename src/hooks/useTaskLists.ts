import { useState, useEffect, useCallback } from 'react';
import { TaskList } from '../types';
import { listStorage } from '../services/localStorage';
import { taskListAPI } from '../services/api';

export default function useTaskLists() {
  const [lists, setLists] = useState<TaskList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeListId, setActiveListId] = useState<string>('default');

  // Fetch lists from API or localStorage if API fails
  const fetchLists = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const allLists = await taskListAPI.getAllTaskLists();
      
      // If no lists returned, create a default one
      if (allLists.length === 0) {
        try {
          const defaultList = await taskListAPI.createTaskList({
            name: 'My Tasks',
            color: '#3B82F6'
          });
          setLists([defaultList]);
        } catch (err) {
          console.error('Failed to create default list', err);
          // Fall back to localStorage
          const defaultLists = listStorage.getAllLists();
          setLists(defaultLists);
        }
      } else {
        setLists(allLists);
      }
    } catch (err) {
      console.error('Failed to fetch lists from API, falling back to localStorage', err);
      try {
        // Fall back to localStorage
        const localLists = listStorage.getAllLists();
        setLists(localLists);
      } catch (localErr) {
        setError('Failed to load task lists');
        console.error('Failed to load lists from localStorage', localErr);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  // Create a new list
  const createList = useCallback(async (list: Omit<TaskList, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newList = await taskListAPI.createTaskList(list);
      setLists(prev => [...prev, newList]);
      return newList;
    } catch (err) {
      console.error('Failed to create list with API, falling back to localStorage', err);
      try {
        // Fall back to localStorage
        const localList = listStorage.createList(list);
        setLists(prev => [...prev, localList]);
        return localList;
      } catch (localErr) {
        setError('Failed to create list');
        console.error('Failed to create list in localStorage', localErr);
        throw localErr;
      }
    }
  }, []);

  // Update a list
  const updateList = useCallback(async (listId: string, updatedList: Partial<TaskList>) => {
    try {
      const updated = await taskListAPI.updateTaskList(listId, updatedList);
      setLists(prev => prev.map(list => list.id === listId ? updated : list));
      return updated;
    } catch (err) {
      console.error('Failed to update list with API, falling back to localStorage', err);
      try {
        // Fall back to localStorage
        const localUpdated = listStorage.updateList(listId, updatedList);
        setLists(prev => prev.map(list => list.id === listId ? localUpdated : list));
        return localUpdated;
      } catch (localErr) {
        setError('Failed to update list');
        console.error('Failed to update list in localStorage', localErr);
        throw localErr;
      }
    }
  }, []);

  // Delete a list
  const deleteList = useCallback(async (listId: string) => {
    // Prevent deleting the default list
    if (listId === 'default') {
      setError("Cannot delete the default list");
      return false;
    }
    
    try {
      await taskListAPI.deleteTaskList(listId);
      setLists(prev => prev.filter(list => list.id !== listId));
      
      // If we deleted the active list, set the active list to the default
      if (activeListId === listId) {
        setActiveListId('default');
      }
      
      return true;
    } catch (err) {
      console.error('Failed to delete list with API, falling back to localStorage', err);
      try {
        // Fall back to localStorage
        const success = listStorage.deleteList(listId);
        if (success) {
          setLists(prev => prev.filter(list => list.id !== listId));
          
          // If we deleted the active list, set the active list to the default
          if (activeListId === listId) {
            setActiveListId('default');
          }
        }
        return success;
      } catch (localErr) {
        setError('Failed to delete list');
        console.error('Failed to delete list in localStorage', localErr);
        throw localErr;
      }
    }
  }, [activeListId]);

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