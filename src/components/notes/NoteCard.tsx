import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Hash, 
  Edit3, 
  Trash2, 
  Calendar, 
  FileText,
  Sparkles
} from 'lucide-react';
import { Note } from '../../types';
import { deleteNote } from '../../services/firebase/firestore';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onView: (note: Note) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onView }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir esta nota?')) {
      try {
        await deleteNote(note.id);
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  const getPreviewText = (content: string) => {
    return content.replace(/[#*`>\[\]]/g, '').substring(0, 150) + (content.length > 150 ? '...' : '');
  };

  const getWordCount = (content: string) => {
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const isRecent = () => {
    const now = new Date();
    const noteDate = new Date(note.updatedAt);
    const diffHours = (now.getTime() - noteDate.getTime()) / (1000 * 60 * 60);
    return diffHours < 24;
  };

  const gradients = [
    'from-purple-500 to-pink-500',
    'from-cyan-500 to-blue-500',
    'from-orange-500 to-red-500',
    'from-green-500 to-emerald-500',
    'from-indigo-500 to-purple-500',
  ];

  const gradient = gradients[Math.abs(note.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % gradients.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => onView(note)}
      className="relative bg-white dark:bg-gray-800 rounded-3xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer group hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 shadow-sm hover:shadow-2xl"
    >
      {/* Gradient Header */}
      <div className={`h-2 bg-gradient-to-r ${gradient}`}></div>

      {/* Recent Badge */}
      {isRecent() && (
        <div className="absolute top-4 right-4 z-10">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-3 h-3 bg-green-500 rounded-full shadow-lg"
          ></motion.div>
        </div>
      )}

      <div className="p-6">
        {/* Title */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <FileText size={20} className={`text-transparent bg-gradient-to-r ${gradient} bg-clip-text flex-shrink-0`} />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {note.title}
            </h3>
          </div>
          
          {/* Actions */}
          <div className={`flex items-center gap-1 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(note);
              }}
              className="p-1.5 rounded-xl text-gray-400 hover:text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all"
            >
              <Edit3 size={16} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDelete}
              className="p-1.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            >
              <Trash2 size={16} />
            </motion.button>
          </div>
        </div>

        {/* Preview */}
        {note.content && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-4">
              {getPreviewText(note.content)}
            </p>
          </div>
        )}

        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {note.tags.slice(0, 3).map(tag => (
              <motion.span
                key={tag}
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full"
              >
                <Hash size={10} className="mr-1" />
                {tag}
              </motion.span>
            ))}
            {note.tags.length > 3 && (
              <span className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-full">
                +{note.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <FileText size={12} className="mr-1" />
              <span>{getWordCount(note.content)} palavras</span>
            </div>
            
            {isRecent() && (
              <div className="flex items-center text-green-600 dark:text-green-400">
                <Sparkles size={12} className="mr-1" />
                <span>Recente</span>
              </div>
            )}
          </div>

          <div className="flex items-center">
            <Calendar size={12} className="mr-1" />
            <span>{format(new Date(note.updatedAt), 'dd/MM/yy', { locale: ptBR })}</span>
          </div>
        </div>
      </div>

      {/* Hover Effect */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
    </motion.div>
  );
};