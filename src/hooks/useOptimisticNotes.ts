import { useState, useCallback, useRef } from 'react';
import { Note } from '../types';
import { notesAPI } from '../services/notesAPI';

interface OptimisticNote extends Note {
  isOptimistic?: boolean;
  isDeleting?: boolean;
  error?: string;
}

interface UseOptimisticNotesReturn {
  notes: OptimisticNote[];
  loading: boolean;
  error: string | null;
  createNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<Note>;
  updateNote: (noteId: string, note: Partial<Note>) => Promise<Note>;
  deleteNote: (noteId: string) => Promise<boolean>;
  importNoteFromMarkdown: (content: string, title: string) => Promise<Note>;
  refreshNotes: () => Promise<void>;
}

export default function useOptimisticNotes(userId?: string): UseOptimisticNotesReturn {
  const [notes, setNotes] = useState<OptimisticNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const optimisticCounter = useRef(0);

  // Fetch notes from API
  const fetchNotes = useCallback(async () => {
    if (!userId) {
      setNotes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const allNotes = await notesAPI.getAllNotes(userId);
      setNotes(allNotes.map(note => ({ ...note, isOptimistic: false })));
    } catch (err) {
      console.error('Failed to fetch notes:', err);
      setError('Falha ao carregar notas');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Create a new note with optimistic updates
  const createNote = useCallback(async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!userId) throw new Error('Usuário não autenticado');

    // Create optimistic note
    const optimisticId = `optimistic-${++optimisticCounter.current}`;
    const now = new Date().toISOString();
    const optimisticNote: OptimisticNote = {
      id: optimisticId,
      ...note,
      userId,
      createdAt: now,
      updatedAt: now,
      isOptimistic: true,
    };

    // Add optimistic note immediately
    setNotes(prev => [optimisticNote, ...prev]);

    try {
      // Create actual note
      const createdNote = await notesAPI.createNote(note, userId);
      
      // Replace optimistic note with real note
      setNotes(prev => prev.map(n => 
        n.id === optimisticId 
          ? { ...createdNote, isOptimistic: false }
          : n
      ));
      
      return createdNote;
    } catch (err) {
      console.error('Failed to create note:', err);
      
      // Mark optimistic note with error
      setNotes(prev => prev.map(n => 
        n.id === optimisticId 
          ? { ...n, error: 'Falha ao criar nota' }
          : n
      ));
      
      // Remove failed optimistic note after delay
      setTimeout(() => {
        setNotes(prev => prev.filter(n => n.id !== optimisticId));
      }, 3000);
      
      throw err;
    }
  }, [userId]);

  // Update a note with optimistic updates
  const updateNote = useCallback(async (noteId: string, noteUpdates: Partial<Note>) => {
    if (!userId) throw new Error('Usuário não autenticado');

    // Apply optimistic update
    setNotes(prev => prev.map(note => 
      note.id === noteId 
        ? { 
            ...note, 
            ...noteUpdates, 
            updatedAt: new Date().toISOString(),
            isOptimistic: true 
          }
        : note
    ));

    try {
      const updated = await notesAPI.updateNote(noteId, noteUpdates, userId);
      
      // Replace with real updated note
      setNotes(prev => prev.map(note => 
        note.id === noteId 
          ? { ...updated, isOptimistic: false }
          : note
      ));
      
      return updated;
    } catch (err) {
      console.error('Failed to update note:', err);
      
      // Revert optimistic update
      await fetchNotes();
      throw err;
    }
  }, [userId, fetchNotes]);

  // Delete a note with optimistic updates
  const deleteNote = useCallback(async (noteId: string) => {
    if (!userId) throw new Error('Usuário não autenticado');

    // Mark as deleting optimistically
    setNotes(prev => prev.map(note => 
      note.id === noteId 
        ? { ...note, isDeleting: true }
        : note
    ));

    try {
      await notesAPI.deleteNote(noteId, userId);
      
      // Remove from state
      setNotes(prev => prev.filter(note => note.id !== noteId));
      
      return true;
    } catch (err) {
      console.error('Failed to delete note:', err);
      
      // Revert delete state
      setNotes(prev => prev.map(note => 
        note.id === noteId 
          ? { ...note, isDeleting: false, error: 'Falha ao deletar nota' }
          : note
      ));
      
      throw err;
    }
  }, [userId]);

  // Import note from markdown
  const importNoteFromMarkdown = useCallback(async (content: string, title: string) => {
    if (!userId) throw new Error('Usuário não autenticado');

    try {
      const newNote = await notesAPI.importFromMarkdown(content, title, userId);
      setNotes(prev => [{ ...newNote, isOptimistic: false }, ...prev]);
      return newNote;
    } catch (err) {
      console.error('Failed to import markdown:', err);
      setError('Falha ao importar arquivo markdown');
      throw err;
    }
  }, [userId]);

  return {
    notes: notes.filter(note => !note.error), // Filter out error notes
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    importNoteFromMarkdown,
    refreshNotes: fetchNotes,
  };
}