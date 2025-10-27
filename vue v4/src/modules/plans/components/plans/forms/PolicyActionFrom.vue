<script setup>
import { computed, ref, watch } from 'vue';
import PlanCancellationActionForm from './PlanCancellationActionForm.vue';
import PlanActionWithSinglePeriodsForm from './PlanActionWithSinglePeriodsForm.vue';

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

const formData = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});
</script>
<template>
    <div class="grid grid-cols-12 mt-4 gap-4">
        <div class="col-span-12">
            <div class="flex align-center">
                <InputField
                    variant="switch"
                    v-model="formData.is_cancellations"
                    :falseValue="false"
                    :trueValue="true"
                    data-testid="is_cancellations"
                />
                <span class="ml-2 mt-1">
                    {{ $t('common.cancellations') }}
                </span>
            </div>
            <PlanCancellationActionForm
                v-if="formData.is_cancellations"
                v-model="formData"
                is-new
            />
        </div>
        <div class="col-span-12">
            <div class="flex">
                <InputField
                    variant="switch"
                    v-model="formData.is_extensions"
                    :falseValue="false"
                    :trueValue="true"
                    data-testid="is_extensions"
                />
                <span class="ml-2 mt-1"> {{ $t('common.extensions') }} </span>
            </div>
            <PlanActionWithSinglePeriodsForm
                v-if="formData.is_extensions"
                v-model="formData"
                is-new
                planAction="extension_periods"
                planActionType="extension_type"
            />
        </div>
        <div class="col-span-12">
            <div class="flex">
                <InputField
                    variant="switch"
                    v-model="formData.is_early_returns"
                    :falseValue="false"
                    :trueValue="true"
                    data-testid="is_early_returns"
                />
                <span class="ml-2 mt-1">{{ $t('common.early_returns') }}</span>
            </div>
            <PlanActionWithSinglePeriodsForm
                v-if="formData.is_early_returns"
                v-model="formData"
                is-new
                planAction="early_return_periods"
                planActionType="early_return_type"
            />
        </div>
        <div class="col-span-12">
            <div class="flex">
                <InputField
                    variant="switch"
                    v-model="formData.is_opt_out"
                    :falseValue="false"
                    :trueValue="true"
                    data-testid="is_opt_out"
                />
                <span class="ml-2 mt-1">{{ $t('common.opt_out') }}</span>
            </div>
        </div>
        <div class="col-span-12">
            <div class="flex">
                <InputField
                    variant="switch"
                    v-model="formData.is_overlap"
                    :falseValue="false"
                    :trueValue="true"
                    data-testid="is_overlap"
                />
                <span class="ml-2 mt-1">{{ $t('common.overlap') }}</span>
            </div>
        </div>
        <div class="col-span-12">
            <div class="flex">
                <InputField
                    variant="switch"
                    v-model="formData.is_refundable"
                    :falseValue="false"
                    :trueValue="true"
                    data-testid="is_refundable"
                />
                <span class="ml-2 mt-1">{{ $t('common.refundable') }}</span>
            </div>
        </div>
    </div>
</template>
