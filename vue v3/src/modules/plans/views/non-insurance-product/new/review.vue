<script setup>
import { ref, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { useHelpers } from '@/composables';
import { useNonInsuranceProductStore } from '@/modules/plans/stores/NonInsuranceProduct';

import NonInsuranceProductDetails from '@/modules/plans/components/non-insurance-product/NonInsuranceProductDetails.vue';
import DocumentsTable from '@/components/documents/DocumentsTable.vue';
import AttachPricingInit from '@/modules/plans/components/shared/AttachPricing/AttachPricingInit.vue';
import { provideEditState } from '@/modules/plans/composables/useEditState';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});

const router = useRouter();
const nonInsuranceProductStore = useNonInsuranceProductStore();
const helpers = useHelpers();

const {
    activeEditComponent,
    showUnsavedDialog,
    handleUnsavedChanges,
    triggerCancelEdit
} = provideEditState();

const item = ref({});
const loading = ref(false);
const busy = ref(false);
const isPublishDialog = ref(false);

defineEmits(['showConfirmation']);

const pendingNavigation = ref(null);

onBeforeMount(() => {
    getItem();
});

const getItem = async () => {
    loading.value = true;
    const res = await nonInsuranceProductStore.getNonInsuranceProduct(props.id);
    processResponse(res.data);
    loading.value = false;
};

const processResponse = (data) => {
    nonInsuranceProductStore.setCurrentNonInsuranceProduct(data);
    item.value = data;
};

const goBack = () => {
    if (activeEditComponent.value) {
        handleUnsavedChanges(() => {
            router.push({
                name: 'New Non-insurance Prodcut Step 3',
                params: { id: props.id }
            });
        });
        pendingNavigation.value = 'back';
    } else {
        router.push({
            name: 'New Non-Insurance Product Step 3',
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

const publishNonInsuranceProduct = async () => {
    try {
        busy.value = true;
        const payload = {
            ...item.value,
            status: 'active'
        };
        await nonInsuranceProductStore.publishNonInsuranceProduct(
            props.id,
            payload,
            item.value
        );
        router.push({
            name: 'Non-Insurance Products',
            params: { id: props.id }
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
            name: 'New Non-Insurance Product Step 3',
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
</script>

<template>
    <Loader v-if="loading" />
    <div v-else>
        <h4 data-testid="review-title" class="mt-6 mb-4">
            {{
                $t(
                    'non_insurance_products.review_non_insurance_product_summary'
                )
            }}
        </h4>
        <div class="grid">
            <div class="col-12">
                <Card>
                    <template #content>
                        <NonInsuranceProductDetails
                            :data="item"
                            component-id="non-insurance-product-details"
                            :is-review="true"
                        />
                    </template>
                </Card>
            </div>
            <div class="col-12">
                <Card>
                    <template #content>
                        <AttachPricingInit
                            :is-new="false"
                            :id="props.id"
                            :store="nonInsuranceProductStore"
                            :title="$t('common.non_insurance_product_pricing')"
                            :isNonInsuranceProduct="true"
                            component-id="non-insurance-product-prices"
                            :is-review="true"
                        />
                    </template>
                </Card>
            </div>
            <div class="col-12">
                <Card>
                    <template #content>
                        <DocumentsTable
                            type="non-insurance-products"
                            :id="props.id"
                            :is-new="false"
                            component-id="non-insurance-product-documents"
                            :is-review="true"
                        />
                    </template>
                </Card>
            </div>
        </div>

        <div class="mt-4 flex justify-content-between align-items-center">
            <Button
                :label="$t('buttons.back')"
                data-testid="back-button"
                icon="pi pi-chevron-left"
                class="p-button-outlined"
                @click="goBack"
            />
            <Button
                :label="$t('buttons.confirm_and_publish')"
                data-testid="confirm-publish-button"
                icon-pos="right"
                icon="pi pi-chevron-right"
                :loading="busy"
                @click="showPublishDialog"
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
        :confirm-button-text="$t('buttons.publish')"
        :header="
            $t('non_insurance_products.publish_non_insurance_product_header')
        "
        :content="
            $t('non_insurance_products.publish_non_insurance_product_content', {
                item: helpers.getLocaleValue(item.name)
            })
        "
        @confirm="publishNonInsuranceProduct"
    />
</template>
