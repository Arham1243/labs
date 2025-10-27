<script setup>
import { watch, ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useDragDrop } from '@/modules/plans/composables/useDragDrop';
import Label from '@/components/common/Label.vue';

const props = defineProps({
    modelValue: {
        type: Object
    },
    isNew: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue']);

const {
    handleDragStart,
    handleAreaDragOver,
    handleDropArea,
    handleDragEnd,
    cleanup
} = useDragDrop();

const dropdownList = ref([
    { id: 'days', name: 'Days' },
    { id: 'months', name: 'Months' },
    { id: 'years', name: 'Years' }
]);

// Policy Format //

const POLICY_TYPES = {
    POLICY_ID: 'policy_id',
    PLAN_ID: 'plan_id',
    INSURED_ID: 'insured_id',
    BUSINESS_UNIT_ID: 'business_unit_id',
    CUSTOM: 'custom',
    SEPARATOR: 'separator',
    RANDOM: 'random'
};

const TYPE_CONFIG = {
    [POLICY_TYPES.POLICY_ID]: {
        label: 'Policy ID',
        defaultValue: 'POL123',
        required: true
    },
    [POLICY_TYPES.PLAN_ID]: {
        label: 'Plan ID',
        defaultValue: 'PLAN123',
        required: false
    },
    [POLICY_TYPES.INSURED_ID]: {
        label: 'Insured ID',
        defaultValue: 'INS123',
        required: false
    },
    [POLICY_TYPES.BUSINESS_UNIT_ID]: {
        label: 'Business Unit ID',
        defaultValue: 'BU123',
        required: false
    },
    [POLICY_TYPES.CUSTOM]: {
        label: 'Custom',
        defaultValue: '',
        required: false
    },
    [POLICY_TYPES.SEPARATOR]: {
        label: '-',
        defaultValue: '-',
        required: false
    },
    [POLICY_TYPES.RANDOM]: {
        label: 'Random',
        defaultValue: () => Math.floor(Math.random() * 10).toString(),
        required: false
    }
};

const SPECIAL_TYPES = [
    POLICY_TYPES.CUSTOM,
    POLICY_TYPES.SEPARATOR,
    POLICY_TYPES.RANDOM
];
const DEFAULT_TYPES = [
    POLICY_TYPES.POLICY_ID,
    POLICY_TYPES.PLAN_ID,
    POLICY_TYPES.INSURED_ID,
    POLICY_TYPES.BUSINESS_UNIT_ID
];
const formData = ref({ ...props.modelValue });
const customDialogVisible = ref(false);
const customText = ref('');
let idCounter = 0;
const showFormatBuilder = ref(false);
const selectedFormat = ref([]);
const movedToAdditional = ref([]);
const isInitialized = ref(false);
const randomValueMap = ref({});

const getNextId = () => ++idCounter;
const getTypeConfig = (type) =>
    TYPE_CONFIG[type] || { label: '', defaultValue: '', required: false };

watch(
    formData,
    (value) => {
        emit('update:modelValue', value);
    },
    { deep: true }
);

watch(showFormatBuilder, (newValue) => {
    if (newValue) {
        if (
            selectedFormat.value.length === 0 &&
            (!formData.value.policy_number_format ||
                formData.value.policy_number_format.length === 0)
        ) {
            initializeDefaultFormat();
        }
        updatePolicyNumberFormat();
    } else {
        resetPolicyFormat();
        formData.value.policy_number_format = [];
        emit('update:modelValue', { ...formData.value });
    }
});

onMounted(() => {
    initializeFormatData();
});

const createFormatItem = (type, customValue = null, customId = null) => {
    const config = getTypeConfig(type);
    const id = customId || getNextId();

    let value = customValue;
    let label = config.label;

    if (type === POLICY_TYPES.CUSTOM && customValue) {
        label = customValue;
    }

    if (type === POLICY_TYPES.RANDOM) {
        const randomValue =
            typeof config.defaultValue === 'function'
                ? config.defaultValue()
                : config.defaultValue;

        if (!customValue) {
            value = randomValue;
            randomValueMap.value[id] = randomValue;
        } else if (customValue) {
            randomValueMap.value[id] = customValue;
        }
    }

    return {
        id,
        type,
        label,
        value,
        required: type === POLICY_TYPES.POLICY_ID
    };
};

const getValueForType = (type, itemValue, itemId) => {
    if (itemValue !== undefined && itemValue !== null) {
        return itemValue;
    }

    if (
        type === POLICY_TYPES.RANDOM &&
        itemId &&
        randomValueMap.value[itemId]
    ) {
        return randomValueMap.value[itemId];
    }

    const config = getTypeConfig(type);
    return typeof config.defaultValue === 'function'
        ? config.defaultValue()
        : config.defaultValue;
};

const isSpecialType = (type) => SPECIAL_TYPES.includes(type);

const createDefaultFormat = () => [
    createFormatItem(POLICY_TYPES.POLICY_ID),
    createFormatItem(POLICY_TYPES.SEPARATOR),
    createFormatItem(POLICY_TYPES.PLAN_ID)
];

const createDefaultAdditionalItems = () => [
    createFormatItem(POLICY_TYPES.INSURED_ID),
    createFormatItem(POLICY_TYPES.BUSINESS_UNIT_ID)
];

const mapExistingFormatItems = (formatItems) => {
    return formatItems.map((item) => {
        const id = getNextId();

        if (item.type === POLICY_TYPES.RANDOM && item.value) {
            randomValueMap.value[id] = item.value;
        }

        return createFormatItem(item.type, item.value, id);
    });
};

const createMissingAdditionalItems = (existingTypes) => {
    return DEFAULT_TYPES.filter((type) => !existingTypes.has(type)).map(
        (type) => createFormatItem(type)
    );
};

function initializeFormatData() {
    if (!formData.value.policy_number_format) {
        formData.value.policy_number_format = [];
    } else if (
        Array.isArray(formData.value.policy_number_format) &&
        formData.value.policy_number_format.length > 0
    ) {
        showFormatBuilder.value = true;
        selectedFormat.value = mapExistingFormatItems(
            formData.value.policy_number_format
        );

        const selectedTypes = new Set(
            selectedFormat.value.map((item) => item.type)
        );
        movedToAdditional.value = createMissingAdditionalItems(selectedTypes);
    }

    isInitialized.value = true;
}

function initializeDefaultFormat() {
    selectedFormat.value = createDefaultFormat();
    movedToAdditional.value = createDefaultAdditionalItems();
}

const currentFormatItems = computed(() => {
    return selectedFormat.value;
});

const additionalItems = computed(() => {
    const specialItems = [
        { type: POLICY_TYPES.CUSTOM, label: 'Custom', required: false },
        { type: POLICY_TYPES.SEPARATOR, label: '-', required: false },
        { type: POLICY_TYPES.RANDOM, label: 'Random', required: false }
    ];

    return [...specialItems, ...movedToAdditional.value];
});

function moveToAdditional(item) {
    const index = selectedFormat.value.findIndex((i) => i.id === item.id);
    if (index > -1) {
        if (item.required) {
            return;
        }

        const [removedItem] = selectedFormat.value.splice(index, 1);

        if (!isSpecialType(removedItem.type)) {
            movedToAdditional.value.push(
                createFormatItem(
                    removedItem.type,
                    removedItem.value,
                    removedItem.id
                )
            );
        }
        updatePolicyNumberFormat();
    }
}

function moveBackToCurrent(item) {
    const index = movedToAdditional.value.findIndex((i) => i.id === item.id);
    if (index > -1) {
        const [removedItem] = movedToAdditional.value.splice(index, 1);
        selectedFormat.value.push(
            createFormatItem(
                removedItem.type,
                removedItem.value,
                removedItem.id
            )
        );
        updatePolicyNumberFormat();
    }
}

const formatPreview = computed(() => {
    return selectedFormat.value
        .map((item) => {
            if (item.type === POLICY_TYPES.CUSTOM) {
                return item.value || '';
            } else {
                return getValueForType(item.type, item.value, item.id);
            }
        })
        .join('');
});

function addFormatItem(item) {
    if (item.type === POLICY_TYPES.CUSTOM) {
        customDialogVisible.value = true;
    } else {
        const newItem = createFormatItem(item.type);
        selectedFormat.value.push(newItem);
        updatePolicyNumberFormat();
    }
}

function addCustomText() {
    if (customText.value.length > 0) {
        const newItem = createFormatItem(POLICY_TYPES.CUSTOM, customText.value);
        selectedFormat.value.push(newItem);

        customDialogVisible.value = false;
        customText.value = '';
        updatePolicyNumberFormat();
    }
}

function cancelCustomDialog() {
    customDialogVisible.value = false;
    customText.value = '';
}

function handleAreaDrop(event) {
    handleDropArea(event, {
        items: selectedFormat.value,
        updateItems: (newItems) => (selectedFormat.value = newItems),
        afterUpdate: updatePolicyNumberFormat
    });
}

onBeforeUnmount(() => {
    cleanup();
});

function validateTypes() {
    const allowedFormatTypes = Object.values(POLICY_TYPES);

    selectedFormat.value.forEach((item) => {
        if (!allowedFormatTypes.includes(item.type)) {
            console.warn(`Invalid policy format type: ${item.type}`);
        }
    });
}

const resetPolicyFormat = () => {
    selectedFormat.value = [];
    movedToAdditional.value = [];
    randomValueMap.value = {};
    idCounter = 0;
};

function updatePolicyNumberFormat() {
    validateTypes();

    if (showFormatBuilder.value) {
        formData.value.policy_number_format = selectedFormat.value.map(
            (item) => {
                let value = null;

                if (item.type === POLICY_TYPES.CUSTOM) {
                    value = item.value;
                } else if (item.type === POLICY_TYPES.RANDOM) {
                    value = item.id ? randomValueMap.value[item.id] : null;
                }

                return {
                    type: item.type,
                    value: value
                };
            }
        );
    }
}

const getPolicyFormat = () => {
    return formData.value.policy_number_format;
};

defineExpose({
    getPolicyFormat
});
</script>
<template>
    <div class="p-fluid formgrid grid mt-4">
        <div class="col-12 mb-3 mt-3">
            <div class="grid">
                <div class="col-6">
                    <label for="policy_term"
                        >{{ $t('plans.policy_term') }} *
                        <i
                            v-tooltip="$t('plans.policy_term_tooltip')"
                            class="pi pi-info-circle"
                        ></i
                    ></label>
                    <div class="flex gap-2 mt-2">
                        <div class="field w-full">
                            <InputField
                                id="policy_term"
                                variant="number"
                                v-model="formData.policy_term"
                                data-testid="policy_term"
                            />
                        </div>
                        <div class="field w-full">
                            <InputField
                                id="policy_term_type"
                                variant="dropdown"
                                v-model="formData.policy_term_type"
                                :options="dropdownList"
                                optionLabel="name"
                                :placeholder="$t('common.select')"
                                data-testid="policy_term_type"
                            />
                        </div>
                    </div>
                </div>
                <div class="col-6">
                    <label for="enrolment_period"
                        >{{ $t('plans.enrolment_period') }}
                        <i
                            v-tooltip="$t('plans.enrolment_period_tooltip')"
                            class="pi pi-info-circle"
                        ></i
                    ></label>
                    <div class="flex gap-2 mt-2">
                        <div class="field w-full">
                            <InputField
                                id="enrolment_period"
                                variant="number"
                                v-model="formData.enrolment_period"
                                data-testid="enrolment_period"
                            />
                        </div>
                        <div class="field w-full">
                            <InputField
                                id="enrolment_period_type"
                                variant="dropdown"
                                v-model="formData.enrolment_period_type"
                                :options="dropdownList"
                                optionLabel="name"
                                :placeholder="$t('common.select')"
                                data-testid="enrolment_period_type"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-12">
            <div class="grid">
                <div class="col-6">
                    <label for="minimum_age">{{
                        $t('plans.main_applicant_minimum_age')
                    }}</label>
                    <div class="flex gap-2 mt-2">
                        <div class="field w-full">
                            <InputField
                                id="minimum_age"
                                variant="number"
                                v-model="formData.minimum_age"
                                data-testid="minimum_age"
                            />
                        </div>
                        <div class="field w-full">
                            <InputField
                                id="minimum_age_type"
                                variant="dropdown"
                                v-model="formData.minimum_age_type"
                                :options="dropdownList"
                                optionLabel="name"
                                :placeholder="$t('common.select')"
                                data-testid="minimum_age_type"
                            />
                        </div>
                    </div>
                </div>
                <div class="col-6">
                    <label for="maximum_age">{{
                        $t('plans.main_applicant_maximum_age')
                    }}</label>
                    <div class="flex gap-2 mt-2">
                        <div class="field w-full">
                            <InputField
                                id="maximum_age"
                                variant="number"
                                v-model="formData.maximum_age"
                                data-testid="maximum_age"
                            />
                        </div>
                        <div class="field w-full">
                            <InputField
                                id="maximum_age_type"
                                variant="dropdown"
                                v-model="formData.maximum_age_type"
                                :options="dropdownList"
                                optionLabel="name"
                                :placeholder="$t('common.select')"
                                data-testid="maximum_age_type"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="field col-12">
            <div class="flex mt-3">
                <InputSwitch
                    :falseValue="false"
                    :trueValue="true"
                    v-model="showFormatBuilder"
                    data-testid="show-format-builder"
                />
                <span class="ml-2 mt-1">Custom Policy # Format</span>
            </div>

            <div v-if="showFormatBuilder">
                <div class="filed col-12">
                    <div class="my-3">
                        <div>
                            <Label testId="current-policy-format"
                                >Current policy format (rearrange if
                                required)</Label
                            >
                            <div
                                class="format-droppable my-3"
                                @dragover.prevent="
                                    handleAreaDragOver(
                                        $event,
                                        currentFormatItems
                                    )
                                "
                                @dragenter.prevent
                                @drop="handleAreaDrop($event)"
                            >
                                <div
                                    v-for="(item, index) in currentFormatItems"
                                    :key="item.id"
                                    class="chip-wrapper"
                                    draggable="true"
                                    @dragstart="handleDragStart($event, index)"
                                    @dragend="handleDragEnd($event)"
                                >
                                    <Chip
                                        :label="item.label"
                                        :removable="!item.required"
                                        @remove="moveToAdditional(item)"
                                        class="mr-2 mb-2"
                                    />
                                </div>
                            </div>
                        </div>
                        <hr />
                        <div class="mt-3">
                            <Label testId="additional-options"
                                >Additional options</Label
                            >
                            <div class="my-3">
                                <div
                                    v-for="item in additionalItems"
                                    :key="item.type + (item.id || '')"
                                    class="custom-chip mr-2 mb-2"
                                    @click="
                                        !item.id
                                            ? addFormatItem(item)
                                            : moveBackToCurrent(item)
                                    "
                                >
                                    <i class="pi pi-plus-circle"></i>
                                    <span class="ml-2">{{ item.label }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr />
                    <Label testId="policy-format">Policy format preview</Label>
                    <div
                        class="my-3 p-3 bg-gray-100 border-1 border-black-alpha-10 border-round overflow-x-auto"
                    >
                        {{ formatPreview }}
                    </div>
                </div>
            </div>

            <Dialog
                v-model:visible="customDialogVisible"
                header="Add Custom Value"
                :modal="true"
                :style="{ width: '20vw' }"
            >
                <div class="flex flex-col flex-wrap">
                    <InputText
                        id="customText"
                        v-model="customText"
                        class="w-full"
                        maxlength="20"
                    />
                </div>
                <template #footer>
                    <Button
                        label="Cancel"
                        class="p-button-text"
                        @click="cancelCustomDialog"
                    />
                    <Button
                        label="Save"
                        @click="addCustomText"
                        :disabled="customText.length === 0"
                    />
                </template>
            </Dialog>
        </div>

        <div class="field col-12">
            <div class="flex mt-3">
                <InputSwitch
                    :falseValue="false"
                    :trueValue="true"
                    v-model="formData.is_required_student_number"
                    data-testid="is_required_student_number"
                />
                <span class="ml-2 mt-1">{{
                    $t('plans.student_required')
                }}</span>
            </div>
        </div>

        <div class="field col-12">
            <div class="flex mt-3">
                <InputSwitch
                    :falseValue="false"
                    :trueValue="true"
                    v-model="formData.is_required_employee_number"
                    data-testid="is_required_employee_number"
                />
                <span class="ml-2 mt-1">{{
                    $t('plans.employee_required')
                }}</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.format-droppable {
    display: flex;
    flex-wrap: wrap;
}

.chip-wrapper {
    cursor: grab;
    display: inline-block;
    position: relative;
    transition: margin 0.15s ease;
}

.chip-wrapper.dragging {
    opacity: 0.3;
}

.chip-wrapper.space-before {
    margin-left: 25px !important;
}

.chip-wrapper.space-after {
    margin-right: 25px !important;
}

.chip-wrapper.space-before::before {
    content: '';
    position: absolute;
    left: -20px;
    top: 50%;
    transform: translateY(-50%);
    width: 15px;
    height: 3px;
    border-radius: 2px;
}

.chip-wrapper.space-after::after {
    content: '';
    position: absolute;
    right: -20px;
    top: 50%;
    transform: translateY(-50%);
    width: 15px;
    height: 3px;
    border-radius: 2px;
}

.custom-chip {
    display: inline-flex;
    align-items: center;
    background-color: #e9ecef;
    border-radius: 16px;
    padding: 0.5rem 1rem;
    cursor: pointer;
}

.custom-chip:hover {
    background-color: #dee2e6;
}

.custom-chip i {
    margin-left: 6px;
}

:global(#drag-preview) {
    position: fixed !important;
    pointer-events: none !important;
    z-index: 9999 !important;
    opacity: 0.85 !important;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3)) !important;
    margin: 0 !important;
    padding: 10 !important;
    max-width: none !important;
    max-height: none !important;
}

:global(#drag-preview *) {
    pointer-events: none !important;
}
</style>
