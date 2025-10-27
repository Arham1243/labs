<script setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useClaimStore } from '@/modules/claims/stores/index.js';
import { createClaimsCols } from '@/modules/claims/config/claims.js';
import { claimComponents } from '@/modules/claims/config/filter.js';
import ClaimBaseTable from '@/modules/claims/components/shared/ClaimBaseTable.vue';

const { t } = useI18n();
const router = useRouter();
const claimColumns = createClaimsCols(t);
const { searchClaims_, exportClaims } = useClaimStore();

const getColumns = (type) => {
    return claimColumns[type]?.() || [];
};

const handleRowSelect = (event) => {
    if (
        !event.originalEvent.target?.classList?.contains('p-radiobutton-box') &&
        !event.originalEvent.target?.parentElement?.classList?.contains(
            'p-radiobutton-icon'
        ) &&
        !event.originalEvent.target?.classList?.contains('p-radiobutton-icon')
    ) {
        // Navigate to the claim details page
        router.push(`/claims/${event.data.id}/client/${event.data.client_id}`);
    }
};
</script>

<template>
    <h4>{{ $t('claims.claims_list') }}</h4>
    <Card class="mt-5">
        <template #content>
            <ClaimBaseTable
                :module="t('claims.title')"
                :storeAction="searchClaims_"
                :exportAction="exportClaims"
                :columns="getColumns('regularCols')"
                :showExportButton="true"
                :onRowSelectAction="handleRowSelect"
                :filterComponents="claimComponents"
            />
        </template>
    </Card>
</template>

<style scoped lang="scss"></style>
