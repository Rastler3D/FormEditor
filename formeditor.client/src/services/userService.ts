import { User } from "~/contexts/AuthContext";


export const login = async (username: string, password: string): Promise<User> => {
    await delay(500);
    if (username === 'admin' && password === 'password') {
        return {id: 1, name: 'Admin User', role: 'admin'};
    } else if (username === 'user' && password === 'password') {
        return {id: 2, name: 'Regular User', role: 'user'};
    }
    throw new Error('Invalid credentials');
};

export const register = async (name: string, email: string, password: string): Promise<User> => {
    
    return {id: 1, name: 'Admin User', role: 'admin'};
}

export const fetchUser = async (id: number): Promise<User> => {
    return {id: 1, name: 'Admin User', role: 'admin'};
}

export const refreshToken = async (refreshToken: string): Promise<string> => {
    return "newToken"
}