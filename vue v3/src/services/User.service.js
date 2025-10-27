import AxiosService from './Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const searchUsers = (payload, params) => {
    return AxiosService.post(
        `${BASE_URL}/company-users/search`,
        payload,
        params
    );
};
