<script setup>
import LabelField from '@/modules/claims/components/forms/LabelField.vue';
import { reactive, ref, watch } from 'vue';
import { cfg_adjudication } from '@/modules/claims/utils/adjudication';
import { cloneObj, validateForm } from '@/modules/claims/utils/helper';
import { useAdjudicationQueueStore } from '@/modules/claims/stores/AdjudicationQueue';
import { useRoute } from 'vue-router';

const route = useRoute();
const props = defineProps({
    queueId: { type: [String, Number], default: null }
});

const {
    mutateAdjudicationQueue,
    getAdjudicationQueue,
    currentAdjudicationQueue
} = useAdjudicationQueueStore();
const { mutate, loading, status } = mutateAdjudicationQueue();
getAdjudicationQueue(props.queueId);

// const formData = defineModel({ default: {} });
let formData = reactive({
    name: '',
    description: '',
    start_at: '',
    end_at: null,
    audit_frequency: null,
    validate: false
});
const fields = ref(cfg_adjudication[0].fields);

let freq_error = ref(false);

watch(
    () => formData,
    () => {
        if (formData?.start_at) {
            let endAtIndex = fields.value.findIndex(
                ({ props }) => props.name === 'end_at'
            );
            // fields.value[endAtIndex].props.minDate = formData.start_at;

            if (formData.end_at && formData.end_at < formData.start_at)
                formData.end_at = '';
        }
        if (!formData?.start_at) formData.end_at = '';
    },
    { immediate: true, deep: true }
);

watch(
    () => formData.audit_frequency,
    () => {
        freq_error.value = formData.audit_frequency === null;
    }
);

// Updating form field with appropriate data
watch(
    () => currentAdjudicationQueue,
    () => {
        // reset values
        Object.keys(formData || {}).forEach((key) => {
            formData[key] = key === 'audit_frequency' ? null : '';
        });

        if (currentAdjudicationQueue?.value && props.queueId) {
            let que = cloneObj(currentAdjudicationQueue.value);
            Object.keys(formData || {}).forEach((key) => {
                formData[key] =
                    key === 'start_at' || key === 'end_at'
                        ? que[key]
                            ? new Date(que[key] + 'T12:59:59')
                            : null
                        : que[key];
            });
        }
    },
    { immediate: true, deep: true }
);

const submit = () => {
    // console.log({ formData });
    let valid = validateForm(fields.value, formData);
    if (formData.audit_frequency === null) freq_error.value = true;
    else if (valid)
        mutate({ payload: formData, queueId: props.queueId ?? route.query.id });
};

defineExpose({ submit, loading, status });
</script>

<template>
    <div class="flex flex-wrap">
        <LabelField
            v-for="field in fields"
            :key="field.label"
            :field="field"
            v-model="formData[field.props.name]"
            v-model:validate="formData.validate"
        />

        <div class="p-3" data-testid="text-audit-frequency">
            Send claims for audit, every &nbsp;
            <InputNumber
                v-model="formData.audit_frequency"
                class="w-4rem"
                :class="{ 'border-red-500 border-1 border-round': freq_error }"
                :min="0"
                data-testid="input-audit-frequency"
            />&nbsp; claims
            <small
                v-if="freq_error"
                class="text-red-500 block"
                v-text="'Audit frequency is required'"
                data-testid="text-error-audit-frequency"
            />
        </div>
    </div>
</template>
