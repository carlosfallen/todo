import { Note, Task } from '../types';
import { saveNoteLocal, saveTaskLocal } from '../lib/storage';

export const importProject = async (file: File): Promise<{ notes: Note[], tasks: Task[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (!data.notes || !data.tasks) {
          throw new Error('Invalid project file');
        }
        
        const notes: Note[] = data.notes.map((note: Note) => ({
          ...note,
          id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          updatedAt: new Date().toISOString(),
        }));
        
        const tasks: Task[] = data.tasks.map((task: Task) => ({
          ...task,
          id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          updatedAt: new Date().toISOString(),
        }));
        
        for (const note of notes) {
          await saveNoteLocal(note);
        }
        
        for (const task of tasks) {
          await saveTaskLocal(task);
        }
        
        resolve({ notes, tasks });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};