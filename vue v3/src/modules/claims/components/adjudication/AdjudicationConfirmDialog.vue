<script setup>
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import {
    cfg_adjudication_dialog,
    createDialogConfig
} from '@/modules/claims/utils/adjudication';
import { useAdjudicationQueueStore } from '@/modules/claims/stores/AdjudicationQueue';
import LabelField from '@/modules/claims/components/forms/LabelField.vue';
import { validateForm } from '@/modules/claims/utils/helper';
import { useSubmissionStore } from '@/modules/claims/stores/Submission';
import { auditStatus } from '@/config';

const { t } = useI18n();
const visible = defineModel('visible');
const dialogConfig = createDialogConfig(t);

const { currentSubmission, getSubmissionById } = useSubmissionStore();
const { changeStatusAdjudicationQueue, deleteAdjudicationQueue } =
    useAdjudicationQueueStore();
const { changeQueueSubmissionStatus } = useSubmissionStore();
const { mutate: changeStatusMutation } = changeStatusAdjudicationQueue();
const { mutate: deleteMutation } = deleteAdjudicationQueue();
const { mutate: changeSubmissionStatusMutation } =
    changeQueueSubmissionStatus();

const props = defineProps({
    queue: {
        type: Object
    },
    mode: {
        type: String // 'inactive', 'active', 'delete' or 'confirm_assessment
    },
    clientId: {
        type: [String, Number]
    }
});

const formData = reactive({
    reason: '',
    validate: false
});

const getConfig = (opt, defaultValue = '') =>
    dialogConfig[props.mode]?.(props.queue)[opt] || defaultValue;

const handleConfirm = (mode) => {
    if (mode === 'delete') {
        const { id: queueId, name: queueName } = props.queue;
        deleteMutation({ queueId, queueName });
    } else if (mode === 'audited_completed' || mode === 'audited_declined') {
        const payload = {
            client_id: props.clientId,
            submission_id: currentSubmission.value.id,
            audit_status: mode
        };
        changeSubmissionStatusMutation(payload);

        getSubmissionById(props.clientId, currentSubmission.value.id, true);
    } else {
        const { id: queueId, name: queueName } = props.queue;
        let valid =
            mode === 'inactive'
                ? validateForm(cfg_adjudication_dialog, formData)
                : true;
        if (valid) {
            changeStatusMutation({
                payload: {
                    status: mode,
                    reason: formData.reason
                },
                queueId
            });
            formData.reason = '';
        } else return;
    }
    visible.value = false;
};
</script>

<template>
    <Dialog
        v-model:visible="visible"
        modal
        :header="getConfig('title', 'Confirmation')"
        :style="{ width: '40rem' }"
        data-testid="adjudication-confirm-dialog"
    >
        <p data-testid="dialog-content" v-html="getConfig('content')" />

        <LabelField
            :field="cfg_adjudication_dialog[0]"
            v-model="formData.reason"
            v-model:validate="formData.validate"
            v-if="getConfig('reason')"
        />

        <template #footer>
            <Button
                :label="$t('buttons.cancel')"
                @click="visible = false"
                class="p-button-text"
                data-testid="cancel-button"
            />
            <Button
                :label="getConfig('buttonText')"
                @click="handleConfirm(props.mode)"
                :severity="getConfig('buttonStyle')"
                :data-testid="`${props.mode}-button`"
            />
        </template>
    </Dialog>
</template>
