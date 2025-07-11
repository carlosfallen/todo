import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, Star, X, AlertCircle, Clock, Wifi } from 'lucide-react';
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
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const formRef = useRef<HTMLFormElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  const listId = activeListId === 'all' || activeListId === 'important' || activeListId === 'planned'
    ? lists[0]?.id || 'default'
    : activeListId;
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    const focusTimer = setTimeout(() => {
      if (titleInputRef.current) {
        titleInputRef.current.focus();
      }
    }, 200);
    
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
    if (isSubmitting) return;
    
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    setSyncStatus('saving');
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

      // Clear form immediately for optimistic UI
      setTitle('');
      setNotes('');
      setImportant(false);
      setDueDate(null);
      setSteps([]);
      
      onTaskSaved();
      
      setIsClosing(true);
      setTimeout(() => {
        onClose();
      }, 100);

      // Create task (this will be optimistic)
      await createTask(taskData);
      setSyncStatus('saved');
      
    } catch (error) {
      console.error("Failed to create task:", error);
      setError("Falha ao salvar tarefa. Verifique sua conexão.");
      setSyncStatus('error');
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

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'saving':
        return <Clock size={16} className="text-warning-500 animate-pulse" />;
      case 'saved':
        return <Wifi size={16} className="text-success-500" />;
      case 'error':
        return <AlertCircle size={16} className="text-error-500" />;
      default:
        return null;
    }
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
        className="card-elevated overflow-hidden focus-within:ring-2 focus-within:ring-primary-500"
      >
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <input
              ref={titleInputRef}
              type="text"
              placeholder="Nome da tarefa"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              className="flex-1 text-on-surface text-body-large font-medium placeholder-on-surface-variant focus:outline-none bg-transparent disabled:opacity-50"
            />
            {getSyncStatusIcon()}
          </div>
          
          <textarea
            placeholder="Adicionar notas"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isSubmitting}
            className="w-full mt-3 text-body-medium text-on-surface-variant placeholder-on-surface-variant focus:outline-none resize-none bg-transparent disabled:opacity-50"
            rows={2}
          />
          
          <TaskSteps steps={steps} onChange={setSteps} disabled={isSubmitting} />
          
          {error && (
            <div className="mt-3 p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-xl flex items-center gap-2 text-body-medium text-error-600 dark:text-error-400">
              <AlertCircle size={16} />
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setError(null)}
                className="ml-auto text-error-500 hover:text-error-700 p-1 rounded-full hover:bg-error-100 dark:hover:bg-error-900/30"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
        
        <div className="border-t divider p-3 surface-container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDatePicker(!showDatePicker)}
                disabled={isSubmitting}
                className={`btn-icon ${
                  dueDate 
                    ? 'text-primary-600 bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400' 
                    : ''
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
              className={`btn-icon ${
                important 
                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' 
                  : ''
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Star size={18} fill={important ? 'currentColor' : 'none'} />
            </button>
            
            {dueDate && (
              <div className="px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-label-small flex items-center gap-1">
                <span>
                  {new Date(dueDate).toLocaleDateString('pt-BR', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
                <button
                  type="button"
                  onClick={handleRemoveDueDate}
                  disabled={isSubmitting}
                  className="hover:bg-primary-200 dark:hover:bg-primary-800/30 rounded-full p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="btn-text disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-label-large">Cancelar</span>
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isSubmitting}
              className={`btn-filled ${isSubmitting ? 'opacity-75' : ''}`}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-label-large">Adicionando...</span>
                </div>
              ) : (
                <span className="text-label-large">Adicionar</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;