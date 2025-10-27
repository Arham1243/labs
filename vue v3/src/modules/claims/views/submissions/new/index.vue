<script setup>
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { inject, onMounted, reactive, ref, watch } from 'vue';
import { useGeneralStore } from '@/modules/claims/stores/General';
import { useClaimInsuredStore } from '@/modules/claims/stores/Insured';
import {
    CanadaPost,
    CanadaPostScripts,
    cfg,
    errorCounts,
    validator
} from '@/modules/claims/utils/submissions';
import LabelField from '@/modules/claims/components/forms/LabelField.vue';
import { useSubmissionStore } from '@/modules/claims/stores/Submission';
import { useClaimPolicyStore } from '@/modules/claims/stores/Policy';

// Dynamically add CanadaPost CSS & JS
onMounted(() => CanadaPostScripts());

const { t } = useI18n();
const currentUser = inject('currentUser');

const route = useRoute();
const router = useRouter();

const {
    newSubmission,
    newSubmissionBtn,
    createSubmission,
    resetSubmissionData
} = useSubmissionStore();
const {
    mutate: createSubmissionMutation,
    loading: loadingSubmissions,
    status
} = createSubmission(route.query.client_id, currentUser.value.id);

const { currentInsured, getInsuredById } = useClaimInsuredStore();

// Reset Insured and SubmissionData if changed insured or policy changed
if (
    (currentInsured?.value?.id &&
        currentInsured?.value?.id !== route.query.insured_id) ||
    route.query.policy_id !== newSubmission.value.policy_id
) {
    currentInsured.value = null;
    resetSubmissionData();
}

const { loading } = getInsuredById(
    route.query.client_id,
    route.query.insured_id
);

const { currentPolicy, getPolicyById } = useClaimPolicyStore();
const { loading: loadingPolicy } = getPolicyById(
    route.query.client_id,
    route.query.policy_id
);

const { countries, getCountries, provinces, getProvinces, getCurrencies } =
    useGeneralStore();

getCountries();
getProvinces();
getCurrencies();

const formData = reactive({});

const fields = ref(cfg.policy_holder_details.fields);

// Link with query
const link = (path) =>
    `/claims/submissions/new/${path}?client_id=${route.query.client_id}&insured_id=${route.query.insured_id}&policy_id=${route.query.policy_id}&q=${route.query.q}`;

// Steps
let steps = cfg.claims_process.claimSteps;
const stepperItems = ref(
    steps.map((step) => ({ label: step.title, to: link(step.path) }))
);

const pageIndex = () =>
    steps.findIndex((step) => base_link + step.path === route.path);

// routing / prev / next actions
let base_link = '/claims/submissions/new/';
let prevLink = ref('');
let nextLink = ref('');
let nextLabel = ref('Confirm and Begin Claims Submission');

const next = () => {
    if (pageIndex() === 4) {
        createSubmissionMutation();
    } else router.push(nextLink.value);
};

watch(
    () => status,
    () => {
        if (status.value === 'success')
            setTimeout(() => router.push('/claims?refresh'), 1000);
    },
    { deep: true, immediate: true }
);

const setButtonActions = () => {
    const index = pageIndex();
    let subFormData = newSubmission.value.formData;

    // if (index === 3 && !newSubmission.value.expenses[0].is_payee_self) router.push(link('review'));
    if (index === 4) nextLabel.value = 'Submit Claim';
    else if (index === 0 && subFormData.type?.claim_type === 'travel_benefits')
        nextLabel.value = 'Return to Claims Home Page';
    else if (index > -1) nextLabel.value = 'Confirm and Continue';
    else nextLabel.value = 'Confirm and Begin Claims Submission';

    prevLink.value = link(
        index > 0 ? steps[index - 1].path : index === 0 ? '' : `search`
    );

    if (index === 0 && subFormData.type?.claim_type === 'travel_benefits')
        nextLink.value = '/claims';
    else nextLink.value = link(steps[index + 1]?.path);
};

const pageAccess = () => {
    if (!newSubmission.value.formData.type && pageIndex())
        router.push(link(''));
};

watch(
    () => route,
    () => {
        if (
            !route.query?.client_id ||
            !route.query?.insured_id ||
            !route.query?.policy_id
        ) {
            router.push('/claims/submissions/new/search');
        }

        setButtonActions();
        pageAccess();
    },
    { deep: true, immediate: true }
);

// Set Country Data when currentInsured & Country data are available
const setCountryData = () => {
    if (currentInsured?.value?.id && countries?.value?.length) {
        formData.country = countries.value.filter(
            (country) => country.id === currentInsured.value.country_id
        )[0];

        fields.value[7].props.items = countries.value;

        setTimeout(
            () =>
                CanadaPost(
                    [
                        'address',
                        'address_2',
                        'city',
                        'postal_code',
                        'province',
                        'country'
                    ],
                    formData,
                    countries,
                    provinces
                ),
            500
        );
    }
};

//
//
watch(
    () => currentInsured,
    () => {
        if (currentInsured?.value?.id) {
            // form data
            formData.primary_email = currentInsured.value.email;
            formData.phone_number = currentInsured.value.phone_number;
            formData.address = currentInsured.value.address;
            formData.city = currentInsured.value.city;
            formData.postal_code = currentInsured.value.postal_code;

            // set newSubmission data
            newSubmission.value.insured_id = currentInsured.value.id;
            newSubmission.value.policy_id = currentInsured.value.policies[0].id;

            // country
            setCountryData();
        }
    },
    { deep: true, immediate: true }
);

// Countries and Provinces form updates
watch(
    () => countries,
    () => {
        setCountryData();
    },
    { deep: true, immediate: true }
);

watch(
    () => provinces,
    () => {
        if (
            currentInsured?.value?.id &&
            countries.value?.length &&
            provinces.value?.length
        ) {
            formData.province = provinces.value.filter(
                (province) => province.id === currentInsured.value.province_id
            )[0];

            if (
                ['CA', 'IE', 'US'].indexOf(currentInsured.value.country_id) > -1
            ) {
                fields.value[8].props.items = provinces.value.filter(
                    (province) =>
                        province.country?.id === currentInsured.value.country_id
                );
            }
        }
    },
    { deep: true, immediate: true }
);

// Track newSubmission
watch(
    () => newSubmission,
    () => {
        // console.log({
        //   error: errorCounts( pageIndex(), newSubmission.value.formData?.details ),
        //   // newSubmissionX: newSubmission.value.formData?.details,
        // });

        localStorage.setItem(
            'newSubmission',
            JSON.stringify(newSubmission.value)
        );

        // Next Btn (newSubmissionBtn) Active Conditions
        let subFormData = newSubmission.value.formData;

        // ClaimType Page
        if (
            subFormData.type?.claim_type === 'personal_medical_claim' ||
            subFormData.type?.claim_type === 'travel_benefits'
        ) {
            newSubmissionBtn.value = 0;
        } else if (
            ['work_related_injury_yes', 'car_accident_yes'].indexOf(
                subFormData.type?.claim_type_details
            ) > -1
        ) {
            newSubmissionBtn.value = 0; // @todo need to check if upload exist
        } else {
            newSubmissionBtn.value = -1;
        }

        // ClaimDetail Page
        if (
            pageIndex() === 1 &&
            !errorCounts(pageIndex(), subFormData?.details)
        )
            newSubmissionBtn.value = 1;
        // Payee Page
        else if (pageIndex() === 2) {
            if (subFormData.payee?.payee === 'payee_select_no') {
                newSubmissionBtn.value = 3;
            } else if (
                subFormData.payee?.payee === 'payee_select_yes' &&
                subFormData.payee?.payee_opt === 'policy_holder'
            ) {
                newSubmissionBtn.value = 2;
            }

            if (
                subFormData.payee?.payee === 'payee_select_yes' &&
                subFormData.payee?.payee_opt === 'payee_select_other' &&
                subFormData.payee?.payee_other_first_name &&
                subFormData.payee?.payee_other_last_name &&
                subFormData.payee?.payee_other_email &&
                subFormData.payee?.payee_other_phone &&
                subFormData.payee?.payee_other_street_address_line1 &&
                subFormData.payee?.payee_other_city &&
                subFormData.payee?.payee_other_postal_code &&
                subFormData.payee?.payee_other_country?.id
            ) {
                newSubmissionBtn.value = 2;
            }
        } else if (
            (pageIndex() === 3 &&
                subFormData.payee_details?.payee === 'cheque') ||
            (subFormData.payee_details?.payee === 'claims_reimbursement_card' &&
                subFormData.payee_details?.prepaid_card_terms_agreement) ||
            (subFormData.payee_details?.payee === 'direct_deposit' &&
                subFormData.payee_details?.dd_account_email &&
                subFormData.payee_details?.dd_account_name &&
                subFormData.payee_details?.dd_account_no &&
                subFormData.payee_details?.dd_branch_no &&
                subFormData.payee_details?.dd_institution_no) ||
            (subFormData.payee_details?.payee === 'wire_transfer' &&
                subFormData.payee_details?.wt_account_holder_email &&
                subFormData.payee_details?.wt_account_holder_name &&
                subFormData.payee_details?.wt_account_holder_phone &&
                subFormData.payee_details?.wt_bank_account_name &&
                subFormData.payee_details?.wt_bank_account_number &&
                subFormData.payee_details?.wt_bank_city &&
                subFormData.payee_details?.wt_bank_clabe_number &&
                subFormData.payee_details?.wt_bank_country?.id &&
                subFormData.payee_details?.wt_bank_name &&
                subFormData.payee_details?.wt_bank_postal_code &&
                // subFormData.payee_details?.wt_bank_province &&
                subFormData.payee_details?.wt_bank_routing_swift_code_number &&
                subFormData.payee_details?.wt_bank_street_address &&
                subFormData.payee_details?.wt_city &&
                subFormData.payee_details?.wt_country?.id &&
                subFormData.payee_details?.wt_postal_code &&
                subFormData.payee_details?.wt_province &&
                subFormData.payee_details?.wt_street_address_line1 &&
                subFormData.payee_details?.wt_tax_id_number)
        ) {
            newSubmissionBtn.value = 3;
        }

        setButtonActions();
    },
    { deep: true, immediate: true }
);

// Track FormData
watch(
    () => formData.country,
    () => {
        if (formData?.country?.id && provinces.value) {
            if (['CA', 'IE', 'US'].indexOf(formData.country?.id) > -1) {
                formData.province = {};
                fields.value[8].props.items = provinces.value.filter(
                    (province) => province.country?.id === formData.country.id
                );
                fields.value[8].type = 'ApiDropdown';
            } else {
                fields.value[8].type = 'InputText';
                formData.province = '';
            }
        }
    },
    { deep: true, immediate: true }
);
</script>

<template>
    <div v-if="currentInsured && currentPolicy && formData.country?.id">
        <template v-if="route.name === 'New Submission'">
            <Header hide-back data-testid="title-create-submission">
                <template #title>
                    {{ $t('midnight_sun.create_submission') }}
                </template>
            </Header>
            <div class="col-9 mx-auto">
                <div class="card py-4">
                    <div class="mx-3 pb-3 mb-3 border-bottom-1 border-gray-300">
                        <h4 data-testid="text-insured-name">
                            {{ currentInsured.first_name }}
                            {{ currentInsured.last_name }}
                        </h4>
                        <div
                            class="text-gray-600"
                            data-testid="text-policy-number"
                        >
                            {{ $t('policies.policy_number') }}:
                            {{ currentInsured.policies?.[0]?.policy_number }}
                        </div>
                        <p class="mt-2">
                            {{
                                $t(
                                    'midnight_sun.please_confirm_insured_information',
                                    {
                                        insured_name:
                                            currentInsured.first_name +
                                            ' ' +
                                            currentInsured.last_name
                                    }
                                )
                            }}
                        </p>
                    </div>

                    <LabelField
                        v-for="field in fields.slice(0, 3)"
                        :key="field"
                        :field="field"
                        v-model="formData[field.props.name]"
                    />
                </div>

                <div class="card mx-auto py-4">
                    <h4 class="mx-3 mb-3">Location</h4>
                    <div class="grid p-3">
                        <LabelField
                            v-for="field in fields.slice(3, 9)"
                            :key="field"
                            :field="field"
                            v-model="formData[field.props.name]"
                        />
                    </div>
                </div>

                <!-- For Canada, BC  -->
                <div
                    v-if="
                        formData.country.id === 'CA' &&
                        formData.province?.code === 'BC'
                    "
                    class="card mx-auto py-4"
                >
                    <template v-for="field in fields.slice(9, 12)" :key="field">
                        <div
                            :class="
                                'grid ' +
                                (field.props.name === 'bc_student_study_permit'
                                    ? ''
                                    : 'px-4 my-4')
                            "
                            v-if="
                                field.props.name ===
                                    'bc_study_permit_confirm_hospital' ||
                                (field.props.name ===
                                    'bc_study_permit_confirm_permit' &&
                                    formData.bc_study_permit_confirm_hospital ===
                                        'bc_study_permit_yes') ||
                                (field.props.name ===
                                    'bc_student_study_permit' &&
                                    formData.bc_study_permit_confirm_permit ===
                                        'bc_study_permit_confirm_permit_yes')
                            "
                        >
                            <divider
                                v-if="
                                    field.props.name !==
                                    'bc_study_permit_confirm_hospital'
                                "
                            />
                            <LabelField
                                :field="field"
                                v-model="formData[field.props.name]"
                            />
                        </div>
                    </template>
                </div>
            </div>
        </template>

        <template v-else>
            <!-- All Steps Handled Here -->
            <section class="col-9 mx-auto">
                <div class="mb-4 -mt-4">
                    <h4 data-testid="text-insured-name">
                        {{ currentInsured.first_name }}
                        {{ currentInsured.last_name }}
                    </h4>
                    <div class="text-gray-600" data-testid="text-policy-number">
                        {{ $t('policies.policy_number') }}:
                        {{ currentInsured.policies?.[0]?.policy_number }}
                    </div>
                </div>
                <Steps :model="stepperItems" :readonly="false" />
                <div class="mt-6">
                    <router-view />
                </div>
            </section>
        </template>

        <div
            class="col-9 mx-auto flex mt-5 pt-0 px-3 pb-8 justify-content-between align-items-center"
        >
            <Button
                data-testid="btn-back"
                label="Back"
                outlined
                @click="router.push(`${prevLink}&back=1`)"
            />
            <Button
                :label="nextLabel"
                data-testid="btn-next"
                @click="next"
                iconPos="right"
                :disabled="newSubmissionBtn < pageIndex() && pageIndex() < 4"
                icon="pi pi-arrow-right"
                :loading="loadingSubmissions"
            />
        </div>
    </div>
</template>
<style lang="scss">
.search .p-inputtext {
    padding-bottom: 0.775rem !important;
    width: 100%;
}
</style>
