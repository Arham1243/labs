<script setup>
import { useRouter } from 'vue-router';
import DocumentsTable from '@/components/documents/DocumentsTable.vue';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});

const router = useRouter();

const goBack = () => {
    router.push({ name: 'New Benefit Group Step 3' });
};

const goNext = () => {
    router.push({ name: 'New Benefit Group Step 5', params: { id: props.id } });
};
</script>

<template>
    <div class="mt-12">
        <Card>
            <template #content>
                <DocumentsTable
                    type="benefit-groups"
                    :id="props.id"
                    :is-new="true"
                    component-id="benefit-groups-documents"
                />
            </template>
        </Card>
        <div class="grid grid-cols-12 my-20">
            <div class="col-span-12 col-start-1">
                <div class="mt-12 flex justify-between items-center edit-cancel-button">
                    <Button
                        data-testid="back-button"
                        label="Back"
                        icon="pi pi-chevron-left"
                        class="p-button-outlined"
                        @click="goBack"
                    />
                    <div>
                        <Button
                            data-testid="save-continue-button"
                            label="Save & Continue"
                            icon-pos="right"
                            icon="pi pi-chevron-right"
                            @click="goNext"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
