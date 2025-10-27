import AxiosService from '@/services/Axios.service';

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const getExpenses = (payload) => {
    return AxiosService.get(`${BASE_URL}/expenses?per_page=200`, {
        params: payload
    });
};

export const searchExpenses = (payload, params, clientId) => {
    if (clientId)
        return AxiosService.post(
            `${BASE_URL}/clients/${clientId}/expenses/benefits/search`,
            payload,
            { params }
        );
    else
        return AxiosService.post(`${BASE_URL}/expenses/search`, payload, {
            params
        });
};

export const getExpenseById = (tenantId, expenseId) => {
    return AxiosService.get(
        `${BASE_URL}/clients/${tenantId}/expenses/${expenseId}`
    );
};

export const createExpense = (tenantId, payload) => {
    return AxiosService.post(
        `${BASE_URL}/clients/${tenantId}/expenses`,
        payload
    );
};

export const updateExpense = (tenantId, expenseId, payload) => {
    return AxiosService.put(
        `${BASE_URL}/clients/${tenantId}/expenses/${expenseId}`,
        payload
    );
};

export const changeExpenseStatus = (tenantId, expenseId, payload) => {
    return AxiosService.patch(
        `${BASE_URL}/clients/${tenantId}/expenses/${expenseId}/change-status`,
        payload
    );
};
