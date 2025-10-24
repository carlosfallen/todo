import { useState, useEffect } from 'react';
import { syncLocalToFirestore } from '../lib/sync';
import { useAuth } from './useAuth';

export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { user } = useAuth();

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      if (user) {
        await syncLocalToFirestore(user.uid);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  return { isOnline };
};