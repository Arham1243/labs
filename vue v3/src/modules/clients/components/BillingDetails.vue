<script setup>
import { ref, computed, onMounted, watchEffect, onUnmounted, watch } from 'vue';
import lodash from 'lodash';
import { invoiceFrequency, paymentTypes } from '@/config';
import { useRoute } from 'vue-router';
import { useClientStore } from '@/modules/clients/stores/Client';

import BillingDetailsForm from '@/modules/clients/components/forms/BillingDetailsForm.vue';
import AddressDetailsForm from '@/modules/clients/components/forms/AddressDetailsForm.vue';
import { useEditState } from '@/modules/clients/composables/useEditState';
import { ability } from '@/plugins/ability';

const props = defineProps({
    data: {
        type: Object,
        required: true
    },
    isNew: {
        type: Boolean,
        default: false
    },
    variant: {
        type: String,
        default: 'client'
    },
    businessUnit: {
        type: Object
    },
    componentId: {
        type: String,
        required: true
    },
    isReview: {
        type: Boolean,
        default: false
    }
});

const route = useRoute();
const clientStore = useClientStore();

const {
    activeEditComponent,
    setActiveComponent,
    clearActiveComponent,
    handleUnsavedChanges,
    registerCancelCallback,
    unregisterCancelCallback
} = useEditState();

const busy = ref(false);
const loading = ref(false);
const isEditing = ref(false);

const item = ref({});
const itemToUpdate = ref({});
const client = ref({});

watchEffect(() => {
    if (
        props.variant === 'businessUnit' &&
        isEditing.value &&
        itemToUpdate.value
    ) {
        const wasIsSameAsClient = itemToUpdate.value.is_same_as_client;
        const wasIsBillingAddressSameAsMailing =
            itemToUpdate.value.is_billing_address_same_as_mailing_address;

        if (wasIsSameAsClient === undefined) {
            const isSameAsClient =
                lodash.isEqual(
                    itemToUpdate.value.payment_methods?.map(
                        (paymentMethod) => paymentMethod.id
                    ),
                    client.value.billing_detail?.payment_methods?.map(
                        (paymentMethod) => paymentMethod.id
                    )
                ) &&
                lodash.isEqual(
                    itemToUpdate.value.enrollment_types,
                    client.value.billing_detail?.enrollment_types
                ) &&
                itemToUpdate.value.invoice_frequency ===
                    client.value.billing_detail?.invoice_frequency &&
                itemToUpdate.value.payment_terms ===
                    client.value.billing_detail?.payment_terms &&
                itemToUpdate.value.payment_type ===
                    client.value.billing_detail?.payment_type &&
                itemToUpdate.value.preferred_invoice_name ===
                    client.value.billing_detail?.preferred_invoice_name &&
                itemToUpdate.value.quickbooks_id ===
                    client.value.billing_detail?.quickbooks_id &&
                itemToUpdate.value.country?.id ===
                    client.value.billing_detail?.country?.id &&
                itemToUpdate.value.province?.id ===
                    client.value.billing_detail?.province?.id &&
                itemToUpdate.value.city === client.value.billing_detail?.city &&
                itemToUpdate.value.address ===
                    client.value.billing_detail?.address &&
                itemToUpdate.value.address2 ===
                    client.value.billing_detail?.address2 &&
                itemToUpdate.value.postal_code ===
                    client.value.billing_detail?.postal_code;

            if (isSameAsClient !== wasIsSameAsClient) {
                itemToUpdate.value.is_same_as_client = isSameAsClient;
            }
        }

        if (
            !itemToUpdate.value.is_same_as_client &&
            wasIsBillingAddressSameAsMailing === undefined
        ) {
            const isBillingAddressSameAsMailing =
                itemToUpdate.value.country?.id ===
                    props.businessUnit?.location_details?.country_id &&
                itemToUpdate.value.province?.id ===
                    props.businessUnit?.location_details?.province_id &&
                itemToUpdate.value.city ===
                    props.businessUnit?.location_details?.city &&
                itemToUpdate.value.address ===
                    props.businessUnit?.location_details?.address &&
                itemToUpdate.value.address2 ===
                    props.businessUnit?.location_details?.address2 &&
                itemToUpdate.value.postal_code ===
                    props.businessUnit?.location_details?.postal_code;

            if (
                isBillingAddressSameAsMailing !==
                wasIsBillingAddressSameAsMailing
            ) {
                itemToUpdate.value.is_billing_address_same_as_mailing_address =
                    isBillingAddressSameAsMailing;
            }
        }
    }
});

onMounted(() => {
    setItem();
    getClient();
    registerCancelCallback(props.componentId, handleCancel);
});

onUnmounted(() => {
    unregisterCancelCallback(props.componentId);
});

watch(
    () => itemToUpdate.value.is_billing_address_same_as_mailing_address,
    (isChecked) => {
        if (isChecked) {
            if (props.variant === 'businessUnit' && props.businessUnit) {
                itemToUpdate.value.country =
                    props.businessUnit.location_details?.country;
                itemToUpdate.value.country_id =
                    props.businessUnit.location_details?.country_id;
                itemToUpdate.value.province =
                    props.businessUnit.location_details?.province;
                itemToUpdate.value.province_id =
                    props.businessUnit.location_details?.province_id;
                itemToUpdate.value.address =
                    props.businessUnit.location_details?.address;
                itemToUpdate.value.address2 =
                    props.businessUnit.location_details?.address2;
                itemToUpdate.value.city =
                    props.businessUnit.location_details?.city;
                itemToUpdate.value.postal_code =
                    props.businessUnit.location_details?.postal_code;
            } else {
                const source =
                    props.variant === 'client'
                        ? clientStore.currentClient
                        : client.value;
                itemToUpdate.value.country = source.country;
                itemToUpdate.value.country_id = source.country_id;
                itemToUpdate.value.province = source.province;
                itemToUpdate.value.province_id = source.province?.id;
                itemToUpdate.value.address = source.address;
                itemToUpdate.value.address2 = source.address2;
                itemToUpdate.value.city = source.city;
                itemToUpdate.value.postal_code = source.postal_code;
            }
        }
    },
    { immediate: true }
);

watch(
    () => itemToUpdate.value.is_same_as_client,
    (isSameAsClient) => {
        if (isSameAsClient && client.value?.billing_detail) {
            itemToUpdate.value.payment_methods = [];
            itemToUpdate.value.enrollment_types = [];

            if (client.value.billing_detail.payment_methods) {
                if (
                    Array.isArray(client.value.billing_detail.payment_methods)
                ) {
                    itemToUpdate.value.payment_methods = lodash.cloneDeep(
                        client.value.billing_detail.payment_methods
                    );
                }
            }
            if (client.value.billing_detail.enrollment_types) {
                if (
                    Array.isArray(client.value.billing_detail.enrollment_types)
                ) {
                    itemToUpdate.value.enrollment_types = lodash.cloneDeep(
                        client.value.billing_detail.enrollment_types
                    );
                }
            }

            itemToUpdate.value.payment_type =
                client.value.billing_detail.payment_type || null;
            itemToUpdate.value.invoice_frequency =
                client.value.billing_detail.invoice_frequency || null;
            itemToUpdate.value.payment_terms =
                client.value.billing_detail.payment_terms || null;
            itemToUpdate.value.preferred_invoice_name =
                client.value.billing_detail.preferred_invoice_name || null;
            itemToUpdate.value.quickbooks_id =
                client.value.billing_detail.quickbooks_id || null;
            itemToUpdate.value.country =
                client.value.billing_detail.country || null;
            itemToUpdate.value.province =
                client.value.billing_detail.province || null;
            itemToUpdate.value.address =
                client.value.billing_detail.address || null;
            itemToUpdate.value.address2 =
                client.value.billing_detail.address2 || null;
            itemToUpdate.value.city = client.value.billing_detail.city || null;
            itemToUpdate.value.postal_code =
                client.value.billing_detail.postal_code || null;
            itemToUpdate.value.is_billing_address_same_as_mailing_address = false;
        }
    },
    { immediate: true }
);

const isEditDisabled = computed(() => {
    return (
        activeEditComponent.value &&
        activeEditComponent.value !== props.componentId
    );
});

function compareFormData(original, updated) {
    if (!original || !updated) return true;
    const getComparableObject = (obj) => {
        return {
            invoice_frequency: obj.invoice_frequency || null,
            payment_terms: obj.payment_terms || null,
            preferred_invoice_name: obj.preferred_invoice_name || null,
            quickbooks_id: obj.quickbooks_id || null,
            is_same_as_client: obj.is_same_as_client || false,
            country_id: obj.country?.id || obj.country_id || null,
            province_id: obj.province?.id || obj.province_id || null,
            address: obj.address || null,
            address2: obj.address2 || null,
            city: obj.city || null,
            postal_code: obj.postal_code || null,
            is_billing_address_same_as_mailing_address:
                obj.is_billing_address_same_as_mailing_address || false,
            payment_methods:
                obj.payment_methods
                    ?.map((paymentMethod) => paymentMethod.id)
                    ?.sort() || null,
            enrollment_types: obj.enrollment_types?.sort() || null
        };
    };

    const compareOriginal = getComparableObject(lodash.cloneDeep(original));
    const compareUpdated = getComparableObject(lodash.cloneDeep(updated));

    return lodash.isEqual(compareOriginal, compareUpdated);
}

const isNotChanged = computed(() =>
    compareFormData(item.value, itemToUpdate.value)
);

const setItem = () => {
    if (props.data) item.value = lodash.cloneDeep(props.data);
};

const getClient = async () => {
    if (props.variant === 'client') return;
    try {
        loading.value = true;
        const params = {
            include:
                'billingDetail,billingDetail.paymentMethods,billingDetail.enrollmentTypes,billingDetail.country,billingDetail.province'
        };
        const res = await clientStore.getClient(route.params.clientId, params);
        client.value = res.data;
    } finally {
        loading.value = false;
    }
};

const processData = (data) => {
    props.variant === 'client'
        ? clientStore.setCurrentClient(data)
        : clientStore.setCurrentBusinessUnit(data);
    item.value = lodash.cloneDeep(data.billing_detail);
    itemToUpdate.value = lodash.cloneDeep(item.value);
};

const handleEdit = () => {
    itemToUpdate.value = lodash.cloneDeep(item.value);

    if (itemToUpdate.value.id) {
        props.variant === 'client'
            ? (itemToUpdate.value.client_id = item.value.billiable_id)
            : (itemToUpdate.value.business_unit_id = item.value.billiable_id);
    } else {
        if (!('is_same_as_client' in itemToUpdate.value)) {
            itemToUpdate.value.is_same_as_client =
                props.variant === 'businessUnit' ? false : false;
        }

        if (
            !(
                'is_billing_address_same_as_mailing_address' in
                itemToUpdate.value
            )
        ) {
            itemToUpdate.value.is_billing_address_same_as_mailing_address = true;
        }

        props.variant === 'client'
            ? (itemToUpdate.value.client_id = route.params.id)
            : (itemToUpdate.value.business_unit_id = route.params.id);
    }

    if (props.variant === 'businessUnit') {
        if (
            !itemToUpdate.value.hasOwnProperty('is_same_as_client') ||
            itemToUpdate.value.is_same_as_client === undefined
        ) {
            itemToUpdate.value.is_same_as_client =
                itemToUpdate.value.invoice_frequency ===
                    client.value.billing_detail?.invoice_frequency &&
                itemToUpdate.value.payment_terms ===
                    client.value.billing_detail?.payment_terms &&
                itemToUpdate.value.preferred_invoice_name ===
                    client.value.billing_detail?.preferred_invoice_name &&
                itemToUpdate.value.quickbooks_id ===
                    client.value.billing_detail?.quickbooks_id &&
                itemToUpdate.value.country?.id ===
                    client.value.billing_detail?.country_id &&
                itemToUpdate.value.province?.id ===
                    client.value.billing_detail?.province_id &&
                itemToUpdate.value.city === client.value.billing_detail?.city &&
                itemToUpdate.value.address ===
                    client.value.billing_detail?.address &&
                itemToUpdate.value.address2 ===
                    client.value.billing_detail?.address2 &&
                itemToUpdate.value.postal_code ===
                    client.value.billing_detail?.postal_code;
        }

        if (
            !itemToUpdate.value.hasOwnProperty(
                'is_billing_address_same_as_mailing_address'
            ) ||
            itemToUpdate.value.is_billing_address_same_as_mailing_address ===
                undefined
        ) {
            if (!itemToUpdate.value.is_same_as_client && props.businessUnit) {
                itemToUpdate.value.is_billing_address_same_as_mailing_address =
                    itemToUpdate.value.country?.id ===
                        props.businessUnit.location_details?.country_id &&
                    itemToUpdate.value.province?.id ===
                        props.businessUnit.location_details?.province_id &&
                    itemToUpdate.value.city ===
                        props.businessUnit.location_details?.city &&
                    itemToUpdate.value.address ===
                        props.businessUnit.location_details?.address &&
                    itemToUpdate.value.address2 ===
                        props.businessUnit.location_details?.address2 &&
                    itemToUpdate.value.postal_code ===
                        props.businessUnit.location_details?.postal_code;
            }
        }
    }

    isEditing.value = true;
    setActiveComponent(props.componentId);
};

const handleCancel = () => {
    if (props.isReview) {
        isEditing.value = false;
        clearActiveComponent();
    } else {
        if (!isNotChanged.value) {
            handleUnsavedChanges(() => {
                isEditing.value = false;
                clearActiveComponent();
            });
        } else {
            isEditing.value = false;
            clearActiveComponent();
        }
    }
};

const save = async () => {
    try {
        busy.value = true;
        itemToUpdate.value.country_id = itemToUpdate.value.country?.id;
        itemToUpdate.value.province_id = itemToUpdate.value.province?.id;

        let paymentMethods = [];

        if (itemToUpdate.value.payment_methods) {
            paymentMethods = itemToUpdate.value.payment_methods.map(
                (paymentMethod) => paymentMethod.id
            );
        }

        if (itemToUpdate.value.id) {
            await clientStore.updateBillingDetail(itemToUpdate.value.id, {
                ...itemToUpdate.value,
                ...{ payment_methods: paymentMethods }
            });
        } else {
            await clientStore.createBillingDetail({
                ...itemToUpdate.value,
                ...{ payment_methods: paymentMethods }
            });
        }
        const params =
            props.variant === 'client'
                ? {
                      include:
                          'clientSector,country,billingDetail,billingDetail.country,billingDetail.province,contacts,defaultBusinessUnit,billingDetail.paymentMethods,billingDetail.enrollmentTypes'
                  }
                : {
                      include:
                          'client,accountManager,billingDetail,billingDetail.country,contacts,billingDetail.province,billingDetail.paymentMethods,billingDetail.enrollmentTypes'
                  };
        const res =
            props.variant === 'client'
                ? await clientStore.getClient(route.params.id, params)
                : await clientStore.getBusinessUnit(route.params.id, params);

        processData(res.data);
        isEditing.value = false;
        clearActiveComponent();
    } finally {
        busy.value = false;
    }
};

const isActionAllowed = computed(() => {
    switch (props.variant) {
        case 'client':
            return ability.can('update clients');
        case 'businessUnit':
            return ability.can('update business units');
        default:
            return false;
    }
});
</script>

<template>
    <Loader v-if="loading" />
    <div v-else>
        <div class="grid">
            <div class="col-12">
                <Card>
                    <template #content>
                        <div
                            class="flex justify-content-between align-items-center"
                        >
                            <div class="mb-3 flex align-items-start gap-3">
                                <h5
                                    class="mb-2"
                                    data-testid="billing-details-title"
                                >
                                    Billing Details
                                </h5>
                                <div
                                    v-if="
                                        variant === 'businessUnit' &&
                                        item.is_same_as_client
                                    "
                                >
                                    <Tag
                                        :pt="{
                                            root: {
                                                class: 'bg-gray-300 text-black-alpha-90',
                                                style: 'font-size:9px; font-weight: 200'
                                            }
                                        }"
                                        >SAME AS CLIENT</Tag
                                    >
                                </div>
                            </div>
                            <div v-if="isEditing">
                                <Button
                                    label="Cancel"
                                    class="p-button-outlined mr-2"
                                    @click="handleCancel"
                                />
                                <Button
                                    label="Save"
                                    :loading="busy"
                                    :disabled="isNotChanged"
                                    @click="save"
                                    v-if="isActionAllowed"
                                />
                            </div>
                            <Button
                                v-else
                                size="small"
                                text
                                class="px-2 py-1"
                                label="Edit"
                                icon="pi pi-pencil"
                                :disabled="isEditDisabled"
                                @click="handleEdit"
                                data-testid="edit-button"
                            />
                        </div>
                        <div v-if="isEditing">
                            <div
                                v-if="variant === 'businessUnit'"
                                class="flex items-center my-3"
                            >
                                <InputField
                                    id="is_same_as_client"
                                    variant="checkbox"
                                    binary
                                    v-model="itemToUpdate.is_same_as_client"
                                    data-testid="same-as-client-checkbox"
                                />
                                <label
                                    for="is_same_as_client"
                                    class="ml-2 mt-1"
                                    data-testid="same-as-client-label"
                                    >Same as Client's Billing Details and
                                    Address</label
                                >
                            </div>
                            <BillingDetailsForm
                                :isNew="isNew"
                                v-model="itemToUpdate"
                                :variant="variant"
                                :disabled="
                                    variant === 'businessUnit' &&
                                    itemToUpdate.is_same_as_client
                                "
                            />

                            <hr class="my-3" />
                            <h5
                                class="mb-2"
                                data-testid="billing-address-title"
                            >
                                Billing Address
                            </h5>
                            <div
                                v-if="!itemToUpdate.is_same_as_client"
                                class="flex items-center my-3"
                            >
                                <InputField
                                    id="is_billing_address_same_as_mailing_address"
                                    variant="checkbox"
                                    binary
                                    v-model="
                                        itemToUpdate.is_billing_address_same_as_mailing_address
                                    "
                                    data-testid="same-as-mailing-address-checkbox"
                                />
                                <label
                                    for="is_billing_address_same_as_mailing_address"
                                    class="ml-2 mt-1"
                                    data-testid="same-as-mailing-address-label"
                                    >{{
                                        businessUnit
                                            ? 'Same as Business Unit'
                                            : 'Same as Mailing Address'
                                    }}</label
                                >
                            </div>
                            <AddressDetailsForm
                                :isNew="isNew"
                                v-model="itemToUpdate"
                                :disabled="
                                    itemToUpdate.is_same_as_client ||
                                    itemToUpdate.is_billing_address_same_as_mailing_address
                                "
                            />
                        </div>
                        <div v-else>
                            <div class="grid mt-1">
                                <div
                                    data-testid="payment-type-label"
                                    class="col-3 text-sm font-semibold py-1"
                                >
                                    Payment Type:
                                </div>
                                <div class="col-9 text-sm py-1">
                                    {{
                                        paymentTypes.find(
                                            (f) => f.code === item.payment_type
                                        )?.name
                                    }}
                                </div>
                                <div
                                    data-testid="payment-method-label"
                                    class="col-3 text-sm font-semibold py-1"
                                >
                                    Payment Methods:
                                </div>
                                <div class="col-9 text-sm py-1">
                                    {{
                                        item.payment_methods
                                            ?.map((i) =>
                                                i.payment_provider_id.replaceAll(
                                                    '_',
                                                    ' '
                                                )
                                            )
                                            ?.join(', ')
                                    }}
                                </div>
                                <div
                                    data-testid="invoice-frequency-label"
                                    class="col-3 text-sm font-semibold py-1"
                                >
                                    Invoice Frequency:
                                </div>
                                <div class="col-9 text-sm py-1">
                                    {{
                                        invoiceFrequency.find(
                                            (f) =>
                                                f.code ===
                                                item.invoice_frequency
                                        )?.name
                                    }}
                                </div>
                                <div
                                    data-testid="enrollment-types-label"
                                    class="col-3 text-sm font-semibold py-1"
                                >
                                    Enrolment Types:
                                </div>
                                <div class="col-9 text-sm py-1">
                                    {{ item.enrollment_types?.join(', ') }}
                                </div>
                                <div
                                    data-testid="payment-terms-label"
                                    class="col-3 text-sm font-semibold py-1"
                                >
                                    Payment Terms:
                                </div>
                                <div class="col-9 text-sm py-1">
                                    {{ item.payment_terms }}
                                </div>
                                <div
                                    data-testid="preferred-invoice-name-label"
                                    class="col-3 text-sm font-semibold py-1"
                                >
                                    Preferred Invoice Name:
                                </div>
                                <div class="col-9 text-sm py-1">
                                    {{ item.preferred_invoice_name }}
                                </div>
                                <div
                                    data-testid="quickbooks-id-label"
                                    class="col-3 text-sm font-semibold py-1"
                                >
                                    Quickbooks ID:
                                </div>
                                <div class="col-9 text-sm py-1">
                                    {{ item.quickbooks_id }}
                                </div>
                            </div>

                            <hr class="my-3" />
                            <div class="mb-3 flex align-items-center gap-3">
                                <h5 data-testid="billing-address-title">
                                    Billing Address
                                </h5>
                                <div
                                    v-if="
                                        variant === 'businessUnit' &&
                                        item.is_same_as_client
                                    "
                                >
                                    <Tag
                                        :pt="{
                                            root: {
                                                class: 'bg-gray-300 text-black-alpha-90',
                                                style: 'font-size:9px; font-weight: 200'
                                            }
                                        }"
                                        >SAME AS CLIENT</Tag
                                    >
                                </div>
                                <div
                                    v-else-if="
                                        item.is_billing_address_same_as_mailing_address
                                    "
                                >
                                    <Tag
                                        :pt="{
                                            root: {
                                                class: 'bg-gray-300 text-black-alpha-90',
                                                style: 'font-size:9px; font-weight: 200'
                                            }
                                        }"
                                        >{{
                                            variant === 'businessUnit'
                                                ? 'SAME AS BUSINESS UNIT'
                                                : 'SAME AS MAILING ADDRESS'
                                        }}</Tag
                                    >
                                </div>
                            </div>
                            <div class="grid mt-1">
                                <div
                                    data-testid="address-label"
                                    class="col-3 text-sm font-semibold py-1"
                                >
                                    Address:
                                </div>
                                <div class="col-9 text-sm py-1">
                                    {{ item.address }}
                                </div>
                                <div
                                    data-testid="address2-label"
                                    class="col-3 text-sm font-semibold py-1"
                                >
                                    Address 2:
                                </div>
                                <div class="col-9 text-sm py-1">
                                    {{ item.address2 }}
                                </div>
                                <div
                                    data-testid="country-label"
                                    class="col-3 text-sm font-semibold py-1"
                                >
                                    Country:
                                </div>
                                <div class="col-9 text-sm py-1">
                                    {{ item.country?.name }}
                                </div>
                                <div
                                    data-testid="province-label"
                                    class="col-3 text-sm font-semibold py-1"
                                >
                                    Province/State:
                                </div>
                                <div class="col-9 text-sm py-1">
                                    {{ item.province?.name }}
                                </div>
                                <div
                                    data-testid="city-label"
                                    class="col-3 text-sm font-semibold py-1"
                                >
                                    City:
                                </div>
                                <div class="col-9 text-sm py-1">
                                    {{ item.city }}
                                </div>
                                <div
                                    data-testid="postal-code-label"
                                    class="col-3 text-sm font-semibold py-1"
                                >
                                    Postal/Zip Code:
                                </div>
                                <div class="col-9 text-sm py-1">
                                    {{ item.postal_code }}
                                </div>
                            </div>
                        </div>
                    </template>
                </Card>
            </div>
        </div>
    </div>
</template>
