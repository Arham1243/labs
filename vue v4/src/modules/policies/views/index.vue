<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { PolicyModulePermission } from '@/config';
import Label from '@/components/common/Label.vue';
import PoliciesTable from '@/modules/policies/components/tables/PoliciesTable.vue';
import OrderPoliciesDialog from '@/modules/policies/components/dialogs/OrderPoliciesDialog.vue';

const { t } = useI18n();

const showOrderPoliciesDialog = ref(false);
const exportMenu = ref();

const exportMenuItems = computed(() => {
    return [
        {
            label: t('buttons.xls'),
            icon: 'pi pi-file-excel',
            command: () => {}
        },
        {
            label: t('buttons.pdf'),
            icon: 'pi pi-file-pdf',
            command: () => {}
        }
    ];
});

const showExportActions = (event) => {
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
                <Label test-id="page-title"> {{ $t('policies.title') }} </Label>
            </template>
            <template #actions>
                <div
                    class="flex justify-between items-center gap-4"
                >
                    <div class="custom-button-header-action flex">
                        <Button
                            label="Export"
                            icon="pi pi-chevron-down"
                            iconPos="right"
                            class="p-button-outlined"
                            @click="showExportActions($event)"
                            data-testid="export-button"
                        />
                        <Menu
                            ref="exportMenu"
                            id="export_menu"
                            :model="exportMenuItems"
                            :popup="true"
                            data-testid="export-menu"
                        />
                    </div>
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

        <Card class="mt-6">
            <template #content>
                <PoliciesTable />
            </template>
        </Card>

        <OrderPoliciesDialog v-model="showOrderPoliciesDialog" />
    </div>
</template>

<style lang="scss"></style>
