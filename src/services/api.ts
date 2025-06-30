import { Task, TaskList } from '../types';
// Base URL for API calls
const API_BASE_URL = `http://${window.location.hostname}:5175/api`;

// Helper function for handling API errors
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'An error occurred');
  }
  return response.json();
};

// Task API functions
export const taskAPI = {
  getAllTasks: async (): Promise<Task[]> => {
    const response = await fetch(`${API_BASE_URL}/tasks`);
    return handleResponse(response);
  },

  getTaskById: async (taskId: string): Promise<Task> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`);
    return handleResponse(response);
  },

  createTask: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    return handleResponse(response);
  },

  updateTask: async (taskId: string, task: Partial<Task>): Promise<Task> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    return handleResponse(response);
  },

  deleteTask: async (taskId: string): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

// Task List API functions
export const taskListAPI = {
  getAllTaskLists: async (): Promise<TaskList[]> => {
    const response = await fetch(`${API_BASE_URL}/lists`);
    return handleResponse(response);
  },

  getTaskListById: async (listId: string): Promise<TaskList> => {
    const response = await fetch(`${API_BASE_URL}/lists/${listId}`);
    return handleResponse(response);
  },

  createTaskList: async (list: Omit<TaskList, 'id' | 'createdAt' | 'updatedAt'>): Promise<TaskList> => {
    const response = await fetch(`${API_BASE_URL}/lists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(list),
    });
    return handleResponse(response);
  },

  updateTaskList: async (listId: string, list: Partial<TaskList>): Promise<TaskList> => {
    const response = await fetch(`${API_BASE_URL}/lists/${listId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(list),
    });
    return handleResponse(response);
  },

  deleteTaskList: async (listId: string): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/lists/${listId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};
