import { Task, TaskList } from '../types';

// Fallback storage service using localStorage
// Used when the backend is not available or for offline functionality

const TASKS_KEY = 'taskmaster_tasks';
const LISTS_KEY = 'taskmaster_lists';

// Task storage functions
export const taskStorage = {
  getAllTasks: (): Task[] => {
    const tasksJson = localStorage.getItem(TASKS_KEY);
    return tasksJson ? JSON.parse(tasksJson) : [];
  },

  getTaskById: (taskId: string): Task | undefined => {
    const tasks = taskStorage.getAllTasks();
    return tasks.find(task => task.id === taskId);
  },

  saveTasks: (tasks: Task[]): void => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  },

  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task => {
    const tasks = taskStorage.getAllTasks();
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    taskStorage.saveTasks([...tasks, newTask]);
    return newTask;
  },

  updateTask: (taskId: string, updatedTask: Partial<Task>): Task => {
    const tasks = taskStorage.getAllTasks();
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    
    const updated: Task = {
      ...tasks[taskIndex],
      ...updatedTask,
      updatedAt: new Date().toISOString()
    };
    
    tasks[taskIndex] = updated;
    taskStorage.saveTasks(tasks);
    return updated;
  },

  deleteTask: (taskId: string): boolean => {
    const tasks = taskStorage.getAllTasks();
    const filteredTasks = tasks.filter(task => task.id !== taskId);
    
    if (filteredTasks.length === tasks.length) {
      return false;
    }
    
    taskStorage.saveTasks(filteredTasks);
    return true;
  }
};

// Task List storage functions
export const listStorage = {
  getAllLists: (): TaskList[] => {
    const listsJson = localStorage.getItem(LISTS_KEY);
    if (!listsJson) {
      // Initialize with default lists if none exist
      const defaultLists: TaskList[] = [
        {
          id: 'default',
          name: 'My Tasks',
          color: '#3B82F6',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      listStorage.saveLists(defaultLists);
      return defaultLists;
    }
    return JSON.parse(listsJson);
  },

  getListById: (listId: string): TaskList | undefined => {
    const lists = listStorage.getAllLists();
    return lists.find(list => list.id === listId);
  },

  saveLists: (lists: TaskList[]): void => {
    localStorage.setItem(LISTS_KEY, JSON.stringify(lists));
  },

  createList: (list: Omit<TaskList, 'id' | 'createdAt' | 'updatedAt'>): TaskList => {
    const lists = listStorage.getAllLists();
    const newList: TaskList = {
      ...list,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    listStorage.saveLists([...lists, newList]);
    return newList;
  },

  updateList: (listId: string, updatedList: Partial<TaskList>): TaskList => {
    const lists = listStorage.getAllLists();
    const listIndex = lists.findIndex(list => list.id === listId);
    
    if (listIndex === -1) {
      throw new Error('List not found');
    }
    
    const updated: TaskList = {
      ...lists[listIndex],
      ...updatedList,
      updatedAt: new Date().toISOString()
    };
    
    lists[listIndex] = updated;
    listStorage.saveLists(lists);
    return updated;
  },

  deleteList: (listId: string): boolean => {
    const lists = listStorage.getAllLists();
    
    // Don't allow deleting the default list
    if (listId === 'default') {
      return false;
    }
    
    const filteredLists = lists.filter(list => list.id !== listId);
    
    if (filteredLists.length === lists.length) {
      return false;
    }
    
    listStorage.saveLists(filteredLists);
    
    // When deleting a list, move all tasks to the default list
    const tasks = taskStorage.getAllTasks();
    const updatedTasks = tasks.map(task => 
      task.listId === listId 
        ? { ...task, listId: 'default', updatedAt: new Date().toISOString() } 
        : task
    );
    
    taskStorage.saveTasks(updatedTasks);
    return true;
  }
};