<script setup>
import { useRouter } from 'vue-router';
import { useNonInsuranceProductStore } from '@/modules/plans/stores/NonInsuranceProduct';
import AttachPricingInit from '@/modules/plans/components/shared/AttachPricing/AttachPricingInit.vue';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});

const router = useRouter();
const nonInsuranceProductStore = useNonInsuranceProductStore();

const goBack = () => {
    router.push({
        name: 'New Non-Insurance Product',
        params: { id: props.id }
    });
};

const goNext = () => {
    router.push({
        name: 'New Non-Insurance Product Step 3',
        params: { id: props.id }
    });
};
</script>

<template>
    <div class="mt-12">
        <Card>
            <template #content>
                <AttachPricingInit
                    is-new
                    :isCopy="false"
                    :id="props.id"
                    :store="nonInsuranceProductStore"
                    :title="
                        $t(
                            'non_insurance_products.pricing_based_on_region_country'
                        )
                    "
                    :isNonInsuranceProduct="true"
                    component-id="non-insurance-product-pricing"
                />
            </template>
        </Card>
        <div class="grid grid-cols-12 my-20">
            <div class="col-span-12">
                <div
                    class="mt-12 flex justify-between items-center edit-cancel-button"
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
