import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs,
  onSnapshot,
  Unsubscribe 
} from 'firebase/firestore';
import { db } from './firebase';
import { Note, Task } from '../types';
import { 
  saveNoteLocal, 
  saveTaskLocal, 
  deleteNoteLocal, 
  deleteTaskLocal,
  getNotesLocal,
  getTasksLocal 
} from './storage';

export const syncNoteToFirestore = async (note: Note, userId: string): Promise<Note | null> => {
  try {
    const noteData = { ...note, userId };
    delete noteData.id;
    
    if (note.id && note.id.length > 20) {
      await updateDoc(doc(db, 'notes', note.id), noteData);
      return note;
    } else {
      const docRef = await addDoc(collection(db, 'notes'), noteData);
      const syncedNote = { ...note, id: docRef.id };
      return syncedNote;
    }
  } catch (error) {
    console.error('Sync note error:', error);
    return null;
  }
};

export const syncTaskToFirestore = async (task: Task, userId: string): Promise<Task | null> => {
  try {
    const taskData = { ...task, userId };
    delete taskData.id;
    
    if (task.id && task.id.length > 20) {
      await updateDoc(doc(db, 'tasks', task.id), taskData);
      return task;
    } else {
      const docRef = await addDoc(collection(db, 'tasks'), taskData);
      const syncedTask = { ...task, id: docRef.id };
      return syncedTask;
    }
  } catch (error) {
    console.error('Sync task error:', error);
    return null;
  }
};

export const deleteNoteFromFirestore = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'notes', id));
  } catch (error) {
    console.error('Delete note error:', error);
  }
};

export const deleteTaskFromFirestore = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'tasks', id));
  } catch (error) {
    console.error('Delete task error:', error);
  }
};

export const subscribeToNotes = (userId: string, callback: (notes: Note[]) => void): Unsubscribe => {
  const q = query(collection(db, 'notes'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
    notes.forEach(saveNoteLocal);
    callback(notes);
  });
};

export const subscribeToTasks = (userId: string, callback: (tasks: Task[]) => void): Unsubscribe => {
  const q = query(collection(db, 'tasks'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
    tasks.forEach(saveTaskLocal);
    callback(tasks);
  });
};

export const syncLocalToFirestore = async (userId: string) => {
  const localNotes = await getNotesLocal();
  const localTasks = await getTasksLocal();
  
  for (const note of localNotes) {
    if (!note.id || note.id.length < 20) {
      await syncNoteToFirestore(note, userId);
    }
  }
  
  for (const task of localTasks) {
    if (!task.id || task.id.length < 20) {
      await syncTaskToFirestore(task, userId);
    }
  }
};