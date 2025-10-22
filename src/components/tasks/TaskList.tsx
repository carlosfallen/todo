import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Grid, List as ListIcon } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    important: tasks.filter(t => t.important && !t.completed).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando tarefas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <ListIcon size={24} className="text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Pendentes</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
              <Filter size={24} className="text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Concluídas</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ✓
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Importantes</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.important}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <span className="text-2xl">⭐</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Minhas Tarefas</h1>
          <Button
            onClick={() => setShowTaskForm(true)}
            variant="primary"
            className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
          >
            <Plus size={18} className="mr-2" />
            Nova Tarefa
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar tarefas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          <select
            value={selectedList}
            onChange={(e) => setSelectedList(e.target.value)}
            className="px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          >
            <option value="">Todas as listas</option>
            {taskLists.map(list => (
              <option key={list.id} value={list.id}>{list.name}</option>
            ))}
          </select>

          <div className="flex items-center gap-3">
            <label className="flex items-center space-x-2 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Concluídas</span>
            </label>

            <div className="flex bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-800 shadow-sm' : ''}`}
              >
                <Grid size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-800 shadow-sm' : ''}`}
              >
                <ListIcon size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {tasksByList.map(({ list, tasks }) => (
          <div key={list.id}>
            <div className="flex items-center space-x-3 mb-4">
              <div 
                className="w-3 h-3 rounded-full shadow-lg"
                style={{ backgroundColor: list.color }}
              />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {list.name}
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({tasks.length})
              </span>
            </div>
            
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-3'}>
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
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-gray-400 dark:text-gray-500">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-purple-100 to-cyan-100 dark:from-purple-900/20 dark:to-cyan-900/20 flex items-center justify-center">
                <Plus size={40} className="opacity-50" />
              </div>
              <p className="text-xl font-medium mb-2">Nenhuma tarefa encontrada</p>
              <p className="text-sm">
                {searchTerm || selectedList
                  ? 'Tente ajustar os filtros de pesquisa'
                  : 'Crie sua primeira tarefa para começar'
                }
              </p>
            </div>
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