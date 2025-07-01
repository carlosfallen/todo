import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  connectFirestoreEmulator,
  enableNetwork,
  disableNetwork,
  enableMultiTabIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED
} from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDULf3XSwiiFQZ7q_M9YNieDbWZNLnO7Nw",
  authDomain: "myapp-415315.firebaseapp.com",
  databaseURL: "https://myapp-415315-default-rtdb.firebaseio.com",
  projectId: "myapp-415315",
  storageBucket: "myapp-415315.appspot.com",
  messagingSenderId: "103002319588",
  appId: "1:103002319588:web:1db35f05751e1f284e1af1",
  measurementId: "G-QQL76DDRLS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore with optimizations
export const db = getFirestore(app);

// Enable offline persistence for better performance
try {
  enableMultiTabIndexedDbPersistence(db, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED
  });
} catch (err) {
  console.warn('Firestore persistence failed:', err);
}

// Network status management
let isOnline = navigator.onLine;

window.addEventListener('online', () => {
  isOnline = true;
  enableNetwork(db);
});

window.addEventListener('offline', () => {
  isOnline = false;
  disableNetwork(db);
});

export { isOnline };

// Initialize Analytics (optional)
const analytics = getAnalytics(app);

export { analytics };