<script setup>
import { useRouter } from 'vue-router';
import PlansTable from '@/modules/plans/components/plans/tables/PlansTable.vue';
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
                <Label test-id="page-title">
                    {{ $t('plans.title') }}
                </Label>
            </template>
            <template #actions>
                <Button
                    data-testid="add-new-plan-button"
                    :label="$t('plans.create_btn_label')"
                    icon="pi pi-plus"
                    @click="pushRoute('New Plan')"
                />
            </template>
        </Header>
        <Card class="mt-4">
            <template #content>
                <PlansTable />
            </template>
        </Card>
    </div>
</template>
