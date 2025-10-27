<script setup>
import { ref, computed, onBeforeMount } from 'vue';
import { useHelpers } from '@/composables';
import { useCommonStore } from '@/stores';

import moment from 'moment-timezone';

const helpers = useHelpers();
const commonStore = useCommonStore();

const props = defineProps({
    insured: {
        type: Object,
        default: () => ({})
    }
});

const isLoading = ref(false);
const insured = ref(props.insured);
const countries = ref([]);

const name = computed(() => {
    return `${insured.value?.first_name} ${insured.value?.last_name}`;
});

const dateOfBirth = computed(() => {
    const dob = insured.value?.date_of_birth;
    if (!dob) return '';

    const formattedDate = helpers.formatDate(dob);
    const age = moment().diff(moment(dob), 'years');
    return `${formattedDate} (${age} Years old)`;
});

const passportNumber = computed(() => {
    return insured.value?.passport_number || '-';
});

const email = computed(() => {
    return insured.value?.email || '-';
});

const secondaryEmail = computed(() => {
    return insured.value?.secondary_email || '-';
});

const country = computed(() => {
    const countryId = insured.value?.country_id;
    const country = countries.value.find((c) => c.id === countryId);
    return country?.name || '-';
});

const getCountries = async () => {
    try {
        isLoading.value = true;
        const res = await commonStore.searchCountries();
        countries.value = res.data;
    } catch (error) {
    } finally {
        isLoading.value = false;
    }
};

onBeforeMount(async () => {
    await getCountries();
});

const edit = () => {};
</script>

<template>
    <div class="flex justify-content-between align-items-center">
        <h5 class="mb-2" data-testid="insured-details-title">
            {{ $t('insured_overview.insured_details.title') }}
        </h5>
        <Button
            v-if="false"
            size="small"
            text
            class="px-2 py-1"
            :label="$t('buttons.edit')"
            icon="pi pi-pencil"
            @click="edit"
        />
    </div>

    <Loading v-if="isLoading" />
    <div v-else class="grid mt-1">
        <div class="sm:col-6 md:col-4 text-sm font-semibold py-1">
            {{ $t('insured_overview.applicant.name') }}
        </div>
        <div
            class="sm:col-6 md:col-8 text-sm py-1 p-break-word"
            data-testid="insured-name"
        >
            {{ name }}
        </div>
        <div class="sm:col-6 md:col-4 text-sm font-semibold py-1">
            {{ $t('insured_overview.applicant.date_of_birth') }}
        </div>
        <div class="sm:col-6 md:col-8 text-sm py-1" data-testid="insured-dob">
            {{ dateOfBirth }}
        </div>
        <div class="sm:col-6 md:col-4 text-sm font-semibold py-1">
            {{ $t('insured_overview.applicant.gender') }}
        </div>
        <div
            class="sm:col-6 md:col-8 text-sm py-1 p-break-word"
            data-testid="insured-gender"
        >
            {{ insured?.gender?.name }}
        </div>
        <div class="sm:col-6 md:col-4 text-sm font-semibold py-1">
            {{ $t('insured_overview.applicant.preferred_language') }}
        </div>
        <div
            class="sm:col-6 md:col-8 text-sm py-1"
            data-testid="insured-language"
        >
            English
        </div>
        <div class="sm:col-6 md:col-4 text-sm font-semibold py-1">
            {{ $t('insured_overview.applicant.country_of_origin') }}
        </div>
        <div
            class="sm:col-6 md:col-8 text-sm py-1"
            data-testid="insured-country"
        >
            {{ country }}
        </div>
        <div class="sm:col-6 md:col-4 text-sm font-semibold py-1">
            {{ $t('insured_overview.applicant.passport_no') }}
        </div>
        <div
            class="sm:col-6 md:col-8 text-sm py-1"
            data-testid="insured-passport-number"
        >
            {{ passportNumber }}
        </div>
        <div class="sm:col-6 md:col-4 text-sm font-semibold py-1">
            {{ $t('insured_overview.applicant.primary_email') }}
        </div>
        <div
            class="sm:col-6 md:col-8 text-sm py-1"
            data-testid="insured-primary-email"
        >
            {{ email }}
        </div>
        <div class="sm:col-6 md:col-4 text-sm font-semibold py-1">
            {{ $t('insured_overview.applicant.secondary_email') }}
        </div>
        <div
            class="sm:col-6 md:col-8 text-sm py-1"
            data-testid="insured-secondary-email"
        >
            {{ secondaryEmail }}
        </div>
    </div>
</template>
