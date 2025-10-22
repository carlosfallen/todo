import React, { useState, useEffect } from 'react';
import { Plus, Search, Hash, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Note } from '../../types';
import { NoteCard } from './NoteCard';
import { NoteEditor } from './NoteEditor';
import { NoteViewer } from './NoteViewer';
import { Button } from '../ui/Button';
import { subscribeToNotes } from '../../services/firebase/firestore';

interface NoteListProps {
  userId: string;
}

const CACHE_KEY_NOTES = 'cached_notes';

export const NoteList: React.FC<NoteListProps> = ({ userId }) => {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const cached = localStorage.getItem(`${CACHE_KEY_NOTES}_${userId}`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(notes.length === 0);

  useEffect(() => {
    const unsubscribe = subscribeToNotes(userId, (data) => {
      setNotes(data);
      localStorage.setItem(`${CACHE_KEY_NOTES}_${userId}`, JSON.stringify(data));
      setLoading(false);
    });
    return unsubscribe;
  }, [userId]);

  useEffect(() => {
    let filtered = notes;

    if (searchTerm) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedTag) {
      filtered = filtered.filter(note => note.tags.includes(selectedTag));
    }

    setFilteredNotes(filtered);
  }, [notes, searchTerm, selectedTag]);

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setShowEditor(true);
  };

  const handleViewNote = (note: Note) => {
    setViewingNote(note);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setEditingNote(null);
  };

  const handleCloseViewer = () => {
    setViewingNote(null);
  };

  const handleEditFromViewer = () => {
    if (viewingNote) {
      setEditingNote(viewingNote);
      setViewingNote(null);
      setShowEditor(true);
    }
  };

  const allTags = Array.from(new Set(notes.flatMap(note => note.tags))).sort();

  const stats = {
    total: notes.length,
    tagged: notes.filter(n => n.tags.length > 0).length,
    recent: notes.filter(n => {
      const daysDiff = (new Date().getTime() - new Date(n.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff < 7;
    }).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando notas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total de Notas</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <Sparkles size={24} className="text-white" />
            </div>
          </div>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Esta Semana</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.recent}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <span className="text-2xl">🔥</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Minhas Notas</h1>
          <Button
            onClick={() => setShowEditor(true)}
            variant="primary"
            className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
          >
            <Plus size={18} className="mr-2" />
            Nova Nota
          </Button>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar notas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedTag('')}
              className={`
                px-4 py-2 text-sm font-medium rounded-2xl transition-all
                ${!selectedTag
                  ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }
              `}
            >
              Todas
            </motion.button>
            {allTags.map(tag => (
              <motion.button
                key={tag}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
                className={`
                  inline-flex items-center px-4 py-2 text-sm font-medium rounded-2xl transition-all
                  ${tag === selectedTag
                    ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }
                `}
              >
                <Hash size={14} className="mr-1" />
                {tag}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredNotes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={handleEditNote}
              onView={handleViewNote}
            />
          ))}
        </AnimatePresence>
      </div>

      {filteredNotes.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 border border-gray-200 dark:border-gray-700 text-center">
          <div className="text-gray-400 dark:text-gray-500">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-purple-100 to-cyan-100 dark:from-purple-900/20 dark:to-cyan-900/20 flex items-center justify-center">
              <Sparkles size={40} className="opacity-50" />
            </div>
            <p className="text-xl font-medium mb-2">Nenhuma nota encontrada</p>
            <p className="text-sm">
              {searchTerm || selectedTag
                ? 'Tente ajustar os filtros de pesquisa'
                : 'Crie sua primeira nota para começar'
              }
            </p>
          </div>
        </div>
      )}

      {showEditor && (
        <NoteEditor
          note={editingNote}
          onClose={handleCloseEditor}
          userId={userId}
        />
      )}

      {viewingNote && (
        <NoteViewer
          note={viewingNote}
          onClose={handleCloseViewer}
          onEdit={handleEditFromViewer}
        />
      )}
    </div>
  );
};