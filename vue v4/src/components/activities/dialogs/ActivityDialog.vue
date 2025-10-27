<script setup>
import {
    createActivitiesDialogTitle,
    createActivitiesDialogContent
} from '@/utils/activities';
import { useI18n } from 'vue-i18n';
import { useActivityStore } from '@/stores/Activity';
import LabelField from '@/modules/claims/components/forms/LabelField.vue';
import { inject, nextTick, reactive, ref, watch, onMounted } from 'vue';
import TemplateDialog from '@/components/activities/dialogs/TemplateDialog.vue';
import { useHelpers } from '@/composables';
import { cloneObj, validateForm } from '@/modules/claims/utils/helper';
import { useUserStore } from '@/stores/User';
import { useGlobalStore } from '@/stores/index.js';

const props = defineProps({
    type: { type: String, required: true },
    clientId: { type: [String, Number] },
    feed: { type: Object }
});

const { t } = useI18n();
const helpers = useHelpers();
const globalStore = useGlobalStore();
const currentUser = inject('currentUser');
const visible = defineModel('visible');
const emit = defineEmits(['update:feed']);
const forceEditorKey = ref(0);

//to search users
const userStore = useUserStore();
const users = ref([]);
const loadingUsers = ref(false);

const activitiesDialogTitle = createActivitiesDialogTitle(t, helpers);
const activitiesDialogContent = createActivitiesDialogContent(t, {
    users,
    loadingUsers
});
const templateDialogVisible = ref(false);
let formData = reactive({
    template: '',
    title: '',
    content: '',
    attachment: null,
    communication_source: '',
    validate: false
});

const {
    getAllActivityTemplates,
    mutateActivity,
    currentModule,
    currentModuleId,
    currentActivityTemplates
} = useActivityStore();
const { data: mutatedData, mutate } = mutateActivity();
getAllActivityTemplates();

const getTitle = (opt, defaultValue = '') => {
    const dialogData = activitiesDialogTitle[props.type]?.(
        currentModule?.value
    );

    if (!dialogData) return defaultValue;

    // Customize title if editing
    if (opt === 'title' && props.feed) {
        // Override the title only, leave icon-related values unchanged
        return t(`activities.edit_${props.type}`, {
            module: helpers.capitalizeWords(currentModule?.value)
        });
    }

    return dialogData[opt] || defaultValue;
};

const getContent = () => {
    const dialogData =
        activitiesDialogContent[props.type]?.(currentModule?.value) || [];

    return dialogData
        .filter((field) => {
            // Remove field if it's 'title' and module is 'expense'
            return !(
                currentModule?.value === 'expense' &&
                field.props?.name === 'title'
            );
        })
        .map((field) => {
            if (field.props.name === 'template') {
                field.props.options = Object.entries(
                    currentActivityTemplates.value
                ).map(([key, value]) => ({
                    name: value.title,
                    value: key
                }));
            }

            if (field.props.name === 'assigned_to_user_id') {
                field.props.fetchItems = async (searchTerm) => {
                    if (!users || !loadingUsers) return;

                    try {
                        loadingUsers.value = true;
                        const payload = {
                            search: searchTerm
                                ? { value: searchTerm }
                                : undefined
                        };
                        const response = await userStore.searchUsers(payload, {
                            limit: 5
                        });
                        users.value = response.data || [];
                    } catch (error) {
                        console.error('User search failed:', error);
                        users.value = [];
                    } finally {
                        loadingUsers.value = false;
                    }
                };
            }

            return field;
        });
};

const onTemplateSelected = async (templateIndex) => {
    const selectedTemplate = currentActivityTemplates.value[templateIndex];

    if (selectedTemplate) {
        formData.title = selectedTemplate.title || '';
        formData.content = selectedTemplate.content || '';
    } else {
        formData.title = '';
        formData.content = '';
    }

    forceEditorKey.value++; // trigger editor re-render
};

const resetForm = () => {
    formData.template = '';
    formData.title = '';
    formData.content = '';
    formData.communication_source = '';
    formData.attachment = null;
    formData.assigned_to_user_id = null;
    formData.due_date = null;
    formData.priority = null;
    formData.validate = false;
};

const save = () => {
    formData.validate = true;
    let valid = validateForm(getContent(), formData);

    if (currentModule?.value === 'expense') {
        // Ensure content is not empty
        const content = formData.content?.trim();

        const isEmptyParagraph =
            /^<p>\s*<\/p>$/.test(content) || content === '';

        if (isEmptyParagraph) {
            globalStore.showError(
                t('notifications.required_note_content'),
                t('notifications.note_content_required')
            );
            valid = false;
        }
    }

    if (valid) {
        const data = {
            clientId: props.clientId,
            feedable: props.type,
            payload: {
                ...formData,
                title: formData.title || 'note title for expense', // Ensures empty string
                content: formData.content === '' ? '<p></p>' : formData.content, // Ensures empty string
                module: currentModule.value,
                moduleId: currentModuleId.value,
                user_id: currentUser.value?.id
            }
        };

        if (props.feed) {
            data.activityId = props.feed.feedable_id;
        }

        mutate(data);
        emit('update:feed', mutatedData);
        visible.value = false;
    }
};

watch(visible, async (newVal) => {
    if (newVal) {
        resetForm();
    }

    if (newVal && props.feed) {
        const newFeed = cloneObj(props.feed);
        formData.id = newFeed.id;
        formData.title = newFeed.title || '';
        formData.content = newFeed.body || '';
        formData.communication_source =
            helpers.extractTypeFromCommunicationClass(newFeed.feedable_type);
    }
});

watch(visible, () => {
    if (visible.value) {
        nextTick(() => {
            document.body.style.overflow = 'hidden';
        });
    } else {
        document.body.style.overflow = '';
    }
});

watch(
    templateDialogVisible,
    (val) => {
        if (!val) getAllActivityTemplates(true);
    },
    { immediate: true }
);

// watch(
//     () => mutatedData?.value,
//     (newMutatedData) => {
//         emit('update:feed', newMutatedData);
//     },
//     { immediate: true }
// );

// Load initial users data
onMounted(async () => {
    try {
        loadingUsers.value = true;
        const payload = {
            search: { value: '' }
        };
        const response = await userStore.searchUsers(payload, { limit: 5 });
        users.value = response.data || [];
    } catch (error) {
        console.error('Failed to load users:', error);
        users.value = [];
    } finally {
        loadingUsers.value = false;
    }
});
</script>

<template>
    <Dialog
        v-model:visible="visible"
        model
        :style="{ width: '45rem' }"
        data-testid="new-activity-dialog"
    >
        <template #header>
            <div
                class="inline-flex items-center justify-center gap-2"
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
                <span class="font-bold whitespace-nowrap">{{
                    getTitle('title')
                }}</span>
            </div>
        </template>

        <div class="formgrid grid">
            <LabelField
                v-for="field in getContent()"
                :key="field.label"
                :field="field"
                :force-key="forceEditorKey"
                @additionalAction="templateDialogVisible = true"
                v-model="formData[field.props.name]"
                v-model:validate="formData.validate"
                @onChanged="
                    field.props.name === 'template'
                        ? onTemplateSelected(formData[field.props.name])
                        : null
                "
                :disabled="
                    props.feed && field.props.name === 'communication_source'
                "
            />
        </div>

        <TemplateDialog v-model:visible="templateDialogVisible" />

        <template #footer>
            <div class="formgrid grid">
                <div class="col-12 flex justify-content-end gap-2">
                    <Button
                        :label="$t('buttons.cancel')"
                        @click="visible = false"
                        class="p-button-text"
                        data-testid="cancel-button"
                    />
                    <Button
                        icon="pi pi-check"
                        :label="$t('buttons.save')"
                        data-testid="btn-save"
                        class="m-0"
                        @click="save()"
                    />
                </div>
            </div>
        </template>
    </Dialog>
</template>

<style scoped lang="scss"></style>
