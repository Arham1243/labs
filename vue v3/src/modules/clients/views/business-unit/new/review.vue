<script setup>
import { ref, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';

import ClientDetails from '@/modules/clients/components/ClientDetails.vue';
import LocationDetails from '@/modules/clients/components/LocationDetails.vue';
import BillingDetails from '@/modules/clients/components/BillingDetails.vue';
import ClientContactDetails from '@/modules/clients/components/ClientContactDetails.vue';
import { provideEditState } from '@/modules/clients/composables/useEditState';

import { useClientStore, useCommonStore } from '@/modules/clients/stores';
import { useHelpers } from '@/composables';

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
const helpers = useHelpers();
const clientStore = useClientStore();

const {
    activeEditComponent,
    showUnsavedDialog,
    handleUnsavedChanges,
    triggerCancelEdit
} = provideEditState();

const item = ref({});
const busy = ref(false);
const loading = ref(false);
const isPublishDialog = ref(false);

const pendingNavigation = ref(null);

onBeforeMount(() => {
    getItem();
});

const getItem = async () => {
    try {
        loading.value = true;
        const params = {
            include:
                'client,accountManager,contacts.contactType,billingDetail,billingDetail.country,country,province,billingDetail.province,billingDetail.paymentMethods,billingDetail.enrollmentTypes'
        };
        const res = await clientStore.getBusinessUnit(props.id, params);
        item.value = res.data;

        if (!clientStore.currentClient) {
            await getClient();
        }
    } finally {
        loading.value = false;
    }
};

const getClient = async () => {
    const params = {
        include:
            'clientSector,billingDetail,country,province,billingDetail.country,billingDetail.province,contacts.contactType,defaultBusinessUnit,billingDetail.paymentMethods,billingDetail.enrollmentTypes'
    };
    const res = await clientStore.getClient(item.value.client_id, params);
    clientStore.setCurrentClient(res.data);
};

const goBack = () => {
    if (activeEditComponent.value) {
        handleUnsavedChanges(() => {
            router.push({
                name: 'New Business Unit Step 3',
                params: { id: props.id }
            });
        });
        pendingNavigation.value = 'back';
    } else {
        router.push({
            name: 'New Business Unit Step 3',
            params: { id: props.id }
        });
    }
};

const showPublishDialog = () => {
    if (activeEditComponent.value) {
        handleUnsavedChanges(() => {
            triggerCancelEdit();
            setTimeout(() => {
                isPublishDialog.value = true;
            }, 50);
        });
        pendingNavigation.value = 'publish';
    } else {
        isPublishDialog.value = true;
    }
};

const publish = async () => {
    try {
        busy.value = true;
        item.value.account_manager_user_id =
            item.value.account_manager_user?.id;
        await clientStore.publishBusinessUnit(props.id, item.value);
        router.push({
            name: 'Client Details',
            params: { id: props.clientId }
        });
    } finally {
        busy.value = false;
    }
};

const confirmDiscard = () => {
    showUnsavedDialog.value = false;
    triggerCancelEdit();
    if (pendingNavigation.value === 'back') {
        router.push({
            name: 'New Business Unit Step 3',
            params: { id: props.id }
        });
    } else if (pendingNavigation.value === 'publish') {
        isPublishDialog.value = true;
    }
    pendingNavigation.value = null;
};

const cancelDiscard = () => {
    showUnsavedDialog.value = false;
    pendingNavigation.value = null;
};

const dataUpdated = (newData) => {
    item.value = newData;
};
</script>

<template>
    <Loader v-if="loading" />
    <div v-else class="mt-4">
        <h4 data-testid="review-title">Review Business Unit Summary</h4>
        <div class="masonry-container my-2">
            <div class="masonry-column">
                <Card class="masonry-item mb-3">
                    <template #content>
                        <ClientDetails
                            is-new
                            :data="item"
                            variant="businessUnit"
                            @update:data="dataUpdated"
                            component-id="client-details"
                            :is-review="true"
                        />
                    </template>
                </Card>

                <Card class="masonry-item mb-3">
                    <template #content>
                        <LocationDetails
                            is-new
                            :data="item"
                            variant="businessUnit"
                            @update:data="dataUpdated"
                            component-id="location-details"
                            :is-review="true"
                        />
                    </template>
                </Card>
            </div>

            <div class="masonry-column">
                <div class="masonry-item mb-3">
                    <BillingDetails
                        is-new
                        :businessUnit="item"
                        :data="item.billing_detail"
                        variant="businessUnit"
                        component-id="business-details"
                        :is-review="true"
                        v-if="$ability.can('view business units')"
                    />
                </div>
            </div>
        </div>

        <div class="masonry-column">
            <div class="masonry-item mb-3">
                <ClientContactDetails
                    :data="item.contacts"
                    variant="businessUnit"
                    v-if="$ability.can('view business units')"
                    component-id="contact-details"
                    :is-review="true"
                />
            </div>
        </div>

        <div class="mt-4 flex justify-content-between align-items-center">
            <Button
                label="Back"
                icon="pi pi-chevron-left"
                class="p-button-outlined"
                @click="goBack"
                data-testid="back-button"
            />
            <div>
                <!-- <Button
                    label="Save"
                    class="p-button-outlined mr-2"
                    @click="goHome"
                /> -->
                <Button
                    label="Publish"
                    icon="pi pi-chevron-right"
                    iconPos="right"
                    @click="showPublishDialog"
                    data-testid="publish-button"
                    v-if="$ability.can('update business units')"
                />
            </div>
        </div>
        <Confirmation
            v-model="showUnsavedDialog"
            header="Exit Edit Mode"
            content="Are you sure you want to exit edit mode? Any changes made will be lost."
            confirm-button-class="p-button-danger"
            confirm-button-text="Exit Edit Mode"
            cancel-button-text="Continue Editing"
            class="w-auto"
            @confirm="confirmDiscard"
            @cancel="cancelDiscard"
        />

        <Confirmation
            v-model="isPublishDialog"
            confirm-button-text="Publish"
            header="Publish Business Unit"
            :content="`Are you sure you want to publish the business unit ${helpers.getLocaleValue(
                item.name
            )}?`"
            @confirm="publish"
            v-if="$ability.can('update business units')"
        />
    </div>
</template>

<style lang="scss" scoped></style>
