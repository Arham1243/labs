<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import BenefitServicesForm from '@/modules/plans/components/benefits/forms/BenefitServicesForm.vue';
import CodeGroupsSection from '@/modules/plans/components/benefits/partials/CodeGroupsSection.vue';
import { useEditState } from '@/modules/plans/composables/useEditState';

const props = defineProps({
    id: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: false
    },
    isNew: {
        type: Boolean,
        default: false
    },
    isHide: {
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

const {
    activeEditComponent,
    setActiveComponent,
    clearActiveComponent,
    registerCancelCallback,
    unregisterCancelCallback
} = useEditState();

const isEditing = ref(false);
const activeIndexes = ref([]);
const codeSetGroupsLength = ref(0);
const codeGroupsSectionRef = ref(null);
const canShowRemoveAllButton = ref(false);

const isEditDisabled = computed(() => {
    return (
        activeEditComponent.value &&
        activeEditComponent.value !== props.componentId
    );
});

onMounted(() => {
    registerCancelCallback(props.componentId, handleCancel);
});

onUnmounted(() => {
    unregisterCancelCallback(props.componentId);
});

const handleEdit = () => {
    isEditing.value = true;
    setActiveComponent(props.componentId);
};

const handleCancel = () => {
    if (props.isReview) {
        isEditing.value = false;
        clearActiveComponent();
    } else {
        isEditing.value = false;
        clearActiveComponent();
    }
};

const expandAll = () => {
    activeIndexes.value = Array.from(
        { length: codeSetGroupsLength.value },
        (v, k) => k
    );
};

const collapseAll = () => {
    activeIndexes.value = [];
};

const setGroupsLength = (value) => {
    codeSetGroupsLength.value = value;
};

const removeAllCodes = () => {
    if (codeGroupsSectionRef.value) {
        codeGroupsSectionRef.value.showRemoveAllDialog();
    }
};

const handleToggleRemoveAll = (value) => {
    canShowRemoveAllButton.value = value;
};
</script>
<template>
    <div>
        <div class="flex justify-between items-center mb-4 edit-cancel-button">
            <h5>
                {{ title || $t('benefits.select_services_to_include') }}
            </h5>
            <div v-if="!isNew">
                <Button
                    :label="$t('common.expand_all')"
                    icon="pi pi-plus"
                    class="p-button-text"
                    @click="expandAll"
                />
                <Button
                    :label="$t('common.collapse_all')"
                    icon="pi pi-minus"
                    class="p-button-text"
                    @click="collapseAll"
                />
                <Button
                    v-if="
                        isEditing &&
                        canShowRemoveAllButton &&
                        $ability.can('update benefits')
                    "
                    :label="$t('common.remove_all')"
                    icon="pi pi-times"
                    @click="removeAllCodes"
                    severity="danger"
                    text
                />
                <Button
                    v-if="isEditing"
                    label="Done"
                    icon="pi pi-check"
                    class="p-button"
                    @click="handleCancel"
                />
                <span v-else>
                    <Button
                        v-if="!isHide && $ability.can('update benefits')"
                        text
                        label="Edit"
                        icon="pi pi-pencil"
                        :disabled="isEditDisabled"
                        @click="handleEdit"
                    />
                </span>
            </div>
        </div>

        <BenefitServicesForm
            v-if="(isEditing || isNew) && $ability.can('update benefits')"
            :id="props.id"
        />

        <CodeGroupsSection
            ref="codeGroupsSectionRef"
            :is-editable="
                (isEditing || isNew) && $ability.can('update benefits')
            "
            :id="props.id"
            :active-indexes-details="activeIndexes"
            :is-new="isNew"
            @setGroupsLength="setGroupsLength"
            @toggleRemoveAll="handleToggleRemoveAll"
        />
    </div>
</template>
