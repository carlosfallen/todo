// taskAPI.ts
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
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../firebase';
import { Task, TaskList } from '../types';


// Helper function to convert Firestore timestamp to ISO string
const convertTimestamp = (timestamp: any): string => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  return timestamp;
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

// Task API functions
export const taskAPI = {
  getAllTasks: async (): Promise<Task[]> => {
    try {
      const tasksRef = collection(db, 'tasks');
      const q = query(tasksRef, orderBy('createdAt', 'desc'));
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
      throw new Error('Failed to fetch tasks');
    }
  },

  getTaskById: async (taskId: string): Promise<Task> => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      const taskSnap = await getDoc(taskRef);
      
      if (!taskSnap.exists()) {
        throw new Error('Task not found');
      }
      
      const data = taskSnap.data();
      return {
        id: taskSnap.id,
        ...data,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt)
      } as Task;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw new Error('Failed to fetch task');
    }
  },

  createTask: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    try {
      const tasksRef = collection(db, 'tasks');
      
      // Remove undefined fields before saving to Firebase
      const cleanedTask = removeUndefinedFields(task);
      
      const taskData = {
        ...cleanedTask,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(tasksRef, taskData);
      
      // Get the created task to return with proper timestamps
      const createdTask = await taskAPI.getTaskById(docRef.id);
      return createdTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw new Error('Failed to create task');
    }
  },

  updateTask: async (taskId: string, taskUpdates: Partial<Task>): Promise<Task> => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      
      // Remove id, createdAt, updatedAt from updates as they shouldn't be manually set
      const { id, createdAt, updatedAt, ...updates } = taskUpdates;
      
      // Remove undefined fields before updating
      const cleanedUpdates = removeUndefinedFields(updates);
      
      await updateDoc(taskRef, {
        ...cleanedUpdates,
        updatedAt: serverTimestamp()
      });
      
      // Return the updated task
      const updatedTask = await taskAPI.getTaskById(taskId);
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      throw new Error('Failed to update task');
    }
  },

  deleteTask: async (taskId: string): Promise<{ success: boolean }> => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await deleteDoc(taskRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting task:', error);
      throw new Error('Failed to delete task');
    }
  },
};

// Task List API functions
export const taskListAPI = {
  getAllTaskLists: async (): Promise<TaskList[]> => {
    try {
      const listsRef = collection(db, 'taskLists');
      const q = query(listsRef, orderBy('createdAt', 'asc'));
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
      
      // If no lists exist, create a default one
      if (lists.length === 0) {
        const defaultList = await taskListAPI.createTaskList({
          name: 'My Tasks',
          color: '#3B82F6'
        });
        return [defaultList];
      }
      
      return lists;
    } catch (error) {
      console.error('Error fetching task lists:', error);
      throw new Error('Failed to fetch task lists');
    }
  },

  getTaskListById: async (listId: string): Promise<TaskList> => {
    try {
      const listRef = doc(db, 'taskLists', listId);
      const listSnap = await getDoc(listRef);
      
      if (!listSnap.exists()) {
        throw new Error('Task list not found');
      }
      
      const data = listSnap.data();
      return {
        id: listSnap.id,
        ...data,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt)
      } as TaskList;
    } catch (error) {
      console.error('Error fetching task list:', error);
      throw new Error('Failed to fetch task list');
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
      throw new Error('Failed to create task list');
    }
  },

  updateTaskList: async (listId: string, listUpdates: Partial<TaskList>): Promise<TaskList> => {
    try {
      const listRef = doc(db, 'taskLists', listId);
      
      // Remove id, createdAt, updatedAt from updates
      const { id, createdAt, updatedAt, ...updates } = listUpdates;
      
      await updateDoc(listRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      // Return the updated list
      const updatedList = await taskListAPI.getTaskListById(listId);
      return updatedList;
    } catch (error) {
      console.error('Error updating task list:', error);
      throw new Error('Failed to update task list');
    }
  },

  deleteTaskList: async (listId: string): Promise<{ success: boolean }> => {
    try {
      // Don't allow deleting the default list (you might want to implement this logic)
      // if (listId === 'default') {
      //   throw new Error('Cannot delete default list');
      // }
      
      const listRef = doc(db, 'taskLists', listId);
      await deleteDoc(listRef);
      
      // When deleting a list, you might want to move all tasks to a default list
      // This would require additional logic to query and update tasks
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting task list:', error);
      throw new Error('Failed to delete task list');
    }
  },
};