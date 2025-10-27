<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useBenefitStore } from '@/modules/plans/stores/Benefit';
import { useHelpers } from '@/composables';
import { useI18n } from 'vue-i18n';
import { useGlobalStore } from '@/stores';
import lodash from 'lodash';

const benefitStore = useBenefitStore();
const helpers = useHelpers();
const { t } = useI18n();
const globalStore = useGlobalStore();

const props = defineProps({
    benefitGroupId: String
});

const shouldDialogBeVisible = defineModel('shouldDialogBeVisible');
const formData = defineModel('formData');
const initialFormData = ref(lodash.cloneDeep(formData.value));

const busy = ref(false);
const isEditing = ref(false);
const isAdding = ref(false);
const isDeleting = ref(false);

const header = computed(() => {
    if (isEditing.value) {
        return `Edit ${helpers.getLocaleValue(formData.value.name)} Note`;
    }

    if (isAdding.value) {
        return `Add ${helpers.getLocaleValue(formData.value.name)} Note`;
    }

    if (isDeleting.value) {
        return `Delete ${helpers.getLocaleValue(formData.value.name)} Note`;
    }

    return `${helpers.getLocaleValue(formData.value.name)} Note`;
});

const cancelAction = () => {
    if (isAdding.value) {
        shouldDialogBeVisible.value = false;
    }

    isEditing.value = false;
    isAdding.value = false;
    isDeleting.value = false;

    resetFormDataPivotNote();
    globalStore.clearErrors();
};

const afterUpdate = () => {
    if (isDeleting.value) {
        shouldDialogBeVisible.value = false;
    }

    isEditing.value = false;
    isAdding.value = false;
    isDeleting.value = false;

    initialFormData.value = lodash.cloneDeep(formData.value);
};

const resetFormDataPivotNote = () => {
    formData.value.pivot.note = lodash.cloneDeep(
        initialFormData.value
    ).pivot.note;
};

const updateBenefitNote = async (action = 'update') => {
    if (action === 'create' || action === 'update') {
        if (!formData.value.pivot.note) return;
    }

    try {
        busy.value = true;
        await benefitStore.updateBenefitGroupBenefitPivot(
            props.benefitGroupId,
            formData.value.id,
            {
                pivot: {
                    ...formData.value.pivot,
                    note: formData.value.pivot.note
                }
            },
            false
        );

        afterUpdate();

        switch (action) {
            case 'update':
                globalStore.showSuccess(
                    t('notifications.benefit_note_updated'),
                    t('notifications.benefit_note_updated_detail', {
                        item: helpers.getLocaleValue(formData.value.name)
                    })
                );
                break;
            case 'create':
                globalStore.showSuccess(
                    t('notifications.benefit_note_created'),
                    t('notifications.benefit_note_created_detail', {
                        item: helpers.getLocaleValue(formData.value.name)
                    })
                );
                break;
            case 'delete':
                globalStore.showSuccess(
                    t('notifications.benefit_note_deleted'),
                    t('notifications.benefit_note_deleted_detail', {
                        item: helpers.getLocaleValue(formData.value.name)
                    })
                );
                break;
        }
    } catch (err) {
        resetFormDataPivotNote();
    } finally {
        busy.value = false;
    }
};

const createBenefitNote = async () => {
    await updateBenefitNote('create');
};

const deleteBenefitNote = async () => {
    formData.value.pivot.note = null;
    await updateBenefitNote('delete');
};

onMounted(() => {
    if (!formData.value.pivot.note) {
        isAdding.value = true;
    }
});

onBeforeUnmount(() => {
    globalStore.clearErrors();
    resetFormDataPivotNote();
});
</script>

<template>
    <Dialog
        v-model:visible="shouldDialogBeVisible"
        modal
        :header="header"
        :style="{ width: '480px' }"
        data-testid="benefit-notes-dialog"
    >
        <div v-if="isAdding || isEditing">
            <InputField
                id="pivot.note"
                variant="textarea"
                v-model="formData.pivot.note"
                class="w-full"
                data-testid="note-input"
            />
        </div>
        <div v-else-if="isDeleting">
            {{
                $t('benefits.delete_benefit_note', {
                    item: helpers.getLocaleValue(formData.name)
                })
            }}
        </div>
        <div v-else class="p-break-word">
            {{ formData.pivot.note }}
        </div>
        <template #footer>
            <input type="hidden" autofocus />
            <template v-if="isEditing || isAdding || isDeleting">
                <div class="edit-cancel-button">
                    <Button
                        :disabled="busy"
                        text
                        :label="$t('buttons.cancel')"
                        @click="cancelAction"
                        data-testid="cancel-button"
                        class="p-button-outlined mr-2"
                    />
                    <Button
                        v-if="isEditing || isAdding"
                        :loading="busy"
                        :disabled="busy"
                        :label="
                        isEditing ? $t('buttons.update') : $t('buttons.save')
                    "
                        @click="
                        isEditing ? updateBenefitNote() : createBenefitNote()
                    "
                        data-testid="save-button"
                    />
                    <Button
                        v-else-if="isDeleting"
                        :loading="busy"
                        :disabled="busy"
                        :label="$t('buttons.delete')"
                        @click="deleteBenefitNote"
                        severity="danger"
                        data-testid="delete-button"
                    />
                </div>
            </template>
            <template v-else>
                <div class="flex justify-between items-center">
                    <Button
                        :label="$t('benefits.delete_note')"
                        @click="isDeleting = true"
                        icon="pi pi-trash"
                        text
                        severity="danger"
                        data-testid="delete-note-button"
                    />
                    <Button
                        :label="$t('benefits.edit_note')"
                        @click="isEditing = true"
                        icon="pi pi-pencil"
                        class="p-button-outlined"
                        data-testid="edit-note-button"
                    />
                </div>
            </template>
        </template>
    </Dialog>
</template>
