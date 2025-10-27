import AxiosService from '@/services/Axios.service';
import { BASE_URL } from '@/modules/claims/utils';

export const getPolicy = (clientId, policyId) => {
    return AxiosService.get(
        `${BASE_URL}/clients/${clientId}/policies/${policyId}?include=benefits.serviceCodes`
    );
};

export const searchPolicy = ({ search, filters }) => {
    // ?include=benefits.serviceCodes
    // payload: value, filters
    return AxiosService.post(
        `${BASE_URL}/policies/search?include=benefits.serviceCodes&limit=200`,
        {
            search: { value: search }
            // ...( filters ? { filters } : [] )
            // filters: [{
            //     field: 'plan_id',
            //     value: '1742243535896233269'
            // }]
        }
    );
};

export const getPolicyBatch = (tenantId, policyBatchId) => {
    return AxiosService.get(
        `${BASE_URL}/clients/${tenantId}/policy-batches/${policyBatchId}`
    );
};

export const getPolicyBenefitById = (policyBenefitId) => {
    return AxiosService.get(
        `${BASE_URL}/policy-benefits/${policyBenefitId}?include=serviceCodes`
    );
};
