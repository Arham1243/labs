<script setup>
import { ref, computed, onBeforeMount } from 'vue';
import { useHelpers } from '@/composables';
import { countriesCache } from '@/modules/policies/composables/helpers';

const helpers = useHelpers();

const props = defineProps({
    dependent: {
        type: Object,
        default: () => ({})
    }
});

const isLoading = ref(false);
const dependent = ref(props.dependent.dependent_insured);

const dateOfBirth = computed(() => {
    const dob = dependent.value?.date_of_birth;
    if (!dob) return '';

    const formattedDate = helpers.formatDate(dob, 'DD-MMM-YYYY');
    return `${formattedDate}`;
});

const email = computed(() => {
    return dependent.value?.email || '-';
});

const secondaryEmail = computed(() => {
    return dependent.value?.secondary_email || '-';
});

const country = computed(() => {
    return countriesCache.getById(dependent.value?.country_id) || '-';
});

const passportNumber = computed(() => {
    return dependent.value?.passport_number || '-';
});

onBeforeMount(async () => {});
</script>

<template>
    <div class="flex justify-between items-center">
        <h5 class="mb-2">
            {{ $t('insured_overview.dependents.dependant_details') }}
        </h5>
    </div>

    <Loading v-if="isLoading" />
    <div v-else class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 mt-1">
        <div class="sm:col-span-6 md:col-span-4 text-sm font-semibold py-1">
            {{ $t('insured_overview.applicant.date_of_birth') }}
        </div>
        <div class="sm:col-span-6 md:col-span-8 text-sm py-1">
            {{ dateOfBirth }}
        </div>

        <div class="sm:col-span-6 md:col-span-4 text-sm font-semibold py-1">
            {{ $t('insured_overview.applicant.gender') }}
        </div>
        <div class="sm:col-span-6 md:col-span-8 text-sm py-1 p-break-word">
            {{ dependent?.gender?.name }}
        </div>

        <div class="sm:col-span-6 md:col-span-4 text-sm font-semibold py-1">
            {{ $t('insured_overview.applicant.country_of_origin') }}
        </div>
        <div class="sm:col-span-6 md:col-span-8 text-sm py-1">{{ country }}</div>

        <div class="sm:col-span-6 md:col-span-4 text-sm font-semibold py-1">
            {{ $t('insured_overview.applicant.passport_no') }}
        </div>
        <div class="sm:col-span-6 md:col-span-8 text-sm py-1">{{ passportNumber }}</div>

        <div class="sm:col-span-6 md:col-span-4 text-sm font-semibold py-1">
            {{ $t('insured_overview.applicant.primary_email') }}
        </div>
        <div class="sm:col-span-6 md:col-span-8 text-sm py-1">{{ email }}</div>

        <div class="sm:col-span-6 md:col-span-4 text-sm font-semibold py-1">
            {{ $t('insured_overview.applicant.secondary_email') }}
        </div>
        <div class="sm:col-span-6 md:col-span-8 text-sm py-1">{{ secondaryEmail }}</div>

        <div class="sm:col-span-6 md:col-span-4 text-sm font-semibold py-1">
            {{ $t('insured_overview.applicant.preferred_language') }}
        </div>
        <div class="sm:col-span-6 md:col-span-8 text-sm py-1">English</div>
    </div>
</template>
