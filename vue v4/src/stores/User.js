import { defineStore } from 'pinia';
import { UserService } from '@/services';

import { useGlobalStore } from '@/stores';

export const useUserStore = defineStore('UserStore', () => {
    const globalStore = useGlobalStore();

    const searchUsers = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await UserService.searchUsers(payload, { params });
            return res.data;
        });
    };

    const processSimpleUsers = (data) => {
        return data.map((item) => {
            return {
                id: item.id,
                name: item.name
            };
        });
    };

    return {
        searchUsers,
        processSimpleUsers
    };
});
