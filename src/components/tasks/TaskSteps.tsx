import React, { useState } from 'react';
import { Plus, X, Calendar, User } from 'lucide-react';
import { TaskStep } from '../../types';
import DatePicker from '../ui/DatePicker';
import { v4 as uuidv4 } from 'uuid';

interface TaskStepsProps {
  steps: TaskStep[];
  onChange: (steps: TaskStep[]) => void;
}

const TaskSteps: React.FC<TaskStepsProps> = ({ steps, onChange }) => {
  const [newStepTitle, setNewStepTitle] = useState('');
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<string | null>(null);
  
  const handleAddStep = () => {
    if (!newStepTitle.trim()) return;
    
    const newStep: TaskStep = {
      id: uuidv4(),
      taskId: '',
      title: newStepTitle.trim(),
      completed: false,
      orderIndex: steps.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    onChange([...steps, newStep]);
    setNewStepTitle('');
  };
  
  const handleUpdateStep = (stepId: string, updates: Partial<TaskStep>) => {
    onChange(steps.map(step => 
      step.id === stepId 
        ? { ...step, ...updates, updatedAt: new Date().toISOString() }
        : step
    ));
  };
  
  const handleDeleteStep = (stepId: string) => {
    onChange(steps.filter(step => step.id !== stepId));
  };
  
  const handleReorderStep = (stepId: string, direction: 'up' | 'down') => {
    const currentIndex = steps.findIndex(step => step.id === stepId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= steps.length) return;
    
    const reorderedSteps = [...steps];
    [reorderedSteps[currentIndex], reorderedSteps[newIndex]] = 
      [reorderedSteps[newIndex], reorderedSteps[currentIndex]];
    
    // Update orderIndex values
    reorderedSteps.forEach((step, index) => {
      step.orderIndex = index;
    });
    
    onChange(reorderedSteps);
  };
  
  const handleDateSelect = (stepId: string, date: Date | null) => {
    handleUpdateStep(stepId, { dueDate: date?.toISOString() });
    setShowDatePicker(null);
  };
  
  return (
    <div className="mt-4 space-y-2">
      {steps.map((step, index) => (
        <div 
          key={step.id}
          className={`flex items-start gap-2 p-2 rounded ${
            editingStepId === step.id 
              ? 'bg-neutral-100 dark:bg-neutral-800' 
              : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'
          }`}
        >
          <button
            onClick={() => handleUpdateStep(step.id, { completed: !step.completed })}
            className={`flex-shrink-0 w-4 h-4 mt-1 rounded border ${
              step.completed
                ? 'bg-primary-500 border-primary-500 dark:bg-primary-600 dark:border-primary-600' 
                : 'border-neutral-400 dark:border-neutral-500'
            }`}
          />
          
          <div className="flex-1 min-w-0">
            {editingStepId === step.id ? (
              <input
                type="text"
                value={step.title}
                onChange={(e) => handleUpdateStep(step.id, { title: e.target.value })}
                onBlur={() => setEditingStepId(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setEditingStepId(null);
                  }
                }}
                className="w-full bg-transparent focus:outline-none text-neutral-900 dark:text-neutral-100"
                autoFocus
              />
            ) : (
              <div
                onClick={() => setEditingStepId(step.id)}
                className={`text-sm cursor-pointer ${
                  step.completed 
                    ? 'line-through text-neutral-500 dark:text-neutral-400' 
                    : 'text-neutral-900 dark:text-neutral-100'
                }`}
              >
                {step.title}
              </div>
            )}
            
            {(step.dueDate || step.assignee) && (
              <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                {step.dueDate && (
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(step.dueDate).toLocaleDateString()}
                  </span>
                )}
                {step.assignee && (
                  <span className="flex items-center gap-1">
                    <User size={12} />
                    {step.assignee}
                  </span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowDatePicker(step.id)}
              className="p-1 text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700"
            >
              <Calendar size={14} />
            </button>
            
            {showDatePicker === step.id && (
              <DatePicker
                selectedDate={step.dueDate ? new Date(step.dueDate) : null}
                onSelect={(date) => handleDateSelect(step.id, date)}
                onClose={() => setShowDatePicker(null)}
              />
            )}
            
            <button
              onClick={() => handleDeleteStep(step.id)}
              className="p-1 text-neutral-400 hover:text-important-500 dark:text-neutral-500 dark:hover:text-important-400 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ))}
      
      <div className="flex items-center gap-2">
        <div className="w-4" />
        <input
          type="text"
          placeholder="Add a step"
          value={newStepTitle}
          onChange={(e) => setNewStepTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newStepTitle.trim()) {
              handleAddStep();
            }
          }}
          className="flex-1 text-sm bg-transparent focus:outline-none placeholder-neutral-400 dark:placeholder-neutral-500 text-neutral-900 dark:text-neutral-100"
        />
        <button
          onClick={handleAddStep}
          disabled={!newStepTitle.trim()}
          className={`p-1 rounded-full ${
            newStepTitle.trim()
              ? 'text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20'
              : 'text-neutral-300 dark:text-neutral-600'
          }`}
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
};

export default TaskSteps;