import React from 'react';
import { User, LogOut, Trash2, Download, Upload, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';

const SettingsView: React.FC = () => {
  const { user, signOut } = useAuth();
  const { lists, notes, allTasks } = useApp();
  const [theme, setTheme] = React.useState<'light' | 'dark'>(() => {
    return localStorage.getItem('theme') as 'light' | 'dark' || 'light';
  });

  const handleSignOut = async () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      await signOut();
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
  };

  const exportData = () => {
    const data = {
      lists,
      tasks: allTasks,
      notes,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskmaster-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const deleteAllData = async () => {
    if (window.confirm('ATENÇÃO: Esta ação irá deletar TODOS os seus dados (tarefas, listas e notas). Esta ação não pode ser desfeita. Tem certeza?')) {
      if (window.confirm('Última confirmação: Todos os seus dados serão perdidos permanentemente. Continuar?')) {
        try {
          // Delete all lists (which will cascade delete tasks)
          for (const list of lists) {
            await deleteList(list.id);
          }
          
          // Delete all notes
          for (const note of notes) {
            await deleteNote(note.id);
          }
          
          alert('Todos os dados foram deletados com sucesso.');
        } catch (error) {
          console.error('Erro ao deletar dados:', error);
          alert('Erro ao deletar alguns dados. Tente novamente.');
        }
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-display-small text-on-surface mb-2">Configurações</h1>
        <p className="text-body-large text-on-surface-variant">
          Gerencie sua conta e preferências do aplicativo
        </p>
      </div>

      <div className="space-y-8">
        {/* Perfil do usuário */}
        <section className="card p-6">
          <h2 className="text-headline-small text-on-surface mb-4 flex items-center gap-3">
            <User size={24} />
            Perfil
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-label-large text-on-surface block mb-1">Email</label>
              <p className="text-body-large text-on-surface-variant">{user?.email}</p>
            </div>
            
            {user?.displayName && (
              <div>
                <label className="text-label-large text-on-surface block mb-1">Nome</label>
                <p className="text-body-large text-on-surface-variant">{user.displayName}</p>
              </div>
            )}
            
            <div className="pt-4">
              <button
                onClick={handleSignOut}
                className="btn-outlined flex items-center gap-2 text-error-600 border-error-600 hover:bg-error-50 dark:hover:bg-error-900/20"
              >
                <LogOut size={18} />
                <span className="text-label-large">Sair da conta</span>
              </button>
            </div>
          </div>
        </section>

        {/* Aparência */}
        <section className="card p-6">
          <h2 className="text-headline-small text-on-surface mb-4">Aparência</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-label-large text-on-surface block mb-1">Tema</label>
                <p className="text-body-medium text-on-surface-variant">
                  Escolha entre tema claro ou escuro
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className="btn-outlined flex items-center gap-2"
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                <span className="text-label-large">
                  {theme === 'light' ? 'Escuro' : 'Claro'}
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Estatísticas */}
        <section className="card p-6">
          <h2 className="text-headline-small text-on-surface mb-4">Estatísticas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-display-medium text-primary-600 font-bold">
                {allTasks.length}
              </div>
              <div className="text-body-large text-on-surface-variant">
                Tarefas criadas
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-display-medium text-success-600 font-bold">
                {allTasks.filter(task => task.completed).length}
              </div>
              <div className="text-body-large text-on-surface-variant">
                Tarefas concluídas
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-display-medium text-amber-600 font-bold">
                {notes.length}
              </div>
              <div className="text-body-large text-on-surface-variant">
                Notas criadas
              </div>
            </div>
          </div>
        </section>

        {/* Dados */}
        <section className="card p-6">
          <h2 className="text-headline-small text-on-surface mb-4">Dados</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-label-large text-on-surface block mb-1">
                  Exportar dados
                </label>
                <p className="text-body-medium text-on-surface-variant">
                  Baixe um backup de todas as suas tarefas, listas e notas
                </p>
              </div>
              <button
                onClick={exportData}
                className="btn-outlined flex items-center gap-2"
              >
                <Download size={18} />
                <span className="text-label-large">Exportar</span>
              </button>
            </div>
            
            <div className="border-t divider pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-label-large text-error-600 block mb-1">
                    Deletar todos os dados
                  </label>
                  <p className="text-body-medium text-on-surface-variant">
                    Remove permanentemente todas as suas tarefas, listas e notas
                  </p>
                </div>
                <button
                  onClick={deleteAllData}
                  className="btn-outlined flex items-center gap-2 text-error-600 border-error-600 hover:bg-error-50 dark:hover:bg-error-900/20"
                >
                  <Trash2 size={18} />
                  <span className="text-label-large">Deletar tudo</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Sobre */}
        <section className="card p-6">
          <h2 className="text-headline-small text-on-surface mb-4">Sobre</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-label-large text-on-surface block mb-1">Versão</label>
              <p className="text-body-large text-on-surface-variant">2.1.3</p>
            </div>
            
            <div>
              <label className="text-label-large text-on-surface block mb-1">Desenvolvido com</label>
              <p className="text-body-medium text-on-surface-variant">
                React, TypeScript, Tailwind CSS, Firebase
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsView;