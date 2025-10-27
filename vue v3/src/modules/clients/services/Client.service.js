import AxiosService from '@/services/Axios.service';

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

//Clients

export const searchClients = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/clients/search`, payload, {
        params
    });
};

export const getClients = (params) => {
    return AxiosService.get(
        `${BASE_URL}/clients?include=clientSector,country`,
        {
            params: { params }
        }
    );
};

export const getClient = (id, params) => {
    return AxiosService.get(`${BASE_URL}/clients/${id}`, { params });
};

export const createClient = (payload) => {
    return AxiosService.post(`${BASE_URL}/clients`, payload);
};

export const updateClient = (id, payload) => {
    return AxiosService.put(`${BASE_URL}/clients/${id}`, payload);
};

export const batchUpdateClients = (payload) => {
    return AxiosService.patch(`${BASE_URL}/clients/batch`, payload);
};

export const deleteClient = (id) => {
    return AxiosService.delete(`${BASE_URL}/clients/${id}`);
};

//Holdings
export const searchHoldings = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/holdings/search`, payload, {
        params
    });
};

export const getHoldings = (params) => {
    return AxiosService.get(
        `${BASE_URL}/holdings?include=clients,country,contacts`,
        {
            params: { params }
        }
    );
};

export const getHolding = (id, params) => {
    return AxiosService.get(`${BASE_URL}/holdings/${id}`, { params });
};

export const createHolding = (payload) => {
    return AxiosService.post(`${BASE_URL}/holdings`, payload);
};

export const updateHolding = (id, payload) => {
    return AxiosService.put(`${BASE_URL}/holdings/${id}`, payload);
};

export const deleteHolding = (id) => {
    return AxiosService.delete(`${BASE_URL}/holdings/${id}`);
};

//Business Units

export const searchBusinessUnits = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/business-units/search`, payload, {
        params
    });
};

export const getBusinessUnits = (params) => {
    return AxiosService.get(
        `${BASE_URL}/business-units?include=accountManager,clientSector,country`,
        {
            params: { params }
        }
    );
};

export const getBusinessUnit = (id, params) => {
    return AxiosService.get(`${BASE_URL}/business-units/${id}`, { params });
};

export const createBusinessUnit = (payload) => {
    return AxiosService.post(`${BASE_URL}/business-units`, payload);
};

export const updateBusinessUnit = (id, payload) => {
    return AxiosService.put(`${BASE_URL}/business-units/${id}`, payload);
};

export const deleteBusinessUnit = (id) => {
    return AxiosService.delete(`${BASE_URL}/business-units/${id}`);
};

export const attachNonInsuranceProductToBusinessUnit = (id, payload) => {
    return AxiosService.post(
        `${BASE_URL}/business-units/${id}/attach-non-insurance-products`,
        payload
    );
};

//Client Sectors

export const searchClientSectors = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/client-sectors/search`, payload, {
        params
    });
};

//Billing Details
export const createBillingDetail = (payload) => {
    return AxiosService.post(`${BASE_URL}/billing-details`, payload);
};

export const updateBillingDetail = (id, payload) => {
    return AxiosService.put(`${BASE_URL}/billing-details/${id}`, payload);
};

//Contacts
export const createContact = (payload) => {
    return AxiosService.post(`${BASE_URL}/contacts`, payload);
};

export const updateContact = (id, payload) => {
    return AxiosService.put(`${BASE_URL}/contacts/${id}`, payload);
};

export const deleteContact = (id) => {
    return AxiosService.delete(`${BASE_URL}/contacts/${id}`);
};

export const getContactTypes = (payload) => {
    return AxiosService.post(`${BASE_URL}/contact-types/search`, payload);
};
