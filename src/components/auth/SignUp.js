import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { EMAIL_CONFIG } from '../../config/appConfig';
import toast, { Toaster } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const SignUp = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    contactPerson: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const { signup, handleGoogleSignIn } = useAuth();
  const navigate = useNavigate();

  // Cleanup toasts when component unmounts
  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  const handleInputChange = (e) => {
    e.preventDefault(); // Prevent any default behavior
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (loading) return; // Prevent multiple submissions
    
    const { email, password, confirmPassword, companyName, contactPerson, phone } = formData;

    // Validate all fields are filled
    if (!email || !password || !confirmPassword || !companyName || !contactPerson || !phone) {
      toast.error('Please fill in all required fields', {
        duration: 3000,
        position: 'top-center',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match', {
        duration: 3000,
        position: 'top-center',
      });
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters', {
        duration: 3000,
        position: 'top-center',
      });
      return;
    }

    setLoading(true);
    let toastId;

    try {
      // Show loading toast immediately
      toastId = toast.loading('Creating your account...', {
        position: 'top-center',
      });

      const signupResult = await signup(email.toLowerCase(), password, {
        companyName: companyName.trim(),
        contactPerson: contactPerson.trim(),
        phone: phone.trim(),
        email: email.toLowerCase().trim()
      });

      // Dismiss loading toast immediately after signup
      if (toastId) {
        toast.dismiss(toastId);
      }

      // Clear form immediately
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        companyName: '',
        contactPerson: '',
        phone: ''
      });

      const message = signupResult?.clientData?.approved 
        ? 'Registration successful! You can now log in.'
        : 'Registration submitted! Your account requires admin approval. You will receive an email once approved.';
      
      // Show success message
      toast.success(message, {
        duration: 3000,
        position: 'top-center',
      });

      // Navigate after a short delay
      setTimeout(() => {
        navigate(signupResult?.clientData?.approved ? '/dashboard' : '/login');
      }, 3000);

    } catch (error) {
      console.error('Signup error:', error);
      
      // Always dismiss loading toast in case of error
      if (toastId) {
        toast.dismiss(toastId);
      }
      
      const errorMessage = {
        'auth/email-already-in-use': 'An account with this email already exists',
        'auth/invalid-email': 'Invalid email address',
        'auth/weak-password': 'Password should be at least 6 characters',
        'auth/network-request-failed': 'Network error. Please check your internet connection and try again.'
      }[error.code] || error.message || 'Failed to create account';
      
      toast.error(errorMessage, {
        duration: 3000,
        position: 'top-center',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignInClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (loading) return; // Prevent multiple submissions

    // Validate required fields
    const { companyName, contactPerson, phone } = formData;
    if (!companyName || !contactPerson || !phone) {
      toast.error('Please fill in company details before continuing with Google', {
        duration: 3000,
        position: 'top-center',
      });
      return;
    }
    
    setLoading(true);
    let toastId;

    try {
      toastId = toast.loading('Signing up with Google...', {
        position: 'top-center',
      });

      const result = await handleGoogleSignIn({
        companyName: companyName.trim(),
        contactPerson: contactPerson.trim(),
        phone: phone.trim()
      });

      if (!result?.user || !result?.clientData) {
        throw new Error('Failed to complete registration');
      }

      // Dismiss loading toast immediately
      if (toastId) {
        toast.dismiss(toastId);
      }

      const message = result.clientData.approved
        ? 'Registration successful! You will be redirected to the dashboard.'
        : 'Registration submitted! Your account requires admin approval. You will receive an email once approved.';

      toast.success(message, {
        duration: 3000,
        position: 'top-center',
      });

      setTimeout(() => {
        navigate(result.clientData.approved ? '/dashboard' : '/login');
      }, 3000);

    } catch (err) {
      console.error('Google SignUp Error:', err);
      
      if (toastId) {
        toast.dismiss(toastId);
      }
      
      const errorMessage = err.code === 'auth/popup-closed-by-user'
        ? 'Sign-in cancelled. Please try again.'
        : err.code === 'auth/email-already-in-use' || err.message.includes('already exists')
          ? 'An account with this email already exists. Please sign in instead.'
          : err.message || 'Failed to sign in with Google';
      
      toast.error(errorMessage, {
        duration: 3000,
        position: 'top-center',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Toaster 
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerStyle={{
          top: 40
        }}
        toastOptions={{
          duration: 3000,
          className: '',
          style: {
            background: 'var(--toast-bg, #fff)',
            color: 'var(--toast-color, #000)',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '14px',
            maxWidth: '500px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: 9999
          },
          success: {
            style: {
              background: 'var(--toast-success-bg, #10B981)',
              color: 'var(--toast-success-color, #fff)',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#10B981',
            }
          },
          error: {
            style: {
              background: 'var(--toast-error-bg, #EF4444)',
              color: 'var(--toast-error-color, #fff)',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#EF4444',
            }
          },
          loading: {
            style: {
              background: 'var(--toast-loading-bg, #6366F1)',
              color: 'var(--toast-loading-color, #fff)',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#6366F1',
            }
          },
        }}
      />
      
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create Client Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              Sign in
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Company Name
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                required
                value={formData.companyName}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-700"
                placeholder="Company Name"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Company Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-700"
                placeholder="Company Email Address"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Contact Person Name
              </label>
              <input
                id="contactPerson"
                name="contactPerson"
                type="text"
                required
                value={formData.contactPerson}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-700"
                placeholder="Contact Person Name"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-700"
                placeholder="Phone Number"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-700"
                placeholder="Password"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-700"
                placeholder="Confirm Password"
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading 
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              } transition-colors duration-200`}
            >
              {loading ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              ) : (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-indigo-300 group-hover:text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignInClick}
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 ${
                loading
                  ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
                  : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              } transition-colors duration-200`}
            >
              {loading ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="animate-spin h-5 w-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              ) : (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                    <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                  </svg>
                </span>
              )}
              <span className="ml-8">{loading ? 'Signing in...' : 'Sign up with Google'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
