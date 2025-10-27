<script setup>
import { onBeforeMount, watch } from 'vue';
import { useSearchNonInsuranceProduct } from '@/modules/plans/composables/non-insurance-product/searchNonInsuranceProduct';

defineProps({
    isNew: {
        type: Boolean,
        default: false
    }
});

const formData = defineModel();
const emit = defineEmits(['nonInsuranceProductChanged']);

const {
    loadingNonInsuranceProducts,
    nonInsuranceProducts,
    getNonInsuranceProducts
} = useSearchNonInsuranceProduct();

watch(
    () => formData.value.non_insurance_products,
    (newValue, oldValue) => {
        if (oldValue?.length === 0 && newValue?.length > 0) {
            emit('nonInsuranceProductChanged', {
                action: 'added',
                nonInsuranceProduct: newValue
            });
        } else if (oldValue?.length > 0 && newValue?.length === 0) {
            emit('nonInsuranceProductChanged', { action: 'removed' });
        } else if (oldValue?.length !== newValue?.length) {
            emit('nonInsuranceProductChanged', {
                action: 'changed',
                nonInsuranceProduct: newValue
            });
        }
    },
    { deep: true }
);

watch(
    () => formData.value.shouldIncludeNonInsuranceProducts,
    (newValue) => {
        if (newValue) {
            return;
        }
        formData.value.non_insurance_products = [];
        emit('nonInsuranceProductChanged', { action: 'disabled' });
    }
);

onBeforeMount(async () => {
    await getNonInsuranceProducts();

    if (formData.value.non_insurance_products?.length) {
        formData.value.shouldIncludeNonInsuranceProducts = true;
        const selectedNonInsuranceProducts = [];
        formData.value.non_insurance_products.forEach(
            (nonInsuranceProductItem) => {
                selectedNonInsuranceProducts.push(
                    nonInsuranceProducts.value.find(
                        (i) =>
                            String(i.id) === String(nonInsuranceProductItem.id)
                    )
                );
            }
        );
        formData.value.non_insurance_products = selectedNonInsuranceProducts;
    }
});
</script>
<template>
    <div class="p-fluid formgrid grid mt-4">
        <div class="field col-12">
            <div class="flex">
                <InputSwitch
                    v-model="formData.shouldIncludeNonInsuranceProducts"
                    :falseValue="false"
                    :trueValue="true"
                    data-testid="should-include-non-insurance-products-input"
                />
                <span
                    class="ml-2 mt-1"
                    data-testid="include-non-insurance-products-label"
                >
                    {{ $t('plans.include_non_insurance_products') }}
                </span>
            </div>
            <div
                class="mt-1"
                v-show="formData.shouldIncludeNonInsuranceProducts"
            >
                <ApiMultiselect
                    id="non_insurance_products"
                    localed
                    class="w-full mt-4"
                    option-label="name"
                    v-model="formData.non_insurance_products"
                    @search="getNonInsuranceProducts"
                    :loading="loadingNonInsuranceProducts"
                    :items="nonInsuranceProducts"
                    :shouldSetSelectedItemsOnMounted="true"
                    :shouldFindSelectedItemsById="true"
                    data-testid="include-non-insurance-product-dropdown"
                />
            </div>
        </div>
    </div>
</template>
