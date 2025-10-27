<script setup>
import { useHelpers } from '@/composables';
import { calculateAge } from '@/modules/claims/utils/helper';
import { useGeneralStore } from '@/modules/claims/stores/General';
import { ref, watch } from 'vue';

const props = defineProps({
    insured: { type: Object }
});

const helper = useHelpers();
const country = ref();
const province = ref();
const { getCountryById, getProvinceById } = useGeneralStore();

watch(
    () => [props.insured?.country_id, props.insured?.province_id],
    async ([newCountryId, newProvinceId], [oldCountryId, oldProvinceId]) => {
        if (newCountryId !== oldCountryId && newCountryId) {
            country.value = await getCountryById(newCountryId);
        }
        if (newProvinceId !== oldProvinceId && newProvinceId) {
            province.value = await getProvinceById(newProvinceId);
        }
    }
);
</script>

<template>
    <div>
        <div class="flex justify-between items-center">
            <h5 class="mb-2" data-testid="label-insured-details">
                {{ $t('insureds.insured_details') }}
            </h5>
        </div>
        <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 mt-2">
            <div
                class="col-span-4 font-semibold py-1"
                data-testid="label-insured-client-id"
            >
                {{ $t('insureds.client_id') }}
            </div>
            <div
                class="col-span-8 py-1 p-break-word"
                data-testid="text-insured-client-id"
            >
                {{ props.insured?.client_id }}
            </div>
        </div>
        <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 mt-2">
            <div
                class="col-span-4 font-semibold py-1"
                data-testid="label-insured-firstname"
            >
                {{ $t('insureds.first_name') }}
            </div>
            <div
                class="col-span-8 py-1 p-break-word"
                data-testid="text-insured-firstname"
            >
                {{ props.insured?.first_name }}
            </div>
        </div>
        <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 mt-2">
            <div
                class="col-span-4 font-semibold py-1"
                data-testid="label-insured-lastname"
            >
                {{ $t('insureds.last_name') }}
            </div>
            <div
                class="col-span-8 py-1 p-break-word"
                data-testid="text-insured-lastname"
            >
                {{ props.insured?.last_name }}
            </div>
        </div>
        <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 mt-2">
            <div
                class="col-span-4 font-semibold py-1"
                data-testid="label-insured-date-of-birth"
            >
                {{ $t('insureds.date_of_birth') }}
            </div>
            <div
                class="col-span-8 py-1 p-break-word"
                data-testid="text-insured-date-of-birth-and-age"
            >
                {{
                    helper.formatDate(
                        props.insured?.date_of_birth,
                        'MMM DD, YYYY'
                    )
                }}
                ({{ calculateAge(props.insured?.date_of_birth) }} years old)
            </div>
        </div>
        <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 mt-2">
            <div
                class="col-span-4 font-semibold py-1"
                data-testid="label-insured-gender"
            >
                {{ $t('insureds.gender') }}
            </div>
            <div
                class="col-span-8 py-1 p-break-word"
                data-testid="text-insured-gender"
            >
                {{ props.insured?.gender }}
            </div>
        </div>
        <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 mt-2">
            <div
                class="col-span-4 font-semibold py-1"
                data-testid="label-insured-passport-number"
            >
                {{ $t('insureds.passport_no') }}
            </div>
            <div
                class="col-span-8 py-1 p-break-word"
                data-testid="text-insured-passport-number"
            >
                {{ props.insured?.passport_number }}
            </div>
        </div>
        <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 mt-2">
            <div
                class="col-span-4 font-semibold py-1"
                data-testid="label-insured-passport-number"
            >
                {{ $t('common.status') }}
            </div>
            <div
                class="col-span-8 py-1 p-break-word"
                data-testid="text-insured-passport-number"
            >
                {{ props.insured?.status }}
            </div>
        </div>
        <!--        <Message :closable="false">-->
        <!--            <p>-->
        <!--                <span class="font-semibold">Return Home Offer Accepted</span> - -->
        <!--                Coverage for Stroke related expenses ended Feb 10,2024-->
        <!--            </p>-->
        <!--        </Message>-->

        <Divider />

        <div class="flex justify-between items-center">
            <h5 class="mb-2" data-testid="label-insured-contact-details">
                {{ $t('insureds.contact_details') }}
            </h5>
        </div>
        <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 mt-2">
            <div
                class="col-span-4 font-semibold py-1"
                data-testid="label-insured-primary-email"
            >
                {{ $t('insureds.primary_email') }}
            </div>
            <div
                class="col-span-8 py-1 p-break-word"
                data-testid="text-insured-primary-email"
            >
                {{ props.insured?.email }}
            </div>
        </div>
        <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 mt-2">
            <div
                class="col-span-4 font-semibold py-1"
                data-testid="label-insured-secondary-email"
            >
                {{ $t('insureds.secondary_email') }}
            </div>
            <div
                class="col-span-8 py-1 p-break-word"
                data-testid="text-insured-secondary-email"
            >
                {{ props.insured?.secondaryEmail }}
            </div>
        </div>
        <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 mt-2">
            <div
                class="col-span-4 font-semibold py-1"
                data-testid="label-insured-phone"
            >
                {{ $t('insureds.phone') }}
            </div>
            <div
                class="col-span-8 py-1 p-break-word"
                data-testid="text-insured-phone"
            >
                {{ props.insured?.phone_number }}
            </div>
        </div>
        <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 mt-2">
            <div
                class="col-span-4 font-semibold py-1"
                data-testid="label-insured-alt-phone"
            >
                {{ $t('insureds.alt_phone') }}
            </div>
            <div
                class="col-span-8 py-1 p-break-word"
                data-testid="text-insured-alt-phone"
            >
                {{ props.insured?.altPhone ? props.insured?.altPhone : '-' }}
            </div>
        </div>

        <Divider />

        <div class="flex justify-between items-center">
            <h5 class="mb-2" data-testid="label-insured-current-address">
                {{ $t('insureds.current_address') }}
            </h5>
        </div>
        <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 mt-2">
            <div
                class="col-span-4 font-semibold py-1"
                data-testid="label-insured-address"
            >
                {{ $t('insureds.address') }}
            </div>
            <div
                class="col-span-8 py-1 p-break-word"
                data-testid="text-insured-address"
            >
                {{ props.insured?.address }}
            </div>
        </div>
        <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 mt-2">
            <div
                class="col-span-4 font-semibold py-1"
                data-testid="label-insured-address-2"
            >
                {{ $t('insureds.address_2') }}
            </div>
            <div
                class="col-span-8 py-1 p-break-word"
                data-testid="text-insured-address-2"
            >
                {{ props.insured?.address2 ? props.insured?.address2 : '-' }}
            </div>
        </div>
        <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 mt-2">
            <div
                class="col-span-4 font-semibold py-1"
                data-testid="label-insured-country"
            >
                {{ $t('common.country') }}
            </div>
            <div
                class="col-span-8 py-1 p-break-word"
                data-testid="text-insured-country"
            >
                {{ country?.data?.name }}
            </div>
        </div>
        <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 mt-2">
            <div
                class="col-span-4 font-semibold py-1"
                data-testid="label-insured-province"
            >
                {{ $t('common.province') }}
            </div>
            <div
                class="col-span-8 py-1 p-break-word"
                data-testid="text-insured-province"
            >
                {{ province?.data?.name }}
            </div>
        </div>
        <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 mt-2">
            <div
                class="col-span-4 font-semibold py-1"
                data-testid="label-insured-city"
            >
                {{ $t('insureds.city') }}
            </div>
            <div
                class="col-span-8 py-1 p-break-word"
                data-testid="text-insured-city"
            >
                {{ props.insured?.city }}
            </div>
        </div>
        <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 mt-2">
            <div
                class="col-span-4 font-semibold py-1"
                data-testid="label-insured-postal-code"
            >
                {{ $t('insureds.postal_code') }}
            </div>
            <div
                class="col-span-8 py-1 p-break-word"
                data-testid="text-insured-postal-code"
            >
                {{ props.insured?.postal_code }}
            </div>
        </div>
    </div>
</template>
