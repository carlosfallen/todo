import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Note, Task } from '../types';

interface ProductivityDB extends DBSchema {
  notes: {
    key: string;
    value: Note;
  };
  tasks: {
    key: string;
    value: Task;
  };
}

let dbInstance: IDBPDatabase<ProductivityDB> | null = null;

export const initDB = async () => {
  if (dbInstance) return dbInstance;
  
  dbInstance = await openDB<ProductivityDB>('productivity-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('notes')) {
        db.createObjectStore('notes', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('tasks')) {
        db.createObjectStore('tasks', { keyPath: 'id' });
      }
    },
  });
  
  return dbInstance;
};

export const saveNoteLocal = async (note: Note) => {
  const db = await initDB();
  await db.put('notes', note);
};

export const getNotesLocal = async (): Promise<Note[]> => {
  const db = await initDB();
  return db.getAll('notes');
};

export const deleteNoteLocal = async (id: string) => {
  const db = await initDB();
  await db.delete('notes', id);
};

export const saveTaskLocal = async (task: Task) => {
  const db = await initDB();
  await db.put('tasks', task);
};

export const getTasksLocal = async (): Promise<Task[]> => {
  const db = await initDB();
  return db.getAll('tasks');
};

export const deleteTaskLocal = async (id: string) => {
  const db = await initDB();
  await db.delete('tasks', id);
};

export const clearAllLocal = async () => {
  const db = await initDB();
  await db.clear('notes');
  await db.clear('tasks');
};