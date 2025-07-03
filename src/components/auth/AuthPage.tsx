import React, { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen surface flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex items-center justify-center">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 lg:pr-12 flex-col justify-center">
          <div className="max-w-lg">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-primary-600 rounded-3xl flex items-center justify-center">
                <ClipboardList className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-display-small text-on-surface">
                  TaskMaster
                </h1>
                <p className="text-body-large text-on-surface-variant">
                  Organize suas tarefas e notas
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-primary-600 dark:text-primary-400 text-lg">✓</span>
                </div>
                <div>
                  <h3 className="text-title-medium text-on-surface mb-1">
                    Gerencie suas tarefas
                  </h3>
                  <p className="text-body-medium text-on-surface-variant">
                    Organize, priorize e acompanhe o progresso das suas tarefas com facilidade
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-primary-600 dark:text-primary-400 text-lg">✓</span>
                </div>
                <div>
                  <h3 className="text-title-medium text-on-surface mb-1">
                    Notas em Markdown
                  </h3>
                  <p className="text-body-medium text-on-surface-variant">
                    Escreva e organize suas notas com suporte completo ao formato Markdown
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-primary-600 dark:text-primary-400 text-lg">✓</span>
                </div>
                <div>
                  <h3 className="text-title-medium text-on-surface mb-1">
                    Sincronização na nuvem
                  </h3>
                  <p className="text-body-medium text-on-surface-variant">
                    Acesse suas tarefas e notas de qualquer dispositivo, sempre sincronizadas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth forms */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <div className="w-full max-w-md">
            <div className="card-elevated p-8">
              {isLogin ? (
                <LoginForm onToggleMode={() => setIsLogin(false)} />
              ) : (
                <SignUpForm onToggleMode={() => setIsLogin(true)} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;