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
    let group = 'No Due Date';
    
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      if (dueDate < today && !task.completed) {
        group = 'Overdue';
      } else if (dueDate.getTime() === today.getTime()) {
        group = 'Today';
      } else if (dueDate.getTime() === tomorrow.getTime()) {
        group = 'Tomorrow';
      } else if (dueDate < nextWeek) {
        group = 'This Week';
      } else {
        group = 'Later';
      }
    }
    
    if (!groups[group]) {
      groups[group] = [];
    }
    
    groups[group].push(task);
    return groups;
  }, {} as Record<string, typeof filteredTasks>);
  
  // Sort groups by priority
  const groupOrder = ['Overdue', 'Today', 'Tomorrow', 'This Week', 'Later', 'No Due Date'];
  const sortedGroups = Object.entries(taskGroups).sort((a, b) => {
    return groupOrder.indexOf(a[0]) - groupOrder.indexOf(b[0]);
  });
  
  return (
    <div className="p-4">
      {isAddingTask && (
        <div className="mb-4">
          <TaskForm onClose={() => setIsAddingTask(false)} />
        </div>
      )}
      
      {filteredTasks.length === 0 ? (
        <EmptyState 
          title={filter.search ? "No matching tasks" : "No tasks yet"}
          description={filter.search 
            ? "Try adjusting your search or filters" 
            : `Add a task to ${activeList ? activeList.name : 'get started'}`
          }
          actionLabel="Add a task"
          onAction={() => setIsAddingTask(true)}
        />
      ) : (
        <div className="space-y-6">
          {sortedGroups.map(([group, tasks]) => (
            <div key={group}>
              <h2 className="text-sm font-medium text-neutral-500 mb-2">{group}</h2>
              <div>
                {tasks.map(task => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;