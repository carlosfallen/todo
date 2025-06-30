import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, Star, X, Trash2 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Task } from '../../types';
import DatePicker from '../ui/DatePicker';
import TaskSteps from './TaskSteps';

interface TaskEditProps {
  task: Task;
  onClose: () => void;
}

const TaskEdit: React.FC<TaskEditProps> = ({ task, onClose }) => {
  const { updateTask, deleteTask, lists } = useApp();
  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes || '');
  const [important, setImportant] = useState(task.important);
  const [dueDate, setDueDate] = useState<string | null>(task.dueDate || null);
  const [listId, setListId] = useState(task.listId);
  const [steps, setSteps] = useState(task.steps || []);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showListDropdown, setShowListDropdown] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const listDropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Focus the title input when the form mounts
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
    
    // Handle clicks outside the form to close it
    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        handleSave();
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  useEffect(() => {
    function handleClickOutsideDropdown(event: MouseEvent) {
      if (listDropdownRef.current && !listDropdownRef.current.contains(event.target as Node)) {
        setShowListDropdown(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutsideDropdown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideDropdown);
    };
  }, []);
  
  const handleSave = async () => {
    if (!title.trim()) {
      onClose();
      return;
    }
    
    await updateTask(task.id, {
      title: title.trim(),
      notes: notes.trim(),
      important,
      dueDate: dueDate || undefined,
      listId,
      steps
    });
    
    onClose();
  };
  
  const handleDelete = async () => {
    await deleteTask(task.id);
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
  
  const getCurrentList = () => {
    return lists.find(list => list.id === listId);
  };
  
  return (
    <form
      ref={formRef}
      onSubmit={(e) => { e.preventDefault(); handleSave(); }}
      className="border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-gray-800 shadow-md overflow-hidden focus-within:ring-2 focus-within:ring-primary-300 focus-within:border-primary-300 mb-2"
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
          rows={3}
        />
        
        <TaskSteps steps={steps} onChange={setSteps} />
        
        <div className="mt-3 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowListDropdown(!showListDropdown)}
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
            >
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: getCurrentList()?.color || '#3B82F6' }}
              />
              <span>{getCurrentList()?.name || 'My Tasks'}</span>
            </button>
            
            {showListDropdown && (
              <div 
                ref={listDropdownRef}
                className="absolute left-0 mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-neutral-200 dark:border-neutral-600 z-10 min-w-48"
              >
                <div className="py-1 max-h-48 overflow-y-auto">
                  {lists.map(list => (
                    <button
                      key={list.id}
                      type="button"
                      onClick={() => {
                        setListId(list.id);
                        setShowListDropdown(false);
                      }}
                      className={`flex items-center px-4 py-2 text-sm w-full text-left ${
                        list.id === listId 
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300' 
                          : 'hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <div 
                        className="w-2 h-2 rounded-full mr-2"
                        style={{ backgroundColor: list.color || '#3B82F6' }}
                      />
                      {list.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <span>
            {task.updatedAt && `Updated ${new Date(task.updatedAt).toLocaleDateString()}`}
          </span>
        </div>
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
          
          <button
            type="button"
            onClick={handleDelete}
            className="p-1.5 rounded-full text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-600 hover:text-important-500"
          >
            <Trash2 size={18} />
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
            Save
          </button>
        </div>
      </div>
    </form>
  );
};

export default TaskEdit;