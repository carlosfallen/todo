import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Note } from '../../types';

interface NoteEditorProps {
  note: Note;
  onSave: (note: Note) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave }) => {
  const { updateNote } = useApp();
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setHasChanges(title !== note.title || content !== note.content);
  }, [title, content, note.title, note.content]);

  const handleSave = async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    try {
      // Extract tags from content
      const tagRegex = /#(\w+)/g;
      const tags: string[] = [];
      let match;
      while ((match = tagRegex.exec(content)) !== null) {
        if (!tags.includes(match[1])) {
          tags.push(match[1]);
        }
      }

      const updatedNote = await updateNote(note.id, {
        title: title.trim() || 'Nota sem título',
        content,
        tags
      });

      onSave(updatedNote);
    } catch (error) {
      console.error('Erro ao salvar nota:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b divider surface-container">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field flex-1 text-title-medium font-medium"
            placeholder="Título da nota"
          />
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="btn-filled flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-label-large">Salvando...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span className="text-label-large">Salvar</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 p-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full h-full resize-none border-none outline-none bg-transparent text-body-large font-mono leading-relaxed"
          placeholder="# Título da Nota

Comece a escrever em **Markdown**...

## Exemplos de formatação:

- **Negrito** ou __negrito__
- *Itálico* ou _itálico_
- `código inline`
- [Link](https://exemplo.com)

### Lista de tarefas:
- [x] Tarefa concluída
- [ ] Tarefa pendente

### Tags:
Use #tag para criar tags automaticamente"
          spellCheck={false}
        />
      </div>

      {hasChanges && (
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border-t border-amber-200 dark:border-amber-800">
          <p className="text-body-small text-amber-700 dark:text-amber-400 text-center">
            Você tem alterações não salvas. Pressione Ctrl+S para salvar.
          </p>
        </div>
      )}
    </div>
  );
};

export default NoteEditor;