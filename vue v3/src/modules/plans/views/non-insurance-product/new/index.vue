<script setup>
import lodash from 'lodash';
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useNonInsuranceProductStore } from '@/modules/plans/stores/NonInsuranceProduct';
import { useHelpers } from '@/composables';
import { provideEditState } from '@/modules/plans/composables/useEditState';

const route = useRoute();
const router = useRouter();
const helpers = useHelpers();
const nonInsuranceProductStore = useNonInsuranceProductStore();

provideEditState();

const showUnsavedData = ref(false);

const id = ref(-1);
const stepperItems = ref([
    {
        label: 'Non-Insurance Product Details',
        to: { name: 'New Non-Insurance Product', params: { id } }
    },
    {
        label: 'Pricing',
        to: { name: 'New Non-Insurance Product Step 2', params: { id } }
    },
    {
        label: 'Documents',
        to: { name: 'New Non-Insurance Product Step 3', params: { id } }
    },
    {
        label: 'Review',
        to: { name: 'New Non-Insurance Product Step 4', params: { id } }
    }
]);

onMounted(() => {
    getItem();
});

watch(
    () => [nonInsuranceProductStore.currentNonInsuranceProduct],
    () => {
        if (nonInsuranceProductStore.currentNonInsuranceProduct)
            id.value = nonInsuranceProductStore.currentNonInsuranceProduct.id;
    }
);

const getItem = async () => {
    if (route.params.id == '-1') {
        nonInsuranceProductStore.clearCurrentNonInsuranceProduct();
        return;
    }

    if (
        nonInsuranceProductStore.currentNonInsuranceProduct ||
        route.params.id == '-1'
    )
        return;
    const res = await nonInsuranceProductStore.getNonInsuranceProduct(
        route.params.id
    );
    nonInsuranceProductStore.setCurrentNonInsuranceProduct(res.data);
};

const goBack = () => {
    router.push({ name: 'Non-Insurance Products' });
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
                            data-testid="index-title"
                            class="p-break-all"
                            style="word-break: break-all"
                        >
                            {{
                                lodash.truncate(
                                    helpers.getLocaleValue(
                                        nonInsuranceProductStore
                                            .currentNonInsuranceProduct?.name
                                    ),
                                    {
                                        length: 100
                                    }
                                ) ||
                                $t(
                                    'non_insurance_products.new_non_insurance_product'
                                )
                            }}
                        </div>
                        <StatusTag
                            v-if="
                                nonInsuranceProductStore
                                    .currentNonInsuranceProduct?.status
                            "
                            class="ml-2 mr-2"
                            :status="
                                nonInsuranceProductStore
                                    .currentNonInsuranceProduct?.status
                            "
                        />
                    </div>
                </div>
            </template>
            <template #actions>
                <Button
                    @click="openConfirmation"
                    icon="pi pi-times"
                    severity="secondary"
                    outlined
                    class="px-4 py-2"
                    data-testid="back-button"
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
