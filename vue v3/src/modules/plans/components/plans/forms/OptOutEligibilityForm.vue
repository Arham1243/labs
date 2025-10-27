<script setup>
import { useI18n } from 'vue-i18n';
import PeriodList from '@/modules/plans/components/plans/PeriodList.vue';
import AddPeriodDialog from '@/modules/plans/components/plans/dialogs/AddPeriodDialog.vue';
import { usePeriodManagement } from '@/modules/plans/composables/plans/usePeriodManagement';
import { usePlanStore } from '@/modules/plans/stores/Plan.js';
import {
    cancellationPeriodTypeOptions,
    cancellationPeriodUnitOptions
} from '@/config';

const { t } = useI18n();
const planStore = usePlanStore();

const eligibilityPeriods = defineModel();

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
    eligibilityPeriods,
    planStore.mapPlanPeriodsToEligibilityPeriods(planStore.currentPlan?.periods)
);

const columns = [
    {
        key: 'name',
        label: t('plans.enrolment_period'),
        width: 'col-2',
        type: 'text'
    },
    {
        key: 'start_date',
        label: t('plans.policies_from'),
        width: 'col-2',
        type: 'date'
    },
    {
        key: 'end_date',
        label: t('plans.policies_to'),
        width: 'col-2',
        type: 'date'
    },
    {
        key: 'allow_full_cancellation',
        label: t('plans.allow_full_cancellation'),
        width: 'col-1',
        type: 'switch'
    },
    {
        key: 'cancellation_period_type',
        label: t('plans.cancellation_dates'),
        width: 'col-2',
        type: 'dropdown',
        options: cancellationPeriodTypeOptions,
        optionLabel: 'name',
        optionValue: 'value',
        placeholder: 'Select'
    },
    {
        key: 'cancellation_period',
        label: t('plans.cancellation_period'),
        width: 'col-2',
        type: 'complex'
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
            :periods="eligibilityPeriods"
            :columns="columns"
            :allow-remove="true"
            :busy="busy"
            :empty-message="t('plans.no_periods_found')"
            field-id-prefix="eligibility_periods"
            @remove-period="handleRemovePeriod"
            @update-period="handleUpdatePeriod"
        >
            <template
                #cancellation_period="{
                    period,
                    updatePeriod,
                    fieldIdPrefix,
                    periodIndex
                }"
            >
                <div
                    v-if="period.cancellation_period_type === 'select'"
                    class="text-center"
                >
                    <p>N/A</p>
                </div>
                <div
                    v-else-if="period.cancellation_period_type === 'fixed_date'"
                >
                    <DatePicker
                        :id="`${fieldIdPrefix}.${periodIndex}.cancellation_period_date`"
                        :model-value="period.cancellation_period_date"
                        @update:model-value="
                            updatePeriod(
                                period,
                                'cancellation_period_date',
                                $event
                            )
                        "
                        data-testid="fixed-date-picker"
                    />
                </div>
                <div
                    v-else-if="
                        period.cancellation_period_type === 'opt_out_window'
                    "
                    class="flex gap-2"
                >
                    <div>
                        <InputField
                            :id="`${fieldIdPrefix}.${periodIndex}.cancellation_period_duration`"
                            :model-value="period.cancellation_period_duration"
                            @update:model-value="
                                updatePeriod(
                                    period,
                                    'cancellation_period_duration',
                                    $event
                                )
                            "
                            variant="number"
                            :min="0"
                            data-testid="period-value-input"
                            class="flex-1"
                        />
                    </div>
                    <div>
                        <InputField
                            :id="`${fieldIdPrefix}.${periodIndex}.cancellation_period_unit`"
                            :model-value="period.cancellation_period_unit"
                            @update:model-value="
                                updatePeriod(
                                    period,
                                    'cancellation_period_unit',
                                    $event
                                )
                            "
                            variant="dropdown"
                            :options="cancellationPeriodUnitOptions"
                            optionLabel="name"
                            optionValue="value"
                            data-testid="period-unit-dropdown"
                            class="flex-1"
                        />
                    </div>
                </div>
            </template>
        </PeriodList>

        <div class="flex justify-content-start mt-5">
            <Button
                icon="pi pi-plus"
                :label="t('plans.add_period')"
                text
                @click="openAddDialog"
                class="w-max"
                :disabled="!canAddPeriods"
                data-testid="new-period-button"
            />
        </div>

        <AddPeriodDialog
            v-model:visible="showDialog"
            :initial-available-periods="availablePeriods"
            :columns="dialogColumns"
            title="Add New Period"
            width="90rem"
            @periods-selected="handlePeriodsSelected"
            @cancel="closeAddDialog"
        >
            <template #dialog-cancellation_period="{ period, updatePeriod }">
                <div
                    v-if="period.cancellation_period_type === 'select'"
                    class="text-center"
                >
                    <p>N/A</p>
                </div>
                <div
                    v-else-if="period.cancellation_period_type === 'fixed_date'"
                    class="flex gap-2"
                >
                    <DatePicker
                        :model-value="period.cancellation_period_date"
                        @update:model-value="
                            updatePeriod(period, 'cancellation_date', $event)
                        "
                        data-testid="fixed-date-picker-dialog"
                    />
                </div>
                <div
                    v-else-if="
                        period.cancellation_period_type === 'opt_out_window'
                    "
                    class="flex gap-2"
                >
                    <InputField
                        :model-value="period.cancellation_period_duration"
                        @update:model-value="
                            updatePeriod(
                                period,
                                'cancellation_period_duration',
                                $event
                            )
                        "
                        variant="number"
                        :min="0"
                        data-testid="period-value-input-dialog"
                        class="flex-1"
                    />
                    <InputField
                        :model-value="period.cancellation_period_unit"
                        @update:model-value="
                            updatePeriod(
                                period,
                                'cancellation_period_unit',
                                $event
                            )
                        "
                        variant="dropdown"
                        :options="cancellationPeriodUnitOptions"
                        optionLabel="name"
                        optionValue="value"
                        placeholder="Select"
                        data-testid="period-unit-dropdown-dialog"
                        class="flex-1"
                    />
                </div>
            </template>
        </AddPeriodDialog>
    </div>
</template>
