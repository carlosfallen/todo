import React, { useState } from 'react';
import { format, isToday, isTomorrow, isPast, isFuture } from 'date-fns';
import { Star, Calendar, Edit, Trash2, MoreVertical, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Task } from '../../types';
import { useApp } from '../../contexts/AppContext';
import TaskEdit from './TaskEdit';

interface TaskItemProps {
  task: Task;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { toggleTaskCompletion, toggleTaskImportance, deleteTask, updateTask } = useApp();
  const [showOptions, setShowOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const optionsRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTaskCompletion(task.id);
  };
  
  const handleToggleImportant = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTaskImportance(task.id);
  };
  
  const handleDeleteTask = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTask(task.id);
    setShowOptions(false);
  };
  
  const handleEditTask = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setShowOptions(false);
  };
  
  const handleToggleStep = async (stepId: string) => {
    const updatedSteps = task.steps.map(step =>
      step.id === stepId ? { ...step, completed: !step.completed } : step
    );
    
    await updateTask(task.id, { steps: updatedSteps });
  };
  
  const formatDueDate = (dateString: string | undefined) => {
    if (!dateString) return null;
    
    const dueDate = new Date(dateString);
    if (isToday(dueDate)) return 'Today';
    if (isTomorrow(dueDate)) return 'Tomorrow';
    
    return format(dueDate, 'MMM d');
  };
  
  const getDueDateClass = (dateString: string | undefined) => {
    if (!dateString) return '';
    
    const dueDate = new Date(dateString);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    if (isPast(dueDate) && !isToday(dueDate)) return 'text-important-600 dark:text-important-400';
    if (isToday(dueDate)) return 'text-primary-600 dark:text-primary-400';
    if (isFuture(dueDate)) return 'text-accent-600 dark:text-accent-400';
    
    return '';
  };
  
  const completedSteps = task.steps.filter(step => step.completed).length;
  const totalSteps = task.steps.length;
  const hasSteps = totalSteps > 0;
  
  if (isEditing) {
    return <TaskEdit task={task} onClose={() => setIsEditing(false)} />;
  }
  
  return (
    <div 
      className={`p-3 rounded-lg mb-2 transition-all ${
        task.completed 
          ? 'bg-neutral-100 dark:bg-neutral-800 opacity-70' 
          : 'bg-white dark:bg-neutral-900 hover:shadow-md hover:-translate-y-0.5'
      } shadow border border-neutral-200 dark:border-neutral-700`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={handleToggleComplete}
          className={`flex-shrink-0 w-5 h-5 rounded-full border ${
            task.completed
              ? 'bg-primary-500 border-primary-500 dark:bg-primary-400 dark:border-primary-400' 
              : 'border-neutral-400 dark:border-neutral-500'
          } flex items-center justify-center mt-0.5`}
          aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
        >
          {task.completed && <Check size={12} className="text-white" />}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 
                className={`text-sm font-medium ${
                  task.completed 
                    ? 'line-through text-neutral-500 dark:text-neutral-400' 
                    : 'text-neutral-800 dark:text-neutral-200'
                }`}
              >
                {task.title}
              </h3>
              
              {hasSteps && (
                <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  {completedSteps} of {totalSteps} steps completed
                </div>
              )}
              
              {task.notes && (
                <p className={`text-xs mt-1 ${
                  task.completed 
                    ? 'text-neutral-400 dark:text-neutral-500' 
                    : 'text-neutral-600 dark:text-neutral-400'
                } line-clamp-2`}>
                  {task.notes}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-1 flex-shrink-0">
              {task.dueDate && (
                <span 
                  className={`text-xs flex items-center px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 ${getDueDateClass(task.dueDate)}`}
                >
                  <Calendar size={12} className="mr-1" />
                  {formatDueDate(task.dueDate)}
                </span>
              )}
              
              <button
                onClick={handleToggleImportant}
                className={`p-1 rounded-full ${
                  task.important 
                    ? 'text-accent-500 dark:text-accent-400' 
                    : 'text-neutral-400 hover:text-neutral-500 dark:text-neutral-500 dark:hover:text-neutral-400'
                }`}
                aria-label={task.important ? "Remove importance" : "Mark as important"}
              >
                <Star size={16} fill={task.important ? 'currentColor' : 'none'} />
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowOptions(!showOptions)}
                  className="p-1 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:text-neutral-500 dark:hover:text-neutral-300 dark:hover:bg-neutral-800"
                  aria-label="More options"
                >
                  <MoreVertical size={16} />
                </button>
                
                {showOptions && (
                  <div 
                    ref={optionsRef}
                    className="absolute right-0 mt-1 bg-white dark:bg-neutral-900 rounded-md shadow-lg border border-neutral-200 dark:border-neutral-700 z-10 min-w-48"
                  >
                    <div className="py-1">
                      <button
                        onClick={handleEditTask}
                        className="flex w-full items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                      >
                        <Edit size={16} className="mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={handleDeleteTask}
                        className="flex w-full items-center px-4 py-2 text-sm text-important-600 hover:bg-neutral-100 dark:text-important-400 dark:hover:bg-neutral-800"
                      >
                        <Trash2 size={16} className="mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {hasSteps && (
            <div className="mt-2">
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              >
                {showSteps ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                <span>{showSteps ? 'Hide steps' : 'Show steps'}</span>
              </button>
              
              {showSteps && (
                <div className="mt-2 space-y-2">
                  {task.steps.map(step => (
                    <div
                      key={step.id}
                      className="flex items-start gap-2 pl-2"
                    >
                      <button
                        onClick={() => handleToggleStep(step.id)}
                        className={`flex-shrink-0 w-4 h-4 mt-0.5 rounded border ${
                          step.completed
                            ? 'bg-primary-500 border-primary-500 dark:bg-primary-400 dark:border-primary-400' 
                            : 'border-neutral-400 dark:border-neutral-500'
                        }`}
                      >
                        {step.completed && <Check size={10} className="text-white" />}
                      </button>
                      
                      <div className="flex-1">
                        <div className={`text-sm ${
                          step.completed 
                            ? 'line-through text-neutral-500 dark:text-neutral-400' 
                            : 'text-neutral-800 dark:text-neutral-200'
                        }`}>
                          {step.title}
                        </div>
                        
                        {(step.dueDate || step.assignee) && (
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                            {step.dueDate && (
                              <span className="flex items-center gap-1">
                                <Calendar size={10} />
                                {format(new Date(step.dueDate), 'MMM d')}
                              </span>
                            )}
                            {step.assignee && (
                              <span>{step.assignee}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskItem;