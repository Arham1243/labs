<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useBenefitStore } from '@/modules/plans/stores/Benefit';
import { useHelpers } from '@/composables';

import BenefitGroupsDetails from '@/modules/plans/components/benefit-groups/BenefitGroupsDetails.vue';
import BenefitGroupsBenefits from '@/modules/plans/components/benefit-groups/BenefitGroupsBenefits.vue';
import DocumentsTable from '@/components/documents/DocumentsTable.vue';
import Label from '@/components/common/Label.vue';
import AttachPricingInit from '@/modules/plans/components/shared/AttachPricing/AttachPricingInit.vue';
import { provideEditState } from '@/modules/plans/composables/useEditState';

const router = useRouter();
const benefitStore = useBenefitStore();
const helpers = useHelpers();

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});

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

onMounted(async () => {
    await getItem();
});

const getItem = async () => {
    loading.value = true;
    const res = await benefitStore.getBenefitGroup(props.id);
    item.value = benefitStore.processResponse(res.data);
    loading.value = false;
};

const goBack = () => {
    if (activeEditComponent.value) {
        handleUnsavedChanges(() => {
            router.push({
                name: 'New Benefit Group Step 4',
                params: { id: props.id }
            });
        });
        pendingNavigation.value = 'back';
    } else {
        router.push({
            name: 'New Benefit Group Step 4',
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
        const payload = {
            ...item.value,
            status: 'active'
        };
        await benefitStore.publishBenefitGroup(props.id, payload, item.value);
        router.push({
            name: 'Benefit Groups'
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
            name: 'New Benefit Group Step 4',
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
    <div v-else class="mt-4">
        <div class="mt-6 ml-2">
            <h4>
                <Label test-id="page-title">{{
                    $t('benefit_groups.review_benefit_group_summary')
                }}</Label>
            </h4>
        </div>
        <div class="grid mt-2">
            <div class="col-12">
                <Card>
                    <template #content>
                        <BenefitGroupsDetails
                            :data="item"
                            component-id="benefit-groups-details"
                            :is-review="true"
                        />
                    </template>
                </Card>
            </div>
        </div>
        <Card class="mt-2">
            <template #content>
                <BenefitGroupsBenefits
                    :id="props.id"
                    component-id="benefit-groups-benefits"
                    :is-review="true"
                />
            </template>
        </Card>
        <Card class="mt-4">
            <template #content>
                <AttachPricingInit
                    :is-new="false"
                    :isCopy="false"
                    :id="props.id"
                    :store="benefitStore"
                    :title="$t('common.benefit_group_pricing')"
                    :isBenefitGroup="true"
                    can-recalculate-pricings
                    has-price-breakdown
                    component-id="benefit-groups-prices"
                    :is-review="true"
                />
            </template>
        </Card>
        <Card class="mt-4">
            <template #content>
                <DocumentsTable
                    type="benefit-groups"
                    :id="props.id"
                    :is-new="false"
                    component-id="benefit-groups-documents"
                    :is-review="true"
                />
            </template>
        </Card>
        <div class="my-8 flex justify-content-between align-items-center">
            <Button
                data-testid="back-button"
                label="Back"
                icon="pi pi-chevron-left"
                class="p-button-outlined"
                @click="goBack"
            />
            <Button
                data-testid="confirm-and-publish-button"
                label="Confirm & Publish"
                icon-pos="right"
                icon="pi pi-chevron-right"
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
        confirm-button-text="Publish"
        :header="$t('benefit_groups.publish_benefit_group')"
        :content="
            $t('benefit_groups.publish_benefit_group_content', {
                item: helpers.getLocaleValue(item.name)
            })
        "
        @confirm="publish"
    />
</template>

<style lang="scss" scoped></style>
