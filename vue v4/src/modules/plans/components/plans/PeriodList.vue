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
            class="flex w-full border-b border-gray-200 bg-gray-100 py-3"
        >
            <div
                v-for="column in columns"
                :key="column.key"
                :class="[
                    'flex-1 font-bold px-3 flex items-center',
                    column.type === 'actions' ? 'justify-end' :
                    column.type === 'switch' ? 'justify-center' :
                    'justify-start'
                ]"
            >
                {{ column.label }}
            </div>
        </div>

        <template v-if="periods && periods.length > 0">
            <div
                v-for="(period, periodIndex) in periods"
                :key="period.id || periodIndex"
                :class="[
                    'flex w-full border-b border-gray-200 py-3',
                    periodIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                ]"
            >
                <div
                    v-for="column in columns"
                    :key="column.key"
                    :class="[
                        'flex-1 px-3 flex items-center',
                        column.type === 'actions' ? 'justify-end' :
                        column.type === 'switch' ? 'justify-center' :
                        'justify-start'
                    ]"
                >
                    <span v-if="column.type === 'text' || !column.type">
                        {{ period[column.key] }}
                    </span>

                    <InputField
                        variant="date"
                        :id="`${fieldIdPrefix}.${periodIndex}.${column.key}`"
                        v-else-if="column.type === 'date'"
                        :model-value="period[column.key] || null"
                        @update:model-value="
                            handleUpdatePeriod(period, column.key, $event)
                        "
                        v-bind="getColumnProps(column, period)"
                    />

                    <InputField
                        v-else-if="column.type === 'select'"
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
                        <InputField
                            variant="switch"
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
                            rounded
                            severity="danger"
                            variant="outlined"
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
            class="flex items-center justify-center border-b border-gray-200 py-3"
        >
            <div class="text-center text-gray-500">
                {{ t('plans.no_periods_found') }}
            </div>
        </div>

        <InputField
            variant="message"
            icon="pi pi-exclamation-triangle"
            v-if="periodError"
            severity="error"
            :closable="false"
            class="mt-3"
        >
            {{ periodError }}
        </InputField>
    </div>
</template>
