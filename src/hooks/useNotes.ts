import { useState, useEffect, useCallback } from 'react';
import { Note } from '../types';
import { notesAPI } from '../services/notesAPI';

export default function useNotes(userId?: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setNotes(allNotes);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
      setError('Falha ao carregar notas');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Create a new note
  const createNote = useCallback(async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!userId) throw new Error('Usuário não autenticado');

    try {
      const newNote = await notesAPI.createNote(note, userId);
      setNotes(prev => [newNote, ...prev]);
      return newNote;
    } catch (err) {
      console.error('Failed to create note:', err);
      setError('Falha ao criar nota');
      throw err;
    }
  }, [userId]);

  // Update a note
  const updateNote = useCallback(async (noteId: string, noteUpdates: Partial<Note>) => {
    if (!userId) throw new Error('Usuário não autenticado');

    try {
      const updated = await notesAPI.updateNote(noteId, noteUpdates, userId);
      setNotes(prev => prev.map(note => note.id === noteId ? updated : note));
      return updated;
    } catch (err) {
      console.error('Failed to update note:', err);
      setError('Falha ao atualizar nota');
      throw err;
    }
  }, [userId]);

  // Delete a note
  const deleteNote = useCallback(async (noteId: string) => {
    if (!userId) throw new Error('Usuário não autenticado');

    try {
      await notesAPI.deleteNote(noteId, userId);
      setNotes(prev => prev.filter(note => note.id !== noteId));
      return true;
    } catch (err) {
      console.error('Failed to delete note:', err);
      setError('Falha ao deletar nota');
      throw err;
    }
  }, [userId]);

  // Import note from markdown
  const importNoteFromMarkdown = useCallback(async (content: string, title: string) => {
    if (!userId) throw new Error('Usuário não autenticado');

    try {
      const newNote = await notesAPI.importFromMarkdown(content, title, userId);
      setNotes(prev => [newNote, ...prev]);
      return newNote;
    } catch (err) {
      console.error('Failed to import markdown:', err);
      setError('Falha ao importar arquivo markdown');
      throw err;
    }
  }, [userId]);

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    importNoteFromMarkdown,
    refreshNotes: fetchNotes,
  };
}