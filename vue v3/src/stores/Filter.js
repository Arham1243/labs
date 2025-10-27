import { defineStore } from 'pinia';
import { FilterService } from '@/services';

import { useGlobalStore } from '@/stores';

export const useFilterStore = defineStore('FilterStore', () => {
    const globalStore = useGlobalStore();

    const saveFilter = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await FilterService.saveFilter(payload, {});
            return res.data;
        });
    };

    const getFilters = () => {
        return globalStore.actionWrapper(async () => {
            const res = await FilterService.getFilters({});
            return res.data;
        });
    };

    const updateFilter = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await FilterService.updateFilter(id, payload);
            return res.data;
        });
    };

    const deleteFilter = (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await FilterService.deleteFilter(id);
            return res.data;
        });
    };

    const getLocalFilterKey = (userId, moduleName) => {
        return `filter-${userId}-${moduleName}`;
    };

    const saveFilterLocal = (userId, moduleName, filters) => {
        try {
            const key = getLocalFilterKey(userId, moduleName);
            localStorage.setItem(key, JSON.stringify(filters));
        } catch (error) {
            console.error('Failed to save filters locally', error);
        }
    };

    const getFilterLocal = (userId, moduleName) => {
        try {
            const key = getLocalFilterKey(userId, moduleName);
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error(
                'Failed to retrieve filters from local storage',
                error
            );
            return [];
        }
    };

    const clearFilterLocal = (userId, moduleName) => {
        try {
            const key = getLocalFilterKey(userId, moduleName);
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Failed to clear filters from local storage', error);
        }
    };

    return {
        saveFilter,
        updateFilter,
        getFilters,
        deleteFilter,
        saveFilterLocal,
        getFilterLocal,
        clearFilterLocal
    };
});
