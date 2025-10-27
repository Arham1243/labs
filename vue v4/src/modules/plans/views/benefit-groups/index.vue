<script setup>
import { useRouter } from 'vue-router';
import BenefitGroupsTable from '@/modules/plans/components/benefit-groups/tables/BenefitGroupsTable.vue';
import Label from '@/components/common/Label.vue';
import { useGlobalStore } from '@/stores';

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
                    $t('benefit_groups.title')
                }}</Label>
            </template>
            <template #actions>
                <Button
                    data-testid="add-new-benefit-group-button"
                    :label="$t('benefit_groups.create_btn_label')"
                    icon="pi pi-plus"
                    @click="pushRoute('New Benefit Group')"
                    v-if="$ability.can('create benefit groups')"
                />
            </template>
        </Header>
        <Card class="mt-8">
            <template #content>
                <BenefitGroupsTable />
            </template>
        </Card>
    </div>
</template>

<style lang="scss"></style>
