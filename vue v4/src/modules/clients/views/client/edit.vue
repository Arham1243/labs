<script setup>
import { ref, onBeforeMount, computed } from 'vue';
import { useRouter } from 'vue-router';

import ClientDetails from '@/modules/clients/components/ClientDetails.vue';
import LocationDetails from '@/modules/clients/components/LocationDetails.vue';
import BillingDetails from '@/modules/clients/components/BillingDetails.vue';
import ClientContactDetails from '@/modules/clients/components/ClientContactDetails.vue';
import ClientLogo from '@/modules/clients/components/ClientLogo.vue';

import { useClientStore, useCommonStore } from '@/modules/clients/stores';
import { useHelpers } from '@/composables';
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
const commonStore = useCommonStore();

const {
    showUnsavedDialog,
    confirmDiscard,
    cancelDiscard,
    clearActiveComponent,
    activeEditComponent,
    triggerCancelEdit,
    setForceSkipConfirmation
} = provideEditState();

const menu = ref();
const item = ref({});
const busy = ref(false);
const loading = ref(false);
const isPublishDialog = ref(false);
const statusUpdateDialog = ref(false);
const deleteDialog = ref(false);

const showExitEditDialog = ref(false);
const pendingAction = ref(null);
const menuTriggeredExitDialog = ref(false);

onBeforeMount(async () => {
    await getData();
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

const isItemActive = computed(() => {
    return item.value && item.value.status === 'active';
});

const statusDialogHeader = computed(() => {
    return isItemActive.value
        ? t('clients.make_client_inactive')
        : t('clients.make_client_active');
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

const showDeleteDialog = () => {
    deleteDialog.value = true;
};

const getData = async () => {
    try {
        loading.value = true;
        await getItem();
    } finally {
        loading.value = false;
    }
};

const getItem = async () => {
    const params = {
        include:
            'clientSector,billingDetail,country,province,billingDetail.country,billingDetail.province,contacts.contactType,defaultBusinessUnit,billingDetail.paymentMethods,billingDetail.enrollmentTypes'
    };
    const res = await clientStore.getClient(props.id, params);
    item.value = res.data;
    clientStore.setCurrentClient(res.data);
};

const goBack = () => {
    router.push({
        name: 'Client Details',
        params: { id: props.id }
    });
};

const updateStatus = async () => {
    try {
        loading.value = true;
        const payload = {
            ...item.value,
            preferred_language: item.value.preferred_language?.id,
            status: isItemActive.value ? 'inactive' : 'active'
        };
        await clientStore.updateClient(item.value.id, payload);
        await getItem();
        clearActiveComponent();
    } finally {
        loading.value = false;
    }
};

const deleteItem = async () => {
    try {
        loading.value = true;
        await clientStore.deleteClient(item.value.id);
        await router.push({
            name: 'Clients'
        });
    } finally {
        loading.value = false;
    }
};

const publish = async () => {
    try {
        busy.value = true;
        await clientStore.publishClient(props.id, item.value);
        router.push({
            name: 'Client Details',
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
    <div v-else class="mt-12">
        <Header @goBack="goBack" class="mb-4" >
            <template #title>
                <h4 class="p-break-word" data-testid="edit-client-title">
                    {{ $t('clients.edit_client') }}
                </h4>
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

        <div class="masonry-container my-2">
            <div class="masonry-column">
                <Card class="masonry-item mb-4">
                    <template #content>
                        <ClientDetails
                            is-new
                            :data="item"
                            @update:data="dataUpdated"
                            variant="client"
                            component-id="client-details"
                        />
                    </template>
                </Card>
                <Card class="masonry-item mb-4">
                    <template #content>
                        <LocationDetails
                            is-new
                            :data="item"
                            variant="client"
                            component-id="location-details"
                        />
                    </template>
                </Card>
            </div>
            <div class="masonry-column">
                <div class="masonry-item mb-4">
                    <BillingDetails
                        is-new
                        :data="item.billing_detail"
                        variant="client"
                        component-id="billing-details"
                    />
                </div>
            </div>
        </div>
        <div class="masonry-column">
            <div class="masonry-item-50 mb-4">
                <Card>
                    <template #content>
                        <ClientLogo
                            v-model="item"
                            @update:data="dataUpdated"
                            :is-new="false"
                            variant="client"
                            component-id="client-logo"
                        />
                    </template>
                </Card>
            </div>
        </div>
        <div class="masonry-column">
            <div class="masonry-item my-4">
                <ClientContactDetails
                    :data="item.contacts"
                    variant="client"
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
            data-testid="update-confirmation"
        />
        <Confirmation
            v-model="deleteDialog"
            show-alert-icon
            header="Delete Client"
            :content="`Are you sure you want to delete ${helpers.getLocaleValue(
                item.name
            )}?`"
            confirm-button-class="p-button-danger"
            @confirm="deleteItem"
            data-testid="delete-confirmation"
        />
        <Confirmation
            v-model="isPublishDialog"
            confirm-button-text="Save"
            header="Save Client"
            :content="`Are you sure you want to save the client ${helpers.getLocaleValue(
                item.name
            )}?`"
            @confirm="publish"
            v-if="$ability.can('update clients')"
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

<style lang="scss" scoped></style>
