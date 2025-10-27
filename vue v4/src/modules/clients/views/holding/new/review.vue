<script setup>
import { ref, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';

import ClientDetails from '@/modules/clients/components/ClientDetails.vue';
import LocationDetails from '@/modules/clients/components/LocationDetails.vue';
import ClientContactDetails from '@/modules/clients/components/ClientContactDetails.vue';
import AssociatedClients from '@/modules/clients/components/AssociatedClients.vue';

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
const { activeEditComponent, showUnsavedDialog, handleUnsavedChanges } =
    provideEditState();

const item = ref({});
const busy = ref(false);
const loading = ref(false);
const isPublishDialog = ref(false);

const pendingNavigation = ref(null);

const changeBusyFromChild = (value) => {
    busy.value = value;
};

onBeforeMount(async () => {
    await getItem();
});

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

const goBack = () => {
    if (activeEditComponent.value) {
        handleUnsavedChanges(() => {
            router.push({
                name: 'New Holding Step 3',
                params: { id: props.id }
            });
        });
        pendingNavigation.value = 'back';
    } else {
        router.push({
            name: 'New Holding Step 3',
            params: { id: props.id }
        });
    }
};

const showPublishDialog = () => {
    if (activeEditComponent.value) {
        handleUnsavedChanges(() => {
            isPublishDialog.value = true;
        });
        pendingNavigation.value = 'publish';
    } else {
        isPublishDialog.value = true;
    }
};

const publish = async () => {
    try {
        busy.value = true;
        await clientStore.publishHolding(props.id, item.value);
        router.push({
            name: 'Holdings'
        });
    } finally {
        busy.value = false;
    }
};

const confirmDiscard = () => {
    showUnsavedDialog.value = false;
    if (pendingNavigation.value === 'back') {
        router.push({
            name: 'New Holding Step 3',
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
    <div v-else class="mt-12">
        <h4 data-testid="review-title" class="mb-4">Review Holding Summary</h4>
        <div class="masonry-container my-2">
            <div class="masonry-column">
                <div class="masonry-item">
                    <Card class="mb-4">
                        <template #content>
                            <ClientDetails
                                is-new
                                :data="item"
                                @update:data="dataUpdated"
                                variant="holding"
                                component-id="client-details"
                                :is-review="true"
                            />
                        </template>
                    </Card>
                </div>
                <div class="masonry-item">
                    <Card class="mb-4">
                        <template #content>
                            <LocationDetails
                                is-new
                                :data="item"
                                @update:data="dataUpdated"
                                variant="holding"
                                component-id="location-details"
                                :is-review="true"
                            />
                        </template>
                    </Card>
                </div>
            </div>
            <div class="masonry-column">
                <div class="masonry-item">
                    <Card class="mb-4">
                        <template #content>
                            <ClientLogo
                                v-model="item"
                                @update:data="dataUpdated"
                                :is-new="false"
                                @getItem="getItem"
                                @loading="changeBusyFromChild"
                                variant="holding"
                                component-id="client-logo"
                                :is-review="true"
                            />
                        </template>
                    </Card>
                </div>
                <div class="masonry-item">
                    <Card v-if="$ability.can('view clients')" class="mb-4">
                        <template #content>
                            <AssociatedClients
                                :data="item"
                                component-id="associated-clients"
                                :is-review="true"
                            />
                        </template>
                    </Card>
                </div>
            </div>
        </div>
        <div class="my-4">
            <ClientContactDetails
                :data="item.contacts"
                variant="holding"
                component-id="client-contact-details"
                :is-review="true"
                v-if="$ability.can('view holdings')"
            />
        </div>
        <div class="mt-12 flex justify-between items-center">
            <Button
                label="Back"
                data-testid="back-button"
                icon="pi pi-chevron-left"
                class="p-button-outlined"
                @click="goBack"
            />
            <div>
                <!-- <Button
                    label="Save"
                    class="p-button-outlined mr-2"
                    @click="goHome"
                /> -->
                <Button
                    label="Publish"
                    data-testid="publish-button"
                    icon="pi pi-chevron-right"
                    iconPos="right"
                    @click="showPublishDialog"
                    v-if="$ability.can('update holdings')"
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
            header="Publish Holding"
            :content="`Are you sure you want to publish the holding ${helpers.getLocaleValue(
                item.name
            )}?`"
            @confirm="publish"
            v-if="$ability.can('update holdings')"
        />
    </div>
</template>
