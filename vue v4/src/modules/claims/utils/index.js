import { ref } from 'vue';
import { useGlobalStore } from '@/stores/index.js';

export const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const useResource = (fn, key, refresh = false) => {
    const loading = ref(false);
    const data = ref(null);
    const links = ref(null);
    const meta = ref(null);
    const error = ref(null); // to be worked on

    // check if key has value
    if (key?.['value'] && !refresh) {
        data.value = key['value'];
    } else {
        (async () => {
            try {
                loading.value = true;
                let res = await fn;
                data.value = res?.data;
                links.value = res?.links;
                meta.value = res?.meta;
                if (key) key['value'] = res?.data;
            } finally {
                loading.value = false;
            }
        })();
    }
    return { loading, data, links, meta, error };
};

export const useMutation = (fn, key, pagination, sortFilters) => {
    const loading = ref(false);
    const data = ref(null);
    const meta = ref(null);
    const error = ref(null); // to be worked on
    const status = ref('idle');
    const showToast = ref(false);

    const globalStore = useGlobalStore();

    const mutate = async (payload) =>
        globalStore.actionWrapper(async () => {
            status.value = 'loading';
            loading.value = true;
            error.value = null;

            try {
                const res = await fn(payload); // Call the passed mutation function with the payload
                data.value = res?.data;
                meta.value = res?.meta;
                status.value = 'success';
                if (key) key['value'] = res?.data;
            } catch (err) {
                error.value = err?.response?.data;
                status.value = 'error';
                loading.value = false;
                if (showToast.value) throw err;
            } finally {
                loading.value = false;
            }
        });

    const onPageChange = (event) => {
        pagination.updatePageParams(event);
        mutate(event?.payload);
    };

    const onSortChange = (event) => {
        event.sortField = event?.sortField?.replace('.', '_'); // <- @TODO: to be removed
        pagination.resetPageParams();
        sortFilters.updateSortFilters(event);
        mutate();
    };

    const onSearch = async (searchText) => {
        pagination.resetPageParams();
        sortFilters.updateSearch(searchText);
        mutate();
    };

    return {
        loading,
        data,
        meta,
        error,
        status,
        mutate,
        showToast,
        globalStore,
        showError: globalStore.showError,
        pagination,
        sortFilters,
        onPageChange,
        onSortChange,
        onSearch
    };
};

export const storePayload = () => {
    const payload = ref({});

    const setPayload = (data) => {
        // Set key and value in payload
        if (data) {
            payload.value = data;
        }
    };

    const getPayload = () => {
        // Return the payload object
        return payload.value;
    };

    return {
        setPayload,
        getPayload
    };
};
