<script setup>
import { useI18n } from 'vue-i18n';
import { getColumnProps } from '@/modules/plans/composables/plans/usePeriodManagement.js';
import { useGlobalStore } from '@/stores/index.js';
import { computed } from 'vue';

const props = defineProps({
    periods: {
        type: Array,
        default: () => []
    },
    columns: {
        type: Array,
        required: true
    },
    allowRemove: {
        type: Boolean,
        default: true
    },
    busy: {
        type: Boolean,
        default: false
    },
    fieldIdPrefix: {
        type: String,
        required: true
    }
});

const emit = defineEmits(['remove-period', 'update-period']);
const { t } = useI18n();
const globalStore = useGlobalStore();

const periodError = computed(() => {
    const hasError =
        globalStore.errors && globalStore.errors.fixed_window_periods;
    const isCorrectInstance = props.fieldIdPrefix === 'fixed_window_periods';
    const isListEmpty = props.periods.length === 0;

    if (hasError && isCorrectInstance && isListEmpty) {
        return globalStore.errors.fixed_window_periods[0];
    }

    return null;
});

const handleRemovePeriod = (period) => {
    emit('remove-period', period);
};

const handleUpdatePeriod = (period, field, value) => {
    emit('update-period', { period, field, value });
};
</script>

<template>
    <div>
        <div
            class="p-fluid formgrid grid flex align-items-center border-bottom-1 border-gray-200 bg-gray-100 py-3"
        >
            <div
                v-for="column in columns"
                :key="column.key"
                :class="[column.width, 'font-bold']"
            >
                {{ column.label }}
            </div>
        </div>

        <template v-if="periods && periods.length > 0">
            <div
                v-for="(period, periodIndex) in periods"
                :key="period.id || periodIndex"
                :class="[
                    'p-fluid formgrid flex align-items-center grid border-bottom-1 border-gray-200 py-3',
                    periodIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                ]"
            >
                <div
                    v-for="column in columns"
                    :key="column.key"
                    :class="column.width"
                >
                    <span v-if="column.type === 'text' || !column.type">
                        {{ period[column.key] }}
                    </span>

                    <DatePicker
                        :id="`${fieldIdPrefix}.${periodIndex}.${column.key}`"
                        v-else-if="column.type === 'date'"
                        :model-value="period[column.key] || null"
                        @update:model-value="
                            handleUpdatePeriod(period, column.key, $event)
                        "
                        v-bind="getColumnProps(column, period)"
                    />

                    <InputField
                        v-else-if="column.type === 'dropdown'"
                        :id="`${fieldIdPrefix}.${periodIndex}.${column.key}`"
                        :model-value="period[column.key]"
                        @update:model-value="
                            handleUpdatePeriod(period, column.key, $event)
                        "
                        v-bind="getColumnProps(column, period)"
                    />

                    <div
                        v-else-if="column.type === 'switch'"
                        class="text-center"
                    >
                        <InputSwitch
                            :id="`${fieldIdPrefix}.${periodIndex}.${column.key}`"
                            :model-value="period[column.key]"
                            @update:model-value="
                                handleUpdatePeriod(period, column.key, $event)
                            "
                            v-bind="getColumnProps(column, period)"
                        />
                    </div>

                    <div v-else-if="column.type === 'complex'">
                        <slot
                            :name="column.key"
                            :period="period"
                            :update-period="handleUpdatePeriod"
                            :periodIndex="periodIndex"
                            :fieldIdPrefix="fieldIdPrefix"
                        >
                            <span>{{ period[column.key] }}</span>
                        </slot>
                    </div>

                    <div
                        v-else-if="column.type === 'actions'"
                        class="text-center"
                    >
                        <Button
                            v-if="allowRemove"
                            :disabled="busy"
                            icon="pi pi-trash"
                            class="p-button-rounded p-button-outlined text-red-500"
                            @click="handleRemovePeriod(period)"
                            data-testid="remove-period-button"
                        />
                        <slot
                            name="actions"
                            :period="period"
                            :index="periodIndex"
                            :remove-period="handleRemovePeriod"
                        />
                    </div>
                </div>
            </div>
        </template>

        <div
            v-else
            class="p-fluid formgrid flex align-items-center grid border-bottom-1 border-gray-200 py-3"
        >
            <div class="col-12 text-center text-gray-500">
                {{ t('plans.no_periods_found') }}
            </div>
        </div>

        <Message
            v-if="periodError"
            severity="error"
            :closable="false"
            class="mt-3"
        >
            {{ periodError }}
        </Message>
    </div>
</template>
