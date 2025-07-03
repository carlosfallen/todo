import React, { useState } from 'react';
import { Plus, Search, FileText, Edit, Trash2, Download, Upload, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import NoteEditor from './NoteEditor';
import NoteViewer from './NoteViewer';
import { Note } from '../../types';

const NotesView: React.FC = () => {
  const { notes, createNote, deleteNote, importNoteFromMarkdown, notesLoading } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showImporter, setShowImporter] = useState(false);

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateNote = async () => {
    const newNote = await createNote({
      title: 'Nova Nota',
      content: '# Nova Nota\n\nComece a escrever aqui...',
      tags: []
    });
    setSelectedNote(newNote);
    setIsEditing(true);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (window.confirm('Tem certeza que deseja deletar esta nota?')) {
      await deleteNote(noteId);
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
        setIsEditing(false);
      }
    }
  };

  const handleExportNote = (note: Note) => {
    const blob = new Blob([note.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const MarkdownImporter: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [importContent, setImportContent] = useState('');
    const [importTitle, setImportTitle] = useState('');
    const [isImporting, setIsImporting] = useState(false);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && file.type === 'text/markdown') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setImportContent(content);
          setImportTitle(file.name.replace('.md', ''));
        };
        reader.readAsText(file);
      }
    };

    const handleImport = async () => {
      if (!importContent.trim() || !importTitle.trim()) return;

      setIsImporting(true);
      try {
        const newNote = await importNoteFromMarkdown(importContent, importTitle);
        setSelectedNote(newNote);
        setIsEditing(false);
        onClose();
      } catch (error) {
        console.error('Erro ao importar:', error);
      } finally {
        setIsImporting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="card-elevated w-full max-w-2xl max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b divider">
            <div className="flex justify-between items-center">
              <h2 className="text-title-large text-on-surface">Importar Markdown</h2>
              <button onClick={onClose} className="btn-icon">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto">
            <div className="space-y-6">
              <div>
                <label className="block text-label-large text-on-surface mb-2">
                  Arquivo Markdown
                </label>
                <input
                  type="file"
                  accept=".md,.markdown"
                  onChange={handleFileUpload}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-label-large text-on-surface mb-2">
                  Título da Nota
                </label>
                <input
                  type="text"
                  value={importTitle}
                  onChange={(e) => setImportTitle(e.target.value)}
                  className="input-field w-full"
                  placeholder="Nome da nota"
                />
              </div>

              <div>
                <label className="block text-label-large text-on-surface mb-2">
                  Conteúdo
                </label>
                <textarea
                  value={importContent}
                  onChange={(e) => setImportContent(e.target.value)}
                  className="input-field w-full h-64 font-mono text-sm resize-none"
                  placeholder="Cole o conteúdo markdown aqui..."
                />
              </div>
            </div>
          </div>

          <div className="p-6 bg-surface-container border-t divider flex justify-end gap-3">
            <button onClick={onClose} className="btn-outlined">
              <span className="text-label-large">Cancelar</span>
            </button>
            <button
              onClick={handleImport}
              disabled={!importContent.trim() || !importTitle.trim() || isImporting}
              className="btn-filled"
            >
              {isImporting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-label-large">Importando...</span>
                </div>
              ) : (
                <span className="text-label-large">Importar</span>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (notesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-surface-200 dark:border-surface-700 rounded-full animate-spin border-t-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-80 border-r divider surface-container flex flex-col">
        <div className="p-4 border-b divider">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-title-large text-on-surface">Notas</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowImporter(true)}
                className="btn-icon"
                title="Importar Markdown"
              >
                <Upload size={18} />
              </button>
              <button
                onClick={handleCreateNote}
                className="btn-icon"
                title="Nova Nota"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Buscar notas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-9 w-full"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredNotes.length === 0 ? (
            <div className="p-6 text-center">
              <FileText size={48} className="mx-auto mb-4 text-on-surface-variant" />
              <p className="text-body-large text-on-surface-variant mb-2">
                {searchTerm ? 'Nenhuma nota encontrada' : 'Nenhuma nota ainda'}
              </p>
              <p className="text-body-medium text-on-surface-variant">
                {searchTerm ? 'Tente ajustar sua busca' : 'Crie sua primeira nota'}
              </p>
            </div>
          ) : (
            <div className="p-2">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className={`p-3 rounded-xl cursor-pointer transition-all duration-200 mb-2 group ${
                    selectedNote?.id === note.id
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'hover:bg-surface-100 dark:hover:bg-surface-800'
                  }`}
                  onClick={() => {
                    setSelectedNote(note);
                    setIsEditing(false);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-body-large font-medium truncate mb-1">
                        {note.title}
                      </h3>
                      <p className="text-body-small text-on-surface-variant line-clamp-2 mb-2">
                        {note.content.replace(/[#*`]/g, '').substring(0, 100)}...
                      </p>
                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {note.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-label-small bg-surface-200 dark:bg-surface-700 text-on-surface-variant px-2 py-1 rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                          {note.tags.length > 3 && (
                            <span className="text-label-small text-on-surface-variant">
                              +{note.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportNote(note);
                        }}
                        className="btn-icon p-1"
                        title="Exportar"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note.id);
                        }}
                        className="btn-icon p-1 text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20"
                        title="Deletar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {selectedNote ? (
          <>
            <div className="p-4 border-b divider surface-container flex items-center justify-between">
              <h1 className="text-title-large text-on-surface truncate">
                {selectedNote.title}
              </h1>
              <div className="flex gap-2">
                <button
                  onClick={() => handleExportNote(selectedNote)}
                  className="btn-icon"
                  title="Exportar"
                >
                  <Download size={18} />
                </button>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`btn-icon ${isEditing ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : ''}`}
                  title={isEditing ? 'Visualizar' : 'Editar'}
                >
                  <Edit size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              {isEditing ? (
                <NoteEditor
                  note={selectedNote}
                  onSave={(updatedNote) => {
                    setSelectedNote(updatedNote);
                    setIsEditing(false);
                  }}
                />
              ) : (
                <NoteViewer note={selectedNote} />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileText size={64} className="mx-auto mb-4 text-on-surface-variant" />
              <h2 className="text-headline-small text-on-surface mb-2">
                Selecione uma nota
              </h2>
              <p className="text-body-large text-on-surface-variant mb-6">
                Escolha uma nota da lista ou crie uma nova
              </p>
              <button onClick={handleCreateNote} className="btn-filled">
                <Plus size={18} className="mr-2" />
                <span className="text-label-large">Nova Nota</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {showImporter && <MarkdownImporter onClose={() => setShowImporter(false)} />}
    </div>
  );
};

export default NotesView;