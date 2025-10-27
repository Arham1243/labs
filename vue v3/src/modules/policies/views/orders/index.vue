<script setup>
import { ref, computed } from 'vue';
import Label from '@/components/common/Label.vue';
import { useI18n } from 'vue-i18n';
import { PolicyModulePermission } from '@/config';
import OrdersTable from '@/modules/policies/components/tables/OrdersTable.vue';
import OrderPoliciesDialog from '@/modules/policies/components/dialogs/OrderPoliciesDialog.vue';

const { t } = useI18n();

const showOrderPoliciesDialog = ref(false);
const exportMenu = ref();

const exportMenuItems = computed(() => {
    return [
        {
            label: t('policies.policies_table.xls'),
            command: () => ''
        },
        {
            label: t('policies.policies_table.pdf'),
            command: () => ''
        }
    ];
});

const showExportActions = (event, item) => {
    exportMenu.value.toggle(event);
};

const openOrderPoliciesDialog = (event) => {
    showOrderPoliciesDialog.value = true;
};
</script>

<template>
    <div>
        <Header hide-back>
            <template #title>
                <Label test-id="page-title">
                    {{ $t('policies.orders.title') }}
                </Label>
            </template>
            <template #actions>
                <div
                    class="flex justify-content-between align-items-center gap-3"
                >
                    <Button
                        label="Export"
                        icon="pi pi-chevron-down"
                        iconPos="right"
                        class="p-button-outlined mr-2"
                        @click="showExportActions($event, data)"
                        data-testid="export-button"
                    />
                    <Menu
                        ref="exportMenu"
                        id="export_menu"
                        :model="exportMenuItems"
                        :popup="true"
                        :data-testid="'export-menu'"
                        class="w-1rem"
                    />
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

        <Card class="mt-4">
            <template #content>
                <OrdersTable />
            </template>
        </Card>

        <OrderPoliciesDialog v-model="showOrderPoliciesDialog" />
    </div>
</template>

<style lang="scss"></style>
