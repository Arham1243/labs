<script setup>
import { useRouter } from 'vue-router';
import { useAssociatedPlanStore } from '@/modules/plans/stores/AssociatedPlan';

import AttachPricingInit from '@/modules/plans/components/shared/AttachPricing/AttachPricingInit.vue';

const router = useRouter();
const associatedPlanStore = useAssociatedPlanStore();

const props = defineProps({
    plan: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    }
});

const goBack = () => {
    router.push({
        name: 'New Associated Plan Step 2',
        params: { id: props.id, plan: props.plan }
    });
};

const goNext = () => {
    if (associatedPlanStore.currentPlan.category === 'dependants') {
        router.push({
            name: 'New Associated Plan Dependant',
            params: { id: props.id, plan: props.plan }
        });
        return;
    }
    router.push({
        name: 'New Associated Plan Step 4',
        params: { id: props.id, plan: props.plan }
    });
};
</script>
<template>
    <div class="mt-4">
        <Card>
            <template #content>
                <AttachPricingInit
                    is-new
                    is-disabled-net-price
                    is-copy
                    :id="props.id"
                    :parent="props.plan"
                    :store="associatedPlanStore"
                    :title="$t('plans.pricing_based_on_region_country')"
                    has-price-breakdown
                    can-recalculate-pricings
                    component-id="attach-pricing"
                    is-associated-plan
                />
            </template>
        </Card>
        <div class="grid my-8">
            <div class="col-12 mx-auto">
                <div
                    class="mt-4 flex justify-content-between align-items-center"
                >
                    <Button
                        :label="$t('buttons.back')"
                        icon="pi pi-chevron-left"
                        class="p-button-outlined"
                        @click="goBack"
                        data-testid="back-button"
                    />
                    <div>
                        <Button
                            :label="$t('buttons.save_continue')"
                            icon-pos="right"
                            icon="pi pi-chevron-right"
                            @click="goNext"
                            data-testid="save-continue-button"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
