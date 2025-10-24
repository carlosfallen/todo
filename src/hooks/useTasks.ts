import { useState, useEffect } from 'react';
import { Task } from '../types';
import { getTasksLocal, saveTaskLocal, deleteTaskLocal } from '../lib/storage';
import { syncTaskToFirestore, deleteTaskFromFirestore, subscribeToTasks } from '../lib/sync';
import { useAuth } from './useAuth';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadTasks = async () => {
      const localTasks = await getTasksLocal();
      setTasks(localTasks);
      setLoading(false);
    };

    loadTasks();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToTasks(user.uid, (firestoreTasks) => {
      setTasks(firestoreTasks);
    });

    return () => unsubscribe();
  }, [user]);

  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    const newTask: Task = {
      ...task,
      id: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: user?.uid || 'local-user',
    };

    if (user && navigator.onLine) {
      const syncedTask = await syncTaskToFirestore(newTask, user.uid);
      if (syncedTask) {
        await saveTaskLocal(syncedTask);
        setTasks(prev => [...prev, syncedTask]);
        return syncedTask;
      }
    }

    newTask.id = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await saveTaskLocal(newTask);
    setTasks(prev => [...prev, newTask]);
    return newTask;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const updatedTask = tasks.find(t => t.id === id);
    if (!updatedTask) return;

    const newTask = {
      ...updatedTask,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await saveTaskLocal(newTask);
    setTasks(prev => prev.map(t => t.id === id ? newTask : t));

    if (user && navigator.onLine && id.length > 20) {
      await syncTaskToFirestore(newTask, user.uid);
    }
  };

  const deleteTask = async (id: string) => {
    await deleteTaskLocal(id);
    setTasks(prev => prev.filter(t => t.id !== id));

    if (user && navigator.onLine && id.length > 20) {
      await deleteTaskFromFirestore(id);
    }
  };

  const reorderTasks = async (reorderedTasks: Task[]) => {
    const updatedTasks = reorderedTasks.map((task, index) => ({
      ...task,
      orderIndex: index,
      updatedAt: new Date().toISOString(),
    }));

    for (const task of updatedTasks) {
      await saveTaskLocal(task);
      if (user && navigator.onLine && task.id.length > 20) {
        await syncTaskToFirestore(task, user.uid);
      }
    }

    setTasks(updatedTasks);
  };

  return { tasks, loading, addTask, updateTask, deleteTask, reorderTasks };
};