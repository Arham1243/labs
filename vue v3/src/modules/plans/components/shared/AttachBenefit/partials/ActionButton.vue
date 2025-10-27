<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import useEventsBus from '@/composables/event-bus';

const props = defineProps({
    isNew: {
        default: false,
        type: Boolean
    },
    isCopy: {
        default: false,
        type: Boolean
    },
    isEditing: {
        default: false,
        type: Boolean
    },
    store: {
        type: Object,
        required: true
    },
    isEditDisabled: {
        default: false,
        type: Boolean
    },
    componentId: {
        type: String,
        required: true
    }
});

const { emit } = useEventsBus();
const route = useRoute();

const emits = defineEmits([
    'expandAll',
    'collapseAll',
    'setIsEditing',
    'edit',
    'cancel',
    'toggleRemoveAll'
]);

const openWarning = ref(false);
const loading = ref(false);

const isRemoveAllDialog = ref(false);
const canShowRemoveAllButton = ref(false);

const openSelectFromExisting = function () {
    openWarning.value = true;
};

const copyBenefits = async () => {
    loading.value = true;
    await props.store.copyBenefitsFromParent(
        route.params.plan,
        route.params.id
    );
    loading.value = false;
    openWarning.value = false;

    emit('reloadPlanBenefitGroups');
    emit('setHasIndividualBenefits');
    emit('reloadPlanBenefits');
    emit('reloadPlanDetails');
    emit('openSyncPricesDialog');
};

const removeAllBenefits = async () => {
    loading.value = true;
    await props.store.purgeBenefits(
        route.params.id,
        props.store.currentPlan.total_attached_benefits
    );
    loading.value = false;
    isRemoveAllDialog.value = false;

    emit('reloadPlanBenefitGroups');
    emit('reloadPlanBenefits');
    emit('reloadPlanDetails');
    emit('reloadAssociatedPlanDetails');
    emit('openSyncPricesDialog');
};

watch(
    () => props.store.currentPlan?.total_attached_benefits,
    (newVal) => {
        canShowRemoveAllButton.value = newVal > 0;
    },
    { immediate: true }
);
</script>
<template>
    <div>
        <Button
            v-if="isCopy && (isEditing || isNew)"
            :label="$t('common.select_from_default_plan')"
            class="p-button-outlined mr-2 w-fit"
            @click="openSelectFromExisting"
            icon="pi pi-folder"
            data-testid="select-from-existing"
        />
        <Button
            v-if="!isNew && store.currentPlan?.total_attached_benefits > 0"
            :label="$t('common.expand_all')"
            icon="pi pi-plus"
            class="p-button-text mx-3"
            @click="emits('expandAll')"
            data-testid="expand-all"
        />
        <Button
            v-if="!isNew && store.currentPlan?.total_attached_benefits > 0"
            :label="$t('common.collapse_all')"
            icon="pi pi-minus"
            class="p-button-text mx-3"
            @click="emits('collapseAll')"
            data-testid="collapse-all"
        />
        <Button
            v-if="!isNew && isEditing && canShowRemoveAllButton"
            label="Remove All"
            icon="pi pi-times"
            class="p-button-text p-button-danger ml-3"
            @click="isRemoveAllDialog = true"
            data-testid="remove-all"
        />
        <Button
            v-if="!isNew && isEditing"
            label="Done"
            icon="pi pi-check"
            class="p-button mr-2"
            @click="emits('cancel', true)"
            data-testid="cancel-edit"
        />
        <Button
            v-else-if="!isNew && !isEditing"
            size="small"
            text
            :label="$t('buttons.edit')"
            icon="pi pi-pencil"
            :disabled="isEditDisabled"
            @click="emits('edit')"
            data-testid="edit"
        />
    </div>

    <Dialog
        v-model:visible="openWarning"
        modal
        :header="$t('plans.copy_benefits_from_parent_warning_header')"
        :style="{ width: '480px' }"
    >
        <div>{{ $t('plans.copy_benefits_from_parent_warning_body') }}</div>
        <div class="flex justify-content-end gap-2 mt-5">
            <Button
                type="button"
                :label="$t('buttons.cancel')"
                class="p-button-outlined"
                text
                @click="openWarning = false"
                data-testid="cancel-button"
            ></Button>
            <Button
                type="button"
                :label="$t('buttons.confirm')"
                @click="copyBenefits"
                data-testid="confirm-button"
            ></Button>
        </div>
    </Dialog>
    <Confirmation
        v-model="isRemoveAllDialog"
        :header="$t('plans.remove_benefit_header')"
        :content="$t('plans.remove_benefit_content')"
        :confirm-button-text="$t('buttons.continue')"
        confirm-button-class="p-button-danger"
        @confirm="removeAllBenefits"
    />
</template>
<style lang="scss" scoped>
.p-dialog-header {
    align-items: start !important;
}
</style>
