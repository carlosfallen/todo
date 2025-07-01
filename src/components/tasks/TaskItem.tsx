import React, { useState } from 'react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
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
    if (isToday(dueDate)) return 'Hoje';
    if (isTomorrow(dueDate)) return 'Amanhã';
    
    return format(dueDate, 'dd MMM');
  };
  
  const getDueDateClass = (dateString: string | undefined) => {
    if (!dateString) return '';
    
    const dueDate = new Date(dateString);
    
    if (isPast(dueDate) && !isToday(dueDate)) return 'text-error-600 dark:text-error-400';
    if (isToday(dueDate)) return 'text-primary-600 dark:text-primary-400';
    
    return 'text-surface-600 dark:text-surface-400';
  };
  
  const completedSteps = task.steps.filter(step => step.completed).length;
  const totalSteps = task.steps.length;
  const hasSteps = totalSteps > 0;
  
  if (isEditing) {
    return <TaskEdit task={task} onClose={() => setIsEditing(false)} />;
  }
  
  return (
    <div 
      className={`card p-4 mb-3 transition-all duration-200 hover:shadow-elevation-2 ${
        task.completed 
          ? 'opacity-60' 
          : 'hover:-translate-y-0.5'
      } ripple animate-fade-in`}
    >
      <div className="flex items-start gap-4">
        <button
          onClick={handleToggleComplete}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-200 ${
            task.completed
              ? 'bg-primary-500 border-primary-500 dark:bg-primary-400 dark:border-primary-400' 
              : 'border-outline hover:border-primary-500'
          } flex items-center justify-center mt-0.5 ripple`}
          aria-label={task.completed ? "Marcar como não concluída" : "Marcar como concluída"}
        >
          {task.completed && <Check size={14} className="text-white" />}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 
                className={`text-base font-medium transition-all duration-200 ${
                  task.completed 
                    ? 'line-through text-surface-500 dark:text-surface-400' 
                    : 'text-surface-900 dark:text-surface-50'
                }`}
              >
                {task.title}
              </h3>
              
              {hasSteps && (
                <div className="mt-1 text-sm text-surface-600 dark:text-surface-400">
                  {completedSteps} de {totalSteps} etapas concluídas
                </div>
              )}
              
              {task.notes && (
                <p className={`text-sm mt-2 line-clamp-2 ${
                  task.completed 
                    ? 'text-surface-400 dark:text-surface-500' 
                    : 'text-surface-600 dark:text-surface-400'
                }`}>
                  {task.notes}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {task.dueDate && (
                <span 
                  className={`text-xs flex items-center gap-1 px-3 py-1 rounded-full bg-surface-100 dark:bg-surface-800 ${getDueDateClass(task.dueDate)}`}
                >
                  <Calendar size={12} />
                  {formatDueDate(task.dueDate)}
                </span>
              )}
              
              <button
                onClick={handleToggleImportant}
                className={`p-2 rounded-xl transition-colors ripple ${
                  task.important 
                    ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20' 
                    : 'text-surface-400 hover:text-surface-600 dark:text-surface-500 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800'
                }`}
                aria-label={task.important ? "Remover importância" : "Marcar como importante"}
              >
                <Star size={16} fill={task.important ? 'currentColor' : 'none'} />
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowOptions(!showOptions)}
                  className="p-2 rounded-xl text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:text-surface-500 dark:hover:text-surface-300 dark:hover:bg-surface-800 transition-colors ripple"
                  aria-label="Mais opções"
                >
                  <MoreVertical size={16} />
                </button>
                
                {showOptions && (
                  <div 
                    ref={optionsRef}
                    className="absolute right-0 mt-1 card-elevated z-10 min-w-48 animate-scale-in"
                  >
                    <div className="py-2">
                      <button
                        onClick={handleEditTask}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm text-surface-700 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800 transition-colors ripple"
                      >
                        <Edit size={16} />
                        Editar
                      </button>
                      <button
                        onClick={handleDeleteTask}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-900/20 transition-colors ripple"
                      >
                        <Trash2 size={16} />
                        Deletar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {hasSteps && (
            <div className="mt-3">
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200 transition-colors ripple"
              >
                {showSteps ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                <span>{showSteps ? 'Ocultar etapas' : 'Mostrar etapas'}</span>
              </button>
              
              {showSteps && (
                <div className="mt-3 space-y-2 animate-slide-down">
                  {task.steps.map(step => (
                    <div
                      key={step.id}
                      className="flex items-start gap-3 pl-4"
                    >
                      <button
                        onClick={() => handleToggleStep(step.id)}
                        className={`flex-shrink-0 w-4 h-4 mt-1 rounded border transition-all duration-200 ${
                          step.completed
                            ? 'bg-primary-500 border-primary-500 dark:bg-primary-400 dark:border-primary-400' 
                            : 'border-outline hover:border-primary-500'
                        } ripple`}
                      >
                        {step.completed && <Check size={10} className="text-white" />}
                      </button>
                      
                      <div className="flex-1">
                        <div className={`text-sm transition-all duration-200 ${
                          step.completed 
                            ? 'line-through text-surface-500 dark:text-surface-400' 
                            : 'text-surface-800 dark:text-surface-200'
                        }`}>
                          {step.title}
                        </div>
                        
                        {(step.dueDate || step.assignee) && (
                          <div className="flex items-center gap-3 mt-1 text-xs text-surface-500 dark:text-surface-400">
                            {step.dueDate && (
                              <span className="flex items-center gap-1">
                                <Calendar size={10} />
                                {format(new Date(step.dueDate), 'dd MMM')}
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