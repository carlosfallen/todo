import { Note, Task } from '../types';

export const exportProject = (notes: Note[], tasks: Task[]) => {
  const data = {
    notes,
    tasks,
    exportedAt: new Date().toISOString(),
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `project-export-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportNoteAsMarkdown = (note: Note) => {
  const markdown = `# ${note.title}\n\n${note.content}\n\n---\nTags: ${note.tags.join(', ')}\nCreated: ${new Date(note.createdAt).toLocaleString()}`;
  
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${note.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`;
  a.click();
  URL.revokeObjectURL(url);
};