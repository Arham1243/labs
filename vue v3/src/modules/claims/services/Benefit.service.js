import AxiosService from '@/services/Axios.service';
import { BASE_URL } from '@/modules/claims/utils';

export const getBenefits = () => {
    return AxiosService.get(`${BASE_URL}/benefits?limit=100`);
};
