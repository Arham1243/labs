<script setup>
import { ref, reactive, onBeforeMount, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useClientStore } from '@/modules/clients/stores';
import { useI18n } from 'vue-i18n';

import ClientDetailsForm from '@/modules/clients/components/forms/ClientDetailsForm.vue';
import AddressDetailsForm from '@/modules/clients/components/forms/AddressDetailsForm.vue';
import ClientLogo from '@/modules/clients/components/ClientLogo.vue';
import { ability } from '@/plugins/ability';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});

const emit = defineEmits(['showConfirmation']);

const router = useRouter();
const clientStore = useClientStore();

const showUnsavedData = ref(false);
const busy = ref(false);
const changeBusyFromChild = (value) => {
    busy.value = value;
};
const loading = ref(false);
let formData = reactive({
    name: {
        [useI18n().locale.value]: ''
    },
    short_name: {},
    client_sector: {},
    client_sector_id: null,
    phone_number: null,
    website_url: null,
    create_default_business_unit: false,
    address: null,
    address2: null,
    country: {},
    status: 'draft',
    type: 'shared',
    country_id: null,
    city: null,
    postal_code: null,
    province_id: null,
    province: {},
    preferred_language: null,
    logo: null
});

onBeforeMount(() => {
    getItem();
});

const getItem = async () => {
    if (props.id === '-1') return;
    loading.value = true;
    const params = { include: 'clientSector,country,businessUnits,province' };
    const res = await clientStore.getClient(props.id, params);

    formData = {
        ...res.data,
        create_default_business_unit: !!res.data?.business_units.length
    };
    loading.value = false;
};

const handleBack = () => {
    showUnsavedData.value = true;
    emit('showConfirmation');
};

const goBack = () => {
    router.push({ name: 'Clients' });
};

const create = async () => {
    if (typeof formData.preferred_language === 'undefined') {
        formData.preferred_language = null;
    }
    const res = await clientStore.createClient(formData);
    goNext(res);
};

const update = async () => {
    const res = await clientStore.updateClient(props.id, formData);
    goNext(res);
};

const goNext = (res) => {
    clientStore.setCurrentClient(res.data);
    router.push({
        name: 'New Client Step 2',
        params: { id: res.data.id }
    });
};

const processPayload = () => {
    formData.client_sector_id = formData.client_sector?.id;
    formData.country_id = formData.country?.id;
    formData.province_id = formData.province?.id;
    formData.preferred_language = formData.preferred_language?.id;
};

const save = async () => {
    try {
        busy.value = true;
        processPayload();
        props.id === '-1' ? await create() : await update();
    } finally {
        busy.value = false;
    }
};

const isActionAllowed = computed(() => {
    if (props.id == -1) {
        return ability.can('create clients');
    } else {
        return ability.can('update clients');
    }
});
</script>

<template>
    <Loader v-if="loading" />
    <div v-else>
        <div class="grid grid-cols-12 mt-12">
            <div class="col-span-8 col-start-3">
                <Card>
                    <template #content>
                        <h5 data-testid="client-details-title">
                            {{ $t('clients.client_details') }}
                        </h5>
                        <ClientDetailsForm is-new v-model="formData" />
                    </template>
                </Card>
                <Card class="mt-7">
                    <template #content>
                        <h5 data-testid="mailing-address-title" class="mb-12">
                            {{ $t('clients.mailing_address') }}
                        </h5>
                        <AddressDetailsForm is-new v-model="formData" />
                    </template>
                </Card>
                <Card class="mt-7">
                    <template #content>
                        <ClientLogo
                            v-model="formData"
                            is-new
                            @loading="changeBusyFromChild"
                            variant="client"
                            component-id="client-logo"
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
