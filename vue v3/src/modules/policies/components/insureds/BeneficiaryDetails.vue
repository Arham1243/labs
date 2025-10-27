<script setup>
import { ref, onBeforeMount, computed } from 'vue';
import { useHelpers } from '@/composables';

import { useI18n } from 'vue-i18n';
import { useInsuredsStore } from '@/modules/policies/stores/Insureds';
import { useCommonStore, useGlobalStore } from '@/stores';
import {
    BeneficiaryTypes,
    BeneficiaryPayOptions,
    BeneficiaryPayOptionEnum
} from '@/config';
import { useToast } from 'primevue/usetoast';
import useEventsBus from '@/composables/event-bus';
import lodash from 'lodash';

const props = defineProps({
    insured: {
        type: Object,
        default: () => ({})
    },
    beneficiary: {
        type: Object,
        default: () => ({ meta: { phone_number: '' } })
    }
});

const emits = defineEmits(['close', 'confirmClose']);

const insuredsStore = useInsuredsStore();
const commonStore = useCommonStore();
const globalStore = useGlobalStore();
const { t } = useI18n();
const helpers = useHelpers();
const toast = useToast();
const { emit } = useEventsBus();

const insured = ref(props.insured);
const beneficiary = ref(lodash.cloneDeep(props.beneficiary));

if (!beneficiary.value.meta) {
    beneficiary.value.meta = {};
}
const isEditing = ref(!props.beneficiary.id);
const countries = ref([]);
const provinces = ref([]);
const hasProvinces = ref(false);
const isSaving = ref(false);
const details = ref({});
const bannerMessage = ref();

const selfEntityType = BeneficiaryTypes.SELF.value;
const isUpdateForm = !!props.beneficiary.id;

const enableEditing = () => {
    isEditing.value = true;
};

const isDirty = computed(() => {
    return !lodash.isEqual(props.beneficiary, beneficiary.value);
});
defineExpose({ enableEditing, isEditing, isDirty });

const isViewing = computed(() => {
    return !isEditing.value && beneficiary.value.id;
});

const isDisabled = computed(() => {
    return beneficiary.value.type === selfEntityType;
});

const paymentOptions = computed(() => {
    if (beneficiary.value.type !== BeneficiaryTypes.SELF.value) {
        return BeneficiaryPayOptions.filter(
            (option) =>
                option.value !==
                BeneficiaryPayOptionEnum.CLAIM_REIMBURSEMENT.value
        );
    }
    return BeneficiaryPayOptions;
});

const isFormValid = computed(() => {
    const formData = beneficiary.value;

    if (!formData.type) return false;

    let basicFieldsValid =
        formData &&
        formData.meta &&
        formData.meta.full_name &&
        formData.meta.phone_number &&
        formData.meta.payment_type;

    if (!basicFieldsValid) return false;

    const paymentType = formData.meta.payment_type;
    switch (paymentType) {
        case BeneficiaryPayOptionEnum.CHEQUE.value:
            return (
                formData.meta.address &&
                formData.meta.country_id &&
                formData.meta.city &&
                formData.meta.postal_code
            );

        case BeneficiaryPayOptionEnum.DIRECT_DEPOSIT.value:
            return (
                formData.meta.transit_number &&
                formData.meta.institution_number &&
                formData.meta.account_number &&
                formData.meta.email
            );

        case BeneficiaryPayOptionEnum.WIRE_TRANSFER.value:
            const wireBasicFields =
                formData.meta.transfer_type &&
                formData.meta.account_number &&
                formData.meta.swift_code &&
                formData.meta.bank_name &&
                formData.meta.branch_address;

            if (!wireBasicFields) return false;

            if (formData.meta.transfer_type === 'domestic') {
                return (
                    formData.meta.transit_number &&
                    formData.meta.institution_number
                );
            }

            return true;

        case BeneficiaryPayOptionEnum.CLAIM_REIMBURSEMENT.value:
            return (
                formData.meta.address &&
                formData.meta.city &&
                formData.meta.country_id &&
                formData.meta.province_id &&
                formData.meta.postal_code &&
                formData.meta.card_number &&
                formData.meta.claim_reference_number
            );

        default:
            return false;
    }
});

const getCountries = async (search) => {
    try {
        const res = await commonStore.searchCountries({
            search: {
                value: search
            }
        });

        countries.value = res.data;
    } catch (error) {
        countries.value = [];
    }
};

const getProvinces = async (search = '', countryId = '') => {
    try {
        countryId = countryId || beneficiary.value.meta?.country_id;
        const res = await commonStore.searchProvinces(
            {
                filters: [
                    {
                        field: 'country_id',
                        operator: '=',
                        value: countryId
                    }
                ],
                search: {
                    value: search
                }
            },
            {}
        );

        provinces.value = res.data;
        if (!search) {
            hasProvinces.value = provinces.value.length > 0;
        }

        if (
            beneficiary.value.meta.province_id &&
            !provinces.value.some(
                (province) => province.id === beneficiary.value.meta.province_id
            )
        ) {
            beneficiary.value.meta.province_id = null;
        }
    } catch (error) {
        provinces.value = [];
    }
};

const handleTypeChange = () => {
    bannerMessage.value = null;

    if (beneficiary.value.type === selfEntityType) {
        beneficiary.value.entity_id = insured.value.id;
        mapBeneficiaryMetaForSelf();
    } else {
        beneficiary.value.entity_id = null;
        beneficiary.value.meta = {};
    }
};

const mapBeneficiaryMetaForSelf = (paymentType = null) => {
    if (beneficiary.value.type === selfEntityType) {
        beneficiary.value.meta = {
            full_name: insured.value.first_name + ' ' + insured.value.last_name,
            payment_type: paymentType
        };
    }
};

const handlePaymentTypeChange = () => {
    if (!beneficiary.value.meta) return;

    const paymentType = beneficiary.value.meta.payment_type;

    delete beneficiary.value.meta.transit_number;
    delete beneficiary.value.meta.institution_number;
    delete beneficiary.value.meta.account_number;
    delete beneficiary.value.meta.email;
    delete beneficiary.value.meta.transfer_type;
    delete beneficiary.value.meta.swift_code;
    delete beneficiary.value.meta.bank_name;
    delete beneficiary.value.meta.branch_address;
    delete beneficiary.value.meta.card_number;
    delete beneficiary.value.meta.claim_reference_number;

    if (
        paymentType === BeneficiaryPayOptionEnum.CHEQUE.value ||
        paymentType === BeneficiaryPayOptionEnum.CLAIM_REIMBURSEMENT.value
    ) {
        if (countries.value.length === 0) {
            getCountries('');
        }
    } else {
        delete beneficiary.value.meta.address;
        delete beneficiary.value.meta.country_id;
        delete beneficiary.value.meta.province_id;
        delete beneficiary.value.meta.city;
        delete beneficiary.value.meta.postal_code;
    }
};

const handleClose = () => {
    emits('close');
};

const handleConfirmClose = () => {
    emits('confirmClose');
};

const handleCancel = () => {
    if (isDirty.value) {
        handleConfirmClose();
    } else {
        handleClose();
    }
};

const save = async () => {
    try {
        isSaving.value = true;
        bannerMessage.value = null;

        const formData = { ...beneficiary.value };

        const buildPaymentFields = (meta, paymentType) => {
            const paymentFields = {};
            if (paymentType === BeneficiaryPayOptionEnum.CHEQUE.value) {
                paymentFields.address = meta.address;
                paymentFields.country_id = meta.country_id;
                paymentFields.province_id = meta.province_id;
                paymentFields.city = meta.city;
                paymentFields.postal_code = meta.postal_code;
            } else if (
                paymentType === BeneficiaryPayOptionEnum.DIRECT_DEPOSIT.value
            ) {
                paymentFields.transit_number = meta.transit_number;
                paymentFields.institution_number = meta.institution_number;
                paymentFields.account_number = meta.account_number;
                paymentFields.email = meta.email;
            } else if (
                paymentType === BeneficiaryPayOptionEnum.WIRE_TRANSFER.value
            ) {
                paymentFields.transfer_type = meta.transfer_type;
                paymentFields.account_number = meta.account_number;
                paymentFields.transit_number = meta.transit_number;
                paymentFields.institution_number = meta.institution_number;
                paymentFields.swift_code = meta.swift_code;
                paymentFields.bank_name = meta.bank_name;
                paymentFields.branch_address = meta.branch_address;
            } else if (paymentType === 'credit_card') {
                paymentFields.card_number = meta.card_number;
                paymentFields.cardholder_name = meta.cardholder_name;
            } else if (
                paymentType ===
                BeneficiaryPayOptionEnum.CLAIM_REIMBURSEMENT.value
            ) {
                paymentFields.address = meta.address;
                paymentFields.city = meta.city;
                paymentFields.country_id = meta.country_id;
                paymentFields.province_id = meta.province_id;
                paymentFields.postal_code = meta.postal_code;
                paymentFields.card_number = meta.card_number;
                paymentFields.claim_reference_number =
                    meta.claim_reference_number;
            }
            return paymentFields;
        };

        if (!isUpdateForm) {
            if (formData.type === selfEntityType) {
                const payload = {
                    entity_type: formData.type,
                    entity_id: formData.entity_id,
                    payment_type: formData.meta.payment_type,
                    payment_data: buildPaymentFields(
                        formData.meta,
                        formData.meta.payment_type
                    )
                };

                payload.payment_data.phone_number = formData.meta.phone_number;

                await insuredsStore.addBeneficiary(
                    insured.value.client_id,
                    insured.value.id,
                    payload
                );
            } else if (formData.type === BeneficiaryTypes.EXTERNAL.value) {
                const meta = formData.meta;
                const paymentType = meta.payment_type;
                const payload = {
                    ...meta,
                    payment_data: buildPaymentFields(meta, paymentType)
                };
                await insuredsStore.addExternalBeneficiary(
                    insured.value.client_id,
                    insured.value.id,
                    payload
                );
            } else {
                return;
            }
        } else {
            if (formData.type === selfEntityType) {
                const payload = {
                    entity_type: formData.type,
                    entity_id: formData.entity_id,
                    payment_type: formData.meta.payment_type,
                    payment_data: buildPaymentFields(
                        formData.meta,
                        formData.meta.payment_type
                    )
                };

                payload.payment_data.phone_number = formData.meta.phone_number;

                await insuredsStore.updateBeneficiary(
                    insured.value.client_id,
                    insured.value.id,
                    formData.id,
                    payload
                );
            } else if (formData.type === BeneficiaryTypes.EXTERNAL.value) {
                const meta = formData.meta;
                const payload = {
                    ...meta,
                    payment_data: buildPaymentFields(meta, meta.payment_type)
                };
                await insuredsStore.updateExternalBeneficiary(
                    insured.value.client_id,
                    insured.value.id,
                    formData.meta.id,
                    payload
                );
            } else {
                return;
            }
        }

        toast.add({
            severity: 'success',
            summary: t('insured_overview.beneficiaries.save_success_title'),
            detail: t('insured_overview.beneficiaries.save_success_message'),
            life: 5000
        });

        setTimeout(() => {
            emit('refresh');
            handleClose();
        }, 1000);
    } catch (error) {
        const normalizeErrors = (errors = {}) => {
            const mappedErrors = { ...errors };
            const fieldMap = {
                'payment_data.address': 'address',
                'payment_data.country_id': 'country_id',
                'payment_data.province_id': 'province_id',
                'payment_data.city': 'city',
                'payment_data.postal_code': 'postal_code',
                'payment_data.transit_number': 'transit_number',
                'payment_data.institution_number': 'institution_number',
                'payment_data.account_number': 'account_number',
                'payment_data.email': 'email',
                'payment_data.transfer_type': 'transfer_type',
                'payment_data.swift_code': 'swift_code',
                'payment_data.bank_name': 'bank_name',
                'payment_data.branch_address': 'branch_address',
                'payment_data.phone_number': 'phone_number',
                'payment_data.card_number': 'card_number',
                'payment_data.cardholder_name': 'cardholder_name',
                'payment_data.claim_reference_number': 'claim_reference_number'
            };

            Object.entries(fieldMap).forEach(([source, target]) => {
                if (errors?.[source]?.length) {
                    mappedErrors[target] = errors[source];
                }
            });

            return mappedErrors;
        };

        const errors = normalizeErrors(error.response?.data?.errors);
        globalStore.errors = errors;

        if (errors?.['entity_id']?.length > 1) {
            bannerMessage.value =
                errors['entity_id'][errors['entity_id'].length - 1];
        }
    } finally {
        isSaving.value = false;
    }
};

onBeforeMount(async () => {
    await getCountries();

    if (isUpdateForm) {
        details.value = { ...(props.beneficiary.meta || {}) };

        if (details.value.payment_type) {
            const payOption = BeneficiaryPayOptions.find(
                (option) => option.value === details.value.payment_type
            );
            details.value.payment_type = payOption?.label;
        }

        const needsAddressFields = [
            BeneficiaryPayOptionEnum.CHEQUE.value,
            BeneficiaryPayOptionEnum.CLAIM_REIMBURSEMENT.value
        ].includes(props.beneficiary.meta?.payment_type);
        if (needsAddressFields && details.value.country_id) {
            const country = countries.value.find(
                (country) => country.id === details.value.country_id
            );
            await getProvinces('', country?.id);
            const province = provinces.value.find(
                (province) => province.id === details.value.province_id
            );

            details.value.country = country?.name;
            details.value.province = province?.name;
        }
    }
});
</script>

<template>
    <div class="grid mt-1" v-if="isViewing">
        <div class="col-6 text-md font-bold px-5 py-3">
            {{ $t('policies.applicant.full_name') }}
        </div>
        <div class="col-6 text-md py-3 text-right p-break-all">
            {{ details.full_name || '-' }}
        </div>

        <div class="col-6 text-md font-bold px-5 py-3">
            {{ $t('insured_overview.beneficiaries.contact_number') }}
        </div>
        <div class="col-6 text-md py-3 text-right">
            {{ details.phone_number || '-' }}
        </div>

        <div class="col-6 text-md font-bold px-5 py-3">
            {{ $t('insured_overview.beneficiaries.payment_type') }}
        </div>
        <div class="col-6 text-md py-3 text-right">
            {{ details.payment_type || '-' }}
        </div>

        <template
            v-if="
                props.beneficiary.meta?.payment_type ===
                BeneficiaryPayOptionEnum.CHEQUE.value
            "
        >
            <div class="col-6 text-md font-bold px-5 py-3">
                {{ $t('insured_overview.insured_address.address') }}
            </div>
            <div class="col-6 text-md py-3 text-right">
                {{ details.address || '-' }}
            </div>

            <div class="col-6 text-md font-bold px-5 py-3">
                {{ $t('insured_overview.insured_address.country') }}
            </div>
            <div class="col-6 text-md py-3 text-right">
                {{ details.country || '-' }}
            </div>

            <div class="col-6 text-md font-bold px-5 py-3">
                {{ $t('insured_overview.insured_address.province') }}
            </div>
            <div class="col-6 text-md py-3 text-right">
                {{ details.province || '-' }}
            </div>

            <div class="col-6 text-md font-bold px-5 py-3">
                {{ $t('insured_overview.insured_address.city') }}
            </div>
            <div class="col-6 text-md py-3 text-right">
                {{ details.city || '-' }}
            </div>

            <div class="col-6 text-md font-bold px-5 py-3">
                {{ $t('insured_overview.insured_address.postal_code') }}
            </div>
            <div class="col-6 text-md py-3 text-right">
                {{ details.postal_code || '-' }}
            </div>
        </template>

        <template
            v-else-if="
                props.beneficiary.meta?.payment_type ===
                BeneficiaryPayOptionEnum.DIRECT_DEPOSIT.value
            "
        >
            <div class="col-6 text-md font-bold px-5 py-3">
                {{ $t('insured_overview.beneficiaries.transit_number') }}
            </div>
            <div class="col-6 text-md py-3 text-right">
                {{ details.transit_number || '-' }}
            </div>

            <div class="col-6 text-md font-bold px-5 py-3">
                {{ $t('insured_overview.beneficiaries.institution_number') }}
            </div>
            <div class="col-6 text-md py-3 text-right">
                {{ details.institution_number || '-' }}
            </div>

            <div class="col-6 text-md font-bold px-5 py-3">
                {{ $t('insured_overview.beneficiaries.account_number') }}
            </div>
            <div class="col-6 text-md py-3 text-right">
                {{ details.account_number || '-' }}
            </div>

            <div class="col-6 text-md font-bold px-5 py-3">
                {{ $t('insured_overview.beneficiaries.email') }}
            </div>
            <div class="col-6 text-md py-3 text-right">
                {{ details.email || '-' }}
            </div>
        </template>

        <template
            v-else-if="
                props.beneficiary.meta?.payment_type ===
                BeneficiaryPayOptionEnum.WIRE_TRANSFER.value
            "
        >
            <div class="col-6 text-md font-bold px-5 py-3">
                {{ $t('insured_overview.beneficiaries.transfer_type') }}
            </div>
            <div class="col-6 text-md py-3 text-right">
                {{
                    details.transfer_type
                        ? helpers.capitalizeWords(details.transfer_type)
                        : '-'
                }}
            </div>

            <div class="col-6 text-md font-bold px-5 py-3">
                {{ $t('insured_overview.beneficiaries.account_number') }}
            </div>
            <div class="col-6 text-md py-3 text-right">
                {{ details.account_number || '-' }}
            </div>

            <template v-if="details.transfer_type === 'domestic'">
                <div class="col-6 text-md font-bold px-5 py-3">
                    {{ $t('insured_overview.beneficiaries.transit_number') }}
                </div>
                <div class="col-6 text-md py-3 text-right">
                    {{ details.transit_number || '-' }}
                </div>

                <div class="col-6 text-md font-bold px-5 py-3">
                    {{
                        $t('insured_overview.beneficiaries.institution_number')
                    }}
                </div>
                <div class="col-6 text-md py-3 text-right">
                    {{ details.institution_number || '-' }}
                </div>
            </template>

            <div class="col-6 text-md font-bold px-5 py-3">
                {{ $t('insured_overview.beneficiaries.swift_code') }}
            </div>
            <div class="col-6 text-md py-3 text-right">
                {{ details.swift_code || '-' }}
            </div>

            <div class="col-6 text-md font-bold px-5 py-3">
                {{ $t('insured_overview.beneficiaries.bank_name') }}
            </div>
            <div class="col-6 text-md py-3 text-right">
                {{ details.bank_name || '-' }}
            </div>

            <div class="col-6 text-md font-bold px-5 py-3">
                {{ $t('insured_overview.beneficiaries.branch_address') }}
            </div>
            <div class="col-6 text-md py-3 text-right">
                {{ details.branch_address || '-' }}
            </div>
        </template>

        <template
            v-else-if="
                props.beneficiary.meta?.payment_type ===
                BeneficiaryPayOptionEnum.CLAIM_REIMBURSEMENT.value
            "
        >
            <div class="col-6 text-md font-bold px-5 py-3">
                {{ $t('insured_overview.insured_address.address') }}
            </div>
            <div class="col-6 text-md py-3 text-right">
                {{ details.address || '-' }}
            </div>

            <div class="col-6 text-md font-bold px-5 py-3">
                {{ $t('insured_overview.insured_address.city') }}
            </div>
            <div class="col-6 text-md py-3 text-right">
                {{ details.city || '-' }}
            </div>

            <div class="col-6 text-md font-bold px-5 py-3">
                {{ $t('insured_overview.insured_address.country') }}
            </div>
            <div class="col-6 text-md py-3 text-right">
                {{ details.country || '-' }}
            </div>

            <div class="col-6 text-md font-bold px-5 py-3">
                {{ $t('insured_overview.insured_address.province') }}
            </div>
            <div class="col-6 text-md py-3 text-right">
                {{ details.province || '-' }}
            </div>

            <div class="col-6 text-md font-bold px-5 py-3">
                {{ $t('insured_overview.insured_address.postal_code') }}
            </div>
            <div class="col-6 text-md py-3 text-right">
                {{ details.postal_code || '-' }}
            </div>

            <div class="col-6 text-md font-bold px-5 py-3">
                {{ $t('insured_overview.beneficiaries.card_number') }}
            </div>
            <div class="col-6 text-md py-3 text-right">
                {{ details.card_number || '-' }}
            </div>

            <div class="col-6 text-md font-bold px-5 py-3">
                {{
                    $t('insured_overview.beneficiaries.claim_reference_number')
                }}
            </div>
            <div class="col-6 text-md py-3 text-right">
                {{ details.claim_reference_number || '-' }}
            </div>
        </template>
    </div>
    <div v-else>
        <div class="mt-3 grid p-fluid formgrid">
            <div class="field col-12" v-if="bannerMessage">
                <Message severity="error" icon="pi pi-times-circle">{{
                    bannerMessage
                }}</Message>
            </div>

            <div class="field col-12">
                <label for="type" data-testid="type-label"
                    >{{
                        $t('insured_overview.beneficiaries.type_of_beneficiary')
                    }}
                    *</label
                >
                <Dropdown
                    id="type"
                    data-testid="type"
                    option-label="label"
                    option-value="value"
                    v-model="beneficiary.type"
                    @change="handleTypeChange"
                    :placeholder="$t('common.select')"
                    :options="Object.values(BeneficiaryTypes)"
                    :disabled="isUpdateForm"
                />
            </div>

            <div class="field col-12">
                <label for="full_name" data-testid="full-name-label"
                    >{{ $t('policies.applicant.full_name') }} *</label
                >
                <InputField
                    id="full_name"
                    data-testid="full-name-input"
                    variant="text"
                    v-model="beneficiary.meta.full_name"
                    :disabled="isDisabled"
                />
            </div>
            <div class="field col-12">
                <label for="phone_number" data-testid="phone-number-label"
                    >{{
                        $t('insured_overview.beneficiaries.contact_number')
                    }}
                    *</label
                >
                <InputField
                    id="phone_number"
                    data-testid="phone-number-input"
                    variant="phone"
                    v-model="beneficiary.meta.phone_number"
                />
            </div>
            <div class="field col-12">
                <label for="payment_type" data-testid="payment-type-label"
                    >{{
                        $t('insured_overview.beneficiaries.payment_type')
                    }}
                    *</label
                >
                <Dropdown
                    id="payment_type"
                    data-testid="payment-type-input"
                    option-label="label"
                    option-value="value"
                    v-model="beneficiary.meta.payment_type"
                    @change="handlePaymentTypeChange"
                    :placeholder="$t('common.select')"
                    :options="paymentOptions"
                />
            </div>

            <template
                v-if="
                    beneficiary.meta &&
                    beneficiary.meta.payment_type ===
                        BeneficiaryPayOptionEnum.CHEQUE.value
                "
            >
                <div class="field col-12">
                    <label for="address" data-testid="address-label"
                        >{{ $t('insured_overview.insured_address.address') }} *
                    </label>
                    <InputField
                        id="address"
                        data-testid="address-input"
                        variant="text"
                        v-model="beneficiary.meta.address"
                    />
                </div>
                <div class="field col-12">
                    <label data-testid="country-label"
                        >{{
                            $t('insured_overview.insured_address.country')
                        }}
                        *</label
                    >
                    <ApiDropdown
                        option-label="name"
                        v-model="beneficiary.meta.country_id"
                        @search="getCountries"
                        @change="getProvinces"
                        :items="countries"
                        option-value="id"
                        data-testid="country-input"
                    />
                </div>
                <div class="field col-12">
                    <label data-testid="province-label">
                        <span>{{
                            $t('insured_overview.insured_address.province')
                        }}</span>
                        <span v-if="hasProvinces"> *</span>
                    </label>
                    <ApiDropdown
                        v-if="hasProvinces"
                        id="province_id"
                        option-label="name"
                        v-model="beneficiary.meta.province_id"
                        @search="getProvinces"
                        :items="provinces"
                        option-value="id"
                        data-testid="province-state-input"
                        :disabled="!beneficiary.meta.country_id"
                    />
                    <InputField
                        v-else
                        disabled
                        id="province_id"
                        variant="text"
                        :model-value="
                            $t(
                                'insured_overview.insured_address.not_applicable'
                            )
                        "
                        data-testid="province-state-input"
                    />
                </div>
                <div class="field col-12">
                    <label for="city" data-testid="city-label"
                        >{{
                            $t('insured_overview.insured_address.city')
                        }}
                        *</label
                    >
                    <InputField
                        id="city"
                        data-testid="city-input"
                        variant="text"
                        v-model="beneficiary.meta.city"
                        :disabled="!beneficiary.meta.country_id"
                    />
                </div>
                <div class="field col-12">
                    <label for="postal_code" data-testid="postal-code-label"
                        >{{
                            $t('insured_overview.insured_address.postal_code')
                        }}
                        *</label
                    >
                    <InputField
                        id="postal_code"
                        data-testid="postal-code-input"
                        variant="text"
                        v-model="beneficiary.meta.postal_code"
                        :disabled="!beneficiary.meta.country_id"
                    />
                </div>
            </template>

            <template
                v-else-if="
                    beneficiary.meta &&
                    beneficiary.meta.payment_type ===
                        BeneficiaryPayOptionEnum.DIRECT_DEPOSIT.value
                "
            >
                <div class="field col-12">
                    <label
                        for="transit_number"
                        data-testid="transit-number-label"
                        >{{
                            $t('insured_overview.beneficiaries.transit_number')
                        }}
                        *</label
                    >
                    <InputField
                        id="transit_number"
                        data-testid="transit-number-input"
                        variant="text"
                        v-model="beneficiary.meta.transit_number"
                        maxlength="5"
                        pattern="[0-9]{5}"
                    />
                </div>
                <div class="field col-12">
                    <label
                        for="institution_number"
                        data-testid="institution-number-label"
                        >{{
                            $t(
                                'insured_overview.beneficiaries.institution_number'
                            )
                        }}
                        *</label
                    >
                    <InputField
                        id="institution_number"
                        data-testid="institution-number-input"
                        variant="text"
                        v-model="beneficiary.meta.institution_number"
                        maxlength="3"
                        pattern="[0-9]{3}"
                    />
                </div>
                <div class="field col-12">
                    <label
                        for="account_number"
                        data-testid="account-number-label"
                        >{{
                            $t('insured_overview.beneficiaries.account_number')
                        }}
                        *</label
                    >
                    <InputField
                        id="account_number"
                        data-testid="account-number-input"
                        variant="text"
                        v-model="beneficiary.meta.account_number"
                        minlength="7"
                        maxlength="12"
                        pattern="[0-9]{7,12}"
                    />
                </div>
                <div class="field col-12">
                    <label for="email" data-testid="email-label">
                        {{ $t('insured_overview.beneficiaries.email') }}
                        *
                    </label>
                    <InputField
                        id="email"
                        variant="text"
                        data-testid="email-input"
                        v-model="beneficiary.meta.email"
                    />
                </div>
            </template>

            <template
                v-else-if="
                    beneficiary.meta &&
                    beneficiary.meta.payment_type ===
                        BeneficiaryPayOptionEnum.WIRE_TRANSFER.value
                "
            >
                <div class="field col-12">
                    <label for="transfer_type" data-testid="transfer-type-label"
                        >{{
                            $t('insured_overview.beneficiaries.transfer_type')
                        }}
                        *</label
                    >
                    <Dropdown
                        id="transfer_type"
                        data-testid="transfer-type-input"
                        option-label="label"
                        option-value="value"
                        v-model="beneficiary.meta.transfer_type"
                        :placeholder="$t('common.select')"
                        :options="[
                            {
                                label: $t(
                                    'insured_overview.beneficiaries.international'
                                ),
                                value: 'international'
                            },
                            {
                                label: $t(
                                    'insured_overview.beneficiaries.domestic'
                                ),
                                value: 'domestic'
                            }
                        ]"
                    />
                </div>
                <div class="field col-12">
                    <label
                        for="account_number"
                        data-testid="account-number-label"
                        >{{
                            $t('insured_overview.beneficiaries.account_number')
                        }}
                        *</label
                    >
                    <InputField
                        id="account_number"
                        data-testid="account-number-input"
                        variant="text"
                        v-model="beneficiary.meta.account_number"
                        minlength="7"
                        maxlength="12"
                        pattern="[0-9]{7,12}"
                    />
                </div>
                <template v-if="beneficiary.meta.transfer_type === 'domestic'">
                    <div class="field col-12">
                        <label
                            for="transit_number"
                            data-testid="transit-number-label"
                            >{{
                                $t(
                                    'insured_overview.beneficiaries.transit_number'
                                )
                            }}
                            *</label
                        >
                        <InputField
                            id="transit_number"
                            data-testid="transit-number-input"
                            variant="text"
                            v-model="beneficiary.meta.transit_number"
                            maxlength="5"
                            pattern="[0-9]{5}"
                        />
                    </div>
                    <div class="field col-12">
                        <label
                            for="institution_number"
                            data-testid="institution-number-label"
                            >{{
                                $t(
                                    'insured_overview.beneficiaries.institution_number'
                                )
                            }}
                            *</label
                        >
                        <InputField
                            id="institution_number"
                            data-testid="institution-number-input"
                            variant="text"
                            v-model="beneficiary.meta.institution_number"
                            maxlength="3"
                            pattern="[0-9]{3}"
                        />
                    </div>
                </template>
                <div class="field col-12">
                    <label for="swift_code" data-testid="swift-code-label"
                        >{{
                            $t('insured_overview.beneficiaries.swift_code')
                        }}
                        *</label
                    >
                    <InputField
                        id="swift_code"
                        data-testid="swift-code-input"
                        variant="text"
                        v-model="beneficiary.meta.swift_code"
                    />
                </div>
                <div class="field col-12">
                    <label for="bank_name" data-testid="bank-name-label"
                        >{{
                            $t('insured_overview.beneficiaries.bank_name')
                        }}
                        *</label
                    >
                    <InputField
                        id="bank_name"
                        data-testid="bank-name-input"
                        variant="text"
                        v-model="beneficiary.meta.bank_name"
                    />
                </div>
                <div class="field col-12">
                    <label
                        for="branch_address"
                        data-testid="branch-address-label"
                        >{{
                            $t('insured_overview.beneficiaries.branch_address')
                        }}
                        *</label
                    >
                    <InputField
                        id="branch_address"
                        data-testid="branch-address-input"
                        variant="text"
                        v-model="beneficiary.meta.branch_address"
                    />
                </div>
            </template>
            <template
                v-else-if="
                    beneficiary.meta &&
                    beneficiary.meta.payment_type ===
                        BeneficiaryPayOptionEnum.CLAIM_REIMBURSEMENT.value
                "
            >
                <div class="field col-12">
                    <label for="address" data-testid="address-label"
                        >{{ $t('insured_overview.insured_address.address') }} *
                    </label>
                    <InputField
                        id="address"
                        data-testid="address-input"
                        variant="text"
                        v-model="beneficiary.meta.address"
                    />
                </div>
                <div class="field col-12">
                    <label for="city" data-testid="city-label"
                        >{{
                            $t('insured_overview.insured_address.city')
                        }}
                        *</label
                    >
                    <InputField
                        id="city"
                        data-testid="city-input"
                        variant="text"
                        v-model="beneficiary.meta.city"
                    />
                </div>
                <div class="field col-12">
                    <label data-testid="country-label"
                        >{{
                            $t('insured_overview.insured_address.country')
                        }}
                        *</label
                    >
                    <ApiDropdown
                        option-label="name"
                        v-model="beneficiary.meta.country_id"
                        @search="getCountries"
                        @change="getProvinces"
                        :items="countries"
                        option-value="id"
                        data-testid="country-input"
                    />
                </div>
                <div class="field col-12">
                    <label data-testid="province-label">
                        <span>{{
                            $t('insured_overview.insured_address.province')
                        }}</span>
                        *
                    </label>
                    <ApiDropdown
                        v-if="hasProvinces"
                        id="province_id"
                        option-label="name"
                        v-model="beneficiary.meta.province_id"
                        @search="getProvinces"
                        :items="provinces"
                        option-value="id"
                        data-testid="province-state-input"
                        :disabled="!beneficiary.meta.country_id"
                    />
                    <InputField
                        v-else
                        disabled
                        id="province_id"
                        variant="text"
                        :model-value="
                            $t(
                                'insured_overview.insured_address.not_applicable'
                            )
                        "
                        data-testid="province-state-input"
                    />
                </div>
                <div class="field col-12">
                    <label for="postal_code" data-testid="postal-code-label"
                        >{{
                            $t('insured_overview.insured_address.postal_code')
                        }}
                        *</label
                    >
                    <InputField
                        id="postal_code"
                        data-testid="postal-code-input"
                        variant="text"
                        v-model="beneficiary.meta.postal_code"
                        :disabled="!beneficiary.meta.country_id"
                    />
                </div>
                <div class="field col-12">
                    <label for="card_number" data-testid="card-number-label"
                        >{{
                            $t('insured_overview.beneficiaries.card_number')
                        }}
                        *</label
                    >
                    <InputField
                        id="card_number"
                        data-testid="card-number-input"
                        variant="text"
                        v-model="beneficiary.meta.card_number"
                    />
                </div>
                <div class="field col-12">
                    <label
                        for="claim_reference_number"
                        data-testid="claim-reference-number-label"
                        >{{
                            $t(
                                'insured_overview.beneficiaries.claim_reference_number'
                            )
                        }}
                        *</label
                    >
                    <InputField
                        id="claim_reference_number"
                        data-testid="claim-reference-number-input"
                        variant="text"
                        v-model="beneficiary.meta.claim_reference_number"
                    />
                </div>
            </template>
        </div>
        <div>
            <Divider />
            <div class="flex justify-content-end gap-2">
                <Button
                    :data-testid="'beneficiary-sidebar-cancel-button'"
                    type="button"
                    :label="$t('buttons.cancel')"
                    class="p-button-outlined"
                    text
                    @click="handleCancel"
                />
                <Button
                    data-testid="beneficiary-sidebar-confirm-button'"
                    icon-pos="left"
                    icon="pi pi-check"
                    type="button"
                    :disabled="!isFormValid"
                    :label="$t('buttons.save')"
                    :loading="isSaving"
                    @click="save"
                />
            </div>
        </div>
    </div>
</template>
