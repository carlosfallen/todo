import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, Star, X, AlertCircle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import DatePicker from '../ui/DatePicker';
import TaskSteps from './TaskSteps';
import { TaskStep } from '../../types';

interface TaskFormProps {
  onClose: () => void;
  onTaskSaved?: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onClose, onTaskSaved = () => {} }) => {
  const { createTask, activeListId, lists } = useApp();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [important, setImportant] = useState(false);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [steps, setSteps] = useState<TaskStep[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  // List ID logic
  const listId = activeListId === 'all' || activeListId === 'important' || activeListId === 'planned'
    ? lists[0]?.id || 'default'
    : activeListId;
  
  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    // Focus the title input when the form mounts
    const focusTimer = setTimeout(() => {
      if (titleInputRef.current) {
        titleInputRef.current.focus();
      }
    }, 200);
    
    // Handle clicks outside the form to close it
    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        handleClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(focusTimer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClose = () => {
    if (isSubmitting) return; // Prevent closing while submitting
    
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200); // Wait for exit animation to complete
  };
  
  const createTaskWithRetry = async (taskData: any, maxRetries = 2): Promise<void> => {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        await createTask(taskData);
        return; // Success
      } catch (error) {
        console.error(`Task creation attempt ${attempt + 1} failed:`, error);
        
        if (attempt === maxRetries) {
          throw error; // Final attempt failed
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const taskData = {
        title: title.trim(),
        notes: notes.trim(),
        important,
        dueDate: dueDate || undefined,
        completed: false,
        listId,
        steps
      };

      // For better UX, close form optimistically
      if (retryCount === 0) {
        // Clear form data immediately on first attempt
        setTitle('');
        setNotes('');
        setImportant(false);
        setDueDate(null);
        setSteps([]);
        
        // Trigger callback immediately
        onTaskSaved();
        
        // Close form quickly
        setIsClosing(true);
        setTimeout(() => {
          onClose();
        }, 100);
      }
      
      // Try to create task with retry logic
      await createTaskWithRetry(taskData);
      
    } catch (error) {
      console.error("Failed to create task after retries:", error);
      
      if (retryCount === 0) {
        // If this was optimistic close, we need to handle the error
        setError("Failed to save task. Check your connection.");
        // Could reopen form or show notification
      }
      
      setRetryCount(prev => prev + 1);
    } finally {
      setIsSubmitting(false);
    }
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
    <div 
      className={`transition-all duration-200 ease-out transform-gpu ${
        isVisible && !isClosing
          ? 'opacity-100 scale-y-100 translate-y-0'
          : 'opacity-0 scale-y-95 -translate-y-2'
      }`}
      style={{
        transformOrigin: 'top center'
      }}
    >
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="card-elevated overflow-hidden focus-within:ring-2 focus-within:ring-primary-300 focus-within:border-primary-300"
      >
        <div className="p-3">
          <input
            ref={titleInputRef}
            type="text"
            placeholder="Task name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            className="w-full text-neutral-800 dark:text-neutral-100 font-medium placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none bg-transparent disabled:opacity-50"
          />
          
          <textarea
            placeholder="Add notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isSubmitting}
            className="w-full mt-2 text-sm text-neutral-600 dark:text-neutral-300 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none resize-none bg-transparent disabled:opacity-50"
            rows={2}
          />
          
          <TaskSteps steps={steps} onChange={setSteps} disabled={isSubmitting} />
          
          {error && (
            <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <AlertCircle size={16} />
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
        
        <div className="border-t border-neutral-200 dark:border-neutral-600 p-2 flex items-center justify-between bg-neutral-50 dark:bg-gray-700">
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDatePicker(!showDatePicker)}
                disabled={isSubmitting}
                className={`p-1.5 rounded-full transition-colors ${
                  dueDate 
                    ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:text-primary-300' 
                    : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
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
              disabled={isSubmitting}
              className={`p-1.5 rounded-full transition-colors ${
                important 
                  ? 'text-accent-500' 
                  : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
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
                  disabled={isSubmitting}
                  className="hover:bg-primary-100 dark:hover:bg-primary-800/30 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-3 py-1 text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isSubmitting}
              className={`px-3 py-1 rounded text-sm transition-all ${
                title.trim() && !isSubmitting
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-neutral-200 dark:bg-neutral-600 text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
              } ${isSubmitting ? 'opacity-75' : ''}`}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding...
                </div>
              ) : (
                'Add'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;