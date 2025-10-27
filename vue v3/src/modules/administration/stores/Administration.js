import { defineStore } from 'pinia';
import { AdministrationService } from '@/modules/administration/services';
import { useGlobalStore } from '@/stores';
import { ref } from 'vue';

export const useAdministrationStore = defineStore('AdministrationStore', () => {
    const globalStore = useGlobalStore();
    const settings = ref([]);

    const getSettings = async () => {
        const res = await globalStore.actionWrapper(async () => {
            const response = await AdministrationService.getSettings();
            return response.data;
        });
        settings.value = res;
        return settings.value;
    };

    return {
        settings,
        getSettings
    };
});
