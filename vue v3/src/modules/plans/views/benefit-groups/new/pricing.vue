<script setup>
import { useRouter } from 'vue-router';
import { useBenefitStore } from '@/modules/plans/stores/Benefit';
import AttachPricingInit from '@/modules/plans/components/shared/AttachPricing/AttachPricingInit.vue';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});

const router = useRouter();
const benefitStore = useBenefitStore();

const goBack = () => {
    router.push({ name: 'New Benefit Group Step 2' });
};

const goNext = () => {
    router.push({ name: 'New Benefit Group Step 4', params: { id: props.id } });
};
</script>

<template>
    <div class="mt-4">
        <Card>
            <template #content>
                <AttachPricingInit
                    is-new
                    :isCopy="false"
                    :id="props.id"
                    :store="benefitStore"
                    :title="
                        $t('benefit_groups.pricing_based_on_region_country')
                    "
                    :isBenefitGroup="true"
                    has-price-breakdown
                    can-recalculate-pricings
                    component-id="new-benefit-group-pricing"
                />
            </template>
        </Card>
        <div class="grid my-8">
            <div class="col-12 mx-auto">
                <div
                    class="mt-4 flex justify-content-between align-items-center"
                >
                    <Button
                        data-testid="button-back"
                        label="Back"
                        icon="pi pi-chevron-left"
                        class="p-button-outlined"
                        @click="goBack"
                    />
                    <div>
                        <Button
                            data-testid="button-save-continue"
                            label="Save & Continue"
                            icon-pos="right"
                            icon="pi pi-chevron-right"
                            @click="goNext"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
