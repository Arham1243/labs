import { ref } from 'vue';
import { useGlobalStore } from '@/stores/index.js';

export function usePaginatedDropdown(store, searchFunction) {
    const loading = ref(false);
    const items = ref([]);
    const hasNextPage = ref(false);
    const currentPage = ref(1);
    const currentSearchTerm = ref('');

    /**
     * Fetches the FIRST page.
     */
    const fetchInitialItems = async () => {
        if (loading.value) return;
        try {
            loading.value = true;
            currentPage.value = 1;
            currentSearchTerm.value = '';
            const response = await searchFunction({
                search: { value: '' },
                page: currentPage.value
            });
            if (response && response.data && response.links) {
                items.value = response.data;
                hasNextPage.value = !!response.links.next;
            } else {
                items.value = response.data || [];
                hasNextPage.value = false;
            }
        } catch (error) {
            globalStore.showError('Failed to fetch initial items:', error);
        } finally {
            loading.value = false;
        }
    };

    /**
     * Fetches the next page.
     */

    const fetchNextPage = async () => {
        if (!hasNextPage.value || loading.value) return;
        try {
            loading.value = true;
            currentPage.value++;

            const response = await searchFunction({
                search: { value: currentSearchTerm.value },
                page: currentPage.value
            });

            if (response && response.data) {
                items.value.push(...response.data);
                hasNextPage.value = !!response.links.next;
            }
        } catch (error) {
            globalStore.showError('Failed to fetch next page:', error);
            currentPage.value--;
        } finally {
            loading.value = false;
        }
    };

    /**
     * search function.
     */

    const searchItems = async (searchValue) => {
        if (loading.value) return;
        try {
            loading.value = true;
            currentPage.value = 1;
            currentSearchTerm.value = searchValue;

            const response = await searchFunction({
                search: { value: searchValue },
                page: currentPage.value
            });

            if (response && response.data) {
                items.value = response.data;
                hasNextPage.value = !!response.links?.next;
            }
        } catch (error) {
            globalStore.showError('Failed to search items:', error);
        } finally {
            loading.value = false;
        }
    };

    return {
        loading,
        items,
        hasNextPage,
        fetchInitialItems,
        fetchNextPage,
        searchItems
    };
}
