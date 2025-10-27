<script setup>
import { ref, computed, onBeforeMount } from 'vue';
import { useHelpers } from '@/composables';
import { useCommonStore } from '@/stores';

import moment from 'moment-timezone';

const helpers = useHelpers();
const commonStore = useCommonStore();

const props = defineProps({
    dependent: {
        type: Object,
        default: () => ({})
    }
});

const isLoading = ref(false);
const dependent = ref(props.dependent);

const firstName = computed(() => {
    return '-';
});

const lastName = computed(() => {
    return '-';
});

const dateOfBirth = computed(() => {
    const dob = dependent.value?.date_of_birth;
    if (!dob) return '';

    const formattedDate = helpers.formatDate(dob);
    const age = moment().diff(moment(dob), 'years');
    return '-' || `${formattedDate} (${age} Years old)`;
});

const contact = computed(() => {
    return '-';
});

const relation = computed(() => {
    return '-';
});

const payOption = computed(() => {
    return '-';
});

const address = computed(() => {
    return '-';
});

const address2 = computed(() => {
    return '-';
});

const country = computed(() => {
    return '-' || dependent.value?.country_id || '-';
});

const province = computed(() => {
    return '-';
});

const postal = computed(() => {
    return '-';
});

const city = computed(() => {
    return '-';
});

onBeforeMount(async () => {});
</script>

<template>
    <div class="flex justify-content-between align-items-center">
        <h5 class="mb-2">
            {{ $t('insured_overview.dependents.beneficiary_details') }}
        </h5>
    </div>

    <Loading v-if="isLoading" />
    <div v-else class="grid mt-1">
        <div class="sm:col-6 md:col-2 text-sm font-semibold py-1">
            {{ $t('policies.applicant.first_name') }}
        </div>
        <div class="sm:col-6 md:col-10 text-sm py-1">
            {{ firstName }}
        </div>

        <div class="sm:col-6 md:col-2 text-sm font-semibold py-1">
            {{ $t('policies.applicant.last_name') }}
        </div>
        <div class="sm:col-6 md:col-10 text-sm py-1">
            {{ lastName }}
        </div>

        <div class="sm:col-6 md:col-2 text-sm font-semibold py-1">
            {{ $t('insured_overview.applicant.date_of_birth') }}
        </div>
        <div class="sm:col-6 md:col-10 text-sm py-1">
            {{ dateOfBirth }}
        </div>

        <div class="sm:col-6 md:col-2 text-sm font-semibold py-1">
            {{ $t('insured_overview.dependents.contact_number') }}
        </div>
        <div class="sm:col-6 md:col-10 text-sm py-1 p-break-word">
            {{ contact }}
        </div>

        <div class="sm:col-6 md:col-2 text-sm font-semibold py-1">
            {{ $t('insured_overview.dependents.relation') }}
        </div>
        <div class="sm:col-6 md:col-10 text-sm py-1">{{ relation }}</div>

        <div class="sm:col-6 md:col-2 text-sm font-semibold py-1">
            {{ $t('insured_overview.dependents.pay_option') }}
        </div>
        <div class="sm:col-6 md:col-10 text-sm py-1">{{ payOption }}</div>

        <div class="sm:col-6 md:col-2 text-sm font-semibold py-1">
            {{ $t('insured_overview.insured_address.address') }}
        </div>
        <div class="sm:col-6 md:col-10 text-sm py-1">{{ address }}</div>

        <div class="sm:col-6 md:col-2 text-sm font-semibold py-1">
            {{ $t('insured_overview.insured_address.address2') }}
        </div>
        <div class="sm:col-6 md:col-10 text-sm py-1">{{ address2 }}</div>

        <div class="sm:col-6 md:col-2 text-sm font-semibold py-1">
            {{ $t('insured_overview.insured_address.country') }}
        </div>
        <div class="sm:col-6 md:col-10 text-sm py-1">{{ country }}</div>

        <div class="sm:col-6 md:col-2 text-sm font-semibold py-1">
            {{ $t('insured_overview.insured_address.province') }}
        </div>
        <div class="sm:col-6 md:col-10 text-sm py-1">{{ province }}</div>

        <div class="sm:col-6 md:col-2 text-sm font-semibold py-1">
            {{ $t('insured_overview.insured_address.postal_code') }}
        </div>
        <div class="sm:col-6 md:col-10 text-sm py-1">{{ postal }}</div>

        <div class="sm:col-6 md:col-2 text-sm font-semibold py-1">
            {{ $t('insured_overview.insured_address.city') }}
        </div>
        <div class="sm:col-6 md:col-10 text-sm py-1">{{ city }}</div>
    </div>
</template>
