import {createContext, useContext, createSignal, createEffect, JSX} from 'solid-js';
import * as userServices from "~/services/userService"
import {login} from "~/services/userService";
import {ExternalLoginResponse, UpdateUser} from "~/types/types.ts";
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
    signInWithProvider: (provider: 'google' | 'github') => Promise<void>;
    signUp: (args: { name: string, email: string, password: string }) => Promise<void>;
    refreshToken: () => Promise<string | undefined>;
    eagerRefreshToken: () => Promise<string | undefined>;
    accessToken: () => string;
    signOut: () => void;
    updateUser: (data: UpdateUser) => Promise<User>;
    isAuthenticated: () => boolean;
    hasRole: (roles?: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType>();

export function AuthProvider(props: { children: JSX.Element }) {
    const [user, setUser] = makePersisted(createSignal<User>(), {
        name: "user-profile",
        sync: storageSync,
        storage: localStorage
    });
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
    const [expiresIn, setExpiresIn] = makePersisted(createSignal<string>(), {
        name: "expires-in",
        sync: storageSync,
        storage: localStorage
    });

    createEffect(() => {
        if (accessToken()) {
            userServices.getCurrentUser().then((user) => {
                setUser(user)
            });
        } else {
            setUser()
        }
    });

    const isAuthenticated = () => !!accessToken();

    const hasRole = (roles?: string[]) => user() ? (roles ? roles.includes(user()!.role) : true) : false;

    const signIn = async (credentials: { email: string, password: string }) => {
        const tokens = await login(credentials);
        setAccessToken(tokens.accessToken);
        setRefreshToken(tokens.refreshToken);
        setExpireDate(tokens.expiresIn);
    };

    const signOut = () => {
        setRefreshToken();
        setAccessToken();
        setExpireDate();
    };

    const signUp = (data: { name: string, email: string, password: string }) => {
        return userServices.register(data);
    };

    const signInWithProvider = (provider: 'google' | 'github') : Promise<void> => {
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2.5;
        const url = `/api/authentication/external-login?provider=${encodeURIComponent(provider)}&returnUrl=${encodeURIComponent("/login/external")}`;

        const win = window.open(
            url,
            'External Login',
            `width=${width},height=${height},left=${left},top=${top}`
        );
        
        return new Promise((res, rej) => {
            const abortController = new AbortController();
            var winClosed = setInterval(function () {
                if (win.closed) {
                    clearInterval(winClosed);
                    abortController.abort();
                    rej("Login page was closed"); 
                }
            }, 250);
            window.addEventListener('message', async (event: MessageEvent<ExternalLoginResponse>) => {
                if ((event.source as Window)?.location?.pathname === "/login/external"){
                    clearInterval(winClosed);
                    abortController.abort();
                    const response = event.data;
                    if (response.type === 'success') {
                        setAccessToken(response.message.accessToken);
                        setRefreshToken(response.message.refreshToken);
                        setExpireDate(response.message.expiresIn);
                        res();
                    } else if (response.type === 'error') {
                        setAccessToken();
                        setRefreshToken();
                        setExpireDate();
                        rej(response.message);
                    }
                }
                
            }, {signal: abortController.signal});
        })
        
    };


    const setExpireDate = (expiresIn?: number) => {
        if (expiresIn){
            const date = new Date();
            date.setSeconds(date.getSeconds() + expiresIn);
            setExpiresIn(date.toISOString());
        } else {
            setExpiresIn();
        }
    }
    const isTokenExpired = () => {
        const expirationDate = new Date(expiresIn());
        const date = new Date();
        return expirationDate < date;

    }
    const eagerRefreshToken = async () => {
        try {
            const tokens = await userServices.refreshToken(refreshToken());
            setAccessToken(tokens.accessToken);
            setRefreshToken(tokens.refreshToken);
            setExpireDate(tokens.expiresIn);
            return tokens.accessToken;
        } catch (err) {
            console.error('Failed to refresh token:', err.message);
            setRefreshToken();
            setAccessToken();
            setExpireDate();
            return;
        }
    }
    const manuallyRefreshToken = async () => {
        if (isTokenExpired()) {
            return await eagerRefreshToken()
        }
        return accessToken();
    };

    const updateUser = async (data: UpdateUser): Promise<User> => {
        return userServices.updateUser(user()!.id, data)
            .then(x => (setUser(x), x));
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
            refreshToken: manuallyRefreshToken,
            eagerRefreshToken,
            accessToken
        }}>
            {props.children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext)!;
