import { Note } from '../types';
import { FileText, Trash2 } from 'lucide-react';

interface NotesListProps {
  notes: Note[];
  onSelect: (note: Note) => void;
  onDelete: (id: string) => void;
  searchQuery: string;
}

export const NotesList = ({ notes, onSelect, onDelete, searchQuery }: NotesListProps) => {
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-2">
      {filteredNotes.map(note => (
        <div
          key={note.id}
          className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer group"
          onClick={() => onSelect(note)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <FileText size={18} className="text-blue-500" />
                <h3 className="font-semibold text-gray-800">{note.title}</h3>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{note.content}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {note.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-100 rounded-lg text-red-500"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};