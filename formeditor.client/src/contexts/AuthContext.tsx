import { createContext, useContext, createSignal, createEffect } from 'solid-js';
import { login } from '~/services/api';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'user' | 'admin';
}

interface AuthContextType {
    user: () => User | null;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextType>();

export function AuthProvider(props) {
    const [user, setUser] = createSignal<User | null>(null);

    createEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    });

    const signIn = async (email: string, password: string) => {
        try {
            const user = await login(email, password);
            setUser(user);
            localStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const signOut = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, signIn, signOut }}>
            {props.children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext)!;
