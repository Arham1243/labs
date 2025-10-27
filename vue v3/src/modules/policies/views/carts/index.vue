<script setup>
import { useI18n } from 'vue-i18n';
import Label from '@/components/common/Label.vue';
import CartsTable from '@/modules/policies/components/tables/CartsTable.vue';
import { ref } from 'vue';
import { PolicyModulePermission } from '@/config/index.js';
import OrderPoliciesDialog from '@/modules/policies/components/dialogs/OrderPoliciesDialog.vue';
import { usePoliciesStore } from '@/modules/policies/stores/index.js';

const { t } = useI18n();
const policiesStore = usePoliciesStore();

const tableRef = ref();
const showOrderPoliciesDialog = ref(false);

const openOrderPoliciesDialog = (event) => {
    showOrderPoliciesDialog.value = true;
};
</script>

<template>
    <div>
        <Header hide-back>
            <template #title>
                <Label test-id="page-title"> {{ $t('carts.title') }} </Label>
            </template>

            <template #actions>
                <div
                    class="flex justify-content-between align-items-center gap-3"
                >
                    <Button
                        v-if="
                            $ability.can(PolicyModulePermission.POLICIES.CREATE)
                        "
                        data-testid="order-new-policy-button"
                        label="Order Policies"
                        icon="pi pi-plus"
                        @click="openOrderPoliciesDialog"
                    />
                </div>
            </template>
        </Header>

        <div class="flex gap-5">
            <Card class="flex-1 p-5" data-testid="total_cart_num">
                <template #content>
                    <div class="text-lg font-semibold mb-5">
                        {{ $t('carts.total_cart_num') }}
                    </div>
                    <div class="text-2xl font-bold">
                        {{ tableRef?.cartsAggregation?.meta?.total }}
                    </div>
                </template>
            </Card>

            <Card class="flex-1 p-5" data-testid="num_of_items">
                <template #content>
                    <div class="text-lg font-semibold mb-5">
                        {{ $t('carts.num_of_items') }}
                    </div>
                    <div class="text-2xl font-bold">
                        {{
                            tableRef?.cartsAggregation.data?.reduce(
                                (sum, item) =>
                                    sum + parseInt(item.items_sum_qty || 0),
                                0
                            )
                        }}
                    </div>
                </template>
            </Card>

            <Card class="flex-1 p-5" data-testid="total_amount">
                <template #content>
                    <div class="text-lg font-semibold mb-5">
                        {{ $t('carts.total_amount') }}
                    </div>
                    <div class="text-2xl font-bold">
                        ${{
                            tableRef?.cartsAggregation.data
                                ?.reduce(
                                    (sum, item) =>
                                        sum +
                                        parseFloat(item.items_sum_amount || 0),
                                    0
                                )
                                ?.toFixed(2)
                        }}
                    </div>
                </template>
            </Card>
        </div>

        <Card class="mt-4" data-testid="carts_table">
            <template #content>
                <CartsTable ref="tableRef" />
            </template>
        </Card>

        <OrderPoliciesDialog
            v-model="showOrderPoliciesDialog"
            :page-of-origin="policiesStore.orderFlowPages.carts"
        />
    </div>
</template>

<style lang="scss"></style>
