import { useState, useCallback, useRef } from 'react';
import { TaskList } from '../types';
import { enhancedTaskListAPI } from '../services/enhancedTaskAPI';

interface OptimisticTaskList extends TaskList {
  isOptimistic?: boolean;
  isDeleting?: boolean;
  error?: string;
  syncStatus?: 'pending' | 'syncing' | 'synced' | 'error';
}

interface UseOptimisticTaskListsReturn {
  lists: OptimisticTaskList[];
  loading: boolean;
  error: string | null;
  activeListId: string;
  setActiveListId: (listId: string) => void;
  createList: (list: Omit<TaskList, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<TaskList>;
  updateList: (listId: string, list: Partial<TaskList>) => Promise<TaskList>;
  deleteList: (listId: string, moveTasksToListId?: string) => Promise<boolean>;
  refreshLists: () => Promise<void>;
}

export default function useOptimisticTaskLists(userId?: string): UseOptimisticTaskListsReturn {
  const [lists, setLists] = useState<OptimisticTaskList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeListId, setActiveListId] = useState<string>('all');
  const optimisticCounter = useRef(0);
  const syncQueue = useRef<Map<string, () => Promise<void>>>(new Map());

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
      setLists(allLists.map(list => ({ ...list, syncStatus: 'synced' })));
    } catch (err) {
      console.error('Failed to fetch lists:', err);
      setError('Falha ao carregar listas');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Process sync queue
  const processSyncQueue = useCallback(async () => {
    const entries = Array.from(syncQueue.current.entries());
    
    for (const [listId, syncFn] of entries) {
      try {
        // Mark as syncing
        setLists(prev => prev.map(list => 
          list.id === listId 
            ? { ...list, syncStatus: 'syncing' }
            : list
        ));

        await syncFn();
        
        // Mark as synced
        setLists(prev => prev.map(list => 
          list.id === listId 
            ? { ...list, syncStatus: 'synced', isOptimistic: false, error: undefined }
            : list
        ));
        
        syncQueue.current.delete(listId);
      } catch (error) {
        console.error(`Sync failed for list ${listId}:`, error);
        
        // Mark as error
        setLists(prev => prev.map(list => 
          list.id === listId 
            ? { ...list, syncStatus: 'error', error: 'Falha ao sincronizar' }
            : list
        ));
      }
    }
  }, []);

  // Add to sync queue
  const addToSyncQueue = useCallback((listId: string, syncFn: () => Promise<void>) => {
    syncQueue.current.set(listId, syncFn);
    
    // Process queue after a short delay to batch operations
    setTimeout(processSyncQueue, 100);
  }, [processSyncQueue]);

  // Create a new list with optimistic updates
  const createList = useCallback(async (list: Omit<TaskList, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!userId) throw new Error('Usuário não autenticado');

    // Create optimistic list
    const optimisticId = `optimistic-${++optimisticCounter.current}`;
    const now = new Date().toISOString();
    const optimisticList: OptimisticTaskList = {
      id: optimisticId,
      ...list,
      userId,
      createdAt: now,
      updatedAt: now,
      isOptimistic: true,
      syncStatus: 'pending',
    };

    // Add optimistic list immediately
    setLists(prev => [...prev, optimisticList]);

    // Add to sync queue
    addToSyncQueue(optimisticId, async () => {
      const createdList = await enhancedTaskListAPI.createTaskList(list, userId);
      
      // Replace optimistic list with real list
      setLists(prev => prev.map(l => 
        l.id === optimisticId 
          ? { ...createdList, syncStatus: 'synced' }
          : l
      ));
      
      return createdList;
    });

    return optimisticList as TaskList;
  }, [userId, addToSyncQueue]);

  // Update a list with optimistic updates
  const updateList = useCallback(async (listId: string, listUpdates: Partial<TaskList>) => {
    if (!userId) throw new Error('Usuário não autenticado');

    // Apply optimistic update immediately
    setLists(prev => prev.map(list => 
      list.id === listId 
        ? { 
            ...list, 
            ...listUpdates, 
            updatedAt: new Date().toISOString(),
            syncStatus: 'pending',
            isOptimistic: true 
          }
        : list
    ));

    // Add to sync queue
    addToSyncQueue(listId, async () => {
      const updated = await enhancedTaskListAPI.updateTaskList(listId, listUpdates, userId);
      
      // Update with real data
      setLists(prev => prev.map(list => 
        list.id === listId 
          ? { ...updated, syncStatus: 'synced' }
          : list
      ));
      
      return updated;
    });

    // Return the optimistically updated list
    const updatedList = lists.find(l => l.id === listId);
    return { ...updatedList, ...listUpdates } as TaskList;
  }, [userId, lists, addToSyncQueue]);

  // Delete a list with optimistic updates
  const deleteList = useCallback(async (listId: string, moveTasksToListId?: string) => {
    if (!userId) throw new Error('Usuário não autenticado');

    // Mark as deleting optimistically
    setLists(prev => prev.map(list => 
      list.id === listId 
        ? { ...list, isDeleting: true, syncStatus: 'pending' }
        : list
    ));

    // Add to sync queue
    addToSyncQueue(listId, async () => {
      await enhancedTaskListAPI.deleteTaskList(listId, userId, moveTasksToListId);
      
      // Remove from state
      setLists(prev => prev.filter(list => list.id !== listId));
    });

    // If we deleted the active list, set the active list to 'all'
    if (activeListId === listId) {
      setActiveListId('all');
    }

    return true;
  }, [userId, activeListId, addToSyncQueue]);

  return {
    lists: lists.filter(list => !list.error), // Filter out error lists
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