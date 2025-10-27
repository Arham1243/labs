<script setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
    modelValue: {
        type: Boolean,
        required: true
    },
    infoText: {
        type: String,
        default: ''
    },
    switchTestId: {
        type: String,
        default: 'toggle-switch'
    },
    disabled: {
        type: Boolean,
        default: false
    },
    showInfoIcon: {
        type: Boolean,
        default: true
    }
});

const emit = defineEmits(['update:modelValue']);
const { t } = useI18n();

const switchValue = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});

const automaticCancellationOptions = [
    {
        label: t('plans.alternate_insurance_full_coverage'),
        value: 'full_coverage',
        info: 'lorem ipsum lorem ipsum lorem ipsum.'
    },
    {
        label: t('plans.alternate_insurance_partial_coverage'),
        value: 'partial_coverage',
        info: 'lorem ipsum lorem ipsum lorem ipsum.'
    },
    {
        label: t('plans.alternate_insurance_custom_date'),
        value: 'custom_date',
        info: 'lorem ipsum lorem ipsum lorem ipsum.'
    }
];

const internalRadioValue = ref(null);
const internalCustomDate = ref(null);

watch(switchValue, (newValue) => {
    if (!newValue) {
        internalRadioValue.value = null;
        internalCustomDate.value = null;
    }
});

watch(internalRadioValue, (newValue) => {
    if (newValue !== 'custom_date') {
        internalCustomDate.value = null;
    }
});

const switchId = computed(() => `switch-${props.switchTestId}`);
const radioGroupId = computed(
    () => `radio-group-${props.switchTestId}-cancellation`
);
</script>

<template>
    <div>
        <div class="flex align-items-center gap-3 mb-3">
            <InputSwitch
                :id="switchId"
                v-model="switchValue"
                :false-value="false"
                :true-value="true"
                :disabled="disabled"
                :data-testid="switchTestId"
            />

            <label>
                {{ t('plans.allow_condition_for_automatic_cancellation') }}
            </label>
            <i
                class="pi pi-info-circle info-icon cursor-pointer"
                v-tooltip="`lorem ipsum lorem ipsum lorem ipsum`"
            />
        </div>
        <div
            v-if="switchValue"
            class="radio-options-container mt-5"
            :id="radioGroupId"
            role="radiogroup"
            :aria-labelledby="switchId"
        >
            <div class="flex flex-row gap-4 ml-4">
                <div
                    v-for="option in automaticCancellationOptions"
                    :key="option.value"
                    class="flex align-items-center"
                >
                    <RadioButton
                        :id="`radio-${option.value}`"
                        :name="radioGroupId"
                        :value="option.value"
                        v-model="internalRadioValue"
                        :disabled="disabled"
                        :data-testid="`radio-${option.value}`"
                    />
                    <label :for="`radio-${option.value}`" class="ml-2">{{
                        option.label
                    }}</label>
                    <i
                        v-tooltip="option.info"
                        class="pi pi-info-circle ml-2 cursor-pointer"
                        :title="option.info"
                        v-if="option.info"
                    />
                </div>
                <div v-if="internalRadioValue === 'custom_date'">
                    <DatePicker
                        v-model="internalCustomDate"
                        data-testid="custom-cancellation-date-picker"
                        placeholder="Select custom date"
                        :disabled="disabled"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
