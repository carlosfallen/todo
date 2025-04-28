import React from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import TaskList from './components/tasks/TaskList';
import { AppProvider } from './contexts/AppContext';

function App() {
  return (
    <AppProvider>
      <div className="flex flex-col md:flex-row min-h-screen bg-neutral-100 text-neutral-800">
        <Sidebar />
        
        <div className="flex-1 w-full md:ml-64">
          <Header />
          <main className="px-3 md:px-6">
            <TaskList />
          </main>
        </div>
      </div>
    </AppProvider>
  );
}

export default App;