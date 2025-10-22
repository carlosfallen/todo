import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  Circle,
  Star,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronRight,
  Calendar,
  ListTodo,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Task, TaskList } from '../../types';
import { updateTask, deleteTask } from '../../services/firebase/firestore';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  taskList: TaskList;
  onEdit: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, taskList, onEdit }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleComplete = async () => {
    try {
      await updateTask(task.id, {
        completed: !task.completed
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleToggleImportant = async () => {
    try {
      await updateTask(task.id, {
        important: !task.important
      });
    } catch (error) {
      console.error('Error updating task importance:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      try {
        await deleteTask(task.id);
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleStepToggle = async (stepId: string) => {
    try {
      const updatedSteps = task.steps.map(step =>
        step.id === stepId
          ? { ...step, completed: !step.completed, updatedAt: new Date().toISOString() }
          : step
      );
      await updateTask(task.id, { steps: updatedSteps });
    } catch (error) {
      console.error('Error updating step:', error);
    }
  };

  const getCompletedStepsCount = () => {
    return task.steps.filter(step => step.completed).length;
  };

  const getProgressPercentage = () => {
    if (task.steps.length === 0) return 0;
    return Math.round((getCompletedStepsCount() / task.steps.length) * 100);
  };

  const isOverdue = () => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date() && !task.completed;
  };

  const isDueToday = () => {
    if (!task.dueDate) return false;
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    return today.toDateString() === dueDate.toDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileTap={{ scale: 0.98 }}
      className={`
        ios-card p-4 relative
        ${task.completed ? 'opacity-60' : ''}
        ${isOverdue() ? 'ring-2 ring-red-500/50' : ''}
      `}
    >
      {task.important && !task.completed && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-400 rounded-t-ios-xl"></div>
      )}

      <div className="flex items-start gap-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleToggleComplete}
          className="flex-shrink-0 mt-1"
        >
          {task.completed ? (
            <CheckCircle size={28} className="text-green-500" strokeWidth={2.5} fill="currentColor" />
          ) : (
            <Circle size={28} className="text-ios-light-border dark:text-ios-dark-border" strokeWidth={2.5} />
          )}
        </motion.button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className={`
              text-ios-base font-semibold
              ${task.completed
                ? 'line-through text-ios-light-secondary dark:text-ios-dark-secondary'
                : 'text-ios-light-text dark:text-ios-dark-text'
              }
            `}>
              {task.title}
            </h3>

            <div className="flex items-center gap-1 flex-shrink-0">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleToggleImportant}
                className="p-1.5 rounded-ios"
              >
                <Star
                  size={20}
                  className={task.important ? 'text-orange-500 fill-orange-500' : 'text-ios-light-secondary dark:text-ios-dark-secondary'}
                  strokeWidth={2}
                />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => onEdit(task)}
                className="p-1.5 rounded-ios"
              >
                <Edit3 size={18} className="text-ios-light-secondary dark:text-ios-dark-secondary" strokeWidth={2} />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleDelete}
                className="p-1.5 rounded-ios"
              >
                <Trash2 size={18} className="text-red-500" strokeWidth={2} />
              </motion.button>
            </div>
          </div>

          {task.notes && (
            <p className="text-ios-sm text-ios-light-secondary dark:text-ios-dark-secondary mb-2 line-clamp-2">
              {task.notes}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className="px-3 py-1 text-ios-xs font-semibold rounded-ios text-white"
              style={{ backgroundColor: taskList.color }}
            >
              {taskList.name}
            </span>

            {task.steps.length > 0 && (
              <span className="flex items-center gap-1 px-3 py-1 text-ios-xs font-semibold rounded-ios bg-ios-light-accent/10 dark:bg-ios-dark-accent/10 text-ios-light-accent dark:text-ios-dark-accent">
                <ListTodo size={14} strokeWidth={2.5} />
                {getCompletedStepsCount()}/{task.steps.length}
              </span>
            )}

            {task.dueDate && (
              <span className={`flex items-center gap-1 px-3 py-1 text-ios-xs font-semibold rounded-ios ${
                isOverdue()
                  ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                  : isDueToday()
                    ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                    : 'bg-ios-light-border/50 dark:bg-ios-dark-border/50 text-ios-light-secondary dark:text-ios-dark-secondary'
              }`}>
                {isOverdue() ? <AlertCircle size={14} strokeWidth={2.5} /> : <Clock size={14} strokeWidth={2.5} />}
                {isOverdue() ? 'Atrasada' : isDueToday() ? 'Hoje' : format(new Date(task.dueDate), 'dd/MM')}
              </span>
            )}
          </div>

          {task.steps.length > 0 && !task.completed && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-ios-xs text-ios-light-secondary dark:text-ios-dark-secondary mb-2">
                <span className="font-semibold">Progresso</span>
                <span className="font-bold">{getProgressPercentage()}%</span>
              </div>
              <div className="w-full bg-ios-light-border dark:bg-ios-dark-border rounded-full h-1.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${getProgressPercentage()}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                />
              </div>
            </div>
          )}

          {task.steps.length > 0 && (
            <>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-ios-sm text-ios-light-accent dark:text-ios-dark-accent font-semibold mb-2"
              >
                {isExpanded ? <ChevronDown size={18} strokeWidth={2.5} /> : <ChevronRight size={18} strokeWidth={2.5} />}
                <span>Etapas</span>
              </motion.button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-2 pl-3 border-l-2 border-ios-light-border dark:border-ios-dark-border"
                  >
                    {task.steps.sort((a, b) => a.orderIndex - b.orderIndex).map((step) => (
                      <motion.div
                        key={step.id}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex items-center gap-2"
                      >
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleStepToggle(step.id)}
                        >
                          {step.completed ? (
                            <CheckCircle size={18} className="text-green-500" strokeWidth={2.5} />
                          ) : (
                            <Circle size={18} className="text-ios-light-border dark:text-ios-dark-border" strokeWidth={2.5} />
                          )}
                        </motion.button>
                        <span className={`text-ios-sm ${
                          step.completed
                            ? 'line-through text-ios-light-secondary dark:text-ios-dark-secondary'
                            : 'text-ios-light-text dark:text-ios-dark-text'
                        }`}>
                          {step.title}
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};
