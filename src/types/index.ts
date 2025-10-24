export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  orderIndex: number;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  important: boolean;
  listId: string;
  notes: string;
  steps: Subtask[];
  createdAt: string;
  updatedAt: string;
  taskId: string;
  orderIndex: number;
  userId: string;
}

export interface FilterState {
  tags: string[];
  status: 'all' | 'completed' | 'pending';
  priority: 'all' | 'important' | 'normal';
}