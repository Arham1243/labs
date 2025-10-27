import { search } from '@/modules/administration/services/Gender.service.js';

let genders = [];
export const useGenders = async () => {
    if (!genders.length) {
        try {
            // Fetch only active genders from backend (Orion supports filtering)
            const payload = {
                filters: [
                    {
                        field: 'status',
                        value: 'active'
                    }
                ]
            };
            const params = { limit: 100 };
            const data = await search(payload, params);
            genders = data?.data?.data || [];
        } catch (e) {
            genders = [];
        }
    }

    return {
        genders
    };
};

export const getGenderLabelById = (id) => {
    return genders.find((gender) => gender.id === id)?.name;
};
