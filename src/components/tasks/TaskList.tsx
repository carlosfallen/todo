import React from 'react';
import { useApp } from '../../contexts/AppContext';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import EmptyState from '../ui/EmptyState';
import LoadingSpinner from '../ui/LoadingSpinner';

const TaskList: React.FC = () => {
  const { 
    tasks, 
    tasksLoading, 
    filter,
    isAddingTask,
    setIsAddingTask,
    activeListId,
    activeList
  } = useApp();
  
  const handleTaskSaved = () => {
    setIsAddingTask(false);
  };

  if (tasksLoading) {
    return (
      <div className="flex justify-center py-10">
        <LoadingSpinner />
      </div>
    );
  }
  
  // Filter tasks based on current list and filters
  const filteredTasks = tasks.filter(task => {
    if (activeListId === 'important') {
      return task.important;
    }
    
    if (activeListId === 'planned') {
      return !!task.dueDate;
    }
    
    if (activeListId === 'all') {
      return true;
    }
    
    return task.listId === activeListId;
  });
  
  // Group tasks by date
  const taskGroups = filteredTasks.reduce((groups, task) => {
    let group = 'Sem Data';
    
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      if (dueDate < today && !task.completed) {
        group = 'Atrasadas';
      } else if (dueDate.getTime() === today.getTime()) {
        group = 'Hoje';
      } else if (dueDate.getTime() === tomorrow.getTime()) {
        group = 'Amanhã';
      } else if (dueDate < nextWeek) {
        group = 'Esta Semana';
      } else {
        group = 'Futuras';
      }
    }
    
    if (!groups[group]) {
      groups[group] = [];
    }
    
    groups[group].push(task);
    return groups;
  }, {} as Record<string, typeof filteredTasks>);
  
  // Sort groups by priority
  const groupOrder = ['Atrasadas', 'Hoje', 'Amanhã', 'Esta Semana', 'Futuras', 'Sem Data'];
  const sortedGroups = Object.entries(taskGroups).sort((a, b) => {
    return groupOrder.indexOf(a[0]) - groupOrder.indexOf(b[0]);
  });
  
  const getGroupColor = (groupName: string) => {
    switch (groupName) {
      case 'Atrasadas':
        return 'text-error-600 dark:text-error-400';
      case 'Hoje':
        return 'text-primary-600 dark:text-primary-400';
      case 'Amanhã':
        return 'text-amber-600 dark:text-amber-400';
      default:
        return 'text-on-surface-variant';
    }
  };
  
  return (
    <div className="surface-container min-h-full">
      <div className="p-4 md:p-6">
        {isAddingTask && (
          <div className="mb-6">
            <TaskForm
              onClose={() => setIsAddingTask(false)}
              onTaskSaved={handleTaskSaved}
            />
          </div>
        )}

        {filteredTasks.length === 0 ? (
          <EmptyState 
            title={filter.search ? "Nenhuma tarefa encontrada" : "Nenhuma tarefa ainda"}
            description={filter.search 
              ? "Tente ajustar sua busca ou filtros" 
              : `Adicione uma tarefa para ${activeList ? activeList.name : 'começar'}`
            }
            actionLabel="Adicionar tarefa"
            onAction={() => setIsAddingTask(true)}
          />
        ) : (
          <div className="space-y-8">
            {sortedGroups.map(([group, tasks]) => (
              <div key={group}>
                <h2 className={`text-label-large mb-4 uppercase tracking-wide ${getGroupColor(group)}`}>
                  {group}
                  <span className="ml-2 text-label-medium opacity-70">
                    ({tasks.length})
                  </span>
                </h2>
                <div className="space-y-2">
                  {tasks.map(task => (
                    <TaskItem key={task.id} task={task} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;