<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import ActionButton from './partials/ActionButton.vue';
import WrapBenefits from './partials/WrapBenefits.vue';
import PlanBenefitsForm from './forms/PlanBenefitsForm.vue';
import useEventsBus from '@/composables/event-bus';
import SyncPricesDialog from './dialogs/SyncPricesDialog.vue';
import {
    provideEditState,
    useEditState
} from '@/modules/plans/composables/useEditState';

const props = defineProps({
    id: {
        type: String,
        required: true
    },
    isNew: {
        type: Boolean,
        default: false
    },
    isCopy: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        required: true
    },
    store: {
        type: Object,
        required: true
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

const { bus, emit } = useEventsBus();

provideEditState();

const {
    activeEditComponent,
    setActiveComponent,
    clearActiveComponent,
    handleUnsavedChanges,
    registerCancelCallback,
    unregisterCancelCallback
} = useEditState();

const isEditing = ref(false);
const activeIndexes = ref([]);
const benefitLength = ref(0);
const loading = ref(false);
const openSyncPricesDialog = ref(false);

onMounted(() => {
    registerCancelCallback(props.componentId, handleCancel);
});

onUnmounted(() => {
    unregisterCancelCallback(props.componentId);
});

watch(
    () => bus.value.get('openSyncPricesDialog'),
    async () => {
        let prices = await props.store.searchPlanPrices(props.id, {}, {});
        if (prices.data.length > 0) {
            openSyncPricesDialog.value = true;
        } else {
            await props.store.syncPrices(props.id);
            emit('reloadPrices');
            emit('reloadPlanDetails');
        }
    }
);

const isEditDisabled = computed(() => {
    return Boolean(
        activeEditComponent.value &&
            activeEditComponent.value !== props.componentId
    );
});

const handleEdit = () => {
    isEditing.value = true;
    setActiveComponent(props.componentId);
};

const handleCancel = (skipConfirmation = false) => {
    if (props.isReview || skipConfirmation) {
        isEditing.value = false;
        clearActiveComponent();
    } else {
        handleUnsavedChanges(() => {
            isEditing.value = false;
            clearActiveComponent();
        });
    }
};

const expandAll = () => {
    activeIndexes.value = Array.from(
        { length: benefitLength.value },
        (v, k) => k
    );
};

const collapseAll = () => {
    activeIndexes.value = [];
};

const setBenefitLength = (value) => {
    benefitLength.value = value;
};
</script>

<template>
    <Loader v-if="loading" />
    <div v-else>
        <div class="flex justify-between items-center mb-4">
            <h5>
                {{ title }}
            </h5>
            <!-- Display actions buttons -->
            <ActionButton
                :is-editing="isEditing"
                :is-new="isNew"
                :is-copy="isCopy"
                :store="store"
                :component-id="componentId"
                :is-edit-disabled="isEditDisabled"
                @edit="handleEdit"
                @cancel="handleCancel"
                @expandAll="expandAll"
                @collapseAll="collapseAll"
            />
        </div>

        <!-- Display benefit form -->
        <PlanBenefitsForm v-if="isEditing || isNew" :id="id" :store="store" />

        <!-- Wrap all benefits -->
        <WrapBenefits
            :is-editable="isEditing || isNew"
            :id="id"
            :active-indexes-details="activeIndexes"
            :is-new="isNew"
            :store="store"
            @setBenefitLength="setBenefitLength"
        />

        <SyncPricesDialog
            v-if="openSyncPricesDialog"
            :openDialog="openSyncPricesDialog"
            :id="id"
            :store="store"
            @closeDialog="openSyncPricesDialog = false"
        />
    </div>
</template>
