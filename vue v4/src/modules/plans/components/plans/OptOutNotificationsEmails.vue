<script setup>
import { useI18n } from 'vue-i18n';
import EmailTemplateSelector from '@/modules/plans/components/plans/EmailTemplateSelector.vue';

const props = defineProps({
    templateOptions: {
        type: Array,
        default: () => []
    },
    isNew: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['preview-template']);
const { t } = useI18n();

const emailTemplates = [
    {
        key: 'request',
        label: t('plans.opt_out_request_email_template'),
        modelKey: 'requestTemplate',
        testId: 'opt-out-request'
    },
    {
        key: 'approved',
        label: t('plans.opt_out_approved_email_template'),
        modelKey: 'approvedTemplate',
        testId: 'opt-out-approved'
    },
    {
        key: 'declined',
        label: t('plans.opt_out_declined_email_template'),
        modelKey: 'declinedTemplate',
        testId: 'opt-out-declined'
    }
];

const sendNotifications = defineModel();

const updateTemplate = (templateKey, value) => {
    emit('update:modelValue', {
        ...props.modelValue,
        [templateKey]: value
    });
};

const getTemplateValue = (templateKey) => {
    return props.modelValue?.[templateKey] || null;
};

const handlePreview = (templateData, templateConfig) => {
    emit('preview-template', {
        type: templateConfig.key,
        value: templateData.value,
        label: templateConfig.label,
        template: templateData
    });
};
</script>

<template>
    <div>
        <div class="flex">
            <div class="flex-1">
                <div class="flex items-center gap-3 mb-8">
                    <InputField
                        variant="switch"
                        v-model="sendNotifications"
                        :false-value="false"
                        :true-value="true"
                        data-testid="notifications-enabled-switch"
                    />
                    <span>
                        {{ t('plans.send_notifications_email') }}
                    </span>
                </div>
            </div>
        </div>

        <div
            v-if="sendNotifications"
            class="flex justify-between gap-5"
        >
            <EmailTemplateSelector
                v-for="template in emailTemplates"
                :key="template.key"
                :label="template.label"
                :model-value="getTemplateValue(template.modelKey)"
                :options="templateOptions"
                :test-id="template.testId"
                option-label="name"
                option-value="id"
                placeholder="Select template"
                preview-label="Preview"
                @update:model-value="updateTemplate(template.modelKey, $event)"
                @preview="handlePreview($event, template)"
            />
        </div>
    </div>
</template>
