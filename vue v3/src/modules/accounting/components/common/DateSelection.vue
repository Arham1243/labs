<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const emit = defineEmits(['update:startDate', 'update:endDate']);

const { t } = useI18n();

const selectedDateOption = ref();
const isoStartDate = ref(null);
const isoEndDate = ref(null);
const displayStartDate = ref(null);
const displayEndDate = ref(null);
const errors = ref([]);
const dateOptions = ref([
    {
        label: t('invoice.filter.date_options.none'),
        value: null
    },
    {
        label: t('invoice.filter.date_options.last_7_days'),
        value: 7
    },
    {
        label: t('invoice.filter.date_options.last_30_days'),
        value: 30
    },
    {
        label: t('invoice.filter.date_options.last_60_days'),
        value: 60
    },
    {
        label: t('invoice.filter.date_options.last_12_months'),
        value: 365
    },
    {
        label: t('invoice.filter.date_options.custom_range'),
        value: -1
    }
]);

emit('update:startDate', isoStartDate.value);
emit('update:endDate', isoEndDate.value);

watch(displayStartDate, (newVal) => {
    if (newVal instanceof Date) {
        isoStartDate.value = newVal.toISOString().split('T')[0];
    } else {
        isoStartDate.value = null;
    }
});

watch(displayEndDate, (newVal) => {
    if (newVal instanceof Date) {
        isoEndDate.value = newVal.toISOString().split('T')[0];
    } else {
        isoEndDate.value = null;
    }
});

const optionChanged = () => {
    if (
        selectedDateOption.value.value == -1 ||
        selectedDateOption.value.value == null
    ) {
        displayStartDate.value = null;
        displayEndDate.value = null;
        isoStartDate.value = null;
        isoEndDate.value = null;
    } else updateDateRange(selectedDateOption.value.value);
};

const updateDateRange = (daysToDeduct) => {
    const now = new Date();
    const deduct = new Date(now.getTime() - daysToDeduct * 24 * 60 * 60 * 1000);
    isoStartDate.value = deduct.toISOString().split('T')[0];
    isoEndDate.value = now.toISOString().split('T')[0];
};
</script>

<template>
    <div data-testid="date-selection">
        <label
            for="date"
            class="block text-md font-medium text-gray-700 mb-1"
            data-testid="date-label"
            >{{ $t('invoice.filter.date') }}</label
        >
        <Dropdown
            @change="optionChanged"
            v-model="selectedDateOption"
            :options="dateOptions"
            optionLabel="label"
            class="w-full"
            data-testid="date-dropdown"
        />
    </div>

    <div
        class="w-full pt-4"
        v-if="selectedDateOption && selectedDateOption.value == -1"
        data-testid="custom-date-range"
    >
        <div class="flex flex-row w-full">
            <div class="basis-1/2 w-full pr-1">
                <label
                    for="date"
                    class="block text-md font-medium text-gray-700 mb-1 w-full"
                    data-testid="start-date-label"
                    >{{ $t('invoice.filter.start_date') }}</label
                >
                <Calendar
                    class="w-full"
                    showButtonBar
                    v-model="displayStartDate"
                    dateFormat="dd-M-yy"
                    v-bind="$attrs"
                    :placeholder="$t('common.select_date')"
                    data-testid="start-date-input"
                />
            </div>
            <div class="basis-1/2 w-full pl-1">
                <label
                    for="date"
                    class="block text-md font-medium text-gray-700 mb-1 w-full"
                    data-testid="end-date-label"
                    >{{ $t('invoice.filter.end_date') }}</label
                >
                <Calendar
                    class="w-full"
                    showButtonBar
                    v-model="displayEndDate"
                    dateFormat="dd-M-yy"
                    v-bind="$attrs"
                    :placeholder="$t('common.select_date')"
                    data-testid="end-date-input"
                />
            </div>
        </div>
    </div>

    <small
        v-for="(error, index) in errors"
        :key="index"
        class="p-error block"
        :class="{ 'mb-2': index == errors.length - 1 }"
        id="text-error"
        data-testid="error-message"
    >
        {{ error }}
    </small>
</template>

<style lang="scss" scoped></style>
