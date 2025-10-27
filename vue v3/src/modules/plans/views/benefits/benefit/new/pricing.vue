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
    router.push({ name: 'New Benefit Step 2' });
};

const goNext = () => {
    router.push({ name: 'New Benefit Step 4', params: { id: props.id } });
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
                    :title="$t('benefits.pricing_based_on_region_country')"
                    :isBenefit="true"
                    component-id="benefit-prices"
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

<style lang="scss" scoped></style>
