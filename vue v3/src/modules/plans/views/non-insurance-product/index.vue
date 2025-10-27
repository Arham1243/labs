<script setup>
import { useRouter } from 'vue-router';
import { useGlobalStore } from '@/stores';
import Label from '@/components/common/Label.vue';
import NonInsuranceProductable from '@/modules/plans/components/non-insurance-product/tables/NonInsuranceProductable.vue';

const router = useRouter();

const pushRoute = (name) => {
    useGlobalStore().clearErrors();
    router.push({ name, params: { id: -1 } });
};
</script>

<template>
    <div>
        <Header hide-back>
            <template #title>
                <Label test-id="page-title">{{
                    $t('non_insurance_products.title')
                }}</Label>
            </template>
            <template #actions>
                <Button
                    data-testid="add-new-non-insurance-product-button"
                    :label="$t('non_insurance_products.create_btn_label')"
                    icon="pi pi-plus"
                    @click="pushRoute('New Non-Insurance Product')"
                />
            </template>
        </Header>
        <Card class="mt-4">
            <template #content>
                <NonInsuranceProductable />
            </template>
        </Card>
    </div>
</template>

<style lang="scss"></style>
