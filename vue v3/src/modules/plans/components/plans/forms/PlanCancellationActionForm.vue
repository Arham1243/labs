<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import PolicyCancellationDatesForm from './PolicyCancellationDatesForm.vue';

const props = defineProps({
    modelValue: {
        type: Object
    },
    isNew: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue']);

const { t } = useI18n();

const formData = ref(props.modelValue);

let lastTypeValue = formData.value.cancellation_type;

const fullCancellation = ref(
    formData.value.cancellation_periods.filter((item) => item.type === 'full')
        .length > 0
);

const partialCancellation = ref(
    formData.value.cancellation_periods.filter(
        (item) => item.type === 'partial'
    ).length > 0
);

watch(formData, (value) => {
    emit('update:modelValue', value);
});

const policyActionTypesOptions = [
    { name: t('common.policy_action_type_fixed'), value: 'fixed' },
    { name: t('common.policy_action_type_open'), value: 'open' }
];

const reIndexCancellationPeriods = () => {
    formData.value.cancellation_periods =
        formData.value.cancellation_periods.map((item, index) => {
            return { ...item, id: index };
        });
};

reIndexCancellationPeriods();

const addPeriod = (type) => {
    if (formData.value.cancellation_periods.length < 10) {
        formData.value.cancellation_periods.push({
            id: formData.value.cancellation_periods.length,
            name: '',
            days: null,
            type: type,
            plan_period_precedence: null,
            plan_period_date_reference: null
        });
    }
};

const removePeriod = (id) => {
    formData.value.cancellation_periods =
        formData.value.cancellation_periods.filter(
            (period) => period.id !== id
        );
    reIndexCancellationPeriods();
};

const updatePeriod = (id, updatedPeriod) => {
    const index = formData.value.cancellation_periods.findIndex(
        (period) => period.id === id
    );
    if (index !== -1) {
        formData.value.cancellation_periods[index] = { ...updatedPeriod };
    }
};

const preventEmpty = (event) => {
    if (event.value !== null) {
        lastTypeValue = event.value;
    }
    if (event.value === null) {
        formData.value.cancellation_type = lastTypeValue;
    }
};
</script>
<template>
    <div class="field col-6 mt-4 p-0">
        <InputField
            variant="selectButton"
            id="cancellation_type"
            v-model="formData.cancellation_type"
            :options="policyActionTypesOptions"
            optionLabel="name"
            aria-labelledby="basic"
            @change="preventEmpty"
            data-testid="cancellation_type"
        />
    </div>
    <div v-if="formData.cancellation_type?.value === 'fixed'">
        <div
            v-if="formData.periods.length === 0"
            class="my-2 p-3 message-danger"
        >
            <i class="pi pi-times-circle mr-2"></i>
            <span>{{ $t('common.no_plan_periods') }}</span>
        </div>
        <div class="field col-12 p-0">
            <div class="flex">
                <InputSwitch
                    v-model="fullCancellation"
                    :falseValue="false"
                    :trueValue="true"
                    :disabled="formData.periods.length === 0"
                    data-testid="full_cancellation"
                />
                <span class="ml-2 mt-1">{{
                    $t('common.full_cancellation_eligibility')
                }}</span>
            </div>
        </div>
        <div v-if="fullCancellation">
            <PolicyCancellationDatesForm
                v-for="item in formData.cancellation_periods.filter(
                    (item) => item.type === 'full'
                )"
                :key="item.id"
                :modelValue="item"
                :isNew="props.isNew"
                @remove="removePeriod(item.id)"
                @update:modelValue="updatePeriod(item.id, $event)"
                :periods="formData.periods"
                periodName="cancellation_periods"
            />
            <div
                style="width: 150px"
                class="mb-3"
                v-if="formData.cancellation_periods.length < 10"
            >
                <Button
                    icon="pi pi-plus"
                    label="New Period"
                    text
                    :disabled="formData.periods.length === 0"
                    @click="addPeriod('full')"
                    data-testid="new-period-button"
                />
            </div>
        </div>

        <div class="field col-12 p-0">
            <div class="flex">
                <InputSwitch
                    v-model="partialCancellation"
                    :falseValue="false"
                    :trueValue="true"
                    :disabled="formData.periods.length === 0"
                    data-testid="partial_cancellation"
                />
                <span class="ml-2 mt-1">{{
                    $t('common.partial_cancellation_eligibility')
                }}</span>
            </div>
        </div>
        <div v-if="partialCancellation">
            <PolicyCancellationDatesForm
                v-for="item in formData.cancellation_periods.filter(
                    (item) => item.type === 'partial'
                )"
                :key="item.id"
                :modelValue="item"
                :isNew="props.isNew"
                @remove="removePeriod(item.id)"
                @update:modelValue="updatePeriod(item.id, $event)"
                :periods="formData.periods"
                periodName="cancellation_periods"
            />
            <div
                style="width: 150px"
                class="mb-2"
                v-if="formData.cancellation_periods.length < 10"
            >
                <Button
                    icon="pi pi-plus"
                    label="New Period"
                    text
                    :disabled="formData.periods.length === 0"
                    @click="addPeriod('partial')"
                    data-testid="new-period-button"
                />
            </div>
        </div>
    </div>
</template>
