<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
    modelValue: {
        type: Object
    }
});

const emit = defineEmits(['update:modelValue']);
const { t } = useI18n();

const timeUnitOptions = [
    { name: 'Days', value: 'days' },
    { name: 'Weeks', value: 'weeks' },
    { name: 'Months', value: 'months' },
    { name: 'Years', value: 'years' }
];

const updateModelValue = (key, value) => {
    emit('update:modelValue', {
        ...props.modelValue,
        [key]: value
    });
};

const updateRefundMethod = (method, isChecked) => {
    const currentMethods = props.modelValue?.refund_methods || [];
    let updatedMethods;

    if (isChecked) {
        updatedMethods = [...currentMethods, method];
    } else {
        updatedMethods = currentMethods.filter((m) => m !== method);
    }

    updateModelValue('refund_methods', updatedMethods);
};

const isRefundMethodSelected = (method) => {
    const methods = props.modelValue?.refund_methods || [];
    return methods.includes(method);
};
</script>

<template>
    <div class="flex">
        <div class="flex-1">
            <div class="flex align-items-center gap-3 mb-3">
                <InputSwitch
                    :model-value="
                        props.modelValue?.requires_alternate_insurance || false
                    "
                    @update:model-value="
                        updateModelValue('requires_alternate_insurance', $event)
                    "
                    :falseValue="false"
                    :trueValue="true"
                />
                <span>{{ t('plans.requires_alternate_insurance_info') }}</span>
                <i
                    v-tooltip="`lorem ipsum lorem ipsum lorem ipsum`"
                    class="pi pi-info-circle cursor-pointer"
                />
            </div>

            <div
                v-if="props.modelValue?.requires_alternate_insurance"
                class="ml-6 mb-5"
            >
                <div class="flex flex-column gap-2">
                    <label>{{ t('plans.approved_plans') }}</label>
                    <InputField
                        variant="chips"
                        :model-value="props.modelValue?.approved_plans || []"
                        @update:model-value="
                            updateModelValue('approved_plans', $event)
                        "
                        :placeholder="
                            t('plans.press_enter_after_each_name_to_add')
                        "
                        data-testid="approved-plans-chips"
                        class="custom-chips"
                    />
                </div>
            </div>

            <div class="flex align-items-center gap-3 mb-3">
                <InputSwitch
                    :model-value="
                        props.modelValue?.allow_opt_out_resubmissions || false
                    "
                    @update:model-value="
                        updateModelValue('allow_opt_out_resubmissions', $event)
                    "
                    :falseValue="false"
                    :trueValue="true"
                />
                <span>{{ t('plans.allow_opt_out_resubmissions') }}</span>
                <i
                    v-tooltip="`lorem ipsum lorem ipsum lorem ipsum`"
                    class="pi pi-info-circle cursor-pointer"
                />
            </div>
            <div class="flex align-items-center gap-3 mb-3">
                <InputSwitch
                    :model-value="
                        props.modelValue?.requires_proof_of_coverage || false
                    "
                    @update:model-value="
                        updateModelValue('requires_proof_of_coverage', $event)
                    "
                    :falseValue="false"
                    :trueValue="true"
                />
                <span>{{ t('plans.requires_proof_of_coverage') }}</span>
                <i
                    v-tooltip="`lorem ipsum lorem ipsum lorem ipsum`"
                    class="pi pi-info-circle cursor-pointer"
                />
            </div>
        </div>
        <div class="flex-1">
            <div class="flex align-items-center gap-3 mb-3">
                <InputSwitch
                    :model-value="
                        props.modelValue?.allow_direct_refund || false
                    "
                    @update:model-value="
                        updateModelValue('allow_direct_refund', $event)
                    "
                    :falseValue="false"
                    :trueValue="true"
                />
                <span>{{ t('plans.allow_direct_refund_to_student') }}</span>
                <i
                    v-tooltip="`lorem ipsum lorem ipsum lorem ipsum`"
                    class="pi pi-info-circle cursor-pointer"
                />
            </div>

            <div v-if="props.modelValue?.allow_direct_refund" class="ml-6 mb-3">
                <div class="flex flex-column gap-2">
                    <div class="flex align-items-center gap-2">
                        <Checkbox
                            :model-value="
                                isRefundMethodSelected('direct_deposit')
                            "
                            @update:model-value="
                                updateRefundMethod('direct_deposit', $event)
                            "
                            :binary="true"
                            data-testid="direct-deposit-checkbox"
                        />
                        <span>{{ t('plans.direct_deposit') }}</span>
                        <i
                            v-tooltip="`lorem ipsum lorem ipsum lorem ipsum`"
                            class="pi pi-info-circle cursor-pointer"
                        />
                    </div>
                    <div class="flex align-items-center gap-2">
                        <Checkbox
                            :model-value="isRefundMethodSelected('cheque')"
                            @update:model-value="
                                updateRefundMethod('cheque', $event)
                            "
                            :binary="true"
                            data-testid="cheque-checkbox"
                        />
                        <span>{{ t('plans.cheque') }}</span>
                        <i
                            v-tooltip="`lorem ipsum lorem ipsum lorem ipsum`"
                            class="pi pi-info-circle cursor-pointer"
                        />
                    </div>
                    <div class="flex align-items-center gap-2">
                        <Checkbox
                            :model-value="
                                isRefundMethodSelected('wire_transfer')
                            "
                            @update:model-value="
                                updateRefundMethod('wire_transfer', $event)
                            "
                            :binary="true"
                            data-testid="wire-transfer-checkbox"
                        />
                        <span>{{ t('plans.wire_transfer') }}</span>
                        <i
                            v-tooltip="`lorem ipsum lorem ipsum lorem ipsum`"
                            class="pi pi-info-circle cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            <div class="flex align-items-center gap-3 mb-3">
                <InputSwitch
                    :model-value="
                        props.modelValue?.allow_late_opt_outs || false
                    "
                    @update:model-value="
                        updateModelValue('allow_late_opt_outs', $event)
                    "
                    :falseValue="false"
                    :trueValue="true"
                />
                <span>{{ t('plans.allow_late_opt_outs') }}</span>
                <i
                    v-tooltip="`lorem ipsum lorem ipsum lorem ipsum`"
                    class="pi pi-info-circle cursor-pointer"
                />
            </div>

            <div v-if="props.modelValue?.allow_late_opt_outs" class="ml-6 mb-3">
                <div class="flex gap-2 align-items-center">
                    <InputField
                        :model-value="props.modelValue?.late_opt_out_value || 0"
                        @update:model-value="
                            updateModelValue('late_opt_out_value', $event)
                        "
                        variant="number"
                        placeholder="Enter value"
                        data-testid="late-opt-out-value-input"
                        class="w-6rem"
                    />
                    <InputField
                        :model-value="
                            props.modelValue?.late_opt_out_unit || 'days'
                        "
                        @update:model-value="
                            updateModelValue('late_opt_out_unit', $event)
                        "
                        variant="dropdown"
                        :options="timeUnitOptions"
                        optionLabel="name"
                        optionValue="value"
                        data-testid="late-opt-out-unit-dropdown"
                        class="w-8rem"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<style>
.custom-chips .p-inputtext {
    width: 400px;
}
</style>
