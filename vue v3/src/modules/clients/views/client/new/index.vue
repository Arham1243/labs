<script setup>
import { ref, watch, onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useClientStore } from '@/modules/clients/stores';
import { useHelpers } from '@/composables';
import lodash from 'lodash';
import { provideEditState } from '@/modules/clients/composables/useEditState';

provideEditState();

const route = useRoute();
const router = useRouter();
const helpers = useHelpers();
const clientStore = useClientStore();

const showUnsavedData = ref(false);

const id = ref(-1);
const stepperItems = ref([
    {
        label: 'Details',
        to: { name: 'New Client', params: { id } }
    },
    {
        label: 'Billing',
        to: { name: 'New Client Step 2', params: { id } }
    },
    {
        label: 'Contacts',
        to: { name: 'New Client Step 3', params: { id } }
    },
    {
        label: 'Review',
        to: { name: 'New Client Step 4', params: { id } }
    }
]);

onBeforeMount(() => {
    getItem();
});

watch(
    () => [clientStore.currentClient],
    () => {
        if (clientStore.currentClient) id.value = clientStore.currentClient.id;
    }
);

const getItem = async () => {
    if (clientStore.currentClient || route.params.id == '-1') return;
    const params = {
        include: 'clientSector,country,businessUnits,defaultBusinessUnit'
    };
    const res = await clientStore.getClient(route.params.id, params);
    clientStore.setCurrentClient(res.data);
};

const goBack = () => {
    router.push({ name: 'Clients' });
};

const openConfirmation = () => {
    showUnsavedData.value = true;
};
</script>

<template>
    <div class="relative container">
        <Header hide-back>
            <template #title>
                <div>
                    <div class="flex align-items-center">
                        <div class="p-break-word" data-testid="page-title">
                            {{
                                lodash.truncate(
                                    helpers.getLocaleValue(
                                        clientStore.currentClient?.name
                                    ) || 'New Client',
                                    { length: 80 }
                                )
                            }}
                        </div>
                        <StatusTag
                            v-if="clientStore.currentClient?.status"
                            class="ml-2"
                            :status="clientStore.currentClient?.status"
                        />
                    </div>
                </div>
            </template>
            <template #actions>
                <Button
                    @click="openConfirmation"
                    icon="pi pi-times"
                    class="p-button-rounded p-button-outlined"
                    data-testid="close-button"
                />
            </template>
        </Header>

        <div class="mt-6">
            <Steps :model="stepperItems" />
            <router-view @showConfirmation="openConfirmation" />
        </div>
    </div>

    <Confirmation
        v-model="showUnsavedData"
        :header="$t('common.cancel_creation_header')"
        :content="$t('common.cancel_creation_content', { item: 'client' })"
        :confirm-button-text="$t('buttons.exit_without_saving')"
        :cancel-button-text="$t('buttons.cancel')"
        confirm-button-class="bg-red-500 border-red-500"
        @confirm="goBack"
    />
</template>

<style lang="scss" scoped></style>
