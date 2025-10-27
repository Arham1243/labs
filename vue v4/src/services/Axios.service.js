import axios from 'axios';
import { AuthService } from '@/services';
import { useSessionStore } from '@/stores';

const axiosApi = axios.create({
    headers: {
        Accept: 'application/json'
    }
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (token) {
            prom.resolve(token);
        } else {
            prom.reject(error);
        }
    });
    failedQueue = [];
};
axiosApi.interceptors.request.use(
    async (config) => {
        const sessionStore = useSessionStore();
        const authCookie = sessionStore.getCookie() || {};
        const { access_token } = authCookie;
        config.headers['authorization'] = `Bearer ${access_token}`;
        config.headers['accept-language'] = 'en';
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosApi.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const sessionStore = useSessionStore();
        const authCookie = sessionStore.getCookie() || {};
        const rememberMe = sessionStore.getRememberMe() || false;
        const { refresh_token } = authCookie;

        if (error.response && error.response.status === 401) {
            if (refresh_token && rememberMe) {
                if (!isRefreshing) {
                    isRefreshing = true;
                    try {
                        const res = await AuthService.getAccessFromRefreshToken(
                            refresh_token
                        );
                        if (res.status === 200) {
                            sessionStore.startUserSession(res.data);
                            processQueue(null, res.data.access_token);
                            return axiosApi.request(error.config);
                        }
                    } catch (error) {
                        sessionStore.clearSessionState();
                        window.location.reload();
                        return Promise.reject(error);
                    } finally {
                        isRefreshing = false;
                    }
                } else {
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    }).then((token) => {
                        error.config.headers[
                            'authorization'
                        ] = `Bearer ${token}`;
                        return axiosApi.request(error.config);
                    });
                }
            } else {
                sessionStore.clearSessionState();
                window.location.reload();
            }
        }
        return Promise.reject(error);
    }
);

export default axiosApi;
