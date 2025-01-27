import { getApp } from 'firebase/app';

export const enableFirebaseDebug = () => {
    if (process.env.NODE_ENV === 'development') {
        // Enable Firebase Authentication debug mode
        window.localStorage.setItem('debug', 'firebase:*');
        
        // Log Firebase app initialization
        const app = getApp();
        console.log('Firebase App Config:', {
            projectId: app.options.projectId,
            authDomain: app.options.authDomain
        });
    }
};

export const logAuthError = (error, context = '') => {
    console.group(`🔥 Firebase Auth Error ${context ? `(${context})` : ''}`);
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    console.error('Full Error:', error);
    console.groupEnd();
};

export const logFirestoreError = (error, context = '') => {
    console.group(`📄 Firestore Error ${context ? `(${context})` : ''}`);
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    console.error('Full Error:', error);
    console.groupEnd();
};
