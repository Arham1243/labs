<script setup>
import BusinessUnitPlanList from './partials/BusinessUnitPlanList.vue';
import BusinessUnitNewDefaultPlanBtn from './partials/BusinessUnitNewDefaultPlanBtn.vue';
import { ref } from 'vue';
import AddNonInsuranceProductDialog from '@/modules/clients/components/dialogs/AddNonInsuranceProduct.vue';
import BusinessUnitNonInsuranceProductList from '@/modules/clients/components/partials/BusinessUnitNonInsuranceProductList.vue';

defineProps({
    id: {
        required: true,
        type: String
    },
    clientId: {
        required: true,
        type: String
    }
});

const isHasPlans = ref(false);

const hasPlan = (value) => {
    isHasPlans.value = value;
};

const addNonInsuranceProductDialog = ref(false);

const showAddNonInsuranceProductDialog = () => {
    addNonInsuranceProductDialog.value = true;
};
</script>
<template>
    <div class="mt-4">
        <BusinessUnitPlanList :id="id" @has-plans="hasPlan" />
        <BusinessUnitNonInsuranceProductList />
        <div class="mt-8">
            <BusinessUnitNewDefaultPlanBtn :id="id" :clientId="clientId" />
            <Button
                class="ml-4 p-button-outlined"
                :label="$t('non_insurance_products.add_non_insurance_product')"
                icon="pi pi-plus"
                iconPos="left"
                @click="showAddNonInsuranceProductDialog"
                data-testid="add-non-insurance-product-button"
            />
        </div>

        <AddNonInsuranceProductDialog v-model="addNonInsuranceProductDialog" />
    </div>
</template>
