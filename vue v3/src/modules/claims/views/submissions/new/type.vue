<script setup>
import { reactive, ref, watch } from 'vue';
import { cfg } from '@/modules/claims/utils/submissions';
import LabelField from '@/modules/claims/components/forms/LabelField.vue';
import { useRoute, useRouter } from 'vue-router';
import { useSubmissionStore } from '@/modules/claims/stores/Submission';

const route = useRoute();
const router = useRouter();

const { newSubmission } = useSubmissionStore();

const step = cfg.claims_process.claimSteps[0];
const formData = reactive({});

// Set form values from store
Object.keys(newSubmission.value.formData?.type || {}).forEach((key) => {
    formData[key] = newSubmission.value.formData.type[key];
});

watch(
    () => formData,
    () => {
        newSubmission.value.formData.type = {
            ...newSubmission.value.formData.type,
            ...formData
        };

        newSubmission.value.claim_type = formData.claim_type;
        newSubmission.value.claim_type_details = formData.claim_type_details;
    },
    { deep: true, immediate: true }
);
</script>
<template>
    <h3 data-testid="heading-claim-type">{{ step.description }}</h3>
    <div class="card flex mt-5 mb-0 flex-column gap-3">
        <template v-for="field in step.fields" :key="field.label">
            <LabelField :field="field" v-model="formData.claim_type" />

            <div
                v-if="
                    formData.claim_type && field.condition[formData.claim_type]
                "
            >
                <divider />
                <h4
                    v-if="field.condition[formData.claim_type].title"
                    class="text-xl mb-2"
                    data-testid="text-claim-type-details-title"
                    v-html="field.condition[formData.claim_type].title"
                />
                <div
                    v-if="field.condition[formData.claim_type].description"
                    v-html="field.condition[formData.claim_type].description"
                    data-testid="text-claim-type-details-description"
                />
                <template
                    v-for="field_ in field.condition[formData.claim_type]
                        .fields"
                    :key="field_.label"
                >
                    <LabelField
                        :field="field_"
                        v-model="formData.claim_type_details"
                    />
                    <div
                        class="flex flex-column"
                        v-if="field_.condition[formData.claim_type_details]"
                    >
                        <divider class="mt-5" />
                        <p
                            v-if="
                                field_.condition[formData.claim_type_details]
                                    .description
                            "
                            v-text="
                                field_.condition[formData.claim_type_details]
                                    .description
                            "
                        />
                        <template
                            v-for="field__ in field_.condition[
                                formData.claim_type_details
                            ].fields"
                            :key="field__.label"
                        >
                            <LabelField
                                :field="field__"
                                v-model="formData.claim_type_details"
                            />
                        </template>
                    </div>
                </template>
            </div>
        </template>
    </div>
</template>
