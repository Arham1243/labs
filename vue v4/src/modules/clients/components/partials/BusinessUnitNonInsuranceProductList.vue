<script setup>
import BusinessUnitNonInsuranceProduct from '@/modules/clients/components/partials/BusinessUnitNonInsuranceProduct.vue';
import { onMounted, ref } from 'vue';
import { useClientStore } from '@/modules/clients/stores';

const clientStore = useClientStore();
const nonInsuranceProducts = ref([]);

onMounted(() => {
    nonInsuranceProducts.value =
        clientStore.currentBusinessUnit?.non_insurance_products;
});
</script>

<template>
    <div>
        <BusinessUnitNonInsuranceProduct
            v-for="nonInsuranceProduct in nonInsuranceProducts"
            :key="nonInsuranceProduct.id"
            :nonInsuranceProduct="nonInsuranceProduct"
        />
    </div>
</template>
