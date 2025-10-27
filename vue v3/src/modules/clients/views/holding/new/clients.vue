<script setup>
import { ref, onMounted, useTemplateRef } from 'vue';
import { useRouter } from 'vue-router';
import { useClientStore } from '@/modules/clients/stores';

import ClientsDropdown from '@/modules/clients/components/ClientsDropdown.vue';
import ClientReassignmentWarningConfirmation from '@/modules/clients/components/dialogs/ClientReassignmentWarningConfirmation.vue';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});

const router = useRouter();
const clientStore = useClientStore();

const clientReassignmentWarningConfirmation = useTemplateRef(
    'clientReassignmentWarningConfirmation'
);
const showUnsavedData = ref(false);
const busy = ref(false);
const loading = ref(false);
const clients = ref([]);
const associated = ref([]);
const clientsDropdownRef = ref(null);

onMounted(async () => {
    await getItem();
});

const getItem = async () => {
    loading.value = true;
    const params = { include: 'clients,contacts,country' };
    const res = await clientStore.getHolding(props.id, params);
    processResponse(res.data);
    loading.value = false;
};

const goBack = () => {
    router.push({ name: 'New Holding Step 2' });
};

const goNext = () => {
    router.push({
        name: 'New Holding Step 4',
        params: { id: props.id }
    });
};

const processResponse = (data) => {
    if (data.clients) {
        associated.value = data.clients;
    }
};

const processPayload = () => {
    const result = {
        resources: {}
    };
    clients.value.forEach((item) => {
        const { id, ...properties } = item;
        result.resources[id] = { ...properties, holding_id: props.id };
    });
    return result;
};

const addClients = async () => {
    try {
        busy.value = true;
        const payload = processPayload();
        await clientStore.batchUpdateClients(payload);
        const params = { include: 'clients,contacts,country' };
        const res = await clientStore.getHolding(props.id, params);
        processResponse(res.data);
        clients.value = [];
        if (clientsDropdownRef.value && clientsDropdownRef.value.getClients) {
            await clientsDropdownRef.value.getClients();
        }
    } finally {
        busy.value = false;
    }
};

const removeClient = async (data) => {
    try {
        busy.value = true;
        const payload = { ...data, holding_id: null };
        await clientStore.updateClient(data.id, payload);
        const params = { include: 'clients,contacts,country' };
        const res = await clientStore.getHolding(props.id, params);
        processResponse(res.data);

        if (clientsDropdownRef.value && clientsDropdownRef.value.getClients) {
            await clientsDropdownRef.value.getClients();
        }
    } finally {
        busy.value = false;
    }
};
</script>

<template>
    <Loader v-if="loading" />
    <div v-else>
        <div class="p-fluid formgrid grid my-8">
            <div class="col-8 mx-auto">
                <Card>
                    <template #content>
                        <h5 class="mb-3" data-testid="clients-title">
                            Add Associated Clients
                        </h5>
                        <ClientsDropdown
                            v-model="clients"
                            :associated="associated"
                            @add="
                                clientReassignmentWarningConfirmation.beginAddClients(
                                    clients
                                )
                            "
                            @remove="removeClient"
                            ref="clientsDropdownRef"
                            :holding_id="id"
                            v-if="$ability.can('view clients')"
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
                        :label="$t('buttons.back')"
                        icon="pi pi-chevron-left"
                        class="p-button-outlined"
                        @click="goBack"
                        data-testid="back-button"
                    />
                    <Button
                        :label="$t('buttons.save_continue')"
                        :loading="busy"
                        icon-pos="right"
                        icon="pi pi-chevron-right"
                        @click="goNext"
                        data-testid="save-continue-button"
                    />
                </div>
            </div>
        </div>
        <Confirmation
            v-model="showUnsavedData"
            :header="$t('common.cancel_creation_header', { item: 'Holding' })"
            :content="$t('common.cancel_creation_content')"
            :confirm-button-text="$t('buttons.cancel')"
            :cancel-button-text="$t('buttons.close')"
            confirm-button-class="bg-red-500 border-red-500"
            @confirm="goBack"
        />
        <ClientReassignmentWarningConfirmation
            ref="clientReassignmentWarningConfirmation"
            @addClients="addClients"
        />
    </div>
</template>
