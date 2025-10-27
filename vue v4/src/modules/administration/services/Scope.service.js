import AxiosService from '@/services/Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const search = (entity, entity_id, action) => {
    return AxiosService.get(
        `${BASE_URL}/${entity}/${entity_id}/scopes/${action}`
    );
};

export const sync = (entity, entity_id, mode, payload) => {
    return AxiosService[mode === 'attach' ? 'post' : 'delete'](
        `${BASE_URL}/${entity}/${entity_id}/scopes`,
        mode === 'attach' ? payload : { data: payload }
    );
};
