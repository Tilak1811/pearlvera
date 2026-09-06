'use client';

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from 'react';

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    updateProfile,
    User,
} from 'firebase/auth';

import { auth } from '@/lib/firebase';

type AuthContextType = {
    user: User | null;
    loading: boolean;

    signUp: (
        email: string,
        password: string,
        name?: string
    ) => Promise<User>;

    login: (
        email: string,
        password: string
    ) => Promise<User>;

    loginWithGoogle: () => Promise<User>;

    updateUserProfile: (
        name: string
    ) => Promise<void>;

    logout: () => Promise<void>;
};

const AuthContext =
    createContext<AuthContextType | undefined>(undefined);

const googleProvider = new GoogleAuthProvider();

export function AuthProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(
            auth,
            (currentUser) => {
                setUser(currentUser);
                setLoading(false);
            }
        );

        return unsubscribe;
    }, []);

    async function signUp(
        email: string,
        password: string,
        name?: string
    ) {
        const result =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

        if (name?.trim()) {
            await updateProfile(result.user, {
                displayName: name.trim(),
            });
        }

        return result.user;
    }

    async function login(
        email: string,
        password: string
    ) {
        const result =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        return result.user;
    }

    async function loginWithGoogle() {
        const result =
            await signInWithPopup(
                auth,
                googleProvider
            );

        return result.user;
    }

    async function updateUserProfile(
        name: string
    ) {
        if (!auth.currentUser) {
            throw new Error(
                'No authenticated user.'
            );
        }

        await updateProfile(auth.currentUser, {
            displayName: name.trim(),
        });

        setUser({
            ...auth.currentUser,
        });
    }

    async function logout() {
        await signOut(auth);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                signUp,
                login,
                loginWithGoogle,
                updateUserProfile,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            'useAuth must be used inside AuthProvider'
        );
    }

    return context;
}