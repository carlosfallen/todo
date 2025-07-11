import React, { useState } from 'react';
import { Plus, Search, FileText, Edit, Trash2, Download, Upload, X, ArrowLeft, Grid, List } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useToast } from '../../hooks/useToast';
import NoteEditor from './NoteEditor';
import NoteViewer from './NoteViewer';
import { Note } from '../../types';
import useOptimisticNotes from '../../hooks/useOptimisticNotes';
import { useAuth } from '../../contexts/AuthContext';
import ToastContainer from '../ui/ToastContainer';
 
const NotesView: React.FC = () => {
  const { user } = useAuth();
  const { notes, createNote, deleteNote, importNoteFromMarkdown, loading: notesLoading } = useOptimisticNotes(user?.uid);
  const { toasts, showToast, removeToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const [showNotesList, setShowNotesList] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateNote = async () => {
    try {
      const newNote = await createNote({
        title: 'Nova Nota',
        content: '# Nova Nota\n\nComece a escrever aqui...',
        tags: []
      });
      setSelectedNote(newNote);
      setIsEditing(true);
      if (window.innerWidth < 768) {
        setShowNotesList(false);
      }
      showToast({
        type: 'success',
        title: 'Nota criada',
        message: 'Nova nota criada com sucesso'
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erro',
        message: 'Falha ao criar nota'
      });
    }
  };

  const handleNoteSelect = (note: Note) => {
    setSelectedNote(note);
    setIsEditing(false);
    if (window.innerWidth < 768) {
      setShowNotesList(false);
    }
  };

  const handleBackToList = () => {
    setShowNotesList(true);
    setSelectedNote(null);
    setIsEditing(false);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (window.confirm('Tem certeza que deseja deletar esta nota?')) {
      try {
        await deleteNote(noteId);
        if (selectedNote?.id === noteId) {
          setSelectedNote(null);
          setIsEditing(false);
          if (window.innerWidth < 768) {
            setShowNotesList(true);
          }
        }
        showToast({
          type: 'success',
          title: 'Nota deletada',
          message: 'Nota deletada com sucesso'
        });
      } catch (error) {
        showToast({
          type: 'error',
          title: 'Erro',
          message: 'Falha ao deletar nota'
        });
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
    
    showToast({
      type: 'success',
      title: 'Nota exportada',
      message: 'Arquivo markdown baixado com sucesso'
    });
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
        if (window.innerWidth < 768) {
          setShowNotesList(false);
        }
        onClose();
        showToast({
          type: 'success',
          title: 'Nota importada',
          message: 'Arquivo markdown importado com sucesso'
        });
      } catch (error) {
        showToast({
          type: 'error',
          title: 'Erro',
          message: 'Falha ao importar arquivo'
        });
      } finally {
        setIsImporting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="card-elevated w-full max-w-2xl max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b border-surface-800">
            <div className="flex justify-between items-center">
              <h2 className="text-title-large text-surface-300">Importar Markdown</h2>
              <button onClick={onClose} className="btn-icon">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto">
            <div className="space-y-6">
              <div>
                <label className="block text-label-large text-surface-300 mb-2">
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
                <label className="block text-label-large text-surface-300 mb-2">
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
                <label className="block text-label-large text-surface-300 mb-2">
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

          <div className="p-6 surface-container border-t border-surface-800 flex justify-end gap-3">
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
        <div className="w-8 h-8 border-4 border-surface-700 rounded-full animate-spin border-t-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-full relative surface">
      {/* Sidebar de notas - Responsivo */}
      <div className={`
        ${showNotesList ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static
        fixed md:relative inset-y-0 left-0 z-30
        w-full md:w-96 lg:w-80 xl:w-96
        transition-transform duration-300 ease-in-out
        border-r border-surface-800 surface-container flex flex-col
      `}>
        <div className="p-4 md:p-6 border-b border-surface-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-title-large text-surface-300">Notas</h2>
            <div className="flex gap-2">
              <div className="hidden md:flex gap-1 bg-surface-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-surface-400 hover:text-surface-300'
                  }`}
                  title="Visualização em grade"
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-surface-400 hover:text-surface-300'
                  }`}
                  title="Visualização em lista"
                >
                  <List size={16} />
                </button>
              </div>
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
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-500" />
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
              <FileText size={48} className="mx-auto mb-4 text-surface-500" />
              <p className="text-body-large text-surface-400 mb-2">
                {searchTerm ? 'Nenhuma nota encontrada' : 'Nenhuma nota ainda'}
              </p>
              <p className="text-body-medium text-surface-500">
                {searchTerm ? 'Tente ajustar sua busca' : 'Crie sua primeira nota'}
              </p>
            </div>
          ) : (
            <div className={`p-2 ${viewMode === 'grid' ? 'hidden md:block' : ''}`}>
              {viewMode === 'grid' ? (
                // Grid view for desktop
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
                  {filteredNotes.map((note) => (
                    <div
                      key={note.id}
                      className={`card-interactive p-4 cursor-pointer transition-all duration-200 group ${
                        selectedNote?.id === note.id
                          ? 'ring-2 ring-primary-600 bg-primary-600/10'
                          : 'hover:border-surface-700'
                      } ${note.isOptimistic ? 'opacity-70' : ''} ${note.isDeleting ? 'opacity-50' : ''}`}
                      onClick={() => handleNoteSelect(note)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-body-large font-medium text-surface-300 truncate flex-1">
                          {note.title}
                        </h3>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
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
                            className="btn-icon p-1 text-error-400 hover:bg-error-600/20"
                            title="Deletar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-body-small text-surface-500 line-clamp-3 mb-3">
                        {note.content.replace(/[#*`]/g, '').substring(0, 150)}...
                      </p>
                      
                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {note.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-label-small bg-surface-800 text-surface-400 px-2 py-1 rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                          {note.tags.length > 3 && (
                            <span className="text-label-small text-surface-500">
                              +{note.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div className="text-label-small text-surface-600">
                        {new Date(note.updatedAt).toLocaleDateString('pt-BR')}
                      </div>
                      
                      {note.isOptimistic && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-warning-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                // List view
                <div className="space-y-2 p-2">
                  {filteredNotes.map((note) => (
                    <div
                      key={note.id}
                      className={`p-3 rounded-xl cursor-pointer transition-all duration-200 group ${
                        selectedNote?.id === note.id
                          ? 'bg-primary-600/20 text-primary-300'
                          : 'hover:bg-surface-800'
                      } ${note.isOptimistic ? 'opacity-70' : ''} ${note.isDeleting ? 'opacity-50' : ''}`}
                      onClick={() => handleNoteSelect(note)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-body-large font-medium truncate mb-1">
                            {note.title}
                          </h3>
                          <p className="text-body-small text-surface-500 line-clamp-2 mb-2">
                            {note.content.replace(/[#*`]/g, '').substring(0, 100)}...
                          </p>
                          {note.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {note.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-label-small bg-surface-800 text-surface-400 px-2 py-1 rounded-full"
                                >
                                  #{tag}
                                </span>
                              ))}
                              {note.tags.length > 3 && (
                                <span className="text-label-small text-surface-500">
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
                            className="btn-icon p-1 text-error-400 hover:bg-error-600/20"
                            title="Deletar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      
                      {note.isOptimistic && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-warning-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Overlay para mobile - só quando a lista está visível */}
      {showNotesList && selectedNote && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-20" 
          onClick={handleBackToList}
        />
      )}

      {/* Conteúdo principal - Responsivo */}
      <div className={`
        ${!showNotesList ? 'translate-x-0' : 'translate-x-full'}
        md:translate-x-0
        fixed md:relative inset-0 md:inset-auto
        md:flex-1 w-full md:w-auto
        transition-transform duration-300 ease-in-out
        flex flex-col z-10
        surface md:bg-transparent
      `}>
        {selectedNote ? (
          <>
            {/* Header mobile com botão voltar */}
            <div className="md:hidden p-4 border-b border-surface-800 surface-container">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackToList}
                  className="btn-icon"
                  title="Voltar para lista"
                >
                  <ArrowLeft size={20} />
                </button>
                <h1 className="text-title-large text-surface-300 truncate flex-1">
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
                    className={`btn-icon ${isEditing ? 'bg-primary-600/20 text-primary-400' : ''}`}
                    title={isEditing ? 'Visualizar' : 'Editar'}
                  >
                    <Edit size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Conteúdo da nota */}
            <div className="flex-1 overflow-auto">
              {isEditing ? (
                <NoteEditor
                  note={selectedNote}
                  onSave={(updatedNote) => {
                    setSelectedNote(updatedNote);
                    setIsEditing(false);
                    showToast({
                      type: 'success',
                      title: 'Nota salva',
                      message: 'Alterações salvas com sucesso'
                    });
                  }}
                />
              ) : (
                <NoteViewer note={selectedNote} />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <FileText size={64} className="mx-auto mb-4 text-surface-500" />
              <h2 className="text-headline-small text-surface-300 mb-2">
                Selecione uma nota
              </h2>
              <p className="text-body-large text-surface-500 mb-6">
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
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
};

export default NotesView;