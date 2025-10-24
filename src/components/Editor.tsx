import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Note } from '../types';
import { X, Eye, Edit, Download } from 'lucide-react';
import { exportNoteAsMarkdown } from '../utils/export';

interface EditorProps {
  note: Note | null;
  onClose: () => void;
  onSave: (updates: Partial<Note>) => void;
}

export const Editor = ({ note, onClose, onSave }: EditorProps) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState(note?.tags.join(', ') || '');
  const [preview, setPreview] = useState(false);

  if (!note) return null;

  const handleSave = () => {
    onSave({
      title,
      content,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    });
  };

  const handleExport = () => {
    exportNoteAsMarkdown({ ...note, title, content, tags: tags.split(',').map(t => t.trim()) });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            className="text-2xl font-bold flex-1 outline-none"
            placeholder="Note Title"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreview(!preview)}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title={preview ? 'Edit' : 'Preview'}
            >
              {preview ? <Edit size={20} /> : <Eye size={20} />}
            </button>
            <button
              onClick={handleExport}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="Export as Markdown"
            >
              <Download size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {preview ? (
            <div className="prose max-w-none">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={handleSave}
              className="w-full h-full resize-none outline-none font-mono"
              placeholder="Start writing in Markdown..."
            />
          )}
        </div>

        <div className="p-4 border-t">
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            onBlur={handleSave}
            className="w-full px-3 py-2 border rounded-lg outline-none"
            placeholder="Tags (comma separated)"
          />
        </div>
      </div>
    </div>
  );
};