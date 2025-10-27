<script setup>
import LabelField from '@/modules/claims/components/forms/LabelField.vue';
import {
    createActivitiesDialogContent,
    createActivitiesDialogTitle
} from '@/utils/activities';
import { useI18n } from 'vue-i18n';
import { useActivityStore } from '@/stores/Activity.js';
import { reactive, watch } from 'vue';
import { cloneObj, validateForm } from '@/modules/claims/utils/helper.js';
import { useHelpers } from '@/composables/index.js';

const { t } = useI18n();
const helpers = useHelpers();
const templateDialogVisible = defineModel('visible');
const activitiesDialogTitle = createActivitiesDialogTitle(t, helpers);
const activitiesDialogContent = createActivitiesDialogContent(t);

const { mutateActivityTemplate } = useActivityStore();
const { status, mutate } = mutateActivityTemplate();
let formData = reactive({
    title: '',
    content: '',
    validate: false
});

const getTitle = (opt, defaultValue = '') =>
    activitiesDialogTitle['template']?.('template')[opt] || defaultValue;

const getContent = () =>
    activitiesDialogContent['template']?.('template') || [];

const saveTemplate = () => {
    formData.validate = true;
    let valid = validateForm(getContent(), formData);

    if (valid) {
        formData.content =
            formData.content === '' ? '<p></p>' : formData.content; // Ensures empty string
        mutate(formData);
    }
};

watch(templateDialogVisible, () => {
    if (templateDialogVisible.value) {
        // Reset form data when dialog opens
        formData.title = '';
        formData.content = '';
        formData.validate = false;
    }
});

watch(status, () => {
    if (status.value === 'success') {
        templateDialogVisible.value = false;
        formData.title = '';
        formData.content = '';
        formData.validate = false;
    } else if (status.value === 'error') {
        // Handle error case, e.g., show a notification
        console.error('Error saving template');
    }
});
</script>

<template>
    <Dialog
        v-model:visible="templateDialogVisible"
        model
        :style="{ width: '55rem' }"
        data-testid="template-dialog"
    >
        <template #header>
            <div
                class="inline-flex align-items-center justify-content-center gap-2"
            >
                <div
                    class="icon-wrapper"
                    :style="'background-color:' + getTitle('icon_background')"
                >
                    <i
                        :class="getTitle('icon')"
                        :style="'color:' + getTitle('icon_color')"
                    ></i>
                </div>
                <span class="font-bold white-space-nowrap">
                    {{ getTitle('title') }}
                </span>
            </div>
        </template>

        <LabelField
            v-for="field in getContent()"
            :field="field"
            :key="field.label"
            class="p-0"
            v-model="formData[field.props.name]"
            v-model:validate="formData.validate"
        />

        <template #footer>
            <Button
                :label="$t('buttons.cancel')"
                @click="templateDialogVisible = false"
                class="p-button-text"
                data-testid="cancel-button"
            />
            <Button
                :label="$t('buttons.save')"
                data-testid="btn-save"
                @click="saveTemplate"
            />
        </template>
    </Dialog>
</template>

<style scoped lang="scss"></style>
