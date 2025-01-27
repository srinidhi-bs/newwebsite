import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  getRedirectResult,
  signOut,
  browserPopupRedirectResolver,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, db, googleProvider } from '../firebase/config';
import { collection, setDoc, getDoc, doc, query, where, getDocs } from 'firebase/firestore';
import { EMAIL_CONFIG } from '../config/appConfig';
import { logAuthError, logFirestoreError } from '../utils/firebaseLogger';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Function to fetch client data
  const fetchClientData = async (uid) => {
    try {
      const clientRef = doc(db, 'clients', uid);
      const docSnap = await getDoc(clientRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      logFirestoreError(error, 'fetchClientData');
      return null;
    }
  };

  // Function to handle signup
  const signup = async (email, password, formData) => {
    try {
      setError("");
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create client document
      const clientData = {
        uid: user.uid,
        email: user.email.toLowerCase(),
        ...formData,
        approved: false,
        status: 'pending',
        role: 'client',
        registrationDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'clients', user.uid), clientData);
      return { user, clientData };
    } catch (error) {
      logAuthError(error, 'signup');
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Function to handle login
  const login = async (email, password) => {
    try {
      setError("");
      
      // Attempt to sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if user exists in Firestore
      const clientData = await fetchClientData(userCredential.user.uid);
      if (!clientData) {
        await signOut(auth);
        throw new Error('Account not found. Please sign up first.');
      }
      
      return { user: userCredential.user, clientData };
    } catch (error) {
      logAuthError(error, 'login');
      
      // Handle Firebase Auth specific errors
      let errorMessage;
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Account not found. Please sign up first.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        default:
          errorMessage = error.message || 'Failed to log in. Please try again.';
      }
      
      const enhancedError = new Error(errorMessage);
      enhancedError.code = error.code;
      throw enhancedError;
    }
  };

  // Function to handle logout
  const logout = async () => {
    try {
      setError("");
      await signOut(auth);
      setUser(null);
      setClientData(null);
    } catch (error) {
      logAuthError(error, 'logout');
      setError(error.message);
      throw error;
    }
  };

  // Function to handle Google login
  const handleGoogleLogin = async () => {
    try {
      setError("");
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      return result;
    } catch (error) {
      logAuthError(error, 'googleLogin');
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Function to handle Google sign up
  const handleGoogleSignIn = async (formData = {}) => {
    console.group('🔑 Google Sign Up Process');
    let userCredential = null;
    
    try {
      setLoading(true);
      setError("");
      
      // Validate form data
      if (!formData.companyName || !formData.contactPerson || !formData.phone) {
        console.error('Missing form data:', formData);
        throw new Error('Please fill in all required fields before signing in with Google');
      }

      console.log('Form data:', formData);

      // Sign in with Google using pre-configured provider
      console.log('Initiating Google Sign In...');
      try {
        userCredential = await signInWithPopup(auth, googleProvider);
      } catch (signInError) {
        console.error('Sign in error:', signInError);
        if (signInError.code === 'auth/popup-closed-by-user') {
          throw new Error('Sign-in cancelled. Please try again.');
        }
        if (signInError.code === 'auth/popup-blocked') {
          throw new Error('Popup was blocked. Please allow popups for this site and try again.');
        }
        throw signInError;
      }

      const user = userCredential.user;
      console.log('Google Sign In successful:', user.email);
      
      // Check if user exists in Firestore
      console.log('Checking for existing Firestore document...');
      const userDocRef = doc(db, "clients", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        console.warn('User already exists in Firestore');
        await signOut(auth);
        throw new Error('An account with this Google account already exists. Please sign in instead.');
      }

      // Check auto-approval status
      const isAdmin = EMAIL_CONFIG.ADMIN_EMAILS.includes(user.email.toLowerCase());
      const domain = user.email.split('@')[1]?.toLowerCase();
      const isAutoApproved = isAdmin || EMAIL_CONFIG.ALLOWED_DOMAINS.includes(domain);
      console.log('Auto-approval status:', { isAdmin, domain, isAutoApproved });

      // Prepare client data
      const clientData = {
        uid: user.uid,
        email: user.email.toLowerCase(),
        companyName: formData.companyName,
        contactPerson: formData.contactPerson,
        phone: formData.phone,
        approved: isAutoApproved,
        status: isAutoApproved ? 'approved' : 'pending',
        approvedBy: isAutoApproved ? 'system' : null,
        approvalDate: isAutoApproved ? new Date().toISOString() : null,
        registrationDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        role: isAdmin ? 'admin' : 'client',
        provider: 'google',
        displayName: user.displayName || '',
        photoURL: user.photoURL || ''
      };

      // Create Firestore document
      console.log('Creating Firestore document...');
      try {
        await setDoc(userDocRef, clientData);
        console.log('Firestore document created successfully:', clientData);
        
        // Update context
        setUser(user);
        setClientData(clientData);
        
        console.log('Google Sign Up completed successfully');
        console.groupEnd();
        return { user, clientData };
      } catch (firestoreError) {
        console.error('Firestore Error:', firestoreError);
        // Clean up: delete auth user and sign out
        try {
          await user.delete();
        } catch (deleteError) {
          console.error('Error deleting auth user:', deleteError);
        }
        await signOut(auth);
        throw new Error('Failed to create account. Please try again.');
      }
    } catch (error) {
      console.error('Google Sign Up error:', error);
      // Clean up: ensure user is signed out
      if (userCredential?.user) {
        try {
          await userCredential.user.delete();
        } catch (deleteError) {
          console.error('Error deleting auth user:', deleteError);
        }
        await signOut(auth);
      }
      setError(error.message || 'Failed to sign in with Google');
      console.groupEnd();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Effect to handle auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.group('👤 Auth State Change');
      console.log('Current user:', user?.email);
      
      try {
        if (user) {
          const data = await fetchClientData(user.uid);
          console.log('Client data:', data);
          
          // Check if user is admin by email
          const isAdmin = EMAIL_CONFIG.ADMIN_EMAILS.includes(user.email.toLowerCase());
          console.log('Is admin by email:', isAdmin);
          
          if (isAdmin && (!data || data.role !== 'admin')) {
            // Update admin role if not set
            console.log('Updating admin role...');
            const adminData = {
              ...(data || {}),
              uid: user.uid,
              email: user.email.toLowerCase(),
              role: 'admin',
              approved: true,
              status: 'approved',
              lastUpdated: new Date().toISOString()
            };
            await setDoc(doc(db, 'clients', user.uid), adminData, { merge: true });
            setUser(user);
            setClientData(adminData);
          } else if (!isAdmin && !data?.approved) {
            console.log('Non-admin user not approved');
            await signOut(auth);
            setUser(null);
            setClientData(null);
          } else {
            console.log('Setting user state:', { user: user.email, data });
            setUser(user);
            setClientData(data);
          }
        } else {
          console.log('No user authenticated');
          setUser(null);
          setClientData(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setUser(null);
        setClientData(null);
      } finally {
        setLoading(false);
        console.groupEnd();
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    clientData,
    setClientData,
    loading,
    error,
    signup,
    login,
    handleGoogleSignIn,
    handleGoogleLogin,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
