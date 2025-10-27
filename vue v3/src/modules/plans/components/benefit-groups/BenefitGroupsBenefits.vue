<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import BenefitGroupsBenefitsTable from '@/modules/plans/components/benefit-groups/tables/BenefitGroupsBenefitsTable.vue';
import BenefitGroupsBenefitsForm from '@/modules/plans/components/benefit-groups/forms/BenefitGroupsBenefitsForm.vue';
import SyncPricesDialog from '@/modules/plans/components/shared/AttachBenefit/dialogs/SyncPricesDialog.vue';
import { useBenefitStore } from '@/modules/plans/stores/Benefit';
import useEventsBus from '@/composables/event-bus';
import Label from '@/components/common/Label.vue';
import { useEditState } from '@/modules/plans/composables/useEditState';

const props = defineProps({
    id: {
        type: String,
        required: true
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

const {
    activeEditComponent,
    setActiveComponent,
    clearActiveComponent,
    registerCancelCallback,
    unregisterCancelCallback
} = useEditState();

const isEditing = ref(false);
const totalBenefitIncluded = ref(0);
const benefitStore = useBenefitStore();
const openSyncPricesDialog = ref(false);
const { bus, emit } = useEventsBus();

onMounted(() => {
    registerCancelCallback(props.componentId, handleCancel);
});

onUnmounted(() => {
    unregisterCancelCallback(props.componentId);
});

watch(
    () => bus.value.get('openSyncPricesDialog'),
    async () => {
        let prices = await benefitStore.searchBenefitGroupPrices(
            props.id,
            {},
            {}
        );
        if (prices.data.length > 0) {
            openSyncPricesDialog.value = true;
        } else {
            await benefitStore.syncPrices(props.id);
            emit('reloadPrices');
            emit('reloadBenefitGroupDetails');
        }
    }
);

const isEditDisabled = computed(() => {
    return (
        activeEditComponent.value &&
        activeEditComponent.value !== props.componentId
    );
});

const setTotalBenefitIncluded = (val) => {
    totalBenefitIncluded.value = val;
};

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
</script>

<template>
    <div>
        <div class="flex justify-content-between align-items-center mb-3">
            <h5>
                <Label test-id="page-title">{{ $t('common.benefits') }}</Label>
            </h5>
            <div v-if="!isNew">
                <Button
                    data-testid="button-cancel"
                    v-if="isEditing"
                    label="Done"
                    icon="pi pi-check"
                    class="p-button mr-2"
                    @click="handleCancel"
                />
                <Button
                    v-if="!isEditing && $ability.can('update benefit groups')"
                    data-testid="button-edit"
                    size="small"
                    text
                    class="px-2 py-1"
                    label="Edit"
                    icon="pi pi-pencil"
                    :disabled="isEditDisabled"
                    @click="handleEdit"
                />
            </div>
        </div>

        <BenefitGroupsBenefitsForm
            v-if="isEditing || isNew"
            :id="props.id"
            @setTotalBenefitIncluded="setTotalBenefitIncluded"
        />

        <h5 v-if="isNew && totalBenefitIncluded > 0" class="mb-3">
            {{ totalBenefitIncluded }}
            {{
                totalBenefitIncluded === 1
                    ? $t('benefit_groups.benefit_included')
                    : $t('benefit_groups.benefits_included')
            }}
        </h5>

        <BenefitGroupsBenefitsTable
            @setTotalBenefitIncluded="setTotalBenefitIncluded"
            :is-editable="isEditing || isNew"
            :id="props.id"
        />

        <SyncPricesDialog
            v-if="openSyncPricesDialog"
            :openDialog="openSyncPricesDialog"
            :id="id"
            :store="benefitStore"
            @closeDialog="openSyncPricesDialog = false"
        />
    </div>
</template>

<style lang="scss" scoped></style>
