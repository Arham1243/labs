<script setup>
import { ref, reactive, watch, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useClientStore } from '@/modules/clients/stores';
import { useI18n } from 'vue-i18n';

import ClientDetailsForm from '@/modules/clients/components/forms/ClientDetailsForm.vue';
import AddressDetailsForm from '@/modules/clients/components/forms/AddressDetailsForm.vue';
import { ability } from '@/plugins/ability';

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

const emit = defineEmits(['showConfirmation']);

const showUnsavedData = ref(false);
const busy = ref(false);
const loading = ref(false);
const client = ref({});
let formData = reactive({
    name: {
        [useI18n().locale.value]: ''
    },
    short_name: {},
    status: 'draft',
    billing_access_status: true,
    phone_number: null,
    is_phone_number_same_as_client: false,
    website_url: null,
    is_website_url_same_as_client: false,
    location_details: {
        address: null,
        address2: null,
        country: {},
        country_id: null,
        province: {},
        province_id: null,
        city: null,
        postal_code: null
    },
    is_location_details_same_as_client: false,
    account_manager_user: {},
    account_manager_user_id: null,
    client_id: props.clientId
});

onMounted(async () => {
    await getData();
});

watch(formData, (value) => {
    if (value.is_phone_number_same_as_client) {
        formData.phone_number = client.value.phone_number;
    }
    if (value.is_website_url_same_as_client) {
        formData.website_url = client.value.website_url;
    }
    if (value.is_location_details_same_as_client) {
        formData.location_details.address = client.value.address;
        formData.location_details.address2 = client.value.address2;
        formData.location_details.city = client.value.city;
        formData.location_details.country = client.value.country;
        formData.location_details.postal_code = client.value.postal_code;
        formData.location_details.province = client.value.province;
    }
});

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
    const params = { include: 'country,province' };
    const res = await clientStore.getClient(props.clientId, params);
    client.value = res.data;
};

const getItem = async () => {
    if (props.id == -1) return;
    const params = { include: 'accountManager,client,country,province' };
    const res = await clientStore.getBusinessUnit(props.id, params);
    Object.keys(res.data).forEach((key) => (formData[key] = res.data[key]));
};

const handleBack = () => {
    showUnsavedData.value = true;
    emit('showConfirmation');
};

const goBack = () => {
    router.push({ name: 'Client Details', params: { id: props.clientId } });
};

const create = async () => {
    const res = await clientStore.createBusinessUnit(formData);
    goNext(res);
};

const update = async () => {
    const res = await clientStore.updateBusinessUnit(props.id, formData);
    goNext(res);
};

const goNext = (res) => {
    clientStore.setCurrentBusinessUnit(res.data);
    router.push({
        name: 'New Business Unit Step 2',
        params: { id: res.data.id }
    });
};

const processPayload = () => {
    formData.account_manager_user_id = formData.account_manager_user?.id;
    formData.location_details.country_id =
        formData.location_details.country?.id;
    formData.location_details.province_id =
        formData.location_details.province?.id;
};

const save = async () => {
    try {
        busy.value = true;
        processPayload();
        props.id == -1 ? await create() : await update();
    } finally {
        busy.value = false;
    }
};

const isActionAllowed = computed(() => {
    if (props.id == -1) {
        return ability.can('create business units');
    } else {
        return ability.can('update business units');
    }
});
</script>

<template>
    <Loader v-if="loading" />
    <div v-else>
        <div class="p-fluid formgrid grid my-8">
            <div class="col-8 mx-auto">
                <Card>
                    <template #content>
                        <h5
                            class="mb-3"
                            data-testid="business-unit-details-title"
                        >
                            Business Unit Details
                        </h5>
                        <ClientDetailsForm
                            is-new
                            v-model="formData"
                            variant="businessUnit"
                        />
                    </template>
                </Card>
                <Card class="mt-4">
                    <template #content>
                        <div class="formgrid grid mb-4">
                            <h5
                                class="col-12"
                                data-testid="mailing-address-title"
                            >
                                Mailing Address
                            </h5>
                        </div>
                        <div class="formgrid grid mb-4">
                            <div class="flex align-items-center col-12">
                                <div class="flex items-center">
                                    <InputField
                                        id="is_location_details_same_as_client"
                                        variant="checkbox"
                                        binary
                                        v-model="
                                            formData.is_location_details_same_as_client
                                        "
                                        data-testid="same-as-client-input"
                                    />
                                    <label
                                        class="ml-2 mt-1"
                                        for="is_location_details_same_as_client"
                                        data-testid="same-as-client-label"
                                        >Same as Client</label
                                    >
                                </div>
                            </div>
                        </div>
                        <AddressDetailsForm
                            variant="businessUnit"
                            is-new
                            v-model="formData.location_details"
                            :disabled="
                                formData.is_location_details_same_as_client
                            "
                        />
                    </template>
                </Card>
            </div>
        </div>
        <div class="grid my-8">
            <div class="col-8 mx-auto">
                <div
                    class="mt-4 flex justify-content-between align-items-center"
                >
                    <Button
                        label="Cancel"
                        class="p-button-outlined"
                        @click="handleBack"
                        data-testid="cancel-button"
                    />
                    <Button
                        label="Save & Continue"
                        :loading="busy"
                        icon-pos="right"
                        icon="pi pi-chevron-right"
                        @click="save"
                        data-testid="save-continue-button"
                        v-if="isActionAllowed"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
