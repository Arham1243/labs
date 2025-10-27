<script setup>
import { reactive, ref, watch } from 'vue';
import LabelField from '@/modules/claims/components/forms/LabelField.vue';
import { useRoute, useRouter } from 'vue-router';
import { CanadaPost, cfg } from '@/modules/claims/utils/submissions';
import { useSubmissionStore } from '@/modules/claims/stores/Submission';
import { useGeneralStore } from '@/modules/claims/stores/General';
import { useClaimInsuredStore } from '@/modules/claims/stores/Insured';

const router = useRouter();
let step = ref(cfg.claims_process.claimSteps[2]);

const { currentInsured } = useClaimInsuredStore();
const { countries, provinces } = useGeneralStore();

// Handling Form Data
const { newSubmission } = useSubmissionStore();
const formData = reactive({ payee_other_phone: '' });

// Set form values from store
Object.keys(newSubmission.value.formData.payee || {}).forEach((key) => {
    formData[key] = newSubmission.value.formData.payee[key];
});

const CanadaPostActive = ref(false);

watch(
    () => formData,
    () => {
        newSubmission.value.formData.payee = {
            ...newSubmission.value.formData.payee,
            ...formData
        };

        // Enabling Next Button
        if (formData.payee === 'payee_select_no') {
            newSubmission.value.expenses[0].is_payee_self = false;
            newSubmission.value.payee = {
                payee: 'Clinic / Hospital',
                other: {}
            };
        } else if (
            formData.payee === 'payee_select_yes' &&
            formData.payee_opt === 'policy_holder'
        ) {
            newSubmission.value.expenses[0].is_payee_self = true;
            newSubmission.value.payee = {
                payee: 'Self',
                other: {}
            };
        } else {
            newSubmission.value.expenses[0].is_payee_self = true;
        }

        if (
            formData.payee === 'payee_select_yes' &&
            formData.payee_opt === 'payee_select_other'
        ) {
            let other_info = (({ payee, payee_opt, ...rest }) => rest)({
                ...formData
            });
            newSubmission.value.payee = {
                payee: 'Other',
                other_info
            };

            if (!CanadaPostActive.value) {
                setTimeout(() => {
                    CanadaPost(
                        [
                            'payee_other_street_address_line1',
                            'payee_other_street_address_line2',
                            'payee_other_city',
                            'payee_other_postal_code',
                            'payee_other_province',
                            'payee_other_country'
                        ],
                        formData,
                        countries,
                        provinces
                    );
                    CanadaPostActive.value = true;
                }, 500);
            }
        } else {
            CanadaPostActive.value = false;
        }
    },
    { deep: true, immediate: true }
);

// Countries and Provinces form updates
watch(
    () => countries,
    () => {
        if (currentInsured?.value?.id && countries.value?.length) {
            formData.payee_other_country =
                formData.payee_other_country ||
                countries.value.filter(
                    (country) => country.id === currentInsured.value.country_id
                )[0];
            step.value.fields[0].condition.payee_select_yes.condition.payee_select_other.fields[8].props.items =
                countries.value;
        }
    },
    { deep: true, immediate: true }
);

watch(
    () => provinces,
    () => {
        if (currentInsured?.value?.id && provinces.value?.length) {
            formData.payee_other_province =
                formData.payee_other_province ||
                provinces.value.filter(
                    (province) =>
                        province.id === currentInsured.value.province_id
                )[0];
            step.value.fields[0].condition.payee_select_yes.condition.payee_select_other.fields[9].props.items =
                provinces.value;
        }
    },
    { deep: true, immediate: true }
);

// Track FormData
watch(
    () => formData.payee_other_country,
    () => {
        let fields =
            step.value.fields[0].condition.payee_select_yes.condition
                .payee_select_other.fields;
        if (['CA', 'IE', 'US'].indexOf(formData.payee_other_country?.id) > -1) {
            formData.payee_other_province =
                newSubmission.value.formData?.payee?.payee_other_province || {};
            fields[9].props.items = provinces.value.filter(
                (province) =>
                    province.country?.id === formData.payee_other_country.id
            );
            fields[9].type = 'ApiDropdown';
        } else {
            fields[9].type = 'InputText';
            formData.payee_other_province = '';
        }
    },
    { deep: true, immediate: true }
);
</script>
<template>
    <h3 data-testid="label-step-select-payee">{{ step.title }}</h3>
    <div>
        <template v-for="field in step.fields" :key="field.label">
            <div class="card flex mt-3 mb-0 px-6 flex-column">
                <LabelField :field="field" v-model="formData.payee" />
                <div v-if="field.condition[formData.payee]">
                    <divider class="mt-4" />
                    <p data-testid="text-payee">
                        {{ field.condition[formData.payee].description }}
                    </p>
                    <template
                        v-for="field_ in field.condition[formData.payee].fields"
                        :key="field_.label"
                    >
                        <LabelField
                            :field="field_"
                            v-model="formData.payee_opt"
                        />
                    </template>
                </div>
            </div>
            <div
                v-if="
                    field.condition[formData.payee]?.condition?.[
                        formData.payee_opt
                    ]
                "
                class="card flex mt-3 mb-0 flex-wrap"
            >
                <p class="px-3" data-testid="text-payee-opt">
                    {{
                        field.condition[formData.payee]?.condition?.[
                            formData.payee_opt
                        ].title
                    }}
                </p>
                <template
                    v-for="field_ in field.condition[formData.payee].condition[
                        formData.payee_opt
                    ].fields"
                    :key="field_.label"
                >
                    <LabelField
                        :field="field_"
                        v-model="formData[field_.props.name]"
                    />
                </template>
            </div>
        </template>
    </div>
</template>
