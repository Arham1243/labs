<script setup>
import { useRouter } from 'vue-router';
import DocumentsTable from '@/components/documents/DocumentsTable.vue';
import { usePlanStore } from '@/modules/plans/stores/Plan';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});

const router = useRouter();
const planStore = usePlanStore();

const goBack = () => {
    const hasOptOut = planStore.currentPlan?.is_opt_out;

    if (hasOptOut) {
        router.push({
            name: 'New Plan Step 4 OptOut',
            params: { id: props.id }
        });
    } else {
        router.push({
            name: 'New Plan Step 3',
            params: { id: props.id }
        });
    }
};

const goNext = () => {
    const hasOptOut = planStore.currentPlan?.is_opt_out;

    if (hasOptOut) {
        router.push({
            name: 'New Plan Step 6 Review',
            params: { id: props.id }
        });
    } else {
        router.push({
            name: 'New Plan Step 5 Review',
            params: { id: props.id }
        });
    }
};
</script>

<template>
    <div class="mt-4">
        <Card>
            <template #content>
                <DocumentsTable
                    type="plans"
                    :id="props.id"
                    :is-new="true"
                    component-id="documents-table"
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
                            data-testid="save-and-continue-button"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
