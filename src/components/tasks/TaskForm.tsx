import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, Star, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import DatePicker from '../ui/DatePicker';
import TaskSteps from './TaskSteps';
import { TaskStep } from '../../types';

interface TaskFormProps {
  onClose: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onClose }) => {
  const { createTask, activeListId, lists } = useApp();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [important, setImportant] = useState(false);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [steps, setSteps] = useState<TaskStep[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  // List ID logic
  const listId = activeListId === 'all' || activeListId === 'important' || activeListId === 'planned'
    ? lists[0]?.id || 'default'
    : activeListId;
  
  useEffect(() => {
    // Focus the title input when the form mounts
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
    
    // Handle clicks outside the form to close it
    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    await createTask({
      title: title.trim(),
      notes: notes.trim(),
      important,
      dueDate: dueDate || undefined,
      completed: false,
      listId,
      steps
    });
    
    onClose();
  };
  
  const handleDateSelect = (date: Date | null) => {
    if (date) {
      setDueDate(date.toISOString());
    } else {
      setDueDate(null);
    }
    setShowDatePicker(false);
  };
  
  const handleRemoveDueDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDueDate(null);
  };
  
  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-gray-800 shadow-md overflow-hidden focus-within:ring-2 focus-within:ring-primary-300 focus-within:border-primary-300"
    >
      <div className="p-3">
        <input
          ref={titleInputRef}
          type="text"
          placeholder="Task name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-neutral-800 dark:text-neutral-100 font-medium placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none bg-transparent"
        />
        
        <textarea
          placeholder="Add notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full mt-2 text-sm text-neutral-600 dark:text-neutral-300 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none resize-none bg-transparent"
          rows={2}
        />
        
        <TaskSteps steps={steps} onChange={setSteps} />
      </div>
      
      <div className="border-t border-neutral-200 dark:border-neutral-600 p-2 flex items-center justify-between bg-neutral-50 dark:bg-gray-700">
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`p-1.5 rounded-full ${
                dueDate 
                  ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:text-primary-300' 
                  : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-600'
              }`}
            >
              <CalendarIcon size={18} />
            </button>
            
            {showDatePicker && (
              <DatePicker
                selectedDate={dueDate ? new Date(dueDate) : null}
                onSelect={handleDateSelect}
                onClose={() => setShowDatePicker(false)}
              />
            )}
          </div>
          
          <button
            type="button"
            onClick={() => setImportant(!important)}
            className={`p-1.5 rounded-full ${
              important 
                ? 'text-accent-500' 
                : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-600'
            }`}
          >
            <Star size={18} fill={important ? 'currentColor' : 'none'} />
          </button>
          
          {dueDate && (
            <div className="px-2 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300 text-xs flex items-center gap-1">
              <span>
                {new Date(dueDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
              <button
                type="button"
                onClick={handleRemoveDueDate}
                className="hover:bg-primary-100 dark:hover:bg-primary-800/30 rounded-full"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className={`px-3 py-1 rounded text-sm ${
              title.trim() 
                ? 'bg-primary-600 text-white hover:bg-primary-700' 
                : 'bg-neutral-200 dark:bg-neutral-600 text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
            }`}
          >
            Add
          </button>
        </div>
      </div>
    </form>
  );
};

export default TaskForm;