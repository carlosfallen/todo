import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  serverTimestamp,
  Timestamp,
  writeBatch,
  onSnapshot,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';
import { db } from './optimizedFirebase';
import { Task, TaskList } from '../types';

// Cache para melhor performance
const taskCache = new Map<string, Task>();
const listCache = new Map<string, TaskList>();

// Helper function to convert Firestore timestamp to ISO string
const convertTimestamp = (timestamp: any): string => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  return timestamp || new Date().toISOString();
};

// Helper function to remove undefined values from object
const removeUndefinedFields = (obj: any): any => {
  const cleaned: any = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  });
  return cleaned;
};

// Optimistic updates for better UX
const optimisticUpdates = new Map<string, any>();

// Task API functions with optimizations
export const taskAPI = {
  // Real-time listener for tasks
  subscribeToTasks: (callback: (tasks: Task[]) => void) => {
    const tasksRef = collection(db, 'tasks');
    const q = query(tasksRef, orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const tasks: Task[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const task = {
          id: doc.id,
          ...data,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt)
        } as Task;
        
        // Update cache
        taskCache.set(doc.id, task);
        tasks.push(task);
      });
      
      callback(tasks);
    }, (error) => {
      console.error('Error listening to tasks:', error);
      // Fallback to cache
      callback(Array.from(taskCache.values()));
    });
  },

  getAllTasks: async (): Promise<Task[]> => {
    try {
      // Return cached data immediately if available
      if (taskCache.size > 0) {
        const cachedTasks = Array.from(taskCache.values());
        // Still fetch fresh data in background
        taskAPI.refreshTasks();
        return cachedTasks;
      }

      const tasksRef = collection(db, 'tasks');
      const q = query(tasksRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const tasks: Task[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const task = {
          id: doc.id,
          ...data,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt)
        } as Task;
        
        taskCache.set(doc.id, task);
        tasks.push(task);
      });
      
      return tasks;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      // Return cached data as fallback
      return Array.from(taskCache.values());
    }
  },

  refreshTasks: async () => {
    try {
      const tasksRef = collection(db, 'tasks');
      const q = query(tasksRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const task = {
          id: doc.id,
          ...data,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt)
        } as Task;
        
        taskCache.set(doc.id, task);
      });
    } catch (error) {
      console.error('Error refreshing tasks:', error);
    }
  },

  getTaskById: async (taskId: string): Promise<Task> => {
    try {
      // Check cache first
      if (taskCache.has(taskId)) {
        return taskCache.get(taskId)!;
      }

      const taskRef = doc(db, 'tasks', taskId);
      const taskSnap = await getDoc(taskRef);
      
      if (!taskSnap.exists()) {
        throw new Error('Tarefa não encontrada');
      }
      
      const data = taskSnap.data();
      const task = {
        id: taskSnap.id,
        ...data,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt)
      } as Task;

      taskCache.set(taskId, task);
      return task;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw new Error('Falha ao buscar tarefa');
    }
  },

  createTask: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    try {
      const tasksRef = collection(db, 'tasks');
      
      // Remove undefined fields before saving to Firebase
      const cleanedTask = removeUndefinedFields(task);
      
      // Create optimistic update
      const tempId = `temp_${Date.now()}`;
      const optimisticTask: Task = {
        id: tempId,
        ...cleanedTask,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add to cache immediately for instant UI update
      taskCache.set(tempId, optimisticTask);
      optimisticUpdates.set(tempId, optimisticTask);
      
      const taskData = {
        ...cleanedTask,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(tasksRef, taskData);
      
      // Remove optimistic update and add real task
      taskCache.delete(tempId);
      optimisticUpdates.delete(tempId);
      
      // Get the created task to return with proper timestamps
      const createdTask = await taskAPI.getTaskById(docRef.id);
      return createdTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw new Error('Falha ao criar tarefa');
    }
  },

  updateTask: async (taskId: string, taskUpdates: Partial<Task>): Promise<Task> => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      
      // Remove id, createdAt, updatedAt from updates as they shouldn't be manually set
      const { id, createdAt, updatedAt, ...updates } = taskUpdates;
      
      // Remove undefined fields before updating
      const cleanedUpdates = removeUndefinedFields(updates);

      // Optimistic update
      if (taskCache.has(taskId)) {
        const currentTask = taskCache.get(taskId)!;
        const optimisticTask = {
          ...currentTask,
          ...cleanedUpdates,
          updatedAt: new Date().toISOString()
        };
        taskCache.set(taskId, optimisticTask);
      }
      
      await updateDoc(taskRef, {
        ...cleanedUpdates,
        updatedAt: serverTimestamp()
      });
      
      // Return the updated task
      const updatedTask = await taskAPI.getTaskById(taskId);
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      throw new Error('Falha ao atualizar tarefa');
    }
  },

  deleteTask: async (taskId: string): Promise<{ success: boolean }> => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      
      // Optimistic delete
      taskCache.delete(taskId);
      
      await deleteDoc(taskRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting task:', error);
      throw new Error('Falha ao deletar tarefa');
    }
  },

  // Batch operations for better performance
  batchUpdateTasks: async (updates: Array<{ id: string; updates: Partial<Task> }>) => {
    try {
      const batch = writeBatch(db);
      
      updates.forEach(({ id, updates: taskUpdates }) => {
        const taskRef = doc(db, 'tasks', id);
        const { id: _, createdAt, updatedAt, ...cleanUpdates } = taskUpdates;
        const cleanedUpdates = removeUndefinedFields(cleanUpdates);
        
        batch.update(taskRef, {
          ...cleanedUpdates,
          updatedAt: serverTimestamp()
        });
      });
      
      await batch.commit();
      return { success: true };
    } catch (error) {
      console.error('Error batch updating tasks:', error);
      throw new Error('Falha ao atualizar tarefas em lote');
    }
  }
};

// Task List API functions with optimizations
export const taskListAPI = {
  subscribeToLists: (callback: (lists: TaskList[]) => void) => {
    const listsRef = collection(db, 'taskLists');
    const q = query(listsRef, orderBy('createdAt', 'asc'));
    
    return onSnapshot(q, (snapshot) => {
      const lists: TaskList[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const list = {
          id: doc.id,
          ...data,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt)
        } as TaskList;
        
        listCache.set(doc.id, list);
        lists.push(list);
      });
      
      callback(lists);
    }, (error) => {
      console.error('Error listening to lists:', error);
      callback(Array.from(listCache.values()));
    });
  },

  getAllTaskLists: async (): Promise<TaskList[]> => {
    try {
      // Return cached data immediately if available
      if (listCache.size > 0) {
        const cachedLists = Array.from(listCache.values());
        // Still fetch fresh data in background
        taskListAPI.refreshLists();
        return cachedLists;
      }

      const listsRef = collection(db, 'taskLists');
      const q = query(listsRef, orderBy('createdAt', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const lists: TaskList[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const list = {
          id: doc.id,
          ...data,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt)
        } as TaskList;
        
        listCache.set(doc.id, list);
        lists.push(list);
      });
      
      // If no lists exist, create a default one
      if (lists.length === 0) {
        const defaultList = await taskListAPI.createTaskList({
          name: 'Minhas Tarefas',
          color: '#6750a4'
        });
        return [defaultList];
      }
      
      return lists;
    } catch (error) {
      console.error('Error fetching task lists:', error);
      return Array.from(listCache.values());
    }
  },

  refreshLists: async () => {
    try {
      const listsRef = collection(db, 'taskLists');
      const q = query(listsRef, orderBy('createdAt', 'asc'));
      const querySnapshot = await getDocs(q);
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const list = {
          id: doc.id,
          ...data,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt)
        } as TaskList;
        
        listCache.set(doc.id, list);
      });
    } catch (error) {
      console.error('Error refreshing lists:', error);
    }
  },

  getTaskListById: async (listId: string): Promise<TaskList> => {
    try {
      if (listCache.has(listId)) {
        return listCache.get(listId)!;
      }

      const listRef = doc(db, 'taskLists', listId);
      const listSnap = await getDoc(listRef);
      
      if (!listSnap.exists()) {
        throw new Error('Lista de tarefas não encontrada');
      }
      
      const data = listSnap.data();
      const list = {
        id: listSnap.id,
        ...data,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt)
      } as TaskList;

      listCache.set(listId, list);
      return list;
    } catch (error) {
      console.error('Error fetching task list:', error);
      throw new Error('Falha ao buscar lista de tarefas');
    }
  },

  createTaskList: async (list: Omit<TaskList, 'id' | 'createdAt' | 'updatedAt'>): Promise<TaskList> => {
    try {
      const listsRef = collection(db, 'taskLists');
      const listData = {
        ...list,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(listsRef, listData);
      
      // Get the created list to return with proper timestamps
      const createdList = await taskListAPI.getTaskListById(docRef.id);
      return createdList;
    } catch (error) {
      console.error('Error creating task list:', error);
      throw new Error('Falha ao criar lista de tarefas');
    }
  },

  updateTaskList: async (listId: string, listUpdates: Partial<TaskList>): Promise<TaskList> => {
    try {
      const listRef = doc(db, 'taskLists', listId);
      
      // Remove id, createdAt, updatedAt from updates
      const { id, createdAt, updatedAt, ...updates } = listUpdates;

      // Optimistic update
      if (listCache.has(listId)) {
        const currentList = listCache.get(listId)!;
        const optimisticList = {
          ...currentList,
          ...updates,
          updatedAt: new Date().toISOString()
        };
        listCache.set(listId, optimisticList);
      }
      
      await updateDoc(listRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      // Return the updated list
      const updatedList = await taskListAPI.getTaskListById(listId);
      return updatedList;
    } catch (error) {
      console.error('Error updating task list:', error);
      throw new Error('Falha ao atualizar lista de tarefas');
    }
  },

  deleteTaskList: async (listId: string): Promise<{ success: boolean }> => {
    try {
      const listRef = doc(db, 'taskLists', listId);
      
      // Optimistic delete
      listCache.delete(listId);
      
      await deleteDoc(listRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting task list:', error);
      throw new Error('Falha ao deletar lista de tarefas');
    }
  },
};