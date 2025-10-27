<script setup>
import { ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { contactSources } from '@/config';

import { useClientStore } from '@/modules/clients/stores/Client';
import { usePoliciesStore } from '@/modules/policies/stores/Policies';

const router = useRouter();
const route = useRoute();
const clientStore = useClientStore();
const policiesStore = usePoliciesStore();

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    pageOfOrigin: {
        type: String,
        default: 'Policies'
    }
});

const emit = defineEmits(['update:modelValue']);

const clients = ref([]);
const businessUnits = ref([]);
const linksToMessages = ref([]);
const selectedClient = ref(null);
const selectedBusinessUnit = ref(null);
const selectedContactSource = ref(null);
const selectedLinkToMessage = ref(null);
const loadingClients = ref(false);
const loadingBusinessUnits = ref(false);
const loadingLinkToMessages = ref(false);
const discardDialog = ref(false);

const dialog = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emit('update:modelValue', value);
    }
});

const isFormValid = computed(() => {
    return (
        selectedClient.value &&
        selectedBusinessUnit.value &&
        selectedContactSource.value &&
        (selectedContactSource.value.id !== 'message_center' ||
            selectedLinkToMessage.value)
    );
});

const isModified = computed(
    () =>
        selectedClient.value ||
        selectedBusinessUnit.value ||
        selectedContactSource.value ||
        selectedLinkToMessage.value
);

const isBusinessUnitFieldDisabled = computed(
    () => !!selectedBusinessUnit.value && businessUnits.value.length == 1
);

const confirmCloseOrderPoliciesDialog = (event) => {
    dialog.value = false;
};

const closeOrderPoliciesDialog = (event) => {
    if (isModified.value) {
        discardDialog.value = true;
    } else {
        confirmCloseOrderPoliciesDialog();
    }
};

const resetOrderPoliciesDialog = () => {
    clients.value = [];
    businessUnits.value = [];
    loadingClients.value = false;
    loadingBusinessUnits.value = false;
    loadingLinkToMessages.value = false;

    selectedClient.value = null;
    selectedBusinessUnit.value = null;
    selectedContactSource.value = null;
    selectedLinkToMessage.value = null;
};

const proceedOrderPolicies = (event) => {
    policiesStore.clearOrderDetails();
    policiesStore.setExitOrderTo(props.pageOfOrigin, route.query);
    policiesStore.setOrderDetails(
        selectedClient.value,
        selectedBusinessUnit.value,
        selectedContactSource.value,
        selectedLinkToMessage.value
    );

    if (!policiesStore.isOrderDetailsIncomplete) {
        router.push({ name: 'Order' });
        confirmCloseOrderPoliciesDialog();
    }
};

const getClients = async (search) => {
    try {
        loadingClients.value = true;
        const res = await clientStore.searchClients(
            {
                search: {
                    value: search
                }
            },
            { limit: 100 }
        );
        clients.value = res.data;
    } finally {
        loadingClients.value = false;
    }
};

const getBusinessUnits = async (search) => {
    try {
        loadingBusinessUnits.value = true;
        const res = await clientStore.searchBusinessUnits(
            {
                search: {
                    value: search
                },
                filters: [
                    {
                        field: 'client.id',
                        value: selectedClient?.value?.id
                    }
                ],
                includes: [
                    {
                        relation: 'billingDetail'
                    }
                ]
            },
            { limit: 100 }
        );
        businessUnits.value = res.data;
    } finally {
        loadingBusinessUnits.value = false;
    }
};

const getLinksToMessages = (search) => {};

watch(
    () => props.modelValue,
    (newValue) => {
        if (newValue) {
            getClients().then(() => {
                const clientId = route.query.client_id;
                if (clientId) {
                    const client = clients.value.find(
                        (client) => client.id === clientId
                    );
                    if (client) {
                        selectedClient.value = client;
                    }
                }
            });
        }
    }
);

watch(selectedClient, async (newValue) => {
    if (newValue) {
        await getBusinessUnits();

        if (businessUnits.value.length === 1) {
            selectedBusinessUnit.value = businessUnits.value[0];
        } else {
            const businessUnitId = route.query.business_unit_id;
            if (businessUnitId) {
                const bu = businessUnits.value.find(
                    (bu) => bu.id === businessUnitId
                );
                if (bu) {
                    selectedBusinessUnit.value = bu;
                }
            }
        }
    }
});

watch(selectedContactSource, (newValue) => {
    if (newValue && newValue.id == 'message_center') {
        getLinksToMessages();
    }
});

watch(dialog, (newValue) => {
    if (!newValue) {
        resetOrderPoliciesDialog();
    }
});
</script>

<template>
    <div>
        <Dialog
            data-testid="order-dialog"
            :visible="dialog"
            modal
            :style="{ width: '480px' }"
            @update:visible="closeOrderPoliciesDialog"
            :closable="false"
        >
            <template #header>
                <div
                    class="flex items-center justify-between w-full"
                >
                    <div
                        class="p-dialog-title"
                        data-testid="order-dialog-title"
                    >
                        {{ $t('policies.order_dialog.title') }}
                    </div>
                    <Button
                        icon="pi pi-times"
                        text
rounded
                        data-testid="order-dialog-close-button"
                        @click="closeOrderPoliciesDialog"
                        aria-label="Close"
                    />
                </div>
            </template>
            <div class="grid grid-cols-12">
                <div class="col-span-12 mt-4 mb-8">
                    <label
                        for="client"
                        class="mb-2"
                        data-testid="client-name-label"
                    >
                        {{ $t('policies.order_dialog.client_name') }}
                    </label>
                    <ApiDropdown
                        id="client"
                        localed
                        option-label="name"
                        v-model="selectedClient"
                        @search="getClients"
                        :loading="loadingClients"
                        :items="clients"
                        data-testid="client-name-input"
                        class="w-full"
                    />
                </div>
                <div class="col-span-12 mb-8" v-show="selectedClient">
                    <label
                        for="business_unit"
                        class="mb-2"
                        data-testid="business-unit-label"
                    >
                        {{ $t('policies.order_dialog.business_unit') }}
                    </label>
                    <ApiDropdown
                        id="business_unit"
                        localed
                        option-label="name"
                        v-model="selectedBusinessUnit"
                        @search="getBusinessUnits"
                        :loading="loadingBusinessUnits"
                        :disabled="isBusinessUnitFieldDisabled"
                        :items="businessUnits"
                        data-testid="business-unit-input"
                        class="w-full"
                    />
                </div>
                <div
                    class="col-span-12 mb-8"
                    v-show="selectedClient && selectedBusinessUnit"
                >
                    <label
                        for="contact_source"
                        class="mb-2"
                        data-testid="contact-source-label"
                    >
                        {{ $t('policies.order_dialog.contact_source') }}
                    </label>
                    <InputField
                        id="contact_source"
                        variant="select"
                        :options="contactSources"
                        optionLabel="name"
                        placeholder="Select"
                        v-model="selectedContactSource"
                        data-testid="contact-source-input"
                        class="w-full"
                    />
                </div>
                <div
                    class="col-span-12 mb-8"
                    v-show="
                        selectedClient &&
                        selectedBusinessUnit &&
                        selectedContactSource &&
                        selectedContactSource.id == 'message_center'
                    "
                >
                    <label
                        for="link_to_message"
                        class="mb-2"
                        data-testid="link-to-message-label"
                    >
                        {{ $t('policies.order_dialog.link_to_message') }}
                    </label>
                    <ApiDropdown
                        id="link_to_message"
                        localed
                        option-label="name"
                        v-model="selectedLinkToMessage"
                        @search="getLinksToMessages"
                        :loading="loadingBusinessUnits"
                        :items="linksToMessages"
                        data-testid="link-to-message-input"
                        class="w-full"
                    />
                </div>
            </div>
            <div class="flex justify-end gap-2 mt-4 edit-cancel-button">
                <Button
                    data-testid="cancel-button"
                    type="button"
                    :label="$t('buttons.cancel')"
                    class="p-button-outlined"
                    text
                    @click="closeOrderPoliciesDialog"
                ></Button>
                <Button
                    data-testid="continue-button"
                    type="button"
                    :disabled="!isFormValid"
                    :label="$t('buttons.continue')"
                    icon="pi pi-chevron-right"
                    iconPos="right"
                    @click="proceedOrderPolicies"
                ></Button>
            </div>
        </Dialog>
        <Confirmation
            v-model="discardDialog"
            :header="$t('policies.confirmation_dialog.header')"
            :content="$t('policies.confirmation_dialog.content')"
            confirm-button-class="p-button-danger"
            :confirmButtonText="
                $t('policies.confirmation_dialog.confirm_button_label')
            "
            :cancelButtonText="
                $t('policies.confirmation_dialog.cancel_button_label')
            "
            dialogTestid="discard-dialog"
            headerTestid="discard-dialog-title"
            contentTestid="discard-dialog-content"
            cancelButtonTestid="discard-dialog-cancel-button"
            closeButtonTestid="discard-dialog-close-button"
            confirmButtonTestid="discard-dialog-confirm-button"
            @confirm="confirmCloseOrderPoliciesDialog"
        />
    </div>
</template>
