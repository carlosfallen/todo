import React from 'react';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';
import TaskList from './tasks/TaskList';
import NotesView from './notes/NotesView';
import SettingsView from './settings/SettingsView';
import { useApp } from '../contexts/AppContext';

const MainApp: React.FC = () => {
  const { viewMode } = useApp();

  const renderMainContent = () => {
    switch (viewMode) {
      case 'tasks':
        return <TaskList />;
      case 'notes':
        return <NotesView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <TaskList />;
    }
  };

  return (
    <div className="min-h-screen surface text-on-surface">
      <div className="flex min-h-screen">
        <Sidebar />
        
        <div className="flex-1 min-w-0 flex flex-col">
          {viewMode === 'tasks' && <Header />}
          <main className={`flex-1 ${viewMode === 'notes' ? '' : 'overflow-hidden'}`}>
            {renderMainContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainApp;