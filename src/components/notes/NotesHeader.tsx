import React from 'react';
import { Menu, Plus, Upload, Download, Edit } from 'lucide-react';

const NotesHeader: React.FC = () => {
  const [selectedNote, setSelectedNote] = React.useState(null);
  const [isEditing, setIsEditing] = React.useState(false);

  React.useEffect(() => {
    // Escutar mudanças do NotesView
    const checkActions = () => {
      const actions = (window as any).notesViewActions;
      if (actions) {
        setSelectedNote(actions.selectedNote);
        setIsEditing(actions.isEditing);
      }
    };
    
    const interval = setInterval(checkActions, 100);
    return () => clearInterval(interval);
  }, []);

  const handleCreateNote = () => {
    const actions = (window as any).notesViewActions;
    if (actions) {
      actions.createNote();
    }
  };

  const handleImport = () => {
    const actions = (window as any).notesViewActions;
    if (actions) {
      actions.showImporter();
    }
  };

  const handleExport = () => {
    const actions = (window as any).notesViewActions;
    if (actions && actions.selectedNote) {
      actions.exportNote(actions.selectedNote);
    }
  };

  const handleToggleEdit = () => {
    const actions = (window as any).notesViewActions;
    if (actions) {
      actions.toggleEdit();
    }
  };

  return (
    <header className="bg-surface-container border-b divider p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="btn-icon md:hidden">
            <Menu size={20} />
          </button>
          <h1 className="text-title-large text-on-surface">
            {selectedNote ? (selectedNote as any).title : 'Notas'}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleImport}
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
          
          {selectedNote && (
            <>
              <button
                onClick={handleExport}
                className="btn-icon"
                title="Exportar"
              >
                <Download size={18} />
              </button>
              
              <button
                onClick={handleToggleEdit}
                className={`btn-icon ${isEditing ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : ''}`}
                title={isEditing ? 'Visualizar' : 'Editar'}
              >
                <Edit size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default NotesHeader;