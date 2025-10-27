<script setup>
import { ref, watch, onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useClientStore } from '@/modules/clients/stores';
import { useHelpers } from '@/composables';
import lodash from 'lodash';

const route = useRoute();
const router = useRouter();
const helpers = useHelpers();
const clientStore = useClientStore();

const showUnsavedData = ref(false);

const id = ref(-1);
const stepperItems = ref([
    {
        label: 'Details',
        to: { name: 'New Business Unit', params: { id } }
    },
    {
        label: 'Billing',
        to: { name: 'New Business Unit Step 2', params: { id } }
    },
    {
        label: 'Contacts',
        to: { name: 'New Business Unit Step 3', params: { id } }
    },
    {
        label: 'Review',
        to: { name: 'New Business Unit Step 4', params: { id } }
    }
]);

onBeforeMount(() => {
    getItem();
});

watch(
    () => [clientStore.currentBusinessUnit],
    () => {
        if (clientStore.currentBusinessUnit)
            id.value = clientStore.currentBusinessUnit.id;
    }
);

const getItem = async () => {
    if (clientStore.currentBusinessUnit || route.params.id == '-1') return;
    const params = { include: 'client' };
    const res = await clientStore.getBusinessUnit(route.params.id, params);
    clientStore.setCurrentBusinessUnit(res.data);
};

const goBack = () => {
    router.push({
        name: 'Client Details',
        params: { id: route.params.clientId }
    });
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
                        <div
                            class="p-break-all"
                            data-testid="page-title"
                            v-tooltip.bottom="
                                helpers.getLocaleValue(
                                    clientStore.currentBusinessUnit?.name
                                ) || 'New Business Unit'
                            "
                        >
                            {{
                                lodash.truncate(
                                    helpers.getLocaleValue(
                                        clientStore.currentBusinessUnit?.name
                                    ) || 'New Business Unit',
                                    { length: 80 }
                                )
                            }}
                        </div>
                        <StatusTag
                            v-if="clientStore.currentBusinessUnit?.status"
                            class="ml-2 mr-2"
                            :status="clientStore.currentBusinessUnit?.status"
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
        :content="$t('common.cancel_creation_content')"
        :confirm-button-text="$t('buttons.exit_without_saving')"
        :cancel-button-text="$t('buttons.cancel')"
        confirm-button-class="bg-red-500 border-red-500"
        @confirm="goBack"
    />
</template>

<style lang="scss" scoped></style>
