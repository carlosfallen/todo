import React, { useState } from 'react';
import { User, Mail, Calendar, Edit3, LogOut, Camera, Shield, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { User as FirebaseUser } from 'firebase/auth';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { updateUserProfile, logout } from '../../services/firebase/auth';

interface ProfilePageProps {
  user: FirebaseUser;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await updateUserProfile(user, { displayName });
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      try {
        await logout();
      } catch (error) {
        console.error('Error logging out:', error);
      }
    }
  };

  return (
    <div className=" mt-16 max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-3xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm"
      >
        {/* Cover */}
        <div className="h-32 bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500 relative">
          <div className="absolute inset-0 bg-black/10"></div>
        </div>

        {/* Profile Info */}
        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 mb-6">
            <div className="flex items-end space-x-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-xl">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-full h-full rounded-3xl object-cover"
                    />
                  ) : (
                    <User size={48} className="text-white" />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 w-10 h-10 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-lg border-2 border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform">
                  <Camera size={18} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Name */}
              <div className="pb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {user.displayName || 'Usuário'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 flex items-center">
                  <Mail size={16} className="mr-2" />
                  {user.email}
                </p>
              </div>
            </div>

            {/* Edit Button */}
            <Button
              onClick={() => setShowEditModal(true)}
              variant="outline"
              className="mt-4 md:mt-0 border-2"
            >
              <Edit3 size={18} className="mr-2" />
              Editar Perfil
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">0</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tarefas Concluídas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">0</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Notas Criadas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {Math.floor((new Date().getTime() - new Date(user.metadata.creationTime!).getTime()) / (1000 * 60 * 60 * 24))}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Dias Ativo</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Account Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-3xl border-2 border-gray-200 dark:border-gray-700 p-8 shadow-sm"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Informações da Conta
        </h2>

        <div className="space-y-4">
          <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Mail size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</p>
              <p className="text-base font-semibold text-gray-900 dark:text-white truncate">
                {user.email}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
              <Calendar size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Membro desde</p>
              <p className="text-base font-semibold text-gray-900 dark:text-white">
                {user.metadata.creationTime && 
                  format(new Date(user.metadata.creationTime), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                }
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
              <Shield size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Status da Conta</p>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <p className="text-base font-semibold text-gray-900 dark:text-white">Ativa</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-3xl border-2 border-gray-200 dark:border-gray-700 p-8 shadow-sm"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Configurações
        </h2>

        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <div className="flex items-center space-x-3">
              <Bell size={20} className="text-gray-600 dark:text-gray-400" />
              <span className="font-medium text-gray-900 dark:text-white">Notificações</span>
            </div>
            <div className="w-12 h-6 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
            </div>
          </button>

          <button className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <div className="flex items-center space-x-3">
              <Shield size={20} className="text-gray-600 dark:text-gray-400" />
              <span className="font-medium text-gray-900 dark:text-white">Privacidade</span>
            </div>
            <span className="text-gray-400">›</span>
          </button>
        </div>
      </motion.div>

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <LogOut size={18} className="mr-2" />
          Sair da Conta
        </Button>
      </motion.div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Perfil"
      >
        <div className="space-y-4">
          <Input
            label="Nome"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Digite seu nome"
          />

          <div className="flex space-x-3 pt-4">
            <Button
              onClick={handleUpdateProfile}
              variant="primary"
              className="flex-1 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
              loading={loading}
            >
              Salvar
            </Button>
            <Button
              onClick={() => setShowEditModal(false)}
              variant="ghost"
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};