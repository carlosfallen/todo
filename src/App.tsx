import { useState } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { Filters } from './components/Filters';
import { NotesList } from './components/NotesList';
import { TasksList } from './components/TasksList';
import { Editor } from './components/Editor';
import { useNotes } from './hooks/useNotes';
import { useTasks } from './hooks/useTasks';
import { useAuth } from './hooks/useAuth';
import { FilterState, Note, Task } from './types';
import { exportProject } from './utils/export';
import { importProject } from './utils/import';
import { Plus, StickyNote, CheckSquare } from 'lucide-react';

function App() {
  const { notes, addNote, updateNote, deleteNote } = useNotes();
  const { tasks, addTask, updateTask, deleteTask, reorderTasks } = useTasks();
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    tags: [],
    status: 'all',
    priority: 'all',
  });
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [activeTab, setActiveTab] = useState<'notes' | 'tasks'>('tasks');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  const allTags = [...new Set([...notes.flatMap(n => n.tags)])];

  const handleExport = () => {
    exportProject(notes, tasks);
  };

  const handleImport = async (file: File) => {
    try {
      const { notes: importedNotes, tasks: importedTasks } = await importProject(file);
      for (const note of importedNotes) {
        await addNote(note);
      }
      for (const task of importedTasks) {
        await addTask(task);
      }
      alert('Project imported successfully!');
    } catch (error) {
      alert('Failed to import project. Please check the file format.');
    }
  };

  const handleAddNote = async () => {
    const newNote = await addNote({
      title: 'New Note',
      content: '',
      tags: [],
    });
    if (newNote) {
      setSelectedNote(newNote);
    }
  };

  const handleAddTask = async () => {
    await addTask({
      title: 'New Task',
      completed: false,
      important: false,
      listId: '',
      notes: '',
      steps: [],
      taskId: '',
      orderIndex: tasks.length,
    });
  };

  const handleReorder = async (reorderedTasks: Task[]) => {
    const allTasksMap = new Map(tasks.map(t => [t.id, t]));
    reorderedTasks.forEach((task, index) => {
      allTasksMap.set(task.id, { ...task, orderIndex: index });
    });
    await reorderTasks(Array.from(allTasksMap.values()));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onExport={handleExport} onImport={handleImport} />

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                    activeTab === 'tasks'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <CheckSquare size={20} />
                  Tasks ({tasks.length})
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                    activeTab === 'notes'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <StickyNote size={20} />
                  Notes ({notes.length})
                </button>
              </div>

              {activeTab === 'tasks' ? (
                <button
                  onClick={handleAddTask}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  <Plus size={20} />
                  Add Task
                </button>
              ) : (
                <button
                  onClick={handleAddNote}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  <Plus size={20} />
                  Add Note
                </button>
              )}
            </div>

            <div className="space-y-4">
              {activeTab === 'tasks' ? (
                <TasksList
                  tasks={tasks}
                  onUpdate={updateTask}
                  onDelete={deleteTask}
                  onReorder={handleReorder}
                  filters={filters}
                  searchQuery={searchQuery}
                />
              ) : (
                <NotesList
                  notes={notes}
                  onSelect={setSelectedNote}
                  onDelete={deleteNote}
                  searchQuery={searchQuery}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedNote && (
        <Editor
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
          onSave={(updates) => updateNote(selectedNote.id, updates)}
        />
      )}
    </div>
  );
}

export default App;