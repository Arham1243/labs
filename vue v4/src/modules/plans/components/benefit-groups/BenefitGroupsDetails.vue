<script setup>
import lodash from 'lodash';
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useHelpers } from '@/composables';
import { useDateFormatter } from '@/composables/useDateFormatter.js';
import { useBenefitStore } from '@/modules/plans/stores/Benefit';
import useEventsBus from '@/composables/event-bus';
import BenefitGroupsDetailsForm from '@/modules/plans/components/benefit-groups/forms/BenefitGroupsDetailsForm.vue';
import Label from '@/components/common/Label.vue';
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
const emits = defineEmits(['reload']);

const helpers = useHelpers();
const benefitStore = useBenefitStore();
const { emit } = useEventsBus();

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

const processData = (data) => {
    item.value = lodash.cloneDeep(data);
    itemToUpdate.value = lodash.cloneDeep(item.value);
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
        const res = await benefitStore.updateBenefitGroup(
            itemToUpdate.value.id,
            benefitStore.processPayload(itemToUpdate.value)
        );
        processData(benefitStore.processResponse(res.data));
        isEditing.value = false;
        clearActiveComponent();
        emits('reload');
        emit('reloadBenefitGroupDetails');
    } finally {
        busy.value = false;
    }
};
</script>
<template>
    <Loader v-if="loading" />
    <div v-else>
        <div class="flex justify-between items-center edit-cancel-button">
            <h5 class="mb-2">
                {{ $t('benefit_groups.benefit_group_details') }}
            </h5>
            <div v-if="isEditing">
                <Button
                    data-testid="cancel-button"
                    label="Cancel"
                    class="p-button-outlined mr-2"
                    @click="handleCancel"
                />
                <Button
                    data-testid="save-button"
                    label="Save"
                    :loading="busy"
                    :disabled="isNotChanged"
                    @click="save"
                />
            </div>
            <Button
                v-if="!isEditing && $ability.can('update benefit groups')"
                data-testid="edit-button"
                size="small"
                text
                class="px-2 py-1 p-button-outlined"
                label="Edit"
                icon="pi pi-pencil"
                :disabled="isEditDisabled"
                @click="handleEdit"
            />
        </div>

        <BenefitGroupsDetailsForm
            v-if="isEditing"
            :isNew="isNew"
            v-model="itemToUpdate"
        />

        <div v-else class="grid grid-cols-12 gap-2 mt-1">
            <div class="sm:col-span-6 md:col-span-2 text-sm font-semibold">
                <Label test-id="name-label">{{ $t('common.name') }}</Label
                >:
            </div>
            <div class="sm:col-span-6 md:col-span-10 text-sm p-break-word">
                {{ helpers.getLocaleValue(item.name) }}
            </div>
            <div class="sm:col-span-6 md:col-span-2 text-sm font-semibold">
                <Label test-id="coverage-label">{{
                    $t('common.coverage')
                }}</Label
                >:
            </div>
            <div class="sm:col-span-6 md:col-span-10 text-sm">
                {{ item.coverage ? item.coverage + ' %' : '-' }}
            </div>
            <div class="sm:col-span-6 md:col-span-2 text-sm font-semibold">
                <Label test-id="max-amount-label">{{
                    $t('common.to_a_maximum_of')
                }}</Label
                >:
            </div>
            <div class="sm:col-span-6 md:col-span-10 text-sm">
                {{
                    item.max_amount ? helpers.moneyFormat(item.max_amount) : '-'
                }}
            </div>
            <div class="sm:col-span-6 md:col-span-2 text-sm font-semibold">
                <Label test-id="effective-date-label">{{
                    $t('common.effective_date')
                }}</Label
                >:
            </div>
            <div class="sm:col-span-6 md:col-span-10 text-sm">
                {{
                    formatValue(item.effective_date, {
                        type: 'date',
                        format: 'long'
                    })
                }}
            </div>
            <div class="sm:col-span-6 md:col-span-2 text-sm font-semibold">
                <Label test-id="end-date-label">{{
                    $t('common.end_date')
                }}</Label
                >:
            </div>
            <div class="sm:col-span-6 md:col-span-10 text-sm">
                {{ formatEndDateDisplay(data.end_date) }}
            </div>
            <div class="sm:col-span-6 md:col-span-2 text-sm font-semibold">
                Inbound
            </div>
            <div class="sm:col-span-6 md:col-span-10 text-sm">
                <template v-if="item.bound?.value === 'in'"
                    ><i class="pi pi-check"></i> Yes</template
                >
                <template v-else><i class="pi pi-times"></i> No</template>
            </div>
            <div class="sm:col-span-6 md:col-span-2 text-sm font-semibold">
                International
            </div>
            <div class="sm:col-span-6 md:col-span-10 text-sm">
                <template v-if="item.type?.value === 'domestic'"
                    ><i class="pi pi-times"></i> No</template
                >
                <template v-else><i class="pi pi-check"></i> Yes</template>
            </div>
        </div>
    </div>
</template>
