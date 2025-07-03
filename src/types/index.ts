export interface TaskStep {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  assignee?: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  important: boolean;
  notes?: string;
  dueDate?: string;
  listId: string;
  steps: TaskStep[];
  userId?: string; // Para associar com Firebase Auth
  createdAt: string;
  updatedAt: string;
}

export interface TaskList {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  userId?: string; // Para associar com Firebase Auth
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string; // Markdown content
  tags: string[];
  userId?: string; // Para associar com Firebase Auth
  createdAt: string;
  updatedAt: string;
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

export type TaskSortOption = 'dueDate' | 'importance' | 'alphabetical' | 'createdAt';

export interface TaskFilter {
  search: string;
  completed: boolean;
  important: boolean;
  dueDate: string | null;
  sortBy: TaskSortOption;
}

export type ViewMode = 'tasks' | 'notes' | 'settings';