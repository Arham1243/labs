<script setup>
import { ref, onBeforeMount, computed } from 'vue';
import { useRouter } from 'vue-router';

import ClientDetails from '@/modules/clients/components/ClientDetails.vue';
import LocationDetails from '@/modules/clients/components/LocationDetails.vue';
import ClientContactDetails from '@/modules/clients/components/ClientContactDetails.vue';
import AssociatedClients from '@/modules/clients/components/AssociatedClients.vue';

import { useClientStore } from '@/modules/clients/stores';
import { useHelpers } from '@/composables';
import ClientLogo from '@/modules/clients/components/ClientLogo.vue';
import { useI18n } from 'vue-i18n';

import { provideEditState } from '@/modules/clients/composables/useEditState';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});

const { t } = useI18n();
const router = useRouter();
const helpers = useHelpers();
const clientStore = useClientStore();

const menu = ref();
const {
    showUnsavedDialog,
    confirmDiscard,
    cancelDiscard,
    clearActiveComponent,
    activeEditComponent,
    triggerCancelEdit,
    setForceSkipConfirmation
} = provideEditState();

const item = ref({});
const busy = ref(false);
const loading = ref(false);
const deleteDialog = ref(false);
const statusUpdateDialog = ref(false);
const isPublishDialog = ref(false);

const showExitEditDialog = ref(false);
const pendingAction = ref(null);
const menuTriggeredExitDialog = ref(false);

onBeforeMount(async () => {
    await getItem();
});

const menuItems = computed(() => {
    return [
        {
            label: isItemActive.value
                ? t('common.make_inactive')
                : t('common.make_active'),
            icon: isItemActive.value ? 'pi pi-times' : 'pi pi-check',
            command: () => showStatusUpdateDialog()
        },
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            command: () => showDeleteDialog()
        }
    ];
});

const isItemActive = computed(() => {
    return item.value && item.value.status === 'active';
});

const statusDialogHeader = computed(() => {
    return isItemActive.value
        ? t('clients.make_holding_inactive')
        : t('clients.make_holding_active');
});

const statusDialogContent = computed(() => {
    return isItemActive.value
        ? t('common.are_you_sure_inactive', {
              item: helpers.getLocaleValue(item.value?.name)
          })
        : t('common.are_you_sure_active', {
              item: helpers.getLocaleValue(item.value?.name)
          });
});

const statusDialogButtonClass = computed(() => {
    return isItemActive.value ? 'p-button-danger' : 'p-button-success';
});

const statusDialogButtonText = computed(() => {
    return isItemActive.value
        ? t('common.make_inactive')
        : t('common.make_active');
});

const showMenu = (event) => {
    if (activeEditComponent.value) {
        menuTriggeredExitDialog.value = true;
        showExitEditDialog.value = true;
    } else {
        menu.value.toggle(event);
    }
};

const showStatusUpdateDialog = () => {
    if (activeEditComponent.value) {
        pendingAction.value = 'status';
        showExitEditDialog.value = true;
    } else {
        statusUpdateDialog.value = true;
    }
};

const showDeleteDialog = () => {
    deleteDialog.value = true;
};

const getItem = async () => {
    try {
        loading.value = true;
        const params = {
            include: 'clients,country,contacts.contactType,province'
        };
        const res = await clientStore.getHolding(props.id, params);

        item.value = res.data;
    } finally {
        loading.value = false;
    }
};

const updateStatus = async () => {
    try {
        loading.value = true;
        const payload = {
            ...item.value,
            status: isItemActive.value ? 'inactive' : 'active'
        };
        await clientStore.updateHolding(item.value.id, payload);
        await getItem();
        clearActiveComponent();
    } finally {
        loading.value = false;
    }
};

const deleteItem = async () => {
    try {
        loading.value = true;
        await clientStore.deleteHolding(item.value.id);
        await router.push({
            name: 'Holdings'
        });
    } finally {
        loading.value = false;
    }
};

const goBack = () => {
    router.push({
        name: 'Holding Details',
        params: { id: props.id }
    });
};

const publish = async () => {
    try {
        busy.value = true;
        await clientStore.publishHolding(props.id, item.value);
        router.push({
            name: 'Holding Details',
            params: { id: props.id }
        });
    } finally {
        busy.value = false;
    }
};

const dataUpdated = (newData) => {
    item.value = newData;
};

const confirmExitEdit = () => {
    showExitEditDialog.value = false;

    if (menuTriggeredExitDialog.value) {
        setForceSkipConfirmation(true);
        triggerCancelEdit();
        menuTriggeredExitDialog.value = false;
    } else {
        triggerCancelEdit();
        setTimeout(() => {
            statusUpdateDialog.value = true;
        }, 50);
    }
};

const cancelExitEdit = () => {
    showExitEditDialog.value = false;
};
</script>

<template>
    <Loader v-if="loading" />
    <div v-else class="mt-4">
        <Header @goBack="goBack">
            <template #title>
                <div data-testid="edit-holding-title" class="p-break-word">
                    {{ $t('clients.edit_holding') }}
                </div>
                <StatusTag class="ml-2" :status="item.status" />
            </template>
            <template #actions>
                <Button
                    label="Actions"
                    data-testid="actions-button"
                    icon="pi pi-chevron-down"
                    iconPos="right"
                    :loading="busy"
                    @click="showMenu"
                />
                <Menu
                    ref="menu"
                    id="overlay_menu"
                    :model="menuItems"
                    :popup="true"
                />
            </template>
        </Header>
        <div class="grid my-2">
            <div class="grid col-12">
                <div class="col-6">
                    <Card>
                        <template #content>
                            <ClientDetails
                                is-new
                                :data="item"
                                @update:data="dataUpdated"
                                variant="holding"
                                component-id="client-details"
                            />
                        </template>
                    </Card>
                </div>
                <div class="col-6">
                    <Card>
                        <template #content>
                            <ClientLogo
                                v-model="item"
                                @update:data="dataUpdated"
                                :is-new="false"
                                variant="holding"
                                component-id="client-logo"
                            />
                        </template>
                    </Card>
                </div>
            </div>
            <div class="grid col-12">
                <div class="col-6">
                    <Card>
                        <template #content>
                            <LocationDetails
                                is-new
                                :data="item"
                                @update:data="dataUpdated"
                                variant="holding"
                                component-id="location-details"
                            />
                        </template>
                    </Card>
                </div>
                <div class="col-6" v-if="$ability.can('view clients')">
                    <Card>
                        <template #content>
                            <AssociatedClients
                                :data="item"
                                component-id="associated-clients"
                            />
                        </template>
                    </Card>
                </div>
            </div>
            <div class="col-12">
                <ClientContactDetails
                    :data="item.contacts"
                    variant="holding"
                    component-id="client-contact-details"
                />
            </div>
        </div>
        <Confirmation
            v-model="statusUpdateDialog"
            :header="statusDialogHeader"
            :content="statusDialogContent"
            :confirm-button-class="statusDialogButtonClass"
            :confirm-button-text="statusDialogButtonText"
            @confirm="updateStatus"
        />
        <Confirmation
            v-model="deleteDialog"
            show-alert-icon
            header="Delete Holding"
            :content="`Are you sure you want to delete ${helpers.getLocaleValue(
                item.name
            )}?`"
            confirm-button-class="p-button-danger"
            @confirm="deleteItem"
        />
        <Confirmation
            v-model="isPublishDialog"
            confirm-button-text="Publish"
            header="Publish Holding"
            :content="`Are you sure you want to publish the holding ${helpers.getLocaleValue(
                item.name
            )}?`"
            @confirm="publish"
            v-if="$ability.can('update holdings')"
        />

        <Confirmation
            v-model="showUnsavedDialog"
            show-alert-icon
            header="Discard Changes"
            content="Are you sure you want to discard changes made on this page?"
            confirm-button-class="p-button-danger"
            confirm-button-text="Discard"
            cancel-button-text="Continue Editing"
            class="w-auto"
            @confirm="confirmDiscard"
            @cancel="cancelDiscard"
        />

        <Confirmation
            v-model="showExitEditDialog"
            header="Exit Edit Mode"
            content="Are you sure you want to exit edit mode? Any changes made will be lost."
            confirm-button-class="p-button-danger"
            confirm-button-text="Exit Edit Mode"
            cancel-button-text="Continue Editing"
            class="w-auto"
            @confirm="confirmExitEdit"
            @cancel="cancelExitEdit"
        />
    </div>
</template>
