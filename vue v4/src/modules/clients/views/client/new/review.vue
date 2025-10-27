<script setup>
import { ref, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';

import ClientDetails from '@/modules/clients/components/ClientDetails.vue';
import LocationDetails from '@/modules/clients/components/LocationDetails.vue';
import BillingDetails from '@/modules/clients/components/BillingDetails.vue';
import ClientContactDetails from '@/modules/clients/components/ClientContactDetails.vue';
import { useCommonStore } from '@/stores';
import { useClientStore } from '@/modules/clients/stores';
import { useHelpers } from '@/composables';
import ClientLogo from '@/modules/clients/components/ClientLogo.vue';
import { provideEditState } from '@/modules/clients/composables/useEditState';

const props = defineProps({
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

const changeBusyFromChild = (value) => {
    busy.value = value;
};

onBeforeMount(async () => {
    await getData();
});

const getData = async () => {
    try {
        loading.value = true;
        await getItem();
    } finally {
        loading.value = false;
    }
};

const commonStore = useCommonStore();

const getItem = async () => {
    const params = {
        include:
            'clientSector,country,billingDetail,billingDetail.country,contacts.contactType,defaultBusinessUnit,province,billingDetail.province,billingDetail.paymentMethods,billingDetail.enrollmentTypes'
    };
    const res = await clientStore.getClient(props.id, params);

    item.value = res.data;
    item.value.create_default_business_unit = false;
};

const goBack = () => {
    if (activeEditComponent.value) {
        handleUnsavedChanges(() => {
            router.push({
                name: 'New Client Step 3',
                params: { id: props.id }
            });
        });
        pendingNavigation.value = 'back';
    } else {
        router.push({
            name: 'New Client Step 3',
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
        await clientStore.publishClient(props.id, {
            ...item.value,
            preferred_language: item.value.preferred_language?.id
        });
        router.push({
            name: 'Clients'
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
            name: 'New Client Step 3',
            params: { id: props.id }
        });
    } else if (pendingNavigation.value === 'publish') {
        setTimeout(() => {
            isPublishDialog.value = true;
        }, 50);
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
    <div v-else class="mt-12">
        <h4 data-testid="review-title" class="mb-4">Review Client Summary</h4>

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
                            :is-review="true"
                        />
                    </template>
                </Card>

                <Card class="masonry-item mb-4">
                    <template #content>
                        <LocationDetails
                            is-new
                            :data="item"
                            @update:data="dataUpdated"
                            variant="client"
                            component-id="location-details"
                            :is-review="true"
                        />
                    </template>
                </Card>
            </div>
            <div class="masonry-column">
                <div class="masonry-item">
                    <BillingDetails
                        is-new
                        :data="item.billing_detail"
                        variant="client"
                        component-id="billing-details"
                        :is-review="true"
                        v-if="$ability.can('view clients')"
                    />
                </div>
            </div>
        </div>

        <div class="masonry-column">
            <div class="masonry-item-50 mb-8">
                <Card>
                    <template #content>
                        <ClientLogo
                            v-model="item"
                            @update:data="dataUpdated"
                            :is-new="false"
                            @getItem="getItem"
                            @loading="changeBusyFromChild"
                            variant="client"
                            component-id="client-logo"
                            :is-review="true"
                        />
                    </template>
                </Card>
            </div>
        </div>

        <div class="masonry-column">
            <div class="masonry-item mb-12">
                <ClientContactDetails
                    :data="item.contacts"
                    variant="client"
                    component-id="client-contact-details"
                    :is-review="true"
                    v-if="$ability.can('view clients')"
                />
            </div>
        </div>

        <div class="mt-12 flex justify-between items-center">
            <Button
                label="Back"
                icon="pi pi-chevron-left"
                class="p-button-outlined"
                @click="goBack"
                data-testid="back-button"
            />
            <div class="flex items-center gap-2">
                <Checkbox
                    id="is_billing_address_same_as_mailing_address"
                    binary
                    v-model="item.create_default_business_unit"
                    v-if="$ability.can('create business units')"
                    data-testid=""
                />
                <label v-if="$ability.can('create business units')"
                    >Create default business unit</label
                >
                <div
                    class="mr-12 cursor-pointer"
                    v-tooltip.top="
                        `Create a business unit that shares the same name and billing details as the client being created.`
                    "
                >
                    <i class="pi pi-info-circle"></i>
                </div>

                <Button
                    label="Publish"
                    icon="pi pi-chevron-right"
                    iconPos="right"
                    @click="showPublishDialog"
                    :loading="busy"
                    data-testid="publish-button"
                    v-if="$ability.can('update clients')"
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
            header="Publish Client"
            :content="`Are you sure you want to publish the client ${helpers.getLocaleValue(
                item.name
            )}?`"
            @confirm="publish"
            v-if="$ability.can('update clients')"
        />
    </div>
</template>
