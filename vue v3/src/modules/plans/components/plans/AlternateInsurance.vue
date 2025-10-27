<script setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Label from '@/components/common/Label.vue';
import OptOutPeriodDatesForm from '@/modules/plans/components/plans/forms/OptOutPeriodDatesForm.vue';
import OptOutEligibilityForm from '@/modules/plans/components/plans/forms/OptOutEligibilityForm.vue';
import { automaticCancellationConditions } from '@/config/enums.js';

defineProps({
    isNew: {
        type: Boolean,
        default: false
    }
});

const { t } = useI18n();

const formData = defineModel();

const isDataVisibilityTypeFixed = computed(
    () => formData.value.date_visibility_type === 'fixed_window'
);

const dateVisibilityTypeOptions = [
    { name: t('plans.opt_out_settings_fixed_window'), value: 'fixed_window' },
    { name: t('plans.opt_out_settings_open'), value: 'open' }
];

watch(
    () => formData.value.allow_automatic_cancellation,
    (newValue) => {
        if (!newValue) {
            formData.value.automatic_cancellation_condition = null;
        }
    }
);

watch(
    () => formData.value.automatic_cancellation_condition,
    (newValue) => {
        if (newValue !== 'custom_date') {
            formData.value.automatic_cancellation_custom_date = null;
        }
    }
);

const directRefundOptions = [
    {
        label: t('plans.direct_deposit'),
        value: 'direct deposit',
        info: 'lorem ipsum lorem ipsum lorem ipsum.'
    },
    {
        label: t('plans.cheque'),
        value: 'cheque',
        info: 'lorem ipsum lorem ipsum lorem ipsum.'
    },
    {
        label: t('plans.wire_transfer'),
        value: 'wire transfer',
        info: 'lorem ipsum lorem ipsum lorem ipsum.'
    }
];

const timeUnitOptions = [
    { name: 'Days', value: 'days' },
    { name: 'Weeks', value: 'weeks' },
    { name: 'Months', value: 'months' },
    { name: 'Years', value: 'years' }
];
</script>

<template>
    <h5 class="mb-2 mt-3">
        <Label test-id="page-title">
            {{ $t('plans.website_settings') }}
        </Label>
    </h5>
    <span>{{ $t('plans.website_settings_text') }}</span>

    <div class="p-fluid my-5">
        <InputField
            variant="selectButton"
            id="date_visibility_type"
            v-model="formData.date_visibility_type"
            :options="dateVisibilityTypeOptions"
            optionValue="value"
            optionLabel="name"
            aria-labelledby="basic"
        />
    </div>

    <div v-if="isDataVisibilityTypeFixed" class="col-12">
        <OptOutPeriodDatesForm v-model="formData.fixed_window_periods" />
    </div>

    <Divider class="mt-3 mb-7" v-if="isDataVisibilityTypeFixed" />

    <h5 class="mb-2">
        <Label test-id="page-title">{{ t('plans.opt_out_eligibility') }}</Label>
    </h5>
    <span>{{ t('plans.opt_out_eligibility_text') }}</span>

    <div class="col-12">
        <OptOutEligibilityForm v-model="formData.eligibility_periods" />
    </div>

    <Divider class="mt-3 mb-7" />

    <h5 class="mb-5">
        <Label test-id="page-title">
            {{ t('plans.automatic_cancellation') }}
        </Label>
    </h5>
    <div>
        <div class="flex align-items-center gap-3 mb-3">
            <InputSwitch
                id="allow_automatic_cancellation"
                v-model="formData.allow_automatic_cancellation"
                :false-value="false"
                :true-value="true"
                data-testid="automatic-cancellation-condition-switch"
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
            v-if="formData.allow_automatic_cancellation"
            class="radio-options-container mt-5"
            role="radiogroup"
        >
            <div class="flex flex-row gap-4 ml-4">
                <div
                    v-for="option in automaticCancellationConditions"
                    :key="option.value"
                    class="flex align-items-center"
                >
                    <RadioButton
                        :name="option.value"
                        :value="option.value"
                        v-model="formData.automatic_cancellation_condition"
                        data-testid="automatic-cancellation-condition-radio"
                    />
                    <label :for="option.value" class="ml-2">{{
                        option.name
                    }}</label>
                    <i
                        v-tooltip="option.info"
                        class="pi pi-info-circle ml-2 cursor-pointer"
                        :title="option.info"
                        v-if="option.info"
                    />
                </div>
                <InputField
                    variant="hidden"
                    id="automatic_cancellation_condition"
                    display="none"
                />
                <div
                    v-if="
                        formData.automatic_cancellation_condition ===
                        'custom_date'
                    "
                >
                    <DatePicker
                        id="automatic_cancellation_custom_date"
                        v-model="formData.automatic_cancellation_custom_date"
                        data-testid="custom-cancellation-date-picker"
                        placeholder="Select custom date"
                    />
                </div>
            </div>
        </div>
    </div>

    <Divider class="my-6" />

    <h5 class="mb-5">
        <Label test-id="page-title">
            {{ t('plans.manual_verification') }}
        </Label>
    </h5>
    <div class="flex">
        <div class="flex-1">
            <div class="flex align-items-center gap-3 mb-3">
                <InputSwitch
                    id="requires_alternate_insurance_info"
                    v-model="formData.requires_alternate_insurance_info"
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
                v-if="formData.requires_alternate_insurance_info"
                class="ml-6 mb-5"
            >
                <div class="flex flex-column gap-2">
                    <label>{{ t('plans.approved_plans') }}</label>
                    <InputField
                        variant="chips"
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
                    id="allow_opt_out_resubmissions"
                    v-model="formData.allow_opt_out_resubmissions"
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
                    id="requires_proof_of_coverage"
                    v-model="formData.requires_proof_of_coverage"
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
                    id="allow_direct_refund_to_student"
                    v-model="formData.allow_direct_refund_to_student"
                    :falseValue="false"
                    :trueValue="true"
                />
                <span>{{ t('plans.allow_direct_refund_to_student') }}</span>
                <i
                    v-tooltip="`lorem ipsum lorem ipsum lorem ipsum`"
                    class="pi pi-info-circle cursor-pointer"
                />
            </div>

            <div
                v-if="formData.allow_direct_refund_to_student"
                class="ml-6 mb-3"
            >
                <div class="flex flex-column gap-2">
                    <div
                        v-for="option in directRefundOptions"
                        :key="option.value"
                        class="flex align-items-center gap-2"
                    >
                        <Checkbox
                            v-model="formData.direct_refund_options"
                            :value="option.value"
                            data-testid="direct-deposit-checkbox"
                        />
                        <span>{{ option.label }}</span>
                        <i
                            v-tooltip="option.info"
                            class="pi pi-info-circle cursor-pointer"
                        />
                    </div>
                    <InputField
                        variant="hidden"
                        id="direct_refund_options"
                        display="none"
                    />
                </div>
            </div>

            <div class="flex align-items-center gap-3 mb-3">
                <InputSwitch
                    id="allow_late_opt_outs"
                    v-model="formData.allow_late_opt_outs"
                    :falseValue="false"
                    :trueValue="true"
                />
                <span>{{ t('plans.allow_late_opt_outs') }}</span>
                <i
                    v-tooltip="`lorem ipsum lorem ipsum lorem ipsum`"
                    class="pi pi-info-circle cursor-pointer"
                />
            </div>

            <div v-if="formData.allow_late_opt_outs" class="ml-6 mb-3">
                <div class="flex gap-2 align-items-center">
                    <div>
                        <InputField
                            id="late_opt_out_duration"
                            v-model="formData.late_opt_out_duration"
                            variant="number"
                            placeholder="Enter value"
                            data-testid="late-opt-out-value-input"
                            class="w-6rem"
                        />
                    </div>
                    <InputField
                        id="late_opt_out_unit"
                        v-model="formData.late_opt_out_unit"
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
