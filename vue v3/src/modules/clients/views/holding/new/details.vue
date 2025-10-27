<script setup>
import { ref, reactive, onBeforeMount, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useClientStore } from '@/modules/clients/stores';

import ClientDetailsForm from '@/modules/clients/components/forms/ClientDetailsForm.vue';
import AddressDetailsForm from '@/modules/clients/components/forms/AddressDetailsForm.vue';
import { useI18n } from 'vue-i18n';
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
    phone_number: null,
    website_url: null,
    address: null,
    address2: null,
    country: {},
    status: 'draft',
    country_id: null,
    city: null,
    province: {},
    province_id: {},
    postal_code: null,
    logo: null
});

onMounted(async () => {
    await getItem();
});

const getItem = async () => {
    if (props.id == -1) return;
    loading.value = true;
    const params = { include: 'clients,contacts,country,province' };
    const res = await clientStore.getHolding(props.id, params);
    formData = res.data;
    loading.value = false;
};

const handleBack = () => {
    showUnsavedData.value = true;
    emit('showConfirmation');
};

const goBack = () => {
    router.push({ name: 'Holdings' });
};

const create = async () => {
    const res = await clientStore.createHolding(formData);
    goNext(res);
};

const update = async () => {
    const res = await clientStore.updateHolding(props.id, formData);
    goNext(res);
};

const goNext = (res) => {
    clientStore.setCurrentHolding(res.data);
    router.push({
        name: 'New Holding Step 2',
        params: { id: res.data.id }
    });
};

const processPayload = () => {
    formData.country_id = formData.country?.id;

    formData.province_id = formData.country_id ? formData.province?.id : null;
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
        return ability.can('create holdings');
    } else {
        return ability.can('update holdings');
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
                        <h5 class="mb-3" data-testid="holding-details-title">
                            Holding Details
                        </h5>
                        <ClientDetailsForm
                            is-new
                            v-model="formData"
                            variant="holding"
                        />
                    </template>
                </Card>
                <Card class="mt-4">
                    <template #content>
                        <h5 class="mb-3" data-testid="mailing-address-title">
                            {{ $t('clients.mailing_address') }}
                        </h5>
                        <AddressDetailsForm is-new v-model="formData" />
                    </template>
                </Card>
                <Card class="mt-4">
                    <template #content>
                        <ClientLogo
                            v-model="formData"
                            is-new
                            @loading="changeBusyFromChild"
                            variant="holding"
                            component-id="client-logo"
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
