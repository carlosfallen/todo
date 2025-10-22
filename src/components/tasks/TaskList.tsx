import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, TaskList as TaskListType } from '../../types';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { Button } from '../ui/Button';
import { subscribeToTasks, subscribeToTaskLists } from '../../services/firebase/firestore';

interface TaskListProps {
  userId: string;
}

const CACHE_KEY_TASKS = 'cached_tasks';
const CACHE_KEY_LISTS = 'cached_task_lists';

export const TaskList: React.FC<TaskListProps> = ({ userId }) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const cached = localStorage.getItem(`${CACHE_KEY_TASKS}_${userId}`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [taskLists, setTaskLists] = useState<TaskListType[]>(() => {
    try {
      const cached = localStorage.getItem(`${CACHE_KEY_LISTS}_${userId}`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedList, setSelectedList] = useState<string>('');
  const [showCompleted, setShowCompleted] = useState<boolean>(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(tasks.length === 0 || taskLists.length === 0);

  useEffect(() => {
    const unsubscribeTasks = subscribeToTasks(userId, (data) => {
      setTasks(data);
      localStorage.setItem(`${CACHE_KEY_TASKS}_${userId}`, JSON.stringify(data));
      setLoading(false);
    });

    const unsubscribeTaskLists = subscribeToTaskLists(userId, (data) => {
      setTaskLists(data);
      localStorage.setItem(`${CACHE_KEY_LISTS}_${userId}`, JSON.stringify(data));
      setLoading(false);
    });

    return () => {
      unsubscribeTasks();
      unsubscribeTaskLists();
    };
  }, [userId]);

  useEffect(() => {
    let filtered = tasks;

    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedList) {
      filtered = filtered.filter(task => task.listId === selectedList);
    }

    if (!showCompleted) {
      filtered = filtered.filter(task => !task.completed);
    }

    setFilteredTasks(filtered);
  }, [tasks, searchTerm, selectedList, showCompleted]);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleCloseTaskForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const tasksByList = taskLists.map(list => ({
    list,
    tasks: filteredTasks.filter(task => task.listId === list.id)
  })).filter(group => group.tasks.length > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-ios-light-accent dark:border-ios-dark-accent border-t-transparent mx-auto mb-4"></div>
          <p className="text-ios-base text-ios-light-secondary dark:text-ios-dark-secondary">Carregando tarefas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      <div className="ios-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-ios-lg font-bold text-ios-light-text dark:text-ios-dark-text">
            Minhas Tarefas
          </h2>
          <Button onClick={() => setShowTaskForm(true)} size="sm">
            <Plus size={18} strokeWidth={2.5} className="mr-1" />
            Nova
          </Button>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ios-light-secondary dark:text-ios-dark-secondary" strokeWidth={2} />
            <input
              type="text"
              placeholder="Buscar tarefas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ios-input pl-10 text-ios-base"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedList}
              onChange={(e) => setSelectedList(e.target.value)}
              className="ios-input text-ios-sm flex-1"
            >
              <option value="">Todas as listas</option>
              {taskLists.map(list => (
                <option key={list.id} value={list.id}>{list.name}</option>
              ))}
            </select>

            <label className="flex items-center gap-2 ios-card px-4 py-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                className="w-5 h-5 rounded border-ios-light-border dark:border-ios-dark-border text-ios-light-accent dark:text-ios-dark-accent focus:ring-2 focus:ring-ios-light-accent dark:focus:ring-ios-dark-accent"
              />
              <span className="text-ios-sm font-medium text-ios-light-text dark:text-ios-dark-text whitespace-nowrap">
                Concluídas
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {tasksByList.map(({ list, tasks }) => (
          <div key={list.id}>
            <div className="flex items-center gap-2 mb-3 px-1">
              <div
                className="w-3 h-3 rounded-full shadow-ios-sm"
                style={{ backgroundColor: list.color }}
              />
              <h3 className="text-ios-lg font-bold text-ios-light-text dark:text-ios-dark-text">
                {list.name}
              </h3>
              <span className="text-ios-sm text-ios-light-secondary dark:text-ios-dark-secondary font-semibold">
                {tasks.length}
              </span>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {tasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    taskList={list}
                    onEdit={handleEditTask}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}

        {tasksByList.length === 0 && (
          <div className="ios-card p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-ios-xl bg-ios-light-border/50 dark:bg-ios-dark-border/50 flex items-center justify-center">
              <Plus size={32} className="text-ios-light-secondary dark:text-ios-dark-secondary opacity-50" strokeWidth={2} />
            </div>
            <p className="text-ios-lg font-semibold text-ios-light-text dark:text-ios-dark-text mb-1">
              Nenhuma tarefa encontrada
            </p>
            <p className="text-ios-sm text-ios-light-secondary dark:text-ios-dark-secondary">
              {searchTerm || selectedList
                ? 'Ajuste os filtros ou crie uma nova'
                : 'Crie sua primeira tarefa'}
            </p>
          </div>
        )}
      </div>

      <TaskForm
        isOpen={showTaskForm}
        onClose={handleCloseTaskForm}
        task={editingTask}
        taskLists={taskLists}
        userId={userId}
      />
    </div>
  );
};
