import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  AlertCircle
} from 'lucide-react';
import { Task, TaskList } from '../../types';
import { updateTask, deleteTask } from '../../services/firebase/firestore';
import { AnimatePresence } from 'framer-motion';

interface TaskCardProps {
  task: Task;
  taskList: TaskList;
  onEdit: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, taskList, onEdit }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`
        relative rounded-3xl border-2 overflow-hidden transition-all duration-300
        ${task.completed 
          ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-green-200 dark:border-green-800' 
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
        }
        ${isOverdue() ? 'ring-2 ring-red-400 dark:ring-red-600' : ''}
        shadow-sm hover:shadow-xl
      `}
    >
      {/* Priority Indicator Bar */}
      {task.important && !task.completed && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400"></div>
      )}

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleComplete}
            className="flex-shrink-0 mt-0.5"
          >
            {task.completed ? (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                <CheckCircle size={20} className="text-white" />
              </div>
            ) : (
              <Circle size={24} className="text-gray-400 hover:text-purple-500 transition-colors" />
            )}
          </motion.button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className={`
                text-base font-semibold transition-all
                ${task.completed 
                  ? 'line-through text-gray-500 dark:text-gray-400' 
                  : 'text-gray-900 dark:text-white'
                }
              `}>
                {task.title}
              </h3>

              {/* Actions */}
              <div className={`flex items-center gap-1 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleToggleImportant}
                  className={`p-1.5 rounded-xl transition-all ${
                    task.important 
                      ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' 
                      : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                  }`}
                >
                  <Star size={16} fill={task.important ? 'currentColor' : 'none'} />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onEdit(task)}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all"
                >
                  <Edit3 size={16} />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleDelete}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  <Trash2 size={16} />
                </motion.button>
              </div>
            </div>

            {/* Notes */}
            {task.notes && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                {task.notes.length > 100 ? `${task.notes.substring(0, 100)}...` : task.notes}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span 
                className="px-3 py-1 text-xs font-medium rounded-full text-white shadow-sm"
                style={{ backgroundColor: taskList.color }}
              >
                {taskList.name}
              </span>
              
              {task.steps.length > 0 && (
                <span className="flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                  <ListTodo size={12} />
                  {getCompletedStepsCount()}/{task.steps.length}
                </span>
              )}

              {task.dueDate && (
                <span className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${
                  isOverdue() 
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' 
                    : isDueToday() 
                      ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}>
                  {isOverdue() ? <AlertCircle size={12} /> : <Calendar size={12} />}
                  {isOverdue() ? 'Atrasada' : isDueToday() ? 'Hoje' : new Date(task.dueDate).toLocaleDateString('pt-BR')}
                </span>
              )}
            </div>

            {/* Progress Bar */}
            {task.steps.length > 0 && !task.completed && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                  <span className="font-medium">Progresso</span>
                  <span className="font-bold">{getProgressPercentage()}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${getProgressPercentage()}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500 rounded-full"
                  />
                </div>
              </div>
            )}

            {/* Steps */}
            {task.steps.length > 0 && (
              <>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-2"
                >
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <span className="font-medium">Etapas</span>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700 ml-2"
                    >
                      {task.steps.sort((a, b) => a.orderIndex - b.orderIndex).map((step) => (
                        <motion.div 
                          key={step.id}
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          className="flex items-center gap-2"
                        >
                          <button
                            onClick={() => handleStepToggle(step.id)}
                            className="flex-shrink-0"
                          >
                            {step.completed ? (
                              <CheckCircle size={16} className="text-green-500" />
                            ) : (
                              <Circle size={16} className="text-gray-400 hover:text-purple-500 transition-colors" />
                            )}
                          </button>
                          <span className={`text-sm ${
                            step.completed 
                              ? 'line-through text-gray-500 dark:text-gray-400' 
                              : 'text-gray-700 dark:text-gray-300'
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
      </div>
    </motion.div>
  );
};