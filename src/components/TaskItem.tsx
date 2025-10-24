import { Task, Subtask } from '../types';
import { CheckCircle2, Circle, Star, Trash2, Copy, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface TaskItemProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (task: Task) => void;
}

export const TaskItem = ({ task, onUpdate, onDelete, onDuplicate }: TaskItemProps) => {
  const [expanded, setExpanded] = useState(false);
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const steps = task.steps || [];

  const handleToggle = () => {
    onUpdate(task.id, { completed: !task.completed });
  };

  const handleToggleImportant = () => {
    onUpdate(task.id, { important: !task.important });
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    
    const newSubtask: Subtask = {
      id: `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: newSubtaskTitle,
      completed: false,
      createdAt: new Date().toISOString(),
      orderIndex: steps.length,
    };

    onUpdate(task.id, { steps: [...steps, newSubtask] });
    setNewSubtaskTitle('');
    setShowSubtaskInput(false);
  };

  const handleToggleSubtask = (subtaskId: string) => {
    const updatedSteps = steps.map(step =>
      step.id === subtaskId ? { ...step, completed: !step.completed } : step
    );
    onUpdate(task.id, { steps: updatedSteps });
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    const updatedSteps = steps.filter(step => step.id !== subtaskId);
    onUpdate(task.id, { steps: updatedSteps });
  };

  const handleDuplicate = () => {
    onDuplicate(task);
  };

  const completedSubtasks = steps.filter(s => s.completed).length;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow group">
      <div className="flex items-start gap-3">
        <button
          onClick={handleToggle}
          className="mt-1 flex-shrink-0"
        >
          {task.completed ? (
            <CheckCircle2 className="text-green-500" size={24} />
          ) : (
            <Circle className="text-gray-400" size={24} />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className={`font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                {task.title}
              </h3>
              {task.notes && (
                <p className="text-sm text-gray-600 mt-1">{task.notes}</p>
              )}
              {steps.length > 0 && (
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    {completedSubtasks}/{steps.length} subtasks
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleToggleImportant}
                className={`p-1 rounded ${task.important ? 'text-yellow-500' : 'text-gray-300'}`}
              >
                <Star size={20} fill={task.important ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={handleDuplicate}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-100 rounded text-blue-500"
              >
                <Copy size={18} />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded text-red-500"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {expanded && (
            <div className="mt-3 space-y-2 pl-4 border-l-2 border-gray-200">
              {steps.map(step => (
                <div key={step.id} className="flex items-center gap-2 group/subtask">
                  <button
                    onClick={() => handleToggleSubtask(step.id)}
                    className="flex-shrink-0"
                  >
                    {step.completed ? (
                      <CheckCircle2 className="text-green-500" size={18} />
                    ) : (
                      <Circle className="text-gray-400" size={18} />
                    )}
                  </button>
                  <span className={`flex-1 text-sm ${step.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {step.title}
                  </span>
                  <button
                    onClick={() => handleDeleteSubtask(step.id)}
                    className="opacity-0 group-hover/subtask:opacity-100 p-1 hover:bg-red-100 rounded text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              {showSubtaskInput ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                    onBlur={handleAddSubtask}
                    placeholder="Subtask title"
                    className="flex-1 px-2 py-1 text-sm border rounded outline-none"
                    autoFocus
                  />
                </div>
              ) : (
                <button
                  onClick={() => setShowSubtaskInput(true)}
                  className="text-sm text-blue-500 hover:text-blue-600"
                >
                  + Add subtask
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};