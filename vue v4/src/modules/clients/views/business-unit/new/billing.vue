<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useClientStore } from '@/modules/clients/stores';

import BillingDetailsForm from '@/modules/clients/components/forms/BillingDetailsForm.vue';
import AddressDetailsForm from '@/modules/clients/components/forms/AddressDetailsForm.vue';

const props = defineProps({
    clientId: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    }
});

const router = useRouter();
const clientStore = useClientStore();

const busy = ref(false);
const loading = ref(false);
const client = ref({});
const item = ref(false);
let formData = reactive({
    is_same_as_client: false,
    enrollment_types: [],
    payment_type: null,
    payment_methods: [],
    invoice_frequency: null,
    payment_terms: null,
    preferred_invoice_name: null,
    quickbooks_id: null,
    is_billing_address_same_as_mailing_address: false,
    country: {},
    country_id: null,
    province: {},
    province_id: null,
    address: null,
    address2: null,
    city: null,
    postal_code: null,
    business_unit_id: props.id
});

onMounted(async () => {
    await getData();
});

watch(
    () => formData.is_billing_address_same_as_mailing_address,
    (value) => {
        if (value) {
            formData.country = item.value.location_details?.country;
            formData.country_id = item.value.location_details?.country_id;
            formData.province = item.value.location_details?.province;
            formData.province_id = item.value.location_details?.province_id;
            formData.address = item.value.location_details?.address;
            formData.address2 = item.value.location_details?.address2;
            formData.city = item.value.location_details?.city;
            formData.postal_code = item.value.location_details?.postal_code;
        }
    }
);

watch(
    () => formData.is_same_as_client,
    (value) => {
        if (value) {
            formData.is_billing_address_same_as_mailing_address = false;
            formData.enrollment_types =
                client.value.billing_detail?.enrollment_types;
            formData.payment_type = client.value.billing_detail?.payment_type;
            formData.payment_methods =
                client.value.billing_detail?.payment_methods;
            formData.invoice_frequency =
                client.value.billing_detail?.invoice_frequency;
            formData.payment_terms = client.value.billing_detail?.payment_terms;
            formData.preferred_invoice_name =
                client.value.billing_detail?.preferred_invoice_name;
            formData.quickbooks_id = client.value.billing_detail?.quickbooks_id;
            formData.country = client.value.billing_detail?.country;
            formData.country_id = client.value.billing_detail?.country_id;
            formData.province = client.value.billing_detail?.province;
            formData.province_id = client.value.billing_detail?.province_id;
            formData.address = client.value.billing_detail?.address;
            formData.address2 = client.value.billing_detail?.address2;
            formData.city = client.value.billing_detail?.city;
            formData.postal_code = client.value.billing_detail?.postal_code;
        }
    }
);

const getData = async () => {
    try {
        loading.value = true;
        await getClient();
        await getItem();
    } finally {
        loading.value = false;
    }
};

const getClient = async () => {
    const params = {
        include:
            'billingDetail,billingDetail.country,country,billingDetail.province,billingDetail.paymentMethods,billingDetail.enrollmentTypes'
    };
    const res = await clientStore.getClient(props.clientId, params);

    client.value = res.data;

    clientStore.setCurrentClient(res.data);
};

const getItem = async () => {
    const params = {
        include:
            'client,billingDetail,billingDetail.country,country,billingDetail.province,billingDetail.paymentMethods,billingDetail.enrollmentTypes'
    };
    const res = await clientStore.getBusinessUnit(props.id, params);

    await processResponse(res.data);
};

const create = async () => {
    await clientStore.createBillingDetail(formData);
    goNext();
};

const update = async () => {
    await clientStore.updateBillingDetail(formData.id, formData);
    goNext();
};

const goBack = () => {
    router.push({ name: 'New Business Unit', params: { id: props.id } });
};

const goNext = () => {
    router.push({ name: 'New Business Unit Step 3', params: { id: props.id } });
};

const processResponse = async (data) => {
    item.value = data;
    if (data.billing_detail) {
        Object.keys(data.billing_detail).forEach(
            (key) => (formData[key] = data.billing_detail[key])
        );
    }
};

const save = async () => {
    try {
        busy.value = true;
        formData.country_id = formData.country?.id;
        formData.province_id = formData.province?.id;
        formData.business_unit_id = props.id;
        if (formData.payment_methods) {
            formData.payment_methods = formData.payment_methods.map(
                (paymentMethod) => paymentMethod.id
            );
        }
        formData.id ? await update() : await create();
        goNext();
    } finally {
        busy.value = false;
    }
};
</script>

<template>
    <Loader v-if="loading" />
    <div v-else>
        <div class="grid grid-cols-12 mt-12">
            <div class="col-span-8 col-start-3">
                <Card>
                    <template #content>
                        <div>
                            <div class="flex w-full justify-between">
                                <h5
                                    data-testid="billing-details-title"
                                >
                                    Billing Details
                                </h5>
                            </div>
                            <div>
                                <div class="flex items-center my-6">
                                    <InputField
                                        id="is_same_as_client"
                                        variant="checkbox"
                                        binary
                                        v-model="formData.is_same_as_client"
                                        data-testid="same-as-client-checkbox"
                                    />
                                    <label
                                        for="is_same_as_client"
                                        class="ml-2 mt-1"
                                        data-testid="same-as-client-label"
                                        >Same as Client’s Billing Details and
                                        Address</label
                                    >
                                </div>
                                <BillingDetailsForm
                                    is-new
                                    v-model="formData"
                                    variant="businessUnit"
                                    :disabled="formData.is_same_as_client"
                                />
                            </div>
                        </div>
                        <Divider />
                        <div>
                            <div class="flex w-full justify-between">
                                <h5
                                    data-testid="billing-address-title"
                                >
                                    Billing Address
                                </h5>
                            </div>
                            <div>
                                <div
                                    v-if="!formData.is_same_as_client"
                                    class="flex items-center my-6"
                                >
                                    <InputField
                                        id="is_billing_address_same_as_mailing_address"
                                        variant="checkbox"
                                        binary
                                        v-model="
                                            formData.is_billing_address_same_as_mailing_address
                                        "
                                        data-testid="same-as-mailing-address-checkbox"
                                    />
                                    <label
                                        for="is_billing_address_same_as_mailing_address"
                                        class="ml-2 mt-1"
                                        data-testid="same-as-mailing-address-label"
                                        >Same as Business Unit</label
                                    >
                                </div>
                                <AddressDetailsForm
                                    is-new
                                    v-model="formData"
                                    :disabled="
                                        formData.is_billing_address_same_as_mailing_address ||
                                        formData.is_same_as_client
                                    "
                                />
                            </div>
                        </div>
                    </template>
                </Card>
            </div>
        </div>
        <div class="grid grid-cols-12 my-20">
            <div class="col-span-8 col-start-3">
                <div
                    class="mt-12 flex justify-between items-center"
                >
                    <Button
                        label="Back"
                        icon="pi pi-chevron-left"
                        class="p-button-outlined"
                        @click="goBack"
                        data-testid="button-back"
                    />
                    <Button
                        label="Save & Continue"
                        :loading="busy"
                        icon-pos="right"
                        icon="pi pi-chevron-right"
                        @click="save"
                        data-testid="button-save-continue"
                        v-if="
                            $ability.can('create business units') ||
                            $ability.can('update business units')
                        "
                    />
                </div>
            </div>
        </div>
    </div>
</template>
