import React from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, FileText, Calendar, TrendingUp, Clock, Star } from 'lucide-react';
import { Task, Note } from '../../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface HomeScreenProps {
  userId: string;
  tasks: Task[];
  notes: Note[];
  onNavigate: (tab: 'tasks' | 'notes') => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ tasks, notes, onNavigate }) => {
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Bom dia' : now.getHours() < 18 ? 'Boa tarde' : 'Boa noite';

  const todayTasks = tasks.filter(t => !t.completed && (!t.dueDate || new Date(t.dueDate) <= new Date()));
  const importantTasks = tasks.filter(t => t.important && !t.completed);
  const recentNotes = notes.slice(0, 3);

  const stats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.completed).length,
    pendingTasks: tasks.filter(t => !t.completed).length,
    totalNotes: notes.length,
  };

  const completionRate = stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;

  return (
    <div className="space-y-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-ios-2xl font-bold text-ios-light-text dark:text-ios-dark-text">
          {greeting}
        </h1>
        <p className="text-ios-base text-ios-light-secondary dark:text-ios-dark-secondary">
          {format(now, "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <motion.div
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('tasks')}
          className="ios-card p-6 cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-ios-lg bg-ios-light-accent/10 dark:bg-ios-dark-accent/10 flex items-center justify-center">
              <CheckSquare size={24} className="text-ios-light-accent dark:text-ios-dark-accent" strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-3xl font-bold text-ios-light-text dark:text-ios-dark-text mb-1">
            {stats.pendingTasks}
          </p>
          <p className="text-ios-sm text-ios-light-secondary dark:text-ios-dark-secondary">
            Tarefas pendentes
          </p>
        </motion.div>

        <motion.div
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('notes')}
          className="ios-card p-6 cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-ios-lg bg-orange-500/10 flex items-center justify-center">
              <FileText size={24} className="text-orange-500" strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-3xl font-bold text-ios-light-text dark:text-ios-dark-text mb-1">
            {stats.totalNotes}
          </p>
          <p className="text-ios-sm text-ios-light-secondary dark:text-ios-dark-secondary">
            Notas criadas
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="ios-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-ios-lg font-bold text-ios-light-text dark:text-ios-dark-text">
            Progresso
          </h2>
          <TrendingUp size={20} className="text-green-500" strokeWidth={2.5} />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-ios-base text-ios-light-secondary dark:text-ios-dark-secondary">
              Taxa de conclusão
            </span>
            <span className="text-ios-lg font-bold text-ios-light-text dark:text-ios-dark-text">
              {completionRate}%
            </span>
          </div>
          <div className="w-full h-2 bg-ios-light-border dark:bg-ios-dark-border rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{stats.completedTasks}</p>
              <p className="text-ios-xs text-ios-light-secondary dark:text-ios-dark-secondary">Concluídas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-ios-light-accent dark:text-ios-dark-accent">{stats.pendingTasks}</p>
              <p className="text-ios-xs text-ios-light-secondary dark:text-ios-dark-secondary">Pendentes</p>
            </div>
          </div>
        </div>
      </motion.div>

      {todayTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="ios-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Calendar size={20} className="text-ios-light-accent dark:text-ios-dark-accent" strokeWidth={2.5} />
              <h2 className="text-ios-lg font-bold text-ios-light-text dark:text-ios-dark-text">
                Hoje
              </h2>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onNavigate('tasks')}
              className="text-ios-sm text-ios-light-accent dark:text-ios-dark-accent font-semibold"
            >
              Ver todas
            </motion.button>
          </div>

          <div className="space-y-3">
            {todayTasks.slice(0, 3).map(task => (
              <motion.div
                key={task.id}
                whileTap={{ scale: 0.98 }}
                className="flex items-start space-x-3 p-3 rounded-ios-lg bg-ios-light-bg dark:bg-ios-dark-elevated cursor-pointer"
              >
                <div className={`w-5 h-5 rounded-full border-2 mt-0.5 ${
                  task.important
                    ? 'border-orange-500'
                    : 'border-ios-light-border dark:border-ios-dark-border'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-ios-base text-ios-light-text dark:text-ios-dark-text font-medium truncate">
                    {task.title}
                  </p>
                  {task.dueDate && (
                    <div className="flex items-center space-x-1 mt-1">
                      <Clock size={12} className="text-ios-light-secondary dark:text-ios-dark-secondary" />
                      <p className="text-ios-xs text-ios-light-secondary dark:text-ios-dark-secondary">
                        {format(new Date(task.dueDate), 'HH:mm')}
                      </p>
                    </div>
                  )}
                </div>
                {task.important && (
                  <Star size={16} className="text-orange-500 fill-orange-500 mt-1" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {recentNotes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="ios-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <FileText size={20} className="text-orange-500" strokeWidth={2.5} />
              <h2 className="text-ios-lg font-bold text-ios-light-text dark:text-ios-dark-text">
                Notas Recentes
              </h2>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onNavigate('notes')}
              className="text-ios-sm text-ios-light-accent dark:text-ios-dark-accent font-semibold"
            >
              Ver todas
            </motion.button>
          </div>

          <div className="space-y-3">
            {recentNotes.map(note => (
              <motion.div
                key={note.id}
                whileTap={{ scale: 0.98 }}
                className="p-4 rounded-ios-lg bg-ios-light-bg dark:bg-ios-dark-elevated cursor-pointer"
              >
                <p className="text-ios-base text-ios-light-text dark:text-ios-dark-text font-semibold mb-1 truncate">
                  {note.title}
                </p>
                <p className="text-ios-sm text-ios-light-secondary dark:text-ios-dark-secondary line-clamp-2">
                  {note.content.substring(0, 80)}...
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
