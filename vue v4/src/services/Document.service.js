import AxiosService from './Axios.service';

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const listDocuments = (type, id, locale = 'en') => {
    return AxiosService.get(`${BASE_URL}/${type}/${id}/documents`, {
        params: {
            locale
        }
    });
};

export const storeDocument = (type, id, data) => {
    return AxiosService.post(`${BASE_URL}/${type}/${id}/documents`, data);
};

export const renameDocument = (type, id, data) => {
    return AxiosService.put(`${BASE_URL}/${type}/${id}/documents/rename`, data);
};

export const moveDocument = (type, id, data) => {
    return AxiosService.put(`${BASE_URL}/${type}/${id}/documents/move`, data);
};

export const moveBulkDocument = (type, id, data) => {
    return AxiosService.put(
        `${BASE_URL}/${type}/${id}/documents/move-multiple`,
        data
    );
};

export const deleteDocument = (type, id, data) => {
    return AxiosService.delete(`${BASE_URL}/${type}/${id}/documents/delete`, {
        params: data
    });
};

export const deleteMultiple = (type, id, data) => {
    return AxiosService.delete(
        `${BASE_URL}/${type}/${id}/documents/delete-multiple`,
        {
            params: data
        }
    );
};

export const duplicateDocument = (type, id, data) => {
    return AxiosService.post(
        `${BASE_URL}/${type}/${id}/documents/duplicate`,
        data
    );
};
