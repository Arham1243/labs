<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { usePlanStore } from '@/modules/plans/stores/Plan';
import OptOutNotificationsEmails from '@/modules/plans/components/plans/OptOutNotificationsEmails.vue';
import { useEditState } from '@/modules/plans/composables/useEditState';
import lodash from 'lodash';
import useEventsBus from '@/composables/event-bus.js';

const props = defineProps({
    templateOptions: {
        type: Array,
        default: () => []
    },
    isNew: {
        type: Boolean,
        default: false
    },
    componentId: {
        type: String,
        required: true
    },
    isReview: {
        type: Boolean,
        default: false
    }
});

const route = useRoute();
const planStore = usePlanStore();

const {
    activeEditComponent,
    setActiveComponent,
    clearActiveComponent,
    handleUnsavedChanges,
    registerCancelCallback,
    unregisterCancelCallback
} = useEditState();

const emit = defineEmits(['update:modelValue', 'preview-template']);
const { emit: eventBusEmit } = useEventsBus();

const { t } = useI18n();

const busy = ref(false);
const isEditing = ref(false);
const item = ref(props.modelValue);
const itemToUpdate = ref({});
const alternateInsurance = defineModel();

onMounted(() => {
    registerCancelCallback(props.componentId, handleCancel);
});

onUnmounted(() => {
    unregisterCancelCallback(props.componentId);
});

const isEditDisabled = computed(() => {
    return (
        activeEditComponent.value &&
        activeEditComponent.value !== props.componentId
    );
});

const isNotChanged = computed(() => {
    return lodash.isEqual(item.value, itemToUpdate.value);
});

const handleEdit = () => {
    itemToUpdate.value = lodash.cloneDeep(item.value);
    isEditing.value = true;
    setActiveComponent(props.componentId);
};

const handleCancel = () => {
    if (props.isReview) {
        isEditing.value = false;
        clearActiveComponent();
    } else {
        if (!isNotChanged.value) {
            handleUnsavedChanges(() => {
                isEditing.value = false;
                clearActiveComponent();
            });
        } else {
            isEditing.value = false;
            clearActiveComponent();
        }
    }
};

const save = async () => {
    busy.value = true;
    try {
        await planStore.createOrUpdateAlternateInsurance(
            alternateInsurance.value
        );

        isEditing.value = false;
        clearActiveComponent();
        if (route.name === 'Plan Details') {
            eventBusEmit('reloadPlanDetails');
        } else {
            eventBusEmit('reloadReviewPlanDetails');
        }
    } catch (error) {
        console.error('Error saving:', error);
    } finally {
        busy.value = false;
    }
};

const updateItemToUpdate = (key, value) => {
    itemToUpdate.value = {
        ...itemToUpdate.value,
        [key]: value
    };
};

const notificationsData = computed({
    get: () => {
        const source = isEditing.value ? itemToUpdate.value : props.modelValue;
        return (
            source?.notifications || {
                enabled: false,
                email: '',
                requestTemplate: null,
                approvedTemplate: null,
                declinedTemplate: null
            }
        );
    },
    set: (value) => {
        if (isEditing.value) {
            updateItemToUpdate('notifications', value);
        } else {
            emit('update:modelValue', {
                ...props.modelValue,
                notifications: value
            });
        }
    }
});

const handlePreviewTemplate = (templateData) => {
    emit('preview-template', templateData);
};

const getTemplateName = (templateId) => {
    if (!templateId || !props.templateOptions) return 'Not selected';
    const template = props.templateOptions.find((t) => t.id === templateId);
    return template ? template.name : 'Template not found';
};

const emailTemplateConfigs = [
    {
        key: 'requestTemplate',
        label: t('plans.opt_out_request_email_template'),
        testId: 'opt-out-request'
    },
    {
        key: 'approvedTemplate',
        label: t('plans.opt_out_approved_email_template'),
        testId: 'opt-out-approved'
    },
    {
        key: 'declinedTemplate',
        label: t('plans.opt_out_declined_email_template'),
        testId: 'opt-out-declined'
    }
];
</script>

<template>
    <div class="flex justify-content-between align-items-center">
        <h5 class="mb-2">
            {{ $t('plans.opt_out_notifications_emails') }}
        </h5>
        <div v-if="isEditing">
            <Button
                label="Cancel"
                class="p-button-outlined mr-2"
                @click="handleCancel"
                data-testid="cancel-button"
            />
            <Button
                label="Save"
                :loading="busy"
                :disabled="isNotChanged"
                @click="save"
                data-testid="save-button"
            />
        </div>
        <Button
            v-else
            size="small"
            text
            class="px-2 py-1"
            label="Edit"
            icon="pi pi-pencil"
            :disabled="isEditDisabled"
            @click="handleEdit"
            data-testid="edit-button"
        />
    </div>

    <div v-if="isEditing" class="mt-4">
        <OptOutNotificationsEmails
            v-model="alternateInsurance.send_notifications"
            :template-options="templateOptions"
            :is-new="isNew"
            @preview-template="handlePreviewTemplate"
        />
    </div>

    <div v-else class="mt-4 col-12">
        <div
            v-if="alternateInsurance.send_notifications"
            class="flex col-12 p-0 mb-3"
        >
            <div class="col-2 p-0">
                <span>{{
                    t(
                        'plans.send_additional_notifications_opt_out_requests_and_updates'
                    )
                }}</span>
            </div>
            <div class="col-10 p-0 pl-3">
                <div class="flex align-items-center gap-2">
                    <i
                        :class="
                            alternateInsurance.send_notifications
                                ? 'pi pi-check text-green-500'
                                : 'pi pi-times text-red-500'
                        "
                    ></i>
                    <span class="font-medium">{{
                        alternateInsurance.send_notifications ? 'Yes' : 'No'
                    }}</span>
                </div>
            </div>
        </div>
        <div
            v-if="alternateInsurance.send_notifications"
            class="flex col-12 p-0 mb-3"
        >
            <div class="col-2 p-0">
                <span>{{ t('plans.send_additional_notifications_to') }}</span>
            </div>
            <div class="col-10 p-0 pl-3">
                <span>{{ notificationsData.email || 'N/A' }}</span>
            </div>
        </div>

        <div v-if="alternateInsurance.send_notifications">
            <div
                v-for="templateConfig in emailTemplateConfigs"
                :key="templateConfig.key"
                class="flex col-12 p-0 mb-3"
            >
                <div class="col-2 p-0">
                    <span>{{ templateConfig.label }}</span>
                </div>
                <div class="col-10 p-0 pl-3">
                    <Button
                        :label="
                            getTemplateName(
                                notificationsData[templateConfig.key]
                            )
                        "
                        link
                        class="p-0 text-primary font-medium"
                        @click="
                            handlePreviewTemplate({
                                type: templateConfig.key,
                                value: notificationsData[templateConfig.key],
                                label: templateConfig.label
                            })
                        "
                        :disabled="!notificationsData[templateConfig.key]"
                        :data-testid="`preview-${templateConfig.testId}`"
                    />
                </div>
            </div>
        </div>
        <div
            v-if="!alternateInsurance.send_notifications"
            class="text-center py-6 mt-4"
        >
            <i class="pi pi-bell-slash text-4xl text-300 mb-3"></i>
            <p class="text-600 m-0">Email notifications are disabled</p>
        </div>
    </div>
</template>
