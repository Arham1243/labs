<script setup>
import { useI18n } from 'vue-i18n';
import { ref, watch } from 'vue';
import { useAdjudicationQueueStore } from '@/modules/claims/stores/AdjudicationQueue';
import AdjudicationOverview from '@/modules/claims/components/adjudication/AdjudicationOverview.vue';

const { t } = useI18n();
const { mutateAdjudicationQueue, currentAdjudicationQueue: queue } =
    useAdjudicationQueueStore();
const { mutate, loading, status } = mutateAdjudicationQueue();

const showDialog = ref(false);

const form = defineModel('form', { default: {} });
form.value = {
    loading: loading,
    status: status,
    submit: () => (showDialog.value = true)
};

const publish = () => {
    mutate({
        payload: { status: 'active' },
        queueId: queue.value.id,
        showMsg: true
    });
};

watch(
    () => loading.value,
    () => {
        if (status.value === 'success' && showDialog.value)
            showDialog.value = false;
    }
);
</script>

<template>
    <div>
        <h4
            v-text="t('adjudication.review_summary')"
            data-testid="text-review-title"
        />

        <AdjudicationOverview />

        <Dialog
            v-model:visible="showDialog"
            modal
            :header="t('adjudication.publish_dialog_title')"
            :style="{ width: '32rem' }"
            data-testid="dialog-adjudication-queue"
        >
            <div class="flex mb-0 flex-wrap" data-testid="dialog-message">
                Are you sure you want to publish the queue
                <b v-text="queue.name" class="ml-2" />
            </div>

            <div class="flex justify-end gap-2 mt-20">
                <Button
                    type="button"
                    :label="t('buttons.cancel')"
                    link
                    @click="showDialog = false"
                    data-testid="dialog-btn-cancel-queue"
                />
                <Button
                    type="button"
                    :label="t('buttons.publish')"
                    :loading="loading"
                    data-testid="dialog-btn-save-queue"
                    @click="publish"
                />
            </div>
        </Dialog>
    </div>
</template>
