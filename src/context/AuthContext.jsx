// Authentication Context
// Provides global authentication state and methods throughout the app

import { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    updateProfile,
    sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../firebase.config';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Register new user
    const register = async (email, password, displayName) => {
        try {
            setError(null);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            if (displayName) {
                await updateProfile(userCredential.user, { displayName });
            }

            return userCredential.user;
        } catch (err) {
            console.error('Registration error:', err);
            let msg = 'Failed to create account';

            switch (err.code) {
                case 'auth/email-already-in-use':
                    msg = 'This email is already registered';
                    break;
                case 'auth/invalid-email':
                    msg = 'Invalid email address';
                    break;
                case 'auth/weak-password':
                    msg = 'Password should be at least 6 characters';
                    break;
                default:
                    msg = err.message;
            }

            setError(msg);
            throw new Error(msg);
        }
    };

    // Login user
    const login = async (email, password) => {
        try {
            setError(null);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        } catch (err) {
            console.error('Login error:', err);
            let msg = 'Failed to login';

            switch (err.code) {
                case 'auth/user-not-found':
                    msg = 'No account found with this email';
                    break;
                case 'auth/wrong-password':
                    msg = 'Incorrect password';
                    break;
                case 'auth/invalid-email':
                    msg = 'Invalid email address';
                    break;
                case 'auth/user-disabled':
                    msg = 'This account has been disabled';
                    break;
                default:
                    msg = err.message;
            }

            setError(msg);
            throw new Error(msg);
        }
    };

    // Sign in with Google
    const signInWithGoogle = async () => {
        try {
            setError(null);
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            return result.user;
        } catch (err) {
            console.error('Google sign-in error:', err);
            let msg = 'Failed to sign in with Google';

            switch (err.code) {
                case 'auth/popup-closed-by-user':
                    msg = 'Sign-in cancelled';
                    break;
                case 'auth/popup-blocked':
                    msg = 'Popup was blocked. Please allow popups';
                    break;
                default:
                    msg = err.message;
            }

            setError(msg);
            throw new Error(msg);
        }
    };

    // Logout user
    const logout = async () => {
        try {
            setError(null);
            await signOut(auth);
        } catch (err) {
            console.error('Logout error:', err);
            setError('Failed to logout');
            throw err;
        }
    };

    // Reset password
    const resetPassword = async (email) => {
        try {
            setError(null);
            await sendPasswordResetEmail(auth, email);
        } catch (err) {
            console.error('Password reset error:', err);
            let msg = 'Failed to send reset email';

            switch (err.code) {
                case 'auth/user-not-found':
                    msg = 'No account found with this email';
                    break;
                case 'auth/invalid-email':
                    msg = 'Invalid email address';
                    break;
                default:
                    msg = err.message;
            }

            setError(msg);
            throw new Error(msg);
        }
    };

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        register,
        login,
        signInWithGoogle,
        logout,
        resetPassword,
        error,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
