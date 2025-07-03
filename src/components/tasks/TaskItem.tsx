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
    
    return 'text-on-surface-variant';
  };
  
  const completedSteps = task.steps.filter(step => step.completed).length;
  const totalSteps = task.steps.length;
  const hasSteps = totalSteps > 0;
  
  if (isEditing) {
    return <TaskEdit task={task} onClose={() => setIsEditing(false)} />;
  }
  
  return (
    <div 
      className={`card-interactive p-4 mb-3 transition-all duration-200 ${
        task.completed 
          ? 'opacity-60' 
          : ''
      } ripple animate-fade-in relative ${showOptions ? 'z-50' : 'z-0'} ${showOptions ? 'overflow-visible' : 'overflow-hidden'}`}
    >
      <div className="flex items-start gap-4">
        <button
          onClick={handleToggleComplete}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-200 ${
            task.completed
              ? 'bg-primary-600 border-primary-600 dark:bg-primary-500 dark:border-primary-500' 
              : 'border-surface-400 hover:border-primary-600'
          } flex items-center justify-center mt-0.5 ripple`}
          aria-label={task.completed ? "Marcar como não concluída" : "Marcar como concluída"}
        >
          {task.completed && <Check size={14} className="text-white" />}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 
                className={`text-body-large font-medium transition-all duration-200 ${
                  task.completed 
                    ? 'line-through text-on-surface-variant' 
                    : 'text-on-surface'
                }`}
              >
                {task.title}
              </h3>
              
              {hasSteps && (
                <div className="mt-1 text-body-small text-on-surface-variant">
                  {completedSteps} de {totalSteps} etapas concluídas
                </div>
              )}
              
              {task.notes && (
                <p className={`text-body-medium mt-2 line-clamp-2 ${
                  task.completed 
                    ? 'text-on-surface-variant opacity-70' 
                    : 'text-on-surface-variant'
                }`}>
                  {task.notes}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {task.dueDate && (
                <span 
                  className={`text-label-small flex items-center gap-1 px-3 py-1 rounded-full bg-surface-100 dark:bg-surface-800 ${getDueDateClass(task.dueDate)}`}
                >
                  <Calendar size={12} />
                  {formatDueDate(task.dueDate)}
                </span>
              )}
              
              <button
                onClick={handleToggleImportant}
                className={`btn-icon ${
                  task.important 
                    ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20' 
                    : 'text-on-surface-variant hover:text-amber-500'
                }`}
                aria-label={task.important ? "Remover importância" : "Marcar como importante"}
              >
                <Star size={16} fill={task.important ? 'currentColor' : 'none'} />
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowOptions(!showOptions)}
                  className="btn-icon"
                  aria-label="Mais opções"
                >
                  <MoreVertical size={16} />
                </button>
                
                {showOptions && (
                  <div 
                    ref={optionsRef}
                    className="absolute right-0 top-full mt-1 z-[100] bg-surface-50 dark:bg-surface-900 rounded-xl shadow-elevation-3 border border-surface-200/50 dark:border-surface-800/50 min-w-48 animate-scale-in"
                  >
                    <div className="py-2">
                      <button
                        onClick={handleEditTask}
                        className="flex w-full items-center gap-3 px-4 py-3 text-body-medium text-on-surface hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors ripple"
                      >
                        <Edit size={16} />
                        Editar
                      </button>
                      <button
                        onClick={handleDeleteTask}
                        className="flex w-full items-center gap-3 px-4 py-3 text-body-medium text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-900/20 transition-colors ripple"
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
                className="flex items-center gap-2 text-body-small text-on-surface-variant hover:text-on-surface transition-colors ripple"
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
                            ? 'bg-primary-600 border-primary-600 dark:bg-primary-500 dark:border-primary-500' 
                            : 'border-surface-400 hover:border-primary-600'
                        } ripple`}
                      >
                        {step.completed && <Check size={10} className="text-white" />}
                      </button>
                      
                      <div className="flex-1">
                        <div className={`text-body-medium transition-all duration-200 ${
                          step.completed 
                            ? 'line-through text-on-surface-variant' 
                            : 'text-on-surface'
                        }`}>
                          {step.title}
                        </div>
                        
                        {(step.dueDate || step.assignee) && (
                          <div className="flex items-center gap-3 mt-1 text-label-small text-on-surface-variant">
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