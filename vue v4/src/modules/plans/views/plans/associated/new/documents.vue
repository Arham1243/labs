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
    <div class="mt-12">
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
        <div class="grid grid-cols-12 my-20">
            <div class="col-span-12">
                <div
                    class="mt-12 flex justify-between items-center"
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
