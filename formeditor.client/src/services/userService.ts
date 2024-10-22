import {User} from "~/contexts/AuthContext";
import {Action, Bulk, TableData, TableOption, TokenResponse, UpdateUser} from "~/types/template.ts";
import {api} from "~/lib/api.ts";
import {uploadImage} from "~/services/imageUploadService.ts";
import {optionToQueryParams} from "~/lib/utils.ts";


export const login = async (credentials: { email: string, password: string }): Promise<TokenResponse> => {
    return api.post('/Authentication/login', credentials)
        .then(response => response.data);
};

export const register = async (data: { name: string, email: string, password: string }): Promise<void> => {
    return api.post<User>('/Authentication/registration', data)
        .then(() => {
        });
}

export const refreshToken = async (refreshToken: string): Promise<{ refreshToken: string, accessToken: string }> => {
    return api.post<{ refreshToken: string, accessToken: string }>('/Authentication/refresh', {refreshToken})
        .then(response => response.data);
}

export const getCurrentUser = (): Promise<User> => {
    return api.get<User>('/User/me')
        .then(response => response.data);
};

export const getUsers = (option: TableOption): Promise<TableData<User[]>> => {
    return api.get<TableData<User[]>>('/User', optionToQueryParams(options))
        .then(response => response.data);
};

export const getUser = (userId: number): Promise<User> => {
    return api.get<User>(`/User/${userId}`)
        .then(response => response.data);
};

export const performAction = (typeAction: Action, userId: number): Promise<void> => {
    return api.patch(`/User/${userId}/${typeAction}`)
        .then(() => {
        });
};

export const performBulkAction = (typeAction: Action, bulk: Bulk): Promise<void> => {
    return api.patch(`/User/${typeAction}`, bulk)
        .then(() => {
        });
};

export const changeRole = (userId: number, role: 'User' | 'Admin'): Promise<void> => {
    return api.patch(`/User/${userId}/role/${role}`)
        .then(() => {
        });
};

export const updateUser = async (userId: number, user: UpdateUser): Promise<User> => {
    if (user.avatar instanceof File) {
        user.avatar = await uploadImage(user.avatar);
    }
    return api.patch<User>(`/User/${userId}`, user)
        .then(response => response.data);
};

export const resendConfirmationEmail = (email: string): Promise<void> => {
    return api.post('/Authentication/resendConfirmationEmail', {email})
        .then(() => {
        });
};

export const forgotPassword = (email: string): Promise<void> => {
    return api.post('/Authentication/forgotPassword', { email })
        .then(() => {
        });
};

export const resetPassword = (email: string): Promise<void> => {
    return api.post('/Authentication/resetPassword', {email})
        .then(() => {
        });
};