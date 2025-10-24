import { useAuth } from '../hooks/useAuth';
import { LogOut, LogIn, Wifi, WifiOff } from 'lucide-react';
import { isAuthEnabled } from '../lib/firebase';
import { useOffline } from '../hooks/useOffline';

export const Auth = () => {
  const { user, signInWithGoogle, logout } = useAuth();
  const { isOnline } = useOffline();

  if (!isAuthEnabled) return null;

  return (
    <div className="flex items-center gap-3">
      {!isOnline && (
        <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-lg">
          <WifiOff size={16} />
          <span className="text-sm">Offline</span>
        </div>
      )}
      {isOnline && (
        <div className="flex items-center gap-2 text-green-600">
          <Wifi size={16} />
        </div>
      )}
      {user ? (
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      ) : (
        <button
          onClick={signInWithGoogle}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <LogIn size={18} />
          Sign In
        </button>
      )}
    </div>
  );
};