import AxiosService from '@/services/Axios.service';

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const getNotesBySubmissionId = (tenantId, submissionId) => {
    return AxiosService.get(
        `${BASE_URL}/clients/${tenantId}/submissions/${submissionId}/claim-notes`
    );
};

export const getNotesByExpenseId = (tenantId, expenseId) => {
    return AxiosService.get(
        `${BASE_URL}/clients/${tenantId}/expenses/${expenseId}/claim-notes`
    );
};

export const createSubmissionNote = (tenantId, submissionId, notes) => {
    return AxiosService.post(
        `${BASE_URL}/clients/${tenantId}/submissions/${submissionId}/claim-notes`,
        notes
    );
};

export const createExpenseNote = (tenantId, expenseId, notes) => {
    return AxiosService.post(
        `${BASE_URL}/clients/${tenantId}/expenses/${expenseId}/claim-notes`,
        notes
    );
};

export const searchSubmissionNotes = (tenantId, submissionId, payload) => {
    return AxiosService.post(
        `${BASE_URL}/clients/${tenantId}/submissions/${submissionId}/claim-notes/search`,
        payload
    );
};

export const searchExpenseNotes = (tenantId, expenseId, payload) => {
    return AxiosService.post(
        `${BASE_URL}/clients/${tenantId}/expenses/${expenseId}/claim-notes/search`,
        payload
    );
};

export const updateClaimNote = (tenantId, noteId, notes) => {
    return AxiosService.put(
        `${BASE_URL}/clients/${tenantId}/claim-notes/${noteId}`,
        notes
    );
};

export const deleteClaimNote = (tenantId, noteId) => {
    return AxiosService.delete(
        `${BASE_URL}/clients/${tenantId}/claim-notes/${noteId}`
    );
};
