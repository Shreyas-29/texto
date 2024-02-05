import { View, Text } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { User, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { auth, db } from '@/src/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes, uploadString } from 'firebase/storage';

interface Props {
    children: React.ReactNode
}

interface ContextProps {
    user: User | null;
    isAuthenticated: boolean | undefined;
    register: (username: string, profileUrl: string, email: string, password: string) => Promise<any>;
    login: (email: string, password: string) => Promise<any>;
    logout: () => Promise<any>;
}

export const AuthContext: React.Context<ContextProps | undefined> = React.createContext<ContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: Props) => {

    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(undefined);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsAuthenticated(true);
                setUser(user);
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }
        });

        return unsub;
    }, []);

    const register = async (username: string, profileUrl: string, email: string, password: string) => {
        try {
            const response = await createUserWithEmailAndPassword(auth, email, password);

            // setUser(response?.user);
            // setIsAuthenticated(true);

            await updateProfile(response?.user, { displayName: username, photoURL: profileUrl });

            await setDoc(doc(db, 'users', response?.user?.uid), {
                email: email,
                emailVerified: false,
                displayName: username,
                photoURL: profileUrl,
                userId: response?.user?.uid,
            });

            return { success: true, data: response?.user };
        } catch (error: any) {
            console.log('Error @register: ', error.code);
            if (error.code === 'auth/invalid-email') {
                return { success: false, message: 'Invalid email address.' };
            } else if (error.code === 'auth/email-already-in-use') {
                return { success: false, message: 'Email already in use.' };
            } else if (error.code === 'auth/weak-password') {
                return { success: false, message: 'Password should be at least 6 characters.' };
            } else if (error.code === 'auth/operation-not-allowed') {
                return { success: false, message: 'Error during sign up.' };
            } else {
                return { success: false, message: 'Registration failed. Please try again.' };
            }
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await signInWithEmailAndPassword(auth, email, password);

            return { success: true };
        } catch (error: any) {
            console.log('Error @login: ', error.code);
            if (error.code === 'auth/invalid-email') {
                return { success: false, message: 'Invalid email address.' };
            } else if (error.code === 'auth/invalid-credential') {
                return { success: false, message: 'Invalid credentials.' };
            } else if (error.code === 'auth/user-disabled') {
                return { success: false, message: 'This account has been disabled.' };
            } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                return { success: false, message: 'Invalid email or password.' };
            } else {
                return { success: false, message: 'Login failed. Please try again.' };
            }
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            // setUser(null);
            // setIsAuthenticated(false);

            return { success: true }
        } catch (error: any) {
            console.log('Error @logout: ', error);
            return { success: false, message: error.message };
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                register,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
};

export const useAuth = () => {
    const value = useContext(AuthContext);

    if (!value) {
        throw new Error('useAuth must be used within AuthProvider');
    }

    return value;
};

