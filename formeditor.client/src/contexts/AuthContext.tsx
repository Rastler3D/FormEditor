import {createContext, useContext, createSignal, createEffect, JSX} from 'solid-js';
import * as userServices from "~/services/userService"
import {login} from "~/services/userService";
import {UpdateUser} from "~/types/template.ts";
import {makePersisted, storageSync} from "@solid-primitives/storage";

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    role: 'User' | 'Admin';
    status: "Active" | "Blocked";
}

interface AuthContextType {
    user: () => User | undefined;
    signIn: (args: { email: string, password: string }) => Promise<void>;
    signInWithProvider: (provider: 'google' | 'facebook') => Promise<void>;
    signUp: (args: { name: string, email: string, password: string }) => Promise<void>;
    refreshToken: () => Promise<string | undefined>;
    signOut: () => void;
    updateUser: (data: UpdateUser) => Promise<User>;
    isAuthenticated: () => boolean;
    hasRole: (roles?: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType>();

export function AuthProvider(props: { children: JSX.Element }) {
    const [user, setUser] = createSignal<User>();
    const [refreshToken, setRefreshToken] = makePersisted(createSignal<string>(), {
        name: "refresh-token",
        sync: storageSync,
        storage: localStorage
    });
    const [accessToken, setAccessToken] = makePersisted(createSignal<string>(), {
        name: "access-token",
        sync: storageSync,
        storage: localStorage
    });

    createEffect(() => {
        if (accessToken()) {
            if (!user()) {
                userServices.getCurrentUser().then((user) => {
                    setUser(user)
                });
            }
        } else {
            setUser()
        }
    });

    const isAuthenticated = () => !!user();

    const hasRole = (roles?: string[]) => user() ? (roles ? roles.includes(user()!.role) : true) : false;

    const signIn = async (credentials: { email: string, password: string }) => {
        const tokens = await login(credentials);
        setAccessToken(tokens.accessToken);
        setRefreshToken(tokens.refreshToken);
    };

    const signOut = () => {
        setRefreshToken();
        setAccessToken();
    };

    const signUp = async (data: { name: string, email: string, password: string }) => {
        return await userServices.register(data);
    };

    const signInWithProvider = async () => {
      
    };
    
    const manuallyRefreshToken = async () => {
        let token = refreshToken();
        try {
            const tokens = await userServices.refreshToken(token!);
            return tokens.accessToken;
        } catch (err) {
            setRefreshToken();
            setAccessToken();
        }
    };

    const updateUser = async (data: UpdateUser): Promise<User> => {
        const updatedUser = await userServices.updateUser(user()!.id, data);
        setUser(updatedUser);
        return updatedUser;
    };

    return (
        <AuthContext.Provider value={{
            user,
            signIn,
            signOut,
            signInWithProvider,
            signUp,
            updateUser,
            isAuthenticated,
            hasRole,
            refreshToken: manuallyRefreshToken
        }}>
            {props.children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext)!;
