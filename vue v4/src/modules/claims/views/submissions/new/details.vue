<script setup>
import { reactive, ref, watch } from 'vue';
import LabelField from '@/modules/claims/components/forms/LabelField.vue';
import { useRouter } from 'vue-router';
import { cfg } from '@/modules/claims/utils/submissions';
import { useGeneralStore } from '@/modules/claims/stores/General';
import { useSubmissionStore } from '@/modules/claims/stores/Submission';

const router = useRouter();
import { useHelpers } from '@/composables';
import { useClaimPolicyStore } from '@/modules/claims/stores/Policy';
import SubmissionExpenseForm from '@/modules/claims/components/submissions/SubmissionExpenseForm.vue';
const helpers = useHelpers();

const { currentPolicy } = useClaimPolicyStore();

const { currencies, getCurrencies } = useGeneralStore();
const { loading: loadingCurrency } = getCurrencies();

// Handling Form Data
const { newSubmission } = useSubmissionStore();
const formData = reactive({});

let step = ref(cfg.claims_process.claimSteps[1]);

// Set form values from store
Object.keys(newSubmission.value.formData.details || {}).forEach((key) => {
    formData[key] = newSubmission.value.formData.details[key];
});

// Track formData changes & update newSubmission in the process
watch(
    () => formData,
    () => {
        // console.log({formData});
        newSubmission.value.formData.details = {
            ...newSubmission.value.formData?.details,
            ...formData
        };

        // Other Insurance plan
        if (formData.other_insurance_plan === 'other_insurance_plan_yes') {
            newSubmission.value.secondary_insurance = {
                provider: formData.secondary_insurance_provider ?? '',
                policy_number: formData.policy_or_certificate_number ?? '',
                group_number: formData.group_number ?? '',
                details: formData.other_insurance_details ?? ''
            };
        } else {
            delete newSubmission.value.secondary_insurance;
        }
    },
    { deep: true, immediate: true }
);
</script>
<template>
    <h3 data-testid="heading-claim-step">{{ step.title }}</h3>
    <p data-testid="text-claim-step-description">{{ step.description }}</p>

    <div class="card">
        <SubmissionExpenseForm />
    </div>

    <div class="card">
        <template v-for="field in step.fields" :key="field.label">
            <template v-if="field.type === 'RadioGroup'">
                <LabelField
                    :field="field"
                    v-model="formData.other_insurance_plan"
                />
                <div
                    v-if="
                        formData.other_insurance_plan &&
                        field.condition[formData.other_insurance_plan]
                    "
                >
                    <divider class="!mt-6 !mb-4" />
                    <LabelField
                        v-for="field_ in field.condition[
                            formData.other_insurance_plan
                        ].fields"
                        :key="field_.label"
                        :field="field_"
                        v-model="formData[field_.props.name]"
                    />
                </div>
            </template>
        </template>
    </div>
</template>
