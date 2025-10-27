<script setup>
import { ref, watch, onBeforeMount, computed } from 'vue';
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

const routeToStepMap = {
    'New Client': '1',
    'New Client Step 2': '2',
    'New Client Step 3': '3',
    'New Client Step 4': '4'
};

const stepToRouteMap = {
    1: 'New Client',
    2: 'New Client Step 2',
    3: 'New Client Step 3',
    4: 'New Client Step 4'
};

// Compute current step based on route
const currentStep = computed(() => {
    return routeToStepMap[route.name] || '1';
});

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
                    <div class="flex items-center">
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

        <div class="mt-12">
            <Stepper :value="currentStep" linear class="w-full vertical-stepper">
                <StepList>
                    <Step value="1">
                        Details
                    </Step>
                    <Step value="2">
                        Billing
                    </Step>
                    <Step value="3">
                        Contacts
                    </Step>
                    <Step value="4">
                        Review
                    </Step>
                </StepList>
            </Stepper>
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
