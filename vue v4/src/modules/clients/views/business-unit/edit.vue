<script setup>
import { ref, onBeforeMount, computed } from 'vue';
import { useRouter } from 'vue-router';

import ClientDetails from '@/modules/clients/components/ClientDetails.vue';
import LocationDetails from '@/modules/clients/components/LocationDetails.vue';
import BillingDetails from '@/modules/clients/components/BillingDetails.vue';
import ClientContactDetails from '@/modules/clients/components/ClientContactDetails.vue';
import { provideEditState } from '@/modules/clients/composables/useEditState';

import { useClientStore, useCommonStore } from '@/modules/clients/stores';
import { useHelpers } from '@/composables';
import { useI18n } from 'vue-i18n';

const {
    showUnsavedDialog,
    confirmDiscard,
    cancelDiscard,
    clearActiveComponent,
    activeEditComponent,
    triggerCancelEdit,
    setForceSkipConfirmation
} = provideEditState();

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

const { t } = useI18n();
const router = useRouter();
const helpers = useHelpers();
const clientStore = useClientStore();
const commonStore = useCommonStore();

const menu = ref();
const item = ref({});
const busy = ref(false);
const loading = ref(false);
const deleteDialog = ref(false);
const statusUpdateDialog = ref(false);
const isPublishDialog = ref(false);

const showExitEditDialog = ref(false);
const pendingAction = ref(null);
const menuTriggeredExitDialog = ref(false);

onBeforeMount(() => {
    getItem();
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
        ? t('business_units.make_business_unit_inactive')
        : t('business_units.make_business_unit_active');
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

const getItem = async () => {
    loading.value = true;
    const params = {
        include:
            'client,accountManager,contacts.contactType,billingDetail,billingDetail.country,country,province,billingDetail.province,billingDetail.paymentMethods,billingDetail.enrollmentTypes'
    };
    const res = await clientStore.getBusinessUnit(props.id, params);
    clientStore.setCurrentBusinessUnit(res.data);
    item.value = res.data;

    if (!clientStore.currentClient) {
        await getClient();
    }

    loading.value = false;
};

const getClient = async () => {
    const params = {
        include:
            'clientSector,billingDetail,country,province,billingDetail.country,billingDetail.province,contacts.contactType,defaultBusinessUnit,billingDetail.paymentMethods,billingDetail.enrollmentTypes'
    };
    const res = await clientStore.getClient(item.value.client_id, params);
    clientStore.setCurrentClient(res.data);
};

const updateStatus = async () => {
    try {
        loading.value = true;
        const payload = {
            ...item.value,
            status: item.value.status == 'active' ? 'inactive' : 'active'
        };
        await clientStore.updateBusinessUnit(item.value.id, payload);
        await getItem();
        clearActiveComponent();
    } finally {
        loading.value = false;
    }
};

const deleteItem = async () => {
    try {
        loading.value = true;
        await clientStore.deleteBusinessUnit(item.value.id);
        await goToClientDetails();
    } finally {
        loading.value = false;
    }
};

const showMenu = (event) => {
    if (activeEditComponent.value) {
        menuTriggeredExitDialog.value = true;
        showExitEditDialog.value = true;
    } else {
        menu.value.toggle(event);
    }
};

const showDeleteDialog = () => {
    deleteDialog.value = true;
};

const goBack = () => {
    router.push({
        name: 'Business Unit Details',
        params: { clientId: props.clientId, id: props.id }
    });
};

const goToClientDetails = async () => {
    await router.push({
        name: 'Client Details',
        params: { id: props.clientId }
    });
};

const publish = async () => {
    try {
        busy.value = true;
        await clientStore.publishBusinessUnit(props.id, item.value);
        await goToClientDetails();
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
        <Header @goBack="goBack">
            <template #title>
                <div class="p-break-word">
                    {{ $t('clients.edit_business_unit') }}
                </div>
                <StatusTag class="ml-2" :status="item.status" />
            </template>
            <template #actions>
                <Button
                    label="Actions"
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
                <Card class="masonry-item mb-12">
                    <template #content>
                        <ClientDetails
                            is-new
                            :data="item"
                            variant="businessUnit"
                            @update:data="dataUpdated"
                            component-id="client-details"
                        />
                    </template>
                </Card>

                <Card class="masonry-item mb-12">
                    <template #content>
                        <LocationDetails
                            is-new
                            :data="item"
                            variant="businessUnit"
                            @update:data="dataUpdated"
                            component-id="location-details"
                        />
                    </template>
                </Card>
            </div>

            <div class="masonry-column">
                <div class="masonry-item mb-12">
                    <BillingDetails
                        is-new
                        :businessUnit="item"
                        :data="item.billing_detail || {}"
                        variant="businessUnit"
                        component-id="billing-details"
                    />
                </div>
            </div>
        </div>

        <div class="masonry-column">
            <div class="masonry-item mb-12">
                <ClientContactDetails
                    :data="item.contacts || []"
                    variant="businessUnit"
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
            header="Delete Business Unit"
            :content="`Are you sure you want to delete ${helpers.getLocaleValue(
                item.name
            )}?`"
            confirm-button-class="p-button-danger"
            @confirm="deleteItem"
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
            v-model="isPublishDialog"
            confirm-button-text="Save"
            header="Save Business Unit"
            :content="`Are you sure you want to save the business unit ${helpers.getLocaleValue(
                item.name
            )}?`"
            @confirm="publish"
            v-if="$ability.can('update business units')"
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
