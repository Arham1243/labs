import { ref } from 'vue';
import { useNonInsuranceProductStore } from '@/modules/plans/stores/NonInsuranceProduct';

export function useSearchNonInsuranceProduct() {
    const loadingNonInsuranceProducts = ref(false);
    const nonInsuranceProducts = ref([]);
    const nonInsuranceProductStore = useNonInsuranceProductStore();

    const getNonInsuranceProducts = async (search) => {
        try {
            loadingNonInsuranceProducts.value = true;

            const res =
                await nonInsuranceProductStore.searchNonInsuranceProduct(
                    {
                        search: {
                            value: search
                        },
                        filters: [{ field: 'status', value: 'active' }]
                    },
                    { limit: 100 }
                );

            nonInsuranceProducts.value = res.data;
        } finally {
            loadingNonInsuranceProducts.value = false;
        }
    };

    return {
        loadingNonInsuranceProducts,
        nonInsuranceProducts,
        getNonInsuranceProducts
    };
}
