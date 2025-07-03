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
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Note } from '../types';

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

export const notesAPI = {
  // Get all notes for a user
  getAllNotes: async (userId: string): Promise<Note[]> => {
    try {
      const notesRef = collection(db, 'notes');
      const q = query(
        notesRef, 
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const notes: Note[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        notes.push({
          id: doc.id,
          ...data,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt)
        } as Note);
      });
      
      return notes;
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw new Error('Falha ao buscar notas');
    }
  },

  // Get note by ID
  getNoteById: async (noteId: string, userId: string): Promise<Note> => {
    try {
      const noteRef = doc(db, 'notes', noteId);
      const noteSnap = await getDoc(noteRef);
      
      if (!noteSnap.exists()) {
        throw new Error('Nota não encontrada');
      }
      
      const data = noteSnap.data();
      
      // Verify ownership
      if (data.userId !== userId) {
        throw new Error('Acesso negado');
      }
      
      return {
        id: noteSnap.id,
        ...data,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt)
      } as Note;
    } catch (error) {
      console.error('Error fetching note:', error);
      throw new Error('Falha ao buscar nota');
    }
  },

  // Create a new note
  createNote: async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Note> => {
    try {
      const notesRef = collection(db, 'notes');
      
      const cleanedNote = removeUndefinedFields(note);
      
      const noteData = {
        ...cleanedNote,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(notesRef, noteData);
      
      // Get the created note to return with proper timestamps
      const createdNote = await notesAPI.getNoteById(docRef.id, userId);
      return createdNote;
    } catch (error) {
      console.error('Error creating note:', error);
      throw new Error('Falha ao criar nota');
    }
  },

  // Update a note
  updateNote: async (noteId: string, noteUpdates: Partial<Note>, userId: string): Promise<Note> => {
    try {
      const noteRef = doc(db, 'notes', noteId);
      
      // Verify ownership first
      const existingNote = await notesAPI.getNoteById(noteId, userId);
      
      const { id, createdAt, updatedAt, userId: _, ...updates } = noteUpdates;
      const cleanedUpdates = removeUndefinedFields(updates);
      
      await updateDoc(noteRef, {
        ...cleanedUpdates,
        updatedAt: serverTimestamp()
      });
      
      // Return the updated note
      const updatedNote = await notesAPI.getNoteById(noteId, userId);
      return updatedNote;
    } catch (error) {
      console.error('Error updating note:', error);
      throw new Error('Falha ao atualizar nota');
    }
  },

  // Delete a note
  deleteNote: async (noteId: string, userId: string): Promise<{ success: boolean }> => {
    try {
      // Verify ownership first
      await notesAPI.getNoteById(noteId, userId);
      
      const noteRef = doc(db, 'notes', noteId);
      await deleteDoc(noteRef);
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting note:', error);
      throw new Error('Falha ao deletar nota');
    }
  },

  // Import note from markdown file
  importFromMarkdown: async (content: string, title: string, userId: string): Promise<Note> => {
    try {
      const note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> = {
        title,
        content,
        tags: extractTagsFromContent(content),
        userId
      };
      
      return await notesAPI.createNote(note, userId);
    } catch (error) {
      console.error('Error importing markdown:', error);
      throw new Error('Falha ao importar arquivo markdown');
    }
  }
};

// Helper function to extract tags from markdown content
function extractTagsFromContent(content: string): string[] {
  const tagRegex = /#(\w+)/g;
  const tags: string[] = [];
  let match;
  
  while ((match = tagRegex.exec(content)) !== null) {
    if (!tags.includes(match[1])) {
      tags.push(match[1]);
    }
  }
  
  return tags;
}