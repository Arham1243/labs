<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { getColumnProps } from '@/modules/plans/composables/plans/usePeriodManagement.js';

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    initialAvailablePeriods: {
        type: Array,
        default: () => []
    },
    columns: {
        type: Array,
        required: true
    },
    title: {
        type: String,
        default: 'Add New Period'
    },
    maxSelection: {
        type: Number,
        default: 10
    },
    width: {
        type: String,
        default: '80rem'
    }
});

const emit = defineEmits(['update:visible', 'periods-selected', 'cancel']);
const { t } = useI18n();

const availablePeriods = ref([]);
const selectAll = ref(false);
const selectedPeriods = ref([]);

const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
});

const allPeriodsSelected = computed(() => {
    return (
        availablePeriods.value.length > 0 &&
        selectedPeriods.value.length === availablePeriods.value.length
    );
});

const hasAvailablePeriods = computed(
    () => availablePeriods.value && availablePeriods.value.length > 0
);

const canAddPeriods = computed(() => selectedPeriods.value.length > 0);

watch(
    () => props.initialAvailablePeriods,
    (newValue) => {
        availablePeriods.value = newValue;
    },
    {
        deep: true,
        immediate: true
    }
);

watch(selectAll, (newValue) => {
    if (newValue) {
        selectedPeriods.value = [...availablePeriods.value];
    } else {
        if (allPeriodsSelected.value) {
            selectedPeriods.value = [];
        }
    }
});

watch(
    selectedPeriods,
    (newSelection) => {
        if (
            newSelection.length === availablePeriods.value.length &&
            availablePeriods.value.length > 0
        ) {
            selectAll.value = true;
        } else {
            selectAll.value = false;
        }
    },
    { deep: true }
);

watch(
    () => props.visible,
    (newValue) => {
        if (newValue) {
            selectedPeriods.value = [];
            selectAll.value = false;
        }
    }
);

const handleAddPeriods = () => {
    emit('periods-selected', [...selectedPeriods.value]);
    selectedPeriods.value = [];
    selectAll.value = false;
    dialogVisible.value = false;
};

const handleCancel = () => {
    selectedPeriods.value = [];
    selectAll.value = false;
    emit('cancel');
    dialogVisible.value = false;
};

const updatePeriodField = (period, field, value) => {
    period[field] = value;
};
</script>

<template>
    <Dialog
        v-model:visible="dialogVisible"
        modal
        :header="title"
        :style="{ width }"
    >
        <div v-if="hasAvailablePeriods">
            <div
                class="p-fluid formgrid grid flex align-items-center border-bottom-1 border-gray-200 bg-gray-100 py-3"
            >
                <div class="col-1 font-bold text-center">
                    <Checkbox
                        v-model="selectAll"
                        :binary="true"
                        data-testid="select-all-checkbox"
                        :disabled="!hasAvailablePeriods"
                        v-tooltip.top="t('plans.select_all_periods')"
                    />
                </div>
                <div
                    v-for="column in columns.filter(
                        (col) => col.type !== 'actions'
                    )"
                    :key="column.key"
                    :class="[column.width, 'font-bold']"
                >
                    {{ column.label }}
                </div>
            </div>

            <div
                v-for="(period, index) in availablePeriods"
                :key="period.id || index"
                :class="[
                    'p-fluid formgrid flex align-items-center grid border-bottom-1 border-gray-200 py-3',
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                ]"
            >
                <div class="col-1 text-center">
                    <Checkbox
                        v-model="selectedPeriods"
                        :value="period"
                        data-testid="period-checkbox"
                    />
                </div>

                <div
                    v-for="column in columns.filter(
                        (col) => col.type !== 'actions'
                    )"
                    :key="column.key"
                    :class="column.width"
                >
                    <span v-if="column.type === 'text' || !column.type">
                        {{ period[column.key] }}
                    </span>

                    <DatePicker
                        v-else-if="column.type === 'date'"
                        :model-value="period[column.key] || null"
                        @update:model-value="
                            updatePeriodField(period, column.key, $event)
                        "
                        v-bind="getColumnProps(column, period)"
                    />

                    <InputField
                        v-else-if="column.type === 'dropdown'"
                        :model-value="period[column.key]"
                        @update:model-value="
                            updatePeriodField(period, column.key, $event)
                        "
                        v-bind="getColumnProps(column, period)"
                    />

                    <div
                        v-else-if="column.type === 'switch'"
                        class="text-center"
                    >
                        <InputSwitch
                            :model-value="period[column.key]"
                            @update:model-value="
                                updatePeriodField(period, column.key, $event)
                            "
                            v-bind="getColumnProps(column, period)"
                        />
                    </div>

                    <div v-else-if="column.type === 'complex'">
                        <slot
                            :name="`dialog-${column.key}`"
                            :period="period"
                            :index="index"
                            :update-period="updatePeriodField"
                        >
                            <span>{{ period[column.key] }}</span>
                        </slot>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="text-center p-4">
            <span>{{ t('plans.no_available_periods_to_add') }}</span>
        </div>

        <template #footer>
            <Button
                :label="t('buttons.cancel')"
                icon="pi pi-times"
                text
                @click="handleCancel"
            />
            <Button
                :label="t('plans.add_period')"
                icon="pi pi-plus"
                @click="handleAddPeriods"
                :disabled="!canAddPeriods"
            />
        </template>
    </Dialog>
</template>
