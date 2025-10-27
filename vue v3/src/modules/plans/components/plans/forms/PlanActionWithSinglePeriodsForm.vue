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
    },
    planAction: {
        type: String
    },
    planActionType: {
        type: String
    }
});

const emit = defineEmits(['update:modelValue']);

const { t } = useI18n();

const formData = ref(props.modelValue);

let lastTypeValue = formData.value[props.planActionType];

watch(formData, (value) => {
    emit('update:modelValue', value);
});

const policyActionTypesOptions = [
    { name: t('common.policy_action_type_fixed'), value: 'fixed' },
    { name: t('common.policy_action_type_open'), value: 'open' }
];

const reIndexPlanAction = () => {
    formData.value[props.planAction] = formData.value[props.planAction].map(
        (item, index) => {
            return { ...item, id: index };
        }
    );
};

reIndexPlanAction();

const addPeriod = () => {
    if (formData.value[props.planAction].length < 10) {
        formData.value[props.planAction].push({
            id: formData.value[props.planAction].length,
            name: '',
            days: null,
            plan_period_precedence: null,
            plan_period_date_reference: null
        });
    }
};

const removePeriod = (id) => {
    formData.value[props.planAction] = formData.value[props.planAction].filter(
        (period) => period.id !== id
    );
    reIndexPlanAction();
};

const updatePeriod = (id, updatedPeriod) => {
    const index = formData.value[props.planAction].findIndex(
        (period) => period.id === id
    );
    if (index !== -1) {
        formData.value[props.planAction][index] = { ...updatedPeriod };
    }
};

const preventEmpty = (event) => {
    if (event.value !== null) {
        lastTypeValue = event.value;
    }
    if (event.value === null) {
        formData.value[props.planActionType] = lastTypeValue;
    }
};
</script>
<template>
    <div class="field col-6 mt-4 p-0">
        <InputField
            variant="selectButton"
            :id="props.planActionType"
            v-model="formData[props.planActionType]"
            :options="policyActionTypesOptions"
            optionLabel="name"
            aria-labelledby="basic"
            @change="preventEmpty"
            data-testid="cancellation_type"
        />
    </div>
    <div v-if="formData[props.planActionType]?.value === 'fixed'">
        <div
            v-if="formData.periods.length === 0"
            class="my-2 p-3 message-danger"
            data-testid="warning-message"
        >
            <i class="pi pi-times-circle mr-2"></i>
            <span>{{ $t('common.no_plan_periods') }}</span>
        </div>
        <div>
            <PolicyCancellationDatesForm
                v-for="item in formData[props.planAction]"
                :key="item.id"
                :modelValue="item"
                :isNew="props.isNew"
                @remove="removePeriod(item.id)"
                @update:modelValue="updatePeriod(item.id, $event)"
                :periods="formData.periods"
                :periodName="props.planAction"
            />
            <div
                style="width: 150px"
                class="mb-3"
                v-if="formData[props.planAction]?.length < 10"
            >
                <Button
                    icon="pi pi-plus"
                    label="New Period"
                    text
                    @click="addPeriod()"
                    :disabled="formData.periods.length === 0"
                    data-testid="add-period"
                />
            </div>
        </div>
    </div>
</template>
