<script setup>
import { reactive, ref, watch } from 'vue';
import { CanadaPost, cfg, getIndex } from '@/modules/claims/utils/submissions';
import LabelField from '@/modules/claims/components/forms/LabelField.vue';
import { useRoute, useRouter } from 'vue-router';
import { useSubmissionStore } from '@/modules/claims/stores/Submission';
import { useClaimInsuredStore } from '@/modules/claims/stores/Insured';
import { useGeneralStore } from '@/modules/claims/stores/General';

const route = useRoute();
const router = useRouter();

let step = ref([...cfg.claims_process.claimSteps][3]);

const { currentInsured } = useClaimInsuredStore();
const { countries, provinces } = useGeneralStore();

// Handling Form Data
const { newSubmission } = useSubmissionStore();
const formData = reactive({ wt_account_holder_phone: '' });
const CanadaPostActive = ref(false);

const link = (path = '') =>
    router.push(
        `/claims/submissions/new/${path}?client_id=${route.query.client_id}&insured_id=${route.query.insured_id}&policy_id=${route.query.policy_id}&q=${route.query.q}`
    );

// Set form values from store
Object.keys(newSubmission.value.formData.payee_details || {}).forEach((key) => {
    formData[key] = newSubmission.value.formData.payee_details[key];
});

if (!newSubmission.value.formData.payee?.payee_opt) {
    if (
        newSubmission.value.formData.payee.payee === 'payee_select_no' &&
        !route.query.back
    )
        link('review');
    else link('payee');
}

const getFields = () => {
    // to disable Claim Reimbursement Card
    if (newSubmission.value.payee?.payee === 'Other') {
        let fields = [...step.value.fields][0];
        return [
            {
                ...fields,
                props: {
                    ...fields.props,
                    options: fields.props.options.slice(0, -1)
                }
            }
        ];
    } else {
        return step.value.fields;
    }
};

const visible = ref(false);
const dialogData = reactive({ title: '', details: '', address: '' });

watch(
    () => visible,
    () => {
        if (!visible.value) {
            formData.payee = '';
            formData.prepaid_card_terms_agreement = '';
        }
    },
    { deep: true }
);
//

watch(
    () => formData,
    () => {
        newSubmission.value.formData.payee_details = {
            ...newSubmission.value.formData?.payee_details,
            ...formData
        };

        newSubmission.value.payee.payment_method = formData.payee;
        newSubmission.value.payee.payment_details = (({ payee, ...rest }) =>
            rest)({ ...formData });

        // Handle Dialog and Info for Cheque and Claim Reimbursement
        let subData = newSubmission.value.formData.payee;
        let insured = currentInsured.value;

        let country = countries?.value?.filter(
            (item) => item.id === insured.country_id
        )[0].name;
        // console.log({subData})
        if (
            formData.payee === 'cheque' ||
            (formData.payee === 'claims_reimbursement_card' &&
                formData.prepaid_card_terms_agreement)
        ) {
            let method =
                formData.payee === 'cheque'
                    ? 'cheque'
                    : 'prepaid_card_terms_agreement';
            let address =
                subData.payee_opt === 'policy_holder'
                    ? `${insured.address}, ${insured.city}, ${insured.postal_code}, ${insured.province_id}, ${country}`
                    : `${subData.payee_other_street_address_line1} ${
                          subData.payee_other_street_address_line2
                      }, ${subData.payee_other_city}, ${
                          subData.payee_other_postal_code
                      }, ${
                          subData.payee_other_province.code ||
                          subData.payee_other_province
                      }, ${subData.payee_other_country.name}`;
            // subData.payee_opt === "payee_select_other";

            visible.value = true;
            dialogData.title = getFields()[0].condition[method].title;
            dialogData.details = getFields()[0].condition[method].description;
            dialogData.address = address;
        }

        if (formData.payee === 'wire_transfer') {
            // setTimeout(() => CanadaPost(), 500);
            if (!CanadaPostActive.value) {
                setTimeout(() => {
                    CanadaPost(
                        [
                            'wt_street_address_line1',
                            'wt_street_address_line2',
                            'wt_city',
                            'wt_postal_code',
                            'wt_province',
                            'wt_country'
                        ],
                        formData,
                        countries,
                        provinces
                    );
                    CanadaPost(
                        [
                            'wt_bank_street_address',
                            '',
                            'wt_bank_city',
                            'wt_bank_postal_code',
                            'wt_bank_province',
                            'wt_bank_country'
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

watch(
    () => countries,
    () => {
        if (currentInsured?.value?.id && countries.value?.length) {
            // formData.payee_other_country = countries.value.filter(
            //     (country) => country.id === currentInsured.value.country_id
            // )[0];
            let fields = step.value.fields[0].condition.wire_transfer.fields;
            fields[getIndex(fields, 'wt_country')].props.items =
                countries.value;
            fields[getIndex(fields, 'wt_bank_country')].props.items =
                countries.value;
        }
    },
    { deep: true, immediate: true }
);

// Setting Provinces based on Country Selection for WT and WT Bank Countries
watch(
    () => formData.wt_country,
    () => {
        if (formData.wt_country) {
            let fields = step.value.fields[0].condition.wire_transfer.fields;
            let province_field = fields[getIndex(fields, 'wt_province')];
            if (['CA', 'IE', 'US'].indexOf(formData.wt_country?.id) > -1) {
                formData.wt_province = {};
                province_field.props.items = provinces.value.filter(
                    (province) =>
                        province.country?.id === formData.wt_country.id
                );
                province_field.type = 'ApiDropdown';
            } else {
                province_field.type = 'InputText';
                formData.wt_province = '';
            }
        }
    },
    { deep: true, immediate: true }
);

watch(
    () => formData.wt_bank_country,
    () => {
        if (formData.wt_bank_country) {
            let fields = step.value.fields[0].condition.wire_transfer.fields;
            let province_field = fields[getIndex(fields, 'wt_bank_province')];
            if (['CA', 'IE', 'US'].indexOf(formData.wt_bank_country?.id) > -1) {
                formData.wt_bank_province = {};
                province_field.props.items = provinces.value.filter(
                    (province) =>
                        province.country?.id === formData.wt_bank_country.id
                );
                province_field.type = 'ApiDropdown';
            } else {
                province_field.type = 'InputText';
                formData.wt_bank_province = '';
            }
        }
    },
    { deep: true, immediate: true }
);

const keyup = (e, rules = {}) => {
    if (rules.format === 'number') {
        formData[e.target.name] = formData[e.target.name].replace(
            /[^0-9]/g,
            ''
        );
    }
};
</script>
<template>
    <h3 :data-testid="'text-step-' + step.description" @click="visible = true">
        {{ step.description }}
    </h3>

    <div class="card flex mt-3 mb-0 px-6 flex-column">
        <template v-for="field in getFields()" :key="field.label">
            <LabelField :field="field" v-model="formData.payee" />

            <div v-if="field?.condition?.[formData.payee]" class="grid">
                <divider class="mt-6 mx-3" />
                <h4
                    class="px-3 text-xl mb-3"
                    v-html="field.condition[formData.payee].title"
                    :data-testid="
                        'heading-' + field.condition[formData.payee].title
                    "
                />
                <p
                    v-if="field.condition[formData.payee].description"
                    class="px-3 text-justify"
                    v-html="field.condition[formData.payee].description"
                    :data-testid="
                        'text-' + field.condition[formData.payee].description
                    "
                />
                <template
                    v-for="field_ in field.condition[formData.payee].fields"
                    :key="field_.label + field_.props.name"
                >
                    <template
                        v-if="
                            ['wt_street_address_line1', 'wt_bank_name'].indexOf(
                                field_.props?.name
                            ) > -1
                        "
                    >
                        <divider class="mt-3 mx-3" />
                        <h4
                            class="px-3 text-xl my-3"
                            v-text="
                                field_.props?.name === 'wt_street_address_line1'
                                    ? 'Account Holder Address'
                                    : 'Banking Details'
                            "
                        />
                    </template>

                    <divider
                        class="mt-3 mx-3"
                        v-if="
                            field_.props?.name ===
                            'dd_wire_transfer_cheque_attachment'
                        "
                    />

                    <LabelField
                        :field="field_"
                        v-model="formData[field_.props.name]"
                        @keyup="keyup($event, field_.validation_rules)"
                    />

                    <div v-if="formData.payee_opt">
                        <divider class="mt-4" />
                        <h4
                            class="px-3 text-xl mb-3"
                            v-html="field_.condition[formData.payee_opt].title"
                            :data-testid="
                                'heading-' +
                                field_.condition[formData.payee_opt].title
                            "
                        />
                        <p
                            class="px-3 text-justify"
                            v-html="
                                field_.condition[formData.payee_opt].description
                            "
                            :data-testid="
                                'text-' +
                                field_.condition[formData.payee_opt].description
                            "
                        />
                    </div>
                </template>
            </div>
        </template>
    </div>

    <Dialog
        v-model:visible="visible"
        modal
        :header="dialogData.title"
        :style="{ maxWidth: '56rem', width: '80%' }"
        data-testid="dialog-payee-details"
    >
        <p v-html="dialogData.details" />
        <p v-html="dialogData.address" />

        <div class="flex justify-content-end gap-2 mt-5">
            <Button
                type="button"
                label="Cancel"
                link
                @click="visible = false"
                data-testid="dialog-btn-cancel-payee-details"
            />
            <Button
                type="button"
                label="Confirm Address & Continue"
                icon="pi pi-check"
                data-testid="dialog-btn-save-payee-details"
                @click="link('review')"
            />
        </div>
    </Dialog>
</template>
