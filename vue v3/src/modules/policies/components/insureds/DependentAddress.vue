<script setup>
import { computed, ref, onBeforeMount } from 'vue';
import { useCommonStore } from '@/stores';

import { useI18n } from 'vue-i18n';
import { countriesCache } from '@/modules/policies/composables/helpers';

const commonStore = useCommonStore();
const { t } = useI18n();

const props = defineProps({
    dependent: {
        type: Object,
        default: () => ({})
    }
});

const dependent = ref(props.dependent.dependent_insured);
const provinces = ref([]);

const address = computed(() => {
    return dependent.value?.address || '-';
});

const address2 = computed(() => {
    return dependent.value?.address2 || '-';
});

const country = computed(() => {
    return countriesCache.getById(dependent.value?.country_id) || '-';
});

const city = computed(() => {
    return dependent.value?.city || '-';
});

const postalCode = computed(() => {
    return dependent.value?.postal_code || '-';
});

const province = computed(() => {
    const provinceId = dependent.value?.province_id;
    const province = provinces.value.find((p) => p.id === provinceId);
    return province?.name || '-';
});

const getProvinces = async () => {
    try {
        const res = await commonStore.searchProvinces(
            {
                filters: [
                    {
                        field: 'country_id',
                        operator: '=',
                        value: dependent.value?.country_id
                    }
                ]
            },
            {}
        );

        provinces.value = res.data;
    } catch (error) {}
};

onBeforeMount(() => {
    getProvinces().then();
});
</script>

<template>
    <div class="flex justify-content-between align-items-center">
        <h5 class="mb-2">
            {{ $t('insured_overview.dependents.dependant_address') }}
        </h5>
    </div>

    <div class="grid mt-1">
        <div class="sm:col-6 md:col-4 text-sm font-semibold py-1">
            {{ $t('insured_overview.insured_address.address') }}
        </div>
        <div class="sm:col-6 md:col-8 text-sm py-1">{{ address }}</div>
        <div class="sm:col-6 md:col-4 text-sm font-semibold py-1">
            {{ $t('insured_overview.insured_address.address2') }}
        </div>
        <div class="sm:col-6 md:col-8 text-sm py-1">{{ address2 }}</div>
        <div class="sm:col-6 md:col-4 text-sm font-semibold py-1">
            {{ $t('insured_overview.insured_address.country') }}
        </div>
        <div class="sm:col-6 md:col-8 text-sm py-1">{{ country }}</div>
        <div class="sm:col-6 md:col-4 text-sm font-semibold py-1">
            {{ $t('insured_overview.insured_address.city') }}
        </div>
        <div class="sm:col-6 md:col-8 text-sm py-1">{{ city }}</div>

        <div class="sm:col-6 md:col-4 text-sm font-semibold py-1">
            {{ $t('insured_overview.insured_address.province') }}
        </div>
        <div class="sm:col-6 md:col-8 text-sm py-1">{{ province }}</div>

        <div class="sm:col-6 md:col-4 text-sm font-semibold py-1">
            {{ $t('insured_overview.insured_address.postal_code') }}
        </div>
        <div class="sm:col-6 md:col-8 text-sm py-1">{{ postalCode }}</div>
    </div>
</template>
