import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import TaskList from './components/tasks/TaskList';
import { AppProvider } from './contexts/AppContext';

function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
        <div className="md:flex md:min-h-screen"> {/* Adiciona min-h-screen aqui também */}
          <Sidebar />
          
          <div className="flex-1 min-w-0 flex flex-col"> {/* Adiciona flex flex-col */}
            <Header />
            <main className=""> {/* Adiciona flex-1 */}
              <TaskList />
            </main>
          </div>
        </div>
      </div>
    </AppProvider>
  );
}

export default App;