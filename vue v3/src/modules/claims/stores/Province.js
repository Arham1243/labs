import { ref } from 'vue';
import { defineStore } from 'pinia';
import { useGlobalStore } from '@/stores';
import { useI18n } from 'vue-i18n';
import * as ProvinceService from '@/modules/claims/services/Province.service';

export const useProvinceStore = defineStore('ProvinceStore', () => {
    const globalStore = useGlobalStore();

    const getProvinces = () => {
        return globalStore.actionWrapper(async () => {
            const res = await ProvinceService.getProvinces();
            return res.data;
        });
    };

    const searchProvinces = (payload = {}) => {
        payload.filters = [...(payload.filters ?? [])];
        return globalStore.actionWrapper(async () => {
            const res = await ProvinceService.searchProvinces(payload);
            return res.data;
        });
    };

    const processProvincesForDropDown = (provinces) => {
        return provinces?.map((province) => ({
            id: province.id,
            name: province.name
        }));
    };

    return {
        getProvinces,
        searchProvinces,
        processProvincesForDropDown
    };
});
