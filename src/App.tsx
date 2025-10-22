import { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useLocalStorage } from './hooks/useLocalStorage';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { TaskList } from './components/tasks/TaskList';
import { NoteList } from './components/notes/NoteList';
import { ProfilePage } from './components/profile/ProfilePage';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { createTaskList } from './services/firebase/firestore';

function App() {
  const { user, loading } = useAuth();
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  const [activeTab, setActiveTab] = useLocalStorage<'tasks' | 'notes' | 'profile'>('activeTab', 'tasks');
  const [isLogin, setIsLogin] = useState(true);
  const [defaultListsCreated, setDefaultListsCreated] = useLocalStorage('defaultListsCreated', false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (user && !defaultListsCreated) {
      const createDefaultLists = async () => {
        try {
          const defaultLists = [
            { name: 'Pessoal', color: '#8B5CF6' },
            { name: 'Trabalho', color: '#06B6D4' },
            { name: 'Estudos', color: '#F59E0B' }
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
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-6"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
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
      case 'tasks':
        return <TaskList userId={user.uid} />;
      case 'notes':
        return <NoteList userId={user.uid} />;
      case 'profile':
        return <ProfilePage user={user} />;
      default:
        return <TaskList userId={user.uid} />;
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-20'}`}>
          <Header
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            sidebarOpen={sidebarOpen}
          />
          
          <main className="pt-20 p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;