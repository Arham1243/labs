<script setup>
import { ref, computed } from 'vue';
import { useHelpers } from '@/composables';

const helpers = useHelpers();

const props = defineProps({
    insured: {
        type: Object,
        default: () => ({})
    }
});

const insured = ref(props.insured);

const email = computed(() => {
    return insured.value?.email || '-';
});

const dateRegistered = computed(() => {
    const date = insured.value?.created_at;
    if (!date) return '';

    return helpers.localDate(date, 'MMM D, YYYY HH:mm');
});
</script>

<template>
    <div class="flex justify-between items-center">
        <h5 class="mb-2" data-testid="insured-settings-title">
            {{ $t('insured_overview.insured_settings.title') }}
        </h5>
    </div>

    <div class="grid grid-cols-12 mt-1">
        <div
            class="sm:col-span-6 md:col-span-4 text-sm font-semibold py-1"
            data-testid="2fa-label"
        >
            {{ $t('insured_overview.insured_settings.2fa') }}
        </div>
        <div
            class="sm:col-span-6 md:col-span-8 text-sm py-1 flex gap-2"
            data-testid="2fa"
        >
            <i class="pi pi-check" />
            <span>{{ $t('common.yes') }}</span>
        </div>
        <div
            class="sm:col-span-6 md:col-span-4 text-sm font-semibold py-1"
            data-testid="email-label"
        >
            {{ $t('insured_overview.insured_settings.email') }}
        </div>
        <div class="sm:col-span-6 md:col-span-8 text-sm py-1" data-testid="email">
            {{ email }}
        </div>
        <div
            class="sm:col-span-6 md:col-span-4 text-sm font-semibold py-1"
            data-testid="last-login-label"
        >
            {{ $t('insured_overview.insured_settings.last_login') }}
        </div>
        <div class="sm:col-span-6 md:col-span-8 text-sm py-1" data-testid="last-login">
            {{ $t('insured_overview.insured_settings.never_logged_in') }}
        </div>
        <div
            class="sm:col-span-6 md:col-span-4 text-sm font-semibold py-1"
            data-testid="last-app-login-label"
        >
            {{ $t('insured_overview.insured_settings.last_app_login') }}
        </div>
        <div
            class="sm:col-span-6 md:col-span-8 text-sm py-1"
            data-testid="last-app-login"
        >
            {{ $t('insured_overview.insured_settings.never_logged_in') }}
        </div>
        <div
            class="sm:col-span-6 md:col-span-4 text-sm font-semibold py-1"
            data-testid="date-registered-label"
        >
            {{ $t('insured_overview.insured_settings.date_registered') }}
        </div>
        <div
            class="sm:col-span-6 md:col-span-8 text-sm py-1"
            data-testid="date-registered"
        >
            {{ dateRegistered }}
        </div>
    </div>
</template>
