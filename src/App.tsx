import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import TaskList from './components/tasks/TaskList';
import { AppProvider } from './contexts/AppContext';

function App() {
  return (
    <AppProvider>
      <div className="min-h-screen surface text-on-surface">
        <div className="flex min-h-screen">
          <Sidebar />
          
          <div className="flex-1 min-w-0 flex flex-col">
            <Header />
            <main className="flex-1 overflow-hidden">
              <TaskList />
            </main>
          </div>
        </div>
      </div>
    </AppProvider>
  );
}

export default App;