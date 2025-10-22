import { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useSwipeGesture } from './hooks/useSwipeGesture';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { TaskList } from './components/tasks/TaskList';
import { NoteList } from './components/notes/NoteList';
import { ProfilePage } from './components/profile/ProfilePage';
import { HomeScreen } from './components/home/HomeScreen';
import { TopBar } from './components/layout/TopBar';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { createTaskList } from './services/firebase/firestore';
import { subscribeToTasks, subscribeToNotes } from './services/firebase/firestore';
import { Task, Note } from './types';

function App() {
  const { user, loading } = useAuth();
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  const [activeTab, setActiveTab] = useLocalStorage<'home' | 'tasks' | 'notes' | 'profile'>('activeTab', 'home');
  const [isLogin, setIsLogin] = useState(true);
  const [defaultListsCreated, setDefaultListsCreated] = useLocalStorage('defaultListsCreated', false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    if (user && !defaultListsCreated) {
      const createDefaultLists = async () => {
        try {
          const defaultLists = [
            { name: 'Pessoal', color: '#007AFF' },
            { name: 'Trabalho', color: '#34C759' },
            { name: 'Estudos', color: '#FF9500' }
          ];

          for (const list of defaultLists) {
            await createTaskList({
              ...list,
              userId: user.uid
            });
          }

          setDefaultListsCreated(true);
        } catch (error) {
          console.error('Error creating default task lists:', error);
        }
      };

      createDefaultLists();
    }
  }, [user, defaultListsCreated, setDefaultListsCreated]);

  useEffect(() => {
    if (user) {
      const unsubscribeTasks = subscribeToTasks(user.uid, setTasks);
      const unsubscribeNotes = subscribeToNotes(user.uid, setNotes);

      return () => {
        unsubscribeTasks();
        unsubscribeNotes();
      };
    }
  }, [user]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const tabs: Array<'home' | 'tasks' | 'notes' | 'profile'> = ['home', 'tasks', 'notes', 'profile'];
  const currentIndex = tabs.indexOf(activeTab);

  useSwipeGesture({
    onSwipeLeft: () => {
      if (currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1]);
      }
    },
    onSwipeRight: () => {
      if (currentIndex > 0) {
        setActiveTab(tabs[currentIndex - 1]);
      }
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-ios-light-bg dark:bg-ios-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-ios-light-accent dark:border-ios-dark-accent border-t-transparent mx-auto mb-6"></div>
          <p className="text-ios-base text-ios-light-secondary dark:text-ios-dark-secondary">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-ios-light-bg dark:bg-ios-dark-bg flex items-center justify-center p-4">
        {isLogin ? (
          <LoginForm onToggleForm={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onToggleForm={() => setIsLogin(true)} />
        )}
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            userId={user.uid}
            tasks={tasks}
            notes={notes}
            onNavigate={setActiveTab}
          />
        );
      case 'tasks':
        return <TaskList userId={user.uid} />;
      case 'notes':
        return <NoteList userId={user.uid} />;
      case 'profile':
        return <ProfilePage user={user} />;
      default:
        return (
          <HomeScreen
            userId={user.uid}
            tasks={tasks}
            notes={notes}
            onNavigate={setActiveTab}
          />
        );
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'home':
        return 'Produtividade';
      case 'tasks':
        return 'Tarefas';
      case 'notes':
        return 'Notas';
      case 'profile':
        return 'Perfil';
      default:
        return 'Produtividade';
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-ios-light-bg dark:bg-ios-dark-bg">
        <TopBar
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          title={getTitle()}
        />

        <main className="pt-20 px-4 pb-safe-bottom">
          <div className="max-w-2xl mx-auto">
            {renderContent()}
          </div>
        </main>

        <BottomNavigation
          activeTab={activeTab === 'home' ? 'tasks' : activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
        />
      </div>
    </Router>
  );
}

export default App;
