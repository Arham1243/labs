<script setup>
import { useClaimPolicyStore } from '@/modules/claims/stores/Policy';
import { onMounted, ref } from 'vue';
import { useGeneralStore } from '@/modules/claims/stores/General';

const { currentBusinessUnit } = useClaimPolicyStore();

const country = ref();
const province = ref();
const locationDetails = ref({});
const { getBusinessUnit } = useGeneralStore();

/**
 * On Mounted
 */
onMounted(async () => {
    const res = await getBusinessUnit(currentBusinessUnit.value.id);
    currentBusinessUnit.value = res.data;
    locationDetails.value = res.data.location_details || {};
    country.value = locationDetails.value.country;
    province.value = locationDetails.value.province;
});
</script>

<template>
    <div>
        <div class="flex justify-between items-center">
            <h5 class="mb-2" data-testid="label-school-details">
                {{ $t('organization.school_details') }}
            </h5>
        </div>
        <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 mt-2">
            <div
                class="col-span-4 font-semibold py-1"
                data-testid="label-organization-name"
            >
                {{ $t('organization.title') }}
            </div>
            <div
                class="col-span-8 py-1 p-break-word"
                data-testid="text-organization-name"
            >
                {{ currentBusinessUnit?.name?.en }}
            </div>
        </div>
        <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 mt-2">
            <div
                class="col-span-4 font-semibold py-1"
                data-testid="label-organization-department"
            >
                {{ $t('organization.department') }}
            </div>
            <div
                class="col-span-8 py-1 p-break-word"
                data-testid="text-organization-department"
            >
                {{ currentBusinessUnit?.name?.en }}
            </div>
        </div>
        <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 mt-2">
            <div
                class="col-span-4 font-semibold py-1"
                data-testid="label-organization-phone"
            >
                {{ $t('insureds.phone') }}
            </div>
            <div
                class="col-span-8 py-1 p-break-word"
                data-testid="text-organization-phone"
            >
                {{ currentBusinessUnit?.phone_number }}
            </div>
        </div>
        <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 mt-2">
            <div
                class="col-span-4 font-semibold py-1"
                data-testid="label-organization-fax"
            >
                {{ $t('insureds.fax') }}
            </div>
            <div
                class="col-span-8 py-1 p-break-word"
                data-testid="text-organization-fax"
            >
                -
            </div>
        </div>
        <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 mt-2">
            <div
                class="col-span-4 font-semibold py-1"
                data-testid="label-organization-email"
            >
                {{ $t('auth.email') }}
            </div>
            <div
                class="col-span-8 py-1 p-break-word"
                data-testid="text-organization-email"
            >
                {{ currentBusinessUnit?.website_url }}
            </div>
        </div>

        <Divider />

        <div class="flex justify-between items-center">
            <h5 class="mb-2" data-testid="label-organization-current-address">
                {{ $t('insureds.address') }}
            </h5>
        </div>
        <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 mt-2">
            <div
                class="col-span-4 font-semibold py-1"
                data-testid="label-organization-address"
            >
                {{ $t('insureds.address') }}
            </div>
            <div
                class="col-span-8 py-1 p-break-word"
                data-testid="text-organization-address"
            >
                {{ locationDetails?.address || '-' }}
            </div>
        </div>
        <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 mt-2">
            <div
                class="col-span-4 font-semibold py-1"
                data-testid="label-organization-address-2"
            >
                {{ $t('insureds.address_2') }}
            </div>
            <div
                class="col-span-8 py-1 p-break-word"
                data-testid="text-organization-address-2"
            >
                {{ locationDetails?.address2 || '-' }}
            </div>
        </div>
        <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 mt-2">
            <div
                class="col-span-4 font-semibold py-1"
                data-testid="label-organization-country"
            >
                {{ $t('common.country') }}
            </div>
            <div
                class="col-span-8 py-1 p-break-word"
                data-testid="text-organization-country"
            >
                {{ country?.name }}
            </div>
        </div>
        <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 mt-2">
            <div
                class="col-span-4 font-semibold py-1"
                data-testid="label-organization-province"
            >
                {{ $t('common.province') }}
            </div>
            <div
                class="col-span-8 py-1 p-break-word"
                data-testid="text-organization-province"
            >
                {{ province?.name }}
            </div>
        </div>
        <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 mt-2">
            <div
                class="col-span-4 font-semibold py-1"
                data-testid="label-organization-city"
            >
                {{ $t('insureds.city') }}
            </div>
            <div
                class="col-span-8 py-1 p-break-word"
                data-testid="text-organization-city"
            >
                {{ locationDetails?.city || '-' }}
            </div>
        </div>
        <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 mt-2">
            <div
                class="col-span-4 font-semibold py-1"
                data-testid="label-organization-postal-code"
            >
                {{ $t('insureds.postal_code') }}
            </div>
            <div
                class="col-span-8 py-1 p-break-word"
                data-testid="text-organization-postal-code"
            >
                {{ locationDetails?.postal_code || '-' }}
            </div>
        </div>
    </div>
</template>
