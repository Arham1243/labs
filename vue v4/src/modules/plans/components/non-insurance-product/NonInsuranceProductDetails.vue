<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import lodash from 'lodash';
import { useNonInsuranceProductStore } from '@/modules/plans/stores/NonInsuranceProduct';
import { useHelpers } from '@/composables';
import NonInsuranceProductDetailsForm from '@/modules/plans/components/non-insurance-product/forms/NonInsuranceProductDetailsForm.vue';
import { useGlobalStore } from '@/stores';
import { useEditState } from '@/modules/plans/composables/useEditState';

const props = defineProps({
    data: {
        type: Object,
        required: true
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

const helpers = useHelpers();
const nonInsuranceProductStore = useNonInsuranceProductStore();

const {
    activeEditComponent,
    setActiveComponent,
    clearActiveComponent,
    handleUnsavedChanges,
    registerCancelCallback,
    unregisterCancelCallback
} = useEditState();

const busy = ref(false);
const loading = ref(false);
const isEditing = ref(false);
const item = ref({});
const itemToUpdate = ref({});
const discardDialog = ref(false);

onMounted(() => {
    setItem();
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

const setItem = () => {
    if (props.data) {
        item.value = lodash.cloneDeep(props.data);
        item.value.type = item.value.type ? item.value.type : null;
        item.value.authorized = item.value.authorized;
        item.value.authorized_by_id = item.value.authorized?.id;
    }
};

const emit = defineEmits(['update:data', 'reloadItem']);

const processData = (data) => {
    const processedData = {
        ...data,
        type: data.type ? data.type : null,
        authorized: data.authorized,
        authorized_by_id: data.authorized?.id
    };

    nonInsuranceProductStore.setCurrentNonInsuranceProduct(processedData);
    item.value = lodash.cloneDeep(processedData);
    itemToUpdate.value = lodash.cloneDeep(processedData);
    emit('reloadItem');
};

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
    try {
        busy.value = true;
        const payload = {
            ...itemToUpdate.value,
            type:
                typeof itemToUpdate.value.type === 'object'
                    ? itemToUpdate.value.type.type
                    : itemToUpdate.value.type,
            authorized_by_id:
                itemToUpdate.value.authorized?.id ||
                itemToUpdate.value.authorized_by_id
        };

        const res = await nonInsuranceProductStore.updateNonInsuranceProduct(
            itemToUpdate.value.id,
            payload
        );

        const updatedData =
            await nonInsuranceProductStore.getNonInsuranceProduct(
                itemToUpdate.value.id,
                { include: 'authorized' }
            );

        processData(updatedData.data);
        isEditing.value = false;
        clearActiveComponent();
    } finally {
        busy.value = false;
    }
};

const discardChanges = () => {
    if (isNotChanged.value) {
        isEditing.value = false;
    } else {
        discardDialog.value = true;
    }
};

const exitEditing = () => {
    isEditing.value = false;
    itemToUpdate.value = lodash.cloneDeep(item.value);
    useGlobalStore().clearErrors();
};
</script>

<template>
    <Loader v-if="loading" />
    <div v-else>
        <div class="flex justify-between items-center">
            <h5 class="mb-2">Non-Insurance Product Details</h5>
            <div class="edit-cancel-button">
                <div v-if="isEditing">
                    <Button
                        label="Cancel"
                        class="p-button-outlined mr-2"
                        @click="handleCancel"
                        :disabled="busy"
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
                <div v-else>
                    <Button
                        v-if="!isHide"
                        size="small"
                        text
                        class="px-2 py-1 p-button-outlined"
                        label="Edit"
                        icon="pi pi-pencil"
                        :disabled="isEditDisabled"
                        @click="handleEdit"
                        data-testid="edit-button"
                    />
                </div>
            </div>
        </div>

        <NonInsuranceProductDetailsForm
            v-if="isEditing"
            :isNew="isNew"
            v-model="itemToUpdate"
        />

        <div v-else class="grid grid-cols-12 mt-1">
            <div class="col-span-3 text-sm font-semibold py-1">
                Non-Insurance Product Name
            </div>
            <div class="col-span-9 text-sm py-1 p-break-word">
                {{ helpers.getLocaleValue(item.name) }}
            </div>
            <div class="col-span-3 text-sm font-semibold py-1">Description</div>
            <div class="col-span-9 text-sm py-1">
                {{ helpers.getLocaleValue(item.description) }}
            </div>
            <div class="col-span-3 text-sm font-semibold py-1">
                Non-Insurance Product Type
            </div>
            <div class="col-span-9 text-sm py-1">
                {{ typeof item.type === 'object' ? item.type.type : item.type }}
            </div>
            <div class="sm:col-span-6 md:col-span-3 text-sm font-semibold py-1">
                Can be used as a bundle
            </div>
            <div class="sm:col-span-6 md:col-span-9 text-sm py-1">
                <template v-if="item.plan_enabled">
                    <i class="pi pi-check"></i> Yes
                </template>
                <template v-else> <i class="pi pi-times"></i> No </template>
            </div>
            <div class="col-span-3 text-sm font-semibold py-1">Authorized by</div>
            <div class="col-span-9 text-sm py-1">
                {{ item.authorized?.name }}
            </div>
            <div class="col-span-3 text-sm font-semibold py-1">
                {{ $t('non_insurance_products.integration_id') }}
            </div>
            <div class="col-span-9 text-sm py-1 p-break-word">
                {{ item.integration_id }}
            </div>
        </div>
    </div>
    <Confirmation
        v-model="discardDialog"
        show-alert-icon
        :header="$t('common.discard_header')"
        :content="$t('common.discard_content')"
        confirm-button-class="p-button-danger"
        :confirmButtonText="$t('common.discard_cancel')"
        :cancelButtonText="$t('common.discard_continue')"
        @confirm="exitEditing"
    />
</template>
