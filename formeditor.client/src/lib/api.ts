import axios from 'axios';
import {showToast} from '~/components/ui/toast';
import {refreshToken} from "~/services/userService.ts";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});
api.interceptors.request.use(request => {
    const token = localStorage.getItem('access-token');
    const accessToken = token && JSON.parse(token);
    if (accessToken) {
        request.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return request;
}, error => {
    return Promise.reject(error);
});

api.interceptors.response.use(
    response => response, // Directly return successful responses.
    async error => {
        const originalRequest = error.config;
        if (error.response.headers["token-expired"] === 'true') {
            try {
                const token = localStorage.getItem('refresh-token');
                const refreshTokenValue = token && JSON.parse(token); // Retrieve the stored refresh token.
                // Make a request to your auth server to refresh the token.
                const tokens = await refreshToken(refreshTokenValue);
                const {accessToken, refreshToken: newRefreshToken} = tokens;
                // Store the new access and refresh tokens.
                localStorage.setItem('access-token', JSON.stringify(accessToken));
                localStorage.setItem('refresh-token', JSON.stringify(newRefreshToken));
                // Update the authorization header with the new access token.
                api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

                if (error.response.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true; // Mark the request as retried to avoid infinite loops.

                    return api(originalRequest); // Retry the original request with the new access token.
                }
            } catch (refreshError) {
                // Handle refresh token errors by clearing stored tokens and redirecting to the login page.
                console.error('Token refresh failed:');
                localStorage.removeItem('access-token');
                localStorage.removeItem('refresh-token');
                return Promise.reject(refreshError);
            }

        }
        return Promise.reject(error); // For all other errors, return the error as is.
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            return Promise.reject(error.response.data);
        }
        showToast({title: 'An unexpected error occurred', variant: 'destructive'});
        return Promise.reject('An unexpected error occurred');
    }
);
