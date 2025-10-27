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
    router.push({ name: 'New Benefit Step 3' });
};

const goNext = () => {
    router.push({ name: 'New Benefit Step 5' });
};
</script>

<template>
    <div class="mt-12">
        <Card>
            <template #content>
                <DocumentsTable
                    type="benefits"
                    :id="props.id"
                    :is-new="true"
                    component-id="benefit-documents"
                />
            </template>
        </Card>
        <div class="grid grid-cols-12 my-20">
            <div class="col-span-12 col-start-1">
                <div class="mt-12 flex justify-between items-center edit-cancel-button">
                    <Button
                        :label="$t('buttons.back')"
                        icon="pi pi-chevron-left"
                        class="p-button-outlined"
                        @click="goBack"
                        data-testid="back-button"
                    />
                    <div>
                        <Button
                            :label="$t('buttons.save_continue')"
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
