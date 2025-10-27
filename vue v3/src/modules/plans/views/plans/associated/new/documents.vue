<script setup>
import { useRouter } from 'vue-router';
import DocumentsTable from '@/components/documents/DocumentsTable.vue';
import { useAssociatedPlanStore } from '@/modules/plans/stores/AssociatedPlan';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});

const router = useRouter();
const associatedPlanStore = useAssociatedPlanStore();

const goBack = () => {
    if (associatedPlanStore.currentPlan.category === 'dependants') {
        router.push({ name: 'New Associated Plan Dependant' });
    } else {
        router.push({ name: 'New Associated Plan Step 3' });
    }
};

const goNext = () => {
    router.push({
        name: 'New Associated Plan Step 5',
        params: { id: props.id }
    });
};
</script>

<template>
    <div class="mt-4">
        <Card>
            <template #content>
                <DocumentsTable
                    type="associated-plans"
                    :id="props.id"
                    :is-new="true"
                    component-id="documents"
                />
            </template>
        </Card>
        <div class="grid my-8">
            <div class="col-12 mx-auto">
                <div
                    class="mt-4 flex justify-content-between align-items-center"
                >
                    <Button
                        label="Back"
                        icon="pi pi-chevron-left"
                        class="p-button-outlined"
                        @click="goBack"
                        data-testid="back-button"
                    />
                    <div>
                        <Button
                            label="Save & Continue"
                            icon-pos="right"
                            icon="pi pi-chevron-right"
                            @click="goNext"
                            data-testid="save-continue-button"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
