<script setup>
import { useI18n } from 'vue-i18n';
import PeriodList from '@/modules/plans/components/plans/PeriodList.vue';
import AddPeriodDialog from '@/modules/plans/components/plans/dialogs/AddPeriodDialog.vue';
import { usePeriodManagement } from '@/modules/plans/composables/plans/usePeriodManagement';
import { usePlanStore } from '@/modules/plans/stores/Plan.js';

const planStore = usePlanStore();
const { t } = useI18n();

const fixedWindowPeriods = defineModel();

const {
    busy,
    showDialog,
    availablePeriods,
    canAddPeriods,
    openAddDialog,
    closeAddDialog,
    addSelectedPeriods,
    removePeriod,
    updatePeriod
} = usePeriodManagement(
    fixedWindowPeriods,
    planStore.mapPlanPeriodsToFixedWindowPeriods(planStore.currentPlan?.periods)
);

const columns = [
    {
        key: 'name',
        label: t('plans.enrolment_period'),
        width: 'col-3',
        type: 'text'
    },
    {
        key: 'start_date',
        label: t('plans.website_opt_out_start_date'),
        width: 'col-4',
        type: 'date'
    },
    {
        key: 'end_date',
        label: t('plans.website_opt_out_end_date'),
        width: 'col-4',
        type: 'date'
    },
    {
        key: 'actions',
        label: '',
        width: 'col-1',
        type: 'actions'
    }
];

const dialogColumns = columns.filter((col) => col.type !== 'actions');

const handlePeriodsSelected = (selectedPeriods) => {
    addSelectedPeriods(selectedPeriods);
};

const handleRemovePeriod = (period) => {
    removePeriod(period);
};

const handleUpdatePeriod = ({ period, field, value }) => {
    updatePeriod(period, field, value);
};
</script>

<template>
    <div>
        <PeriodList
            :periods="fixedWindowPeriods"
            :columns="columns"
            :allow-remove="true"
            :busy="busy"
            :empty-message="t('plans.no_periods_found')"
            field-id-prefix="fixed_window_periods"
            @remove-period="handleRemovePeriod"
            @update-period="handleUpdatePeriod"
        />

        <div class="flex justify-content-start mt-5">
            <Button
                icon="pi pi-plus"
                :label="t('plans.add_period')"
                text
                @click="openAddDialog"
                class="w-max"
                :disabled="!canAddPeriods"
                data-testid="add-period-button"
            />
        </div>

        <AddPeriodDialog
            v-model:visible="showDialog"
            :initial-available-periods="availablePeriods"
            :columns="dialogColumns"
            title="Add Period"
            width="80rem"
            @periods-selected="handlePeriodsSelected"
            @cancel="closeAddDialog"
        />
    </div>
</template>
