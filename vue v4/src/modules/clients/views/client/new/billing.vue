<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useClientStore } from '@/modules/clients/stores';

import BillingDetailsForm from '@/modules/clients/components/forms/BillingDetailsForm.vue';
import AddressDetailsForm from '@/modules/clients/components/forms/AddressDetailsForm.vue';

const props = defineProps({
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
const formData = reactive({
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
    province_id: null,
    province: {},
    address: null,
    address2: null,
    city: null,
    postal_code: null,
    client_id: props.id
});

onMounted(async () => {
    await getItem();
});

watch(formData, (newValue) => {
    if (newValue.is_billing_address_same_as_mailing_address) {
        formData.country = client.value.country;
        formData.country_id = client.value.country_id;
        formData.province = client.value.province;
        formData.province_id = client.value.province?.id;
        formData.address = client.value.address;
        formData.address2 = client.value.address2;
        formData.city = client.value.city;
        formData.postal_code = client.value.postal_code;
    }
});

const getItem = async () => {
    try {
        loading.value = true;
        const params = {
            include:
                'billingDetail,billingDetail.country,country,billingDetail.province,province,billingDetail.paymentMethods,billingDetail.enrollmentTypes'
        };
        const res = await clientStore.getClient(props.id, params);
        client.value = res.data;
        processResponse(res.data);
    } finally {
        loading.value = false;
    }
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
    router.push({ name: 'New Client', params: { id: props.id } });
};

const goNext = () => {
    router.push({ name: 'New Client Step 3', params: { id: props.id } });
};

const processResponse = async (data) => {
    if (data.billing_detail) {
        Object.keys(data.billing_detail).forEach(
            (key) => (formData[key] = data.billing_detail[key])
        );
    } else return;
};

const save = async () => {
    try {
        busy.value = true;
        formData.country_id = formData.country?.id;
        formData.province_id = formData.province?.id;
        formData.client_id = props.id;
        if (formData.payment_methods) {
            formData.payment_methods = formData.payment_methods.map(
                (paymentMethod) => paymentMethod.id
            );
        }
        formData.id ? await update() : await create();
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
                        <h5 data-testid="billing-details-title">
                            Billing Details
                        </h5>
                        <BillingDetailsForm is-new v-model="formData" />
                    </template>
                </Card>
                <Card class="mt-7">
                    <template #content>
                        <div class="flex w-full justify-between">
                            <h5
                                data-testid="billing-address-title"
                            >
                                Billing Address
                            </h5>
                        </div>
                        <div class="mt-6">
                            <div class="flex items-center">
                                <Checkbox
                                    id="is_billing_address_same_as_mailing_address"
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
                                    >Same as Mailing Address</label
                                >
                            </div>
                        </div>

                        <AddressDetailsForm
                            is-new
                            v-model="formData"
                            :disabled="
                                formData.is_billing_address_same_as_mailing_address
                            "
                        />
                    </template>
                </Card>
            </div>
        </div>
        <div class="grid grid-cols-12 my-20">
            <div class="col-span-8 col-start-3">
                <div
                    class="mt-12 flex justify-between items-center edit-cancel-button"
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
                            $ability.can('create clients') ||
                            $ability.can('update clients')
                        "
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
