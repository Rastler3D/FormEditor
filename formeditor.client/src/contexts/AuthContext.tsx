import { createContext, useContext, createSignal, createEffect } from 'solid-js';
import {api} from "~/lib/api.ts";
import * as userServices from "~/services/userService"

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    role: 'user' | 'admin';
}

interface AuthContextType {
    user: () => User | null;
    signIn: (email: string, password: string) => Promise<void>;
    signInWithProvider: (provider: 'google' | 'facebook') => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    refreshToken: () => Promise<string>;
    signOut: () => void;
    updateUser: (data: Partial<User>) => Promise<User>;
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

    const register = async (name: string, email: string, password: string) => {
        const response = await api.post('/auth/register', { name, email, password });
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    };

    const signInWithProvider = async (provider: 'google' | 'facebook') => {
        const response = await api.get(`/auth/${provider}`);
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    };

    const refreshToken = async () => {
        let token = localStorage.getItem('refresh_token');
        const accessToken= await userServices.refreshToken(token)
        localStorage.setItem('access_token', accessToken);
        return accessToken;
    };

    const updateUser = async (data: Partial<User>) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined) {
                formData.append(key, value);
            }
        });

        const response = await api.put('/users/profile', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
    };

    return (
        <AuthContext.Provider value={{ user, signIn, signOut, signInWithProvider, register, updateUser }}>
            {props.children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext)!;
