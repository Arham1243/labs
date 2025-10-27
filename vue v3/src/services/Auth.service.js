import AxiosService from './Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/auth`;

export const login = (payload) => {
    return AxiosService.post(`${BASE_URL}/login`, payload);
};

export const resendLoginOtp = (payload) => {
    return AxiosService.post(`${BASE_URL}/resend-login-otp`, payload);
};

export const logout = () => {
    return AxiosService.post(`${BASE_URL}/logout`);
};

export const setupPassword = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/password/set`, payload, { params });
};

export const forgotPassword = (payload) => {
    return AxiosService.post(`${BASE_URL}/password/forgot`, payload);
};

export const resetPassword = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/password/reset`, payload, { params });
};

export const requestPasswordChange = (payload) => {
    return AxiosService.post(`${BASE_URL}/password/request-change`, payload);
};

export const verifyPasswordCode = (payload) => {
    return AxiosService.post(`${BASE_URL}/password/verify`, payload);
};

export const verifyCode = (payload) => {
    return AxiosService.post(`${BASE_URL}/verify`, payload);
};

export const getAccessFromRefreshToken = (refresh_token) => {
    return AxiosService.post(`${BASE_URL}/token/refresh`, { refresh_token });
};

export const me = () => {
    return AxiosService.get(`${BASE_URL}/me`);
};
