<script setup>
import { ref } from 'vue';
import { useHelpers } from '@/composables';

import ItemCard from '@/modules/policies/components/insureds/ItemCard.vue';
import { useI18n } from 'vue-i18n';
import { BeneficiaryTypes, PolicyModulePermission } from '@/config';
import { useInsuredsStore } from '@/modules/policies/stores';
import { ability } from '@/plugins/ability.js';

const helpers = useHelpers();
const { t } = useI18n();
const insuredsStore = useInsuredsStore();

const props = defineProps({
    insured: {
        type: Object,
        default: () => ({})
    }
});

const emits = defineEmits(['view', 'removeBeneficiary']);

const insured = ref(props.insured);
const showMoreList = ref(false);

const beneficiaries = [...insured.value.beneficiaries];
const selfEntityType = BeneficiaryTypes.SELF.value;

const getDetails = (beneficiary) => {
    return `${helpers.capitalizeWords((beneficiary.payment_type || '').replaceAll('_', ' '))}`;
};

const getBeneficiary = async (id) => {
    const beneficiary = await insuredsStore.getBeneficiary(
        insured.value.client_id,
        insured.value.id,
        id
    );
    return beneficiary.data;
};

const viewDetails = async (beneficiary) => {
    const beneficiaryData = { ...beneficiary };
    if (beneficiaryData?.payment_data) {
        beneficiaryData.payment_data = JSON.parse(beneficiary.payment_data);
    }

    if (
        beneficiary.type === selfEntityType &&
        beneficiary?.meta?.id === insured.value.id
    ) {
        beneficiaryData.meta = {
            ...beneficiaryData.meta,
            ...beneficiaryData.payment_data
        };
    } else {
        const data = await getBeneficiary(beneficiary.id);
        beneficiaryData.meta = {
            ...beneficiaryData.meta,
            ...data,
            ...beneficiaryData.payment_data
        };
    }

    emits('view', beneficiaryData);
};

const viewMoreList = () => {
    showMoreList.value = true;
};

const deleteAction = (beneficiary) => {
    if (ability.can(PolicyModulePermission.INSUREDS.BENEFICIARIES.DELETE)) {
        return () => emits('removeBeneficiary', beneficiary);
    } else {
        return null;
    }
};
</script>

<template>
    <ItemCard
        data-testid="insured-beneficiaries"
        v-for="(beneficiary, index) in beneficiaries.slice(0, 2)"
        :key="`beneficiary-${index}`"
        :title="beneficiary.meta?.full_name"
        :detailsLeft="getDetails(beneficiary)"
        :delete-action="deleteAction(beneficiary)"
        @click="viewDetails(beneficiary)"
    />

    <div v-if="beneficiaries?.length > 2">
        <Button
            data-testid="beneficiaries-more-button"
            link
            :label="$t('insured_overview.beneficiaries.view_all_beneficiaries')"
            @click="viewMoreList"
        />
    </div>

    <Dialog
        data-testid="beneficiaries-all-list"
        modal
        v-model:visible="showMoreList"
        class="w-7/12"
        :header="$t('insured_overview.beneficiaries.beneficiaries')"
    >
        <div
            v-for="(beneficiary, index) in beneficiaries"
            :key="index"
            class="mt-2"
        >
            <ItemCard
                data-testid="modal-insured-beneficiaries"
                :key="`modal-beneficiary-${index}`"
                :title="beneficiary.meta?.full_name"
                :detailsLeft="getDetails(beneficiary)"
                :delete-action="deleteAction(beneficiary)"
                @click="viewDetails(beneficiary)"
            />
        </div>
    </Dialog>
</template>
