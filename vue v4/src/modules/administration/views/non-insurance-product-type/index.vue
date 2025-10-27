<script setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import NonInsuranceProductTypeTable from '@/modules/administration/components/non-insurance-product-type/NonInsuranceProductTypeTable.vue';
const { t } = useI18n();
const router = useRouter();

const goBack = () => {
    router.push({ name: 'Administration' });
};
</script>

<template>
    <div>
        <div class="flex items-center gap-6 custom-button-header-action">
            <Button
                data-testid="back-button"
                @click="goBack"
                icon="pi text-sm pi-chevron-left"
                class="mb-2"
                variant="outlined"
            />
            <Header hide-back>
                <template #title
                    ><span data-testid="page-title">{{
                        t('non_insurance_product_type.title')
                    }}</span></template
                >
            </Header>
        </div>
        <Card class="mt-6">
            <template #content>
                <NonInsuranceProductTypeTable />
            </template>
        </Card>
    </div>
</template>
