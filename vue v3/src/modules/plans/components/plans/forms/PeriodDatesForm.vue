<script setup>
import { computed, ref, watch } from 'vue';
import lodash from 'lodash';
import useEventsBus from '@/composables/event-bus';
import { usePlanStore } from '@/modules/plans/stores/Plan';
import PlanActionWithSinglePeriodsForm from '@/modules/plans/components/plans/forms/PlanActionWithSinglePeriodsForm.vue';
import PlanCancellationActionForm from '@/modules/plans/components/plans/forms/PlanCancellationActionForm.vue';

const props = defineProps({
    modelValue: {
        type: Object
    },
    isNew: {
        type: Boolean,
        default: false
    },
    validateDates: {
        type: Boolean,
        default: false
    }
});

const emits = defineEmits(['update:modelValue']);

const { emit } = useEventsBus();

const planStore = usePlanStore();
const busy = ref(false);

const formData = computed({
    get: () => props.modelValue,
    set: (value) => emits('update:modelValue', value)
});

watch(
    () => props.modelValue,
    (value) => {
        emit('periodsUpdated', value);
    },
    { deep: true }
);

const addPeriod = () => {
    if (formData.value.periods.length < 10) {
        formData.value.periods.push({
            id: null,
            name: '',
            start_date: null,
            end_date: null
        });
    }
};

const removePeriod = async (item) => {
    const periodIndex = formData.value.periods.indexOf(item);
    if (item.id === null || !props.validateDates) {
        formData.value.periods.splice(periodIndex, 1);
        return;
    }

    let formDataReplica = lodash.cloneDeep(formData.value);
    formDataReplica.validateDates = true;
    try {
        busy.value = true;
        formDataReplica.periods.splice(periodIndex, 1);
        await planStore.updatePlan(
            formDataReplica.id,
            planStore.transferPayload(formDataReplica)
        );
    } catch (error) {
        return;
    } finally {
        busy.value = false;
    }
    formData.value.periods.splice(periodIndex, 1);
};
</script>
<template>
    <div class="mt-4">
        <div
            v-for="(item, i) in formData.periods"
            :key="i"
            class="p-fluid formgrid grid"
        >
            <div class="field col-3">
                <label
                    data-testid="period-name-label"
                    :for="`periods.${i}.name`"
                    >{{ $t('common.period_name') + ' *' }}</label
                >
                <InputField
                    data-testid="period-name-input"
                    :id="`periods.${i}.name`"
                    variant="text"
                    v-model="item.name"
                />
            </div>
            <div class="field col-4">
                <label
                    data-testid="start-date-label"
                    :for="`periods.${i}.start_date`"
                    >{{ $t('common.start_date') + ' *' }}</label
                >
                <DatePicker
                    data-testid="start-date-input"
                    :id="`periods.${i}.start_date`"
                    v-model="item.start_date"
                />
            </div>
            <div class="field col-4">
                <label
                    data-testid="end-date-label"
                    :for="`periods.${i}.end_date`"
                    >{{ $t('common.end_date') + ' *' }}</label
                >
                <DatePicker
                    data-testid="end-date-input"
                    :id="`periods.${i}.end_date`"
                    v-model="item.end_date"
                />
            </div>
            <div class="field col-1">
                <Button
                    :disabled="busy"
                    icon="pi pi-trash"
                    class="mt-4 p-button-rounded p-button-outlined"
                    @click="removePeriod(item)"
                    style="color: red"
                    data-testid="remove-period-button"
                />
            </div>
        </div>
        <div
            class="flex justify-content-end"
            v-if="formData.periods.length < 10"
        >
            <Button
                icon="pi pi-plus"
                label="Add Period"
                text
                @click="addPeriod"
                class="w-max"
                data-testid="add-period-button"
            />
        </div>
        <hr />
        <div class="p-fluid formgrid grid mt-4">
            <div class="field col-12">
                <div class="flex">
                    <InputSwitch
                        v-model="formData.enforce_start_date"
                        :falseValue="false"
                        :trueValue="true"
                        data-testid="enforce-start-date-input"
                    />
                    <span
                        data-testid="enforce-start-date-label"
                        class="ml-2 mt-1"
                    >
                        {{ $t('plans.enforce_start_date') }}
                    </span>
                </div>
            </div>
            <div class="field col-12">
                <div class="flex mt-3">
                    <InputSwitch
                        v-model="formData.enforce_end_date"
                        :falseValue="false"
                        :trueValue="true"
                        data-testid="enforce-end-date-input"
                    />
                    <span
                        data-testid="enforce-end-date-label"
                        class="ml-2 mt-1"
                    >
                        {{ $t('plans.enforce_end_date') }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>
