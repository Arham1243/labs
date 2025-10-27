<script setup>
import { ref, onMounted, useTemplateRef, computed } from 'vue';
import lodash from 'lodash';
import { useClientStore } from '@/modules/clients/stores';
import { useHelpers } from '@/composables';

import ClientsDropdown from '@/modules/clients/components/ClientsDropdown.vue';
import ClientReassignmentWarningConfirmation from '@/modules/clients/components/dialogs/ClientReassignmentWarningConfirmation.vue';
import { useEditState } from '@/modules/clients/composables/useEditState';
import { useEmptyFields } from '@/modules/clients/composables/useEmptyFields';

const props = defineProps({
    data: {
        type: Object,
        required: true
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

const {
    activeEditComponent,
    setActiveComponent,
    clearActiveComponent,
    handleUnsavedChanges
} = useEditState();

const clientStore = useClientStore();
const helpers = useHelpers();
const emit = defineEmits(['update:data']);

const busy = ref(false);
const loading = ref(false);
const isEditing = ref(false);
const clients = ref([]);
const item = ref({});
const itemToUpdate = ref({});
const associated = ref([]);

const clientReassignmentWarningConfirmation = useTemplateRef(
    'clientReassignmentWarningConfirmation'
);
const clientsDropdownRef = useTemplateRef('clientsDropdownRef');

onMounted(() => {
    setItem();
});

const isEditDisabled = computed(() => {
    return (
        activeEditComponent.value &&
        activeEditComponent.value !== props.componentId
    );
});

const { isNotChanged } = useEmptyFields(item, itemToUpdate);

const setItem = () => {
    if (props.data) item.value = lodash.cloneDeep(props.data);
};

const handleEdit = () => {
    itemToUpdate.value = lodash.cloneDeep(item.value);
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

const processResponse = (data) => {
    item.value = lodash.cloneDeep(data);
    itemToUpdate.value = lodash.cloneDeep(item.value);
    emit('update:data', itemToUpdate.value);
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
        result.resources[id] = {
            ...properties,
            holding_id: itemToUpdate.value.id
        };
    });
    return result;
};

const addClients = async () => {
    try {
        busy.value = true;
        const payload = processPayload();
        await clientStore.batchUpdateClients(payload);
        const params = { include: 'clients,contacts,country' };
        const res = await clientStore.getHolding(itemToUpdate.value.id, params);
        processResponse(res.data);
        await resetClientsDropdown();
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
        const res = await clientStore.getHolding(itemToUpdate.value.id, params);
        processResponse(res.data);
        await resetClientsDropdown();
    } finally {
        busy.value = false;
    }
};

const resetClientsDropdown = async () => {
    clients.value = [];
    await clientsDropdownRef.value.getClients();
};

const getAddress = (client) => {
    const arr = [];
    if (client.address) {
        arr.push(client.address);
    }

    if (client.city) {
        arr.push(client.city);
    }

    if (client.postal_code) {
        arr.push(client.postal_code);
    }

    return arr.toString();
};
</script>

<template>
    <Loader v-if="loading" />
    <div v-else>
        <div class="flex justify-content-between align-items-center mb-3">
            <h5 class="mb-2" data-testid="associated-client-details-title">
                Associated Client Details
            </h5>
            <div v-if="isEditing">
                <Button
                    :loading="busy"
                    label="Cancel"
                    class="p-button-outlined mr-2"
                    @click="handleCancel"
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

        <ClientsDropdown
            v-if="isEditing && $ability.can('view clients')"
            v-model="clients"
            :associated="associated"
            @add="
                clientReassignmentWarningConfirmation.beginAddClients(clients)
            "
            @remove="removeClient"
            :holding_id="item.id"
            ref="clientsDropdownRef"
        />

        <div v-if="!isEditing">
            <div v-for="(client, index) in item.clients" :key="client.id">
                <div class="mb-1">
                    {{ helpers.getLocaleValue(client.name) }}
                </div>
                <div class="text-sm text-gray-600">
                    <template
                        v-if="
                            client.address || client.city || client.postal_code
                        "
                    >
                        {{ getAddress(client) }}
                    </template>
                    <template v-else> No address provided </template>
                </div>
                <hr v-if="index !== item.clients.length - 1" />
            </div>
        </div>
    </div>
    <ClientReassignmentWarningConfirmation
        ref="clientReassignmentWarningConfirmation"
        @addClients="addClients"
    />
</template>

<style lang="scss" scoped></style>
