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
    'New Holding': '1',
    'New Holding Step 2': '2',
    'New Holding Step 3': '3',
    'New Holding Step 4': '4'
};

const stepToRouteMap = {
    1: 'New Holding',
    2: 'New Holding Step 2',
    3: 'New Holding Step 3',
    4: 'New Holding Step 4'
};

// Compute current step based on route
const currentStep = computed(() => {
    return routeToStepMap[route.name] || '1';
});

// Handle step navigation
const onStepChange = (stepValue) => {
    const routeName = stepToRouteMap[stepValue];
    if (routeName && routeName !== route.name) {
        router.push({
            name: routeName,
            params: { id: id.value }
        });
    }
};
onBeforeMount(() => {
    getItem();
});

watch(
    () => [clientStore.currentHolding],
    () => {
        if (clientStore.currentHolding)
            id.value = clientStore.currentHolding.id;
    }
);

const getItem = async () => {
    if (clientStore.currentHolding || route.params.id == '-1') return;
    const params = { include: 'clients,country,contacts' };
    const res = await clientStore.getHolding(route.params.id, params);
    clientStore.setCurrentHolding(res.data);
};

const goBack = () => {
    router.push({ name: 'Holdings' });
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
                        <div
                            class="p-break-all"
                            data-testid="page-title"
                            v-tooltip.bottom="
                                helpers.getLocaleValue(
                                    clientStore.currentHolding?.name
                                ) || 'New Holding'
                            "
                        >
                            {{
                                lodash.truncate(
                                    helpers.getLocaleValue(
                                        clientStore.currentHolding?.name
                                    ) || 'New Holding',
                                    { length: 80 }
                                )
                            }}
                        </div>
                        <StatusTag
                            v-if="clientStore.currentHolding?.status"
                            class="ml-2"
                            :status="clientStore.currentHolding?.status"
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
            <Stepper :value="currentStep" class="w-full vertical-stepper">
                <StepList>
                    <Step
                        value="1"
                        @click="onStepChange('1')"
                        :class="{ 'cursor-pointer': true }"
                    >
                        Details
                    </Step>
                    <Step
                        value="2"
                        @click="onStepChange('2')"
                        :class="{ 'cursor-pointer': true }"
                    >
                        Contacts
                    </Step>
                    <Step
                        value="3"
                        @click="onStepChange('3')"
                        :class="{ 'cursor-pointer': true }"
                    >
                        Associated Clients
                    </Step>
                    <Step
                        value="4"
                        @click="onStepChange('4')"
                        :class="{ 'cursor-pointer': true }"
                    >
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
        :content="
            $t('common.cancel_creation_content', { item: 'holding company' })
        "
        :confirm-button-text="$t('buttons.exit_without_saving')"
        :cancel-button-text="$t('buttons.cancel')"
        confirm-button-class="bg-red-500 border-red-500"
        @confirm="goBack"
    />
</template>

<style lang="scss" scoped></style>
