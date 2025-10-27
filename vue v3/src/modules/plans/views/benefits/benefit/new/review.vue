<script setup>
import { ref, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { useHelpers } from '@/composables';
import { useBenefitStore } from '@/modules/plans/stores/Benefit';

import BenefitDetails from '@/modules/plans/components/benefits/BenefitDetails.vue';
import BenefitRestrictions from '@/modules/plans/components/benefits/BenefitRestrictions.vue';
import BenefitServices from '@/modules/plans/components/benefits/BenefitServices.vue';
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
const benefitStore = useBenefitStore();
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

const pendingNavigation = ref(null);

onBeforeMount(() => {
    getItem();
});

const getItem = async () => {
    loading.value = true;
    const params = {
        include: 'category,underwriter,vendors',
        with_count: 'serviceCodes,serviceCodeGroupsServiceCodes'
    };
    const res = await benefitStore.getBenefit(props.id, params);
    processResponse(res.data);
    loading.value = false;
};

const processResponse = (data) => {
    benefitStore.setCurrentBenefit(data);
    item.value = data;
    item.value.rules = data.rules ? data.rules : [];
    item.value.min_time_req = data.min_time_req ? data.min_time_req : {};
    item.value.is_individual = data.is_individual ? 1 : 0;
    item.value.isTimeRequirement =
        data.min_time_req && Object.keys(data.min_time_req).length > 0;
    item.value.isIncludeSupply = data.rules?.length > 0;
    item.value.is_reportable_to_vendors = data.is_reportable_to_vendors;
};

const goBack = () => {
    if (activeEditComponent.value) {
        handleUnsavedChanges(() => {
            router.push({
                name: 'New Benefit Step 4',
                params: { id: props.id }
            });
        });
        pendingNavigation.value = 'back';
    } else {
        router.push({
            name: 'New Benefit Step 4',
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

const goNext = () => {
    router.push({ name: 'Benefits' });
};

const publishBenefit = async () => {
    try {
        busy.value = true;
        let benefit = benefitStore.currentBenefit;
        benefit.benefit_category_id = benefit.benefit_category?.id;
        benefit.underwriter_id = benefit.underwriter?.id;
        await benefitStore.publishBenefit(props.id);
        goNext();
    } finally {
        busy.value = false;
    }
};

const confirmDiscard = () => {
    showUnsavedDialog.value = false;
    triggerCancelEdit();
    if (pendingNavigation.value === 'back') {
        router.push({
            name: 'New Benefit Step 4',
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
            {{ $t('benefits.review_benefit_summary') }}
        </h4>
        <div class="grid">
            <div class="col-6">
                <Card>
                    <template #content>
                        <BenefitDetails
                            :data="item"
                            component-id="benefit-details"
                            :is-review="true"
                        />
                    </template>
                </Card>
            </div>
            <div class="col-6">
                <Card>
                    <template #content>
                        <BenefitRestrictions
                            :data="item"
                            component-id="benefit-restrictions"
                            :is-review="true"
                        />
                    </template>
                </Card>
            </div>
            <div class="col-12">
                <Card>
                    <template #content>
                        <BenefitServices
                            :id="props.id"
                            :title="$t('benefit_groups.benefit_services')"
                            :is-new="false"
                            component-id="benefit-services"
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
                            :store="benefitStore"
                            :title="$t('common.benefit_pricing')"
                            :isBenefit="true"
                            component-id="benefit-prices"
                            :is-review="true"
                        />
                    </template>
                </Card>
            </div>
            <div class="col-12">
                <Card class="mt-5">
                    <template #content>
                        <DocumentsTable
                            type="benefits"
                            :id="props.id"
                            :is-new="false"
                            component-id="benefit-documents"
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
        :header="$t('benefits.publish_benefit_header')"
        :content="
            $t('benefits.publish_benefit_content', {
                item: helpers.getLocaleValue(item.name)
            })
        "
        @confirm="publishBenefit"
    />
</template>
