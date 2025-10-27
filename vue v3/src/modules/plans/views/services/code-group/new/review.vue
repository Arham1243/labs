<script setup>
import { ref, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { useCodeSetStore } from '../../../../stores/CodeSet';
import { useHelpers } from '@/composables';

import CodeGroupDetails from '../../../../components/services/CodeGroupDetails.vue';
import CodeGroupsServiceCodes from '../../../../components/services/CodeGroupsServiceCodes.vue';
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

onBeforeMount(async () => {
    await getItem();
});

const getItem = async () => {
    loading.value = true;
    const res = await codeSetStore.getCodeGroup(props.id);
    item.value = res.data;
    loading.value = false;
};

const goBack = () => {
    if (activeEditComponent.value) {
        handleUnsavedChanges(() => {
            router.push({
                name: 'New Code Group Step 2',
                params: { id: props.id }
            });
        });
        pendingNavigation.value = 'back';
    } else {
        router.push({
            name: 'New Code Group Step 2',
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
        await codeSetStore.publishCodeGroup(props.id, item.value);
        router.push({
            name: 'Code Groups'
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
            name: 'New Code Group Step 2',
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
        <h4 data-testid="review-title">Review Code Group Summary</h4>
        <div class="grid my-2">
            <div class="col-8">
                <Card>
                    <template #content>
                        <CodeGroupDetails
                            is-new
                            :data="item"
                            @update:data="dataUpdated"
                            component-id="code-group-details"
                            :is-review="true"
                        />
                    </template>
                </Card>
            </div>
        </div>

        <Card class="mt-4">
            <template #content>
                <CodeGroupsServiceCodes
                    :id="id"
                    :code-set-id="item.service_code_set?.id"
                    component-id="code-group-service-code"
                />
            </template>
        </Card>

        <div class="mt-4 flex justify-content-between align-items-center">
            <Button
                label="Back"
                icon="pi pi-chevron-left"
                class="p-button-outlined"
                @click="goBack"
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
            header="Publish Code Group"
            :content="`Are you sure you want to publish the code group ${helpers.getLocaleValue(
                item.name
            )}?`"
            @confirm="publish"
            data-testid="publish-confirmation-dialog"
        />
    </div>
</template>

<style lang="scss" scoped></style>
