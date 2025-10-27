import { ref, computed } from 'vue';
import lodash from 'lodash';

export function usePeriodManagement(formDataPeriods, allPlanPeriods) {
    const busy = ref(false);
    const showDialog = ref(false);
    const selectedPeriods = ref([]);

    const availablePeriods = computed(() => {
        const currentPeriodIds =
            formDataPeriods.value?.map((p) => p.plan_period_id) || [];

        return lodash
            .cloneDeep(allPlanPeriods)
            .filter(
                (period) => !currentPeriodIds.includes(period.plan_period_id)
            );
    });

    const canAddPeriods = computed(() => {
        const currentCount = formDataPeriods.value.length;
        const maxPeriods = 10;
        return currentCount < maxPeriods && availablePeriods.value.length > 0;
    });

    const openAddDialog = () => {
        if (canAddPeriods.value) {
            selectedPeriods.value = [];
            showDialog.value = true;
        }
    };

    const closeAddDialog = () => {
        selectedPeriods.value = [];
        showDialog.value = false;
    };

    const addSelectedPeriods = (periodsToAdd) => {
        if (!formDataPeriods.value) {
            formDataPeriods.value = [];
        }

        periodsToAdd.forEach((period) => {
            formDataPeriods.value.push(period);
        });

        closeAddDialog();
    };

    const removePeriod = (periodToRemove) => {
        formDataPeriods.value = formDataPeriods.value.filter(
            (p) => p.plan_period_id !== periodToRemove.plan_period_id
        );
    };

    const updatePeriod = (periodToUpdate, field, value) => {
        const formDataPeriodToUpdate = formDataPeriods.value.find(
            (p) => p.plan_period_id === periodToUpdate.plan_period_id
        );

        if (formDataPeriodToUpdate) {
            formDataPeriodToUpdate[field] = value;
        }
    };

    return {
        busy,
        showDialog,
        selectedPeriods,
        availablePeriods,
        canAddPeriods,
        openAddDialog,
        closeAddDialog,
        addSelectedPeriods,
        removePeriod,
        updatePeriod
    };
}

export const getColumnProps = (column, period) => {
    const baseProps = {
        'data-testid': `${column.key}-input`
    };

    switch (column.type) {
        case 'select':
            return {
                ...baseProps,
                variant: 'select',
                options: column.options || [],
                optionLabel: column.optionLabel || 'name',
                optionValue: column.optionValue || 'value',
                placeholder: column.placeholder || 'Select'
            };
        case 'switch':
            return {
                ...baseProps,
                falseValue: false,
                trueValue: true
            };
        case 'text':
            return {
                ...baseProps,
                variant: 'text'
            };
        default:
            return baseProps;
    }
};
