import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { Task, TaskList } from '../types';

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

// Enhanced Task API with user association
export const enhancedTaskAPI = {
  // Get all tasks for a user
  getAllTasks: async (userId: string): Promise<Task[]> => {
    try {
      const tasksRef = collection(db, 'tasks');
      const q = query(
        tasksRef, 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const tasks: Task[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tasks.push({
          id: doc.id,
          ...data,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt)
        } as Task);
      });
      
      return tasks;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw new Error('Falha ao buscar tarefas');
    }
  },

  // Get task by ID
  getTaskById: async (taskId: string, userId: string): Promise<Task> => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      const taskSnap = await getDoc(taskRef);
      
      if (!taskSnap.exists()) {
        throw new Error('Tarefa não encontrada');
      }
      
      const data = taskSnap.data();
      
      // Verify ownership
      if (data.userId !== userId) {
        throw new Error('Acesso negado');
      }
      
      return {
        id: taskSnap.id,
        ...data,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt)
      } as Task;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw new Error('Falha ao buscar tarefa');
    }
  },

  // Create a new task
  createTask: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Task> => {
    try {
      const tasksRef = collection(db, 'tasks');
      
      const cleanedTask = removeUndefinedFields(task);
      
      const taskData = {
        ...cleanedTask,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(tasksRef, taskData);
      
      // Get the created task to return with proper timestamps
      const createdTask = await enhancedTaskAPI.getTaskById(docRef.id, userId);
      return createdTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw new Error('Falha ao criar tarefa');
    }
  },

  // Update a task
  updateTask: async (taskId: string, taskUpdates: Partial<Task>, userId: string): Promise<Task> => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      
      // Verify ownership first
      await enhancedTaskAPI.getTaskById(taskId, userId);
      
      const { id, createdAt, updatedAt, userId: _, ...updates } = taskUpdates;
      const cleanedUpdates = removeUndefinedFields(updates);
      
      await updateDoc(taskRef, {
        ...cleanedUpdates,
        updatedAt: serverTimestamp()
      });
      
      // Return the updated task
      const updatedTask = await enhancedTaskAPI.getTaskById(taskId, userId);
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      throw new Error('Falha ao atualizar tarefa');
    }
  },

  // Delete a task
  deleteTask: async (taskId: string, userId: string): Promise<{ success: boolean }> => {
    try {
      // Verify ownership first
      await enhancedTaskAPI.getTaskById(taskId, userId);
      
      const taskRef = doc(db, 'tasks', taskId);
      await deleteDoc(taskRef);
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting task:', error);
      throw new Error('Falha ao deletar tarefa');
    }
  }
};

// Enhanced Task List API with user association and proper task cleanup
export const enhancedTaskListAPI = {
  // Get all task lists for a user
  getAllTaskLists: async (userId: string): Promise<TaskList[]> => {
    try {
      const listsRef = collection(db, 'taskLists');
      const q = query(
        listsRef, 
        where('userId', '==', userId),
        orderBy('createdAt', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      const lists: TaskList[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        lists.push({
          id: doc.id,
          ...data,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt)
        } as TaskList);
      });
      
      return lists;
    } catch (error) {
      console.error('Error fetching task lists:', error);
      throw new Error('Falha ao buscar listas de tarefas');
    }
  },

  // Get task list by ID
  getTaskListById: async (listId: string, userId: string): Promise<TaskList> => {
    try {
      const listRef = doc(db, 'taskLists', listId);
      const listSnap = await getDoc(listRef);
      
      if (!listSnap.exists()) {
        throw new Error('Lista de tarefas não encontrada');
      }
      
      const data = listSnap.data();
      
      // Verify ownership
      if (data.userId !== userId) {
        throw new Error('Acesso negado');
      }
      
      return {
        id: listSnap.id,
        ...data,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt)
      } as TaskList;
    } catch (error) {
      console.error('Error fetching task list:', error);
      throw new Error('Falha ao buscar lista de tarefas');
    }
  },

  // Create a new task list
  createTaskList: async (list: Omit<TaskList, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<TaskList> => {
    try {
      const listsRef = collection(db, 'taskLists');
      
      const cleanedList = removeUndefinedFields(list);
      
      const listData = {
        ...cleanedList,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(listsRef, listData);
      
      // Get the created list to return with proper timestamps
      const createdList = await enhancedTaskListAPI.getTaskListById(docRef.id, userId);
      return createdList;
    } catch (error) {
      console.error('Error creating task list:', error);
      throw new Error('Falha ao criar lista de tarefas');
    }
  },

  // Update a task list
  updateTaskList: async (listId: string, listUpdates: Partial<TaskList>, userId: string): Promise<TaskList> => {
    try {
      const listRef = doc(db, 'taskLists', listId);
      
      // Verify ownership first
      await enhancedTaskListAPI.getTaskListById(listId, userId);
      
      const { id, createdAt, updatedAt, userId: _, ...updates } = listUpdates;
      const cleanedUpdates = removeUndefinedFields(updates);
      
      await updateDoc(listRef, {
        ...cleanedUpdates,
        updatedAt: serverTimestamp()
      });
      
      // Return the updated list
      const updatedList = await enhancedTaskListAPI.getTaskListById(listId, userId);
      return updatedList;
    } catch (error) {
      console.error('Error updating task list:', error);
      throw new Error('Falha ao atualizar lista de tarefas');
    }
  },

  // Delete a task list and handle associated tasks
  deleteTaskList: async (listId: string, userId: string, moveTasksToListId?: string): Promise<{ success: boolean }> => {
    try {
      // Verify ownership first
      await enhancedTaskListAPI.getTaskListById(listId, userId);
      
      const batch = writeBatch(db);
      
      // Get all tasks associated with this list
      const tasksRef = collection(db, 'tasks');
      const tasksQuery = query(
        tasksRef,
        where('listId', '==', listId),
        where('userId', '==', userId)
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      
      // Handle tasks based on strategy
      if (moveTasksToListId) {
        // Move tasks to another list
        tasksSnapshot.forEach((taskDoc) => {
          batch.update(taskDoc.ref, {
            listId: moveTasksToListId,
            updatedAt: serverTimestamp()
          });
        });
      } else {
        // Delete all tasks in this list
        tasksSnapshot.forEach((taskDoc) => {
          batch.delete(taskDoc.ref);
        });
      }
      
      // Delete the list
      const listRef = doc(db, 'taskLists', listId);
      batch.delete(listRef);
      
      // Commit the batch
      await batch.commit();
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting task list:', error);
      throw new Error('Falha ao deletar lista de tarefas');
    }
  }
};