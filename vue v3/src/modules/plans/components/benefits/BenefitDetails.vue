<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import lodash from 'lodash';
import { useBenefitStore } from '@/modules/plans/stores/Benefit';
import { useDateFormatter } from '@/composables/useDateFormatter.js';
import { useHelpers } from '@/composables';
import BenefitDetailsForm from '@/modules/plans/components/benefits/forms/BenefitDetailsForm.vue';
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

const { formatValue, formatEndDateDisplay, initialize } = useDateFormatter();
const helpers = useHelpers();
const benefitStore = useBenefitStore();

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

onMounted(() => {
    setItem();
    registerCancelCallback(props.componentId, handleCancel);
    initialize();
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
    if (props.data) item.value = lodash.cloneDeep(props.data);
};

const emit = defineEmits(['update:data', 'reloadItem']);

const processData = (data) => {
    benefitStore.setCurrentBenefit(data);
    item.value = lodash.cloneDeep(data);
    itemToUpdate.value = lodash.cloneDeep(item.value);
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
        itemToUpdate.value.benefit_category_id =
            itemToUpdate.value.benefit_category?.id;
        itemToUpdate.value.underwriter_id = itemToUpdate.value.underwriter?.id;
        await benefitStore.updateBenefit(itemToUpdate.value.id, {
            ...itemToUpdate.value,
            end_date:
                itemToUpdate.value.end_date != 'Invalid date'
                    ? itemToUpdate.value.end_date
                    : null
        });
        const params = { include: 'category,underwriter,vendors' };
        const res = await benefitStore.getBenefit(
            itemToUpdate.value.id,
            params
        );
        processData(res.data);
        isEditing.value = false;
        clearActiveComponent();
    } finally {
        busy.value = false;
    }
};
</script>

<template>
    <Loader v-if="loading" />
    <div v-else>
        <div class="flex justify-content-between align-items-center">
            <h5 class="mb-2">Benefit Details</h5>
            <div v-if="isEditing">
                <Button
                    label="Cancel"
                    class="p-button-outlined mr-2"
                    @click="handleCancel"
                />
                <Button
                    label="Save"
                    :loading="busy"
                    :disabled="isNotChanged"
                    @click="save"
                />
            </div>
            <div v-else>
                <Button
                    v-if="!isHide && $ability.can('update benefits')"
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

        <BenefitDetailsForm
            v-if="isEditing"
            :isNew="isNew"
            v-model="itemToUpdate"
        />

        <div v-else class="grid mt-1">
            <div class="col-3 text-sm font-semibold py-1">Benefit Name</div>
            <div class="col-9 text-sm py-1 p-break-word">
                {{ helpers.getLocaleValue(item.name) }}
            </div>
            <div class="col-3 text-sm font-semibold py-1">Benefit Code</div>
            <div class="col-9 text-sm py-1">
                {{ item.code }}
            </div>
            <div class="col-3 text-sm font-semibold py-1">Benefit Category</div>
            <div class="col-9 text-sm py-1">
                {{ helpers.getLocaleValue(item.benefit_category?.name) }}
            </div>
            <div class="col-3 text-sm font-semibold py-1">Underwriter</div>
            <div class="col-9 text-sm py-1">{{ item.underwriter?.name }}</div>
            <div class="col-3 text-sm font-semibold py-1">Coverage</div>
            <div class="col-9 text-sm py-1">
                {{ item.coverage }}% to a maximum of
                {{ helpers.moneyFormat(item.max_amount) }}
            </div>

            <div class="col-3 text-sm font-semibold py-1">Effective Date</div>
            <div class="col-9 text-sm py-1">
                {{
                    formatValue(item.effective_date, {
                        type: 'date',
                        format: 'long'
                    })
                }}
            </div>
            <div class="col-3 text-sm font-semibold py-1">End Date</div>
            <div class="col-9 text-sm py-1">
                {{ formatEndDateDisplay(item.end_date) }}
            </div>
        </div>
    </div>
</template>
