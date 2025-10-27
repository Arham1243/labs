import AxiosService from '@/services/Axios.service';

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const getSubmissions = (payload) => {
    return AxiosService.get(`${BASE_URL}/submissions`, {
        params: payload
    });
};

export const getSubmissionById = (tenantId, submissionId) => {
    return AxiosService.get(
        `${BASE_URL}/clients/${tenantId}/submissions/${submissionId}`
    );
};

export const searchSubmissions = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/submissions/search`, payload, {
        params
    });
};

export const createSubmission = (tenantId, payload) => {
    return AxiosService.post(
        `${BASE_URL}/clients/${tenantId}/submissions`,
        payload
    );
};

export const moveSubmissionToClaim = (tenantId, submissionId, payload) => {
    return AxiosService.patch(
        `${BASE_URL}/clients/${tenantId}/submissions/${submissionId}/change-claim`,
        payload
    );
};

export const assignSubmissionToExaminer = (clientId, submissionId, payload) => {
    return AxiosService.post(
        `${BASE_URL}/clients/${clientId}/submissions/${submissionId}/assign`,
        payload
    );
};

export const getSubmissionSources = () => {
    return AxiosService.get(`${BASE_URL}/submissions/sources`);
};

export const changeQueueSubmissionStatus = (
    clientId,
    submissionId,
    payload
) => {
    return AxiosService.patch(
        `${BASE_URL}/clients/${clientId}/submissions/${submissionId}/change-audit-status`,
        payload
    );
};

export const exportSubmissions = (payload) => {
    return AxiosService.post(`${BASE_URL}/submissions/export`, payload, {
        responseType: 'blob',
        headers: {
            Accept: 'text/csv'
        }
    });
};
