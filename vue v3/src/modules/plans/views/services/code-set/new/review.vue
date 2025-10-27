<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCodeSetStore } from '../../../../stores/CodeSet';
import { useHelpers } from '@/composables';

import CodeSetDetails from '../../../../components/services/CodeSetDetails.vue';
import CodeSetsServiceCodes from '../../../../components/services/CodeSetsServiceCodes.vue';
import { provideEditState } from '@/modules/plans/composables/useEditState';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});

const router = useRouter();
const helpers = useHelpers();
const codeSetStore = useCodeSetStore();

const {
    activeEditComponent,
    showUnsavedDialog,
    handleUnsavedChanges,
    triggerCancelEdit
} = provideEditState();

const item = ref({});
const busy = ref(false);
const loading = ref(false);
const isPublishDialog = ref(false);

const pendingNavigation = ref(null);

onMounted(async () => {
    await getItem();
});

const getItem = async () => {
    loading.value = true;
    const res = await codeSetStore.getCodeSet(props.id);
    item.value = res.data;
    loading.value = false;
};

const goBack = () => {
    if (activeEditComponent.value) {
        handleUnsavedChanges(() => {
            router.push({
                name: 'New Code Set Step 2',
                params: { id: props.id }
            });
        });
        pendingNavigation.value = 'back';
    } else {
        router.push({
            name: 'New Code Set Step 2',
            params: { id: props.id }
        });
    }
};

const showPublishDialog = () => {
    if (activeEditComponent.value) {
        handleUnsavedChanges(() => {
            triggerCancelEdit();
            setTimeout(() => {
                isPublishDialog.value = true;
            }, 50);
        });
        pendingNavigation.value = 'publish';
    } else {
        isPublishDialog.value = true;
    }
};

const publish = async () => {
    try {
        busy.value = true;
        await codeSetStore.publishCodeSet(props.id, item.value);
        router.push({
            name: 'Code Sets'
        });
    } finally {
        busy.value = false;
    }
};

const confirmDiscard = () => {
    showUnsavedDialog.value = false;
    triggerCancelEdit();
    if (pendingNavigation.value === 'back') {
        router.push({
            name: 'New Code Set Step 2',
            params: { id: props.id }
        });
    } else if (pendingNavigation.value === 'publish') {
        setTimeout(() => {
            isPublishDialog.value = true;
        }, 50);
    }
    pendingNavigation.value = null;
};

const cancelDiscard = () => {
    showUnsavedDialog.value = false;
    pendingNavigation.value = null;
};

const dataUpdated = (newData) => {
    item.value = newData;
};
</script>

<template>
    <Loader v-if="loading" />
    <div v-else class="mt-4">
        <h4 data-testid="review-title">Review Code Set Summary</h4>
        <div class="grid my-2">
            <div class="col-6">
                <Card>
                    <template #content>
                        <CodeSetDetails
                            is-new
                            :data="item"
                            @update:data="dataUpdated"
                            component-id="code-set-details"
                            :is-review="true"
                        />
                    </template>
                </Card>
            </div>
        </div>

        <Card class="mt-4">
            <template #content>
                <CodeSetsServiceCodes
                    :id="id"
                    component-id="code-sets-service-codes"
                    :is-review="true"
                />
            </template>
        </Card>

        <div class="mt-4 flex justify-content-between align-items-center">
            <Button
                label="Back"
                icon="pi pi-chevron-left"
                class="p-button-outlined"
                @click="goBack"
                data-testid="back-button"
            />
            <div>
                <!-- <Button
                    label="Save"
                    class="p-button-outlined mr-2"
                    @click="goHome"
                /> -->
                <Button
                    label="Publish"
                    icon="pi pi-chevron-right"
                    iconPos="right"
                    @click="showPublishDialog"
                    data-testid="publish-button"
                />
            </div>
        </div>

        <Confirmation
            v-model="showUnsavedDialog"
            header="Exit Edit Mode"
            content="Are you sure you want to exit edit mode? Any changes made will be lost."
            confirm-button-class="p-button-danger"
            confirm-button-text="Exit Edit Mode"
            cancel-button-text="Continue Editing"
            class="w-auto"
            @confirm="confirmDiscard"
            @cancel="cancelDiscard"
        />

        <Confirmation
            v-model="isPublishDialog"
            confirm-button-text="Publish"
            header="Publish Code Set"
            :content="`Are you sure you want to publish the code set ${helpers.getLocaleValue(
                item.name
            )}?`"
            @confirm="publish"
            data-testid="publish-confirmation-dialog"
        />
    </div>
</template>

<style lang="scss" scoped></style>
