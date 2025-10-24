import { useState, useEffect } from 'react';
import { Note } from '../types';
import { getNotesLocal, saveNoteLocal, deleteNoteLocal } from '../lib/storage';
import { syncNoteToFirestore, deleteNoteFromFirestore, subscribeToNotes } from '../lib/sync';
import { useAuth } from './useAuth';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadNotes = async () => {
      const localNotes = await getNotesLocal();
      setNotes(localNotes);
      setLoading(false);
    };

    loadNotes();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToNotes(user.uid, (firestoreNotes) => {
      setNotes(firestoreNotes);
    });

    return () => unsubscribe();
  }, [user]);

  const addNote = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    const newNote: Note = {
      ...note,
      id: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: user?.uid || 'local-user',
    };

    if (user && navigator.onLine) {
      const syncedNote = await syncNoteToFirestore(newNote, user.uid);
      if (syncedNote) {
        await saveNoteLocal(syncedNote);
        setNotes(prev => [...prev, syncedNote]);
        return syncedNote;
      }
    }

    newNote.id = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await saveNoteLocal(newNote);
    setNotes(prev => [...prev, newNote]);
    return newNote;
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    const updatedNote = notes.find(n => n.id === id);
    if (!updatedNote) return;

    const newNote = {
      ...updatedNote,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await saveNoteLocal(newNote);
    setNotes(prev => prev.map(n => n.id === id ? newNote : n));

    if (user && navigator.onLine && id.length > 20) {
      await syncNoteToFirestore(newNote, user.uid);
    }
  };

  const deleteNote = async (id: string) => {
    await deleteNoteLocal(id);
    setNotes(prev => prev.filter(n => n.id !== id));

    if (user && navigator.onLine && id.length > 20) {
      await deleteNoteFromFirestore(id);
    }
  };

  return { notes, loading, addNote, updateNote, deleteNote };
};