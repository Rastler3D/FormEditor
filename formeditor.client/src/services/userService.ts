import {User} from "~/contexts/AuthContext";
import {Action, Bulk, TableData, TableOption, TokenResponse, UpdateUser} from "~/types/types.ts";
import {api} from "~/lib/api.ts";
import {uploadImage} from "~/services/imageUploadService.ts";
import {optionToQueryParams} from "~/lib/utils.ts";


export const login = (credentials: { email: string, password: string }): Promise<TokenResponse> => {
    return api.post('/Authentication/login', credentials)
        .then(response => response.data);
};

export const register = (data: { name: string, email: string, password: string }): Promise<void> => {
        return api.post<void>('/Authentication/registration', data)
            .then(response => response.data)
}

export const refreshToken = (refreshToken: string): Promise<TokenResponse> => {
    return api.post<TokenResponse>('/Authentication/refresh', {refreshToken})
        .then(response => response.data);
}

export const getCurrentUser = (): Promise<User> => {
    return api.get<User>('/User/me')
        .then(response => response.data);
};

export const getUsers = (options: TableOption): Promise<TableData<User[]>> => {
    return api.get<TableData<User[]>>('/User', {params: optionToQueryParams(options)})
        .then(response => response.data);
};

export const getUser = (userId: number): Promise<User> => {
    return api.get<User>(`/User/${userId}`)
        .then(response => response.data);
};

export const performAction = (action: Action, userId: number): Promise<void> => {
    return api.patch(`/User/${userId}/action/?action=${encodeURI(action)}`)
        .then(() => {
        });
};

export const performBulkAction = (bulk: Bulk): Promise<void> => {
    return api.patch(`/User/action`, bulk)
        .then(() => {
        });
};

export const changeRole = (userId: number, role: 'User' | 'Admin'): Promise<void> => {
    return api.patch(`/User/${userId}/role/${role}`)
        .then(() => {
        });
};

export const updateUser = async ({userId, user} : { userId: number, user: UpdateUser }): Promise<User> => {
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