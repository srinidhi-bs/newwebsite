import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { enableIndexedDbPersistence } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAX4xF6wSxvOWAwiSAQuIC8uUyne6obzgc",
  authDomain: "srinidhi-website.firebaseapp.com",
  projectId: "srinidhi-website",
  storageBucket: "srinidhi-website.appspot.com",
  messagingSenderId: "679353636670",
  appId: "1:679353636670:web:31a8eec9876eb2f4e67e6f",
  measurementId: "G-9V85V0YXYT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Auth instance and export it
const auth = getAuth(app);

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Firestore
const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.log('The current browser does not support offline persistence.');
    }
  });

export { auth, db, googleProvider, app as default };
