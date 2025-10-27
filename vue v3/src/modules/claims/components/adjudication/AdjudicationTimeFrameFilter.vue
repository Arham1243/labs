<script setup>
import { computed, ref, watch } from 'vue';
import { startOfDay, endOfDay } from '@/modules/claims/utils/helper';
import AdjudicationCustomDatePickerDialog from '@/modules/claims/components/adjudication/AdjudicationCustomDatePickerDialog.vue';

const openAdjudicationCustomDatePickerDialog = ref(false);
const startDate = ref(null);
const endDate = ref(null);
const selectedKey = ref('All'); // This is bound to dropdown
const previousSelection = ref(null);
const emit = defineEmits(['fetch-data']);

const dropdownOptions = computed(() => [
    { name: 'All', key: 'All' },
    { name: 'Today', key: 'Today' },
    { name: 'Yesterday', key: 'Yesterday' },
    { name: 'Last 7 days', key: 'Last 7 days' },
    { name: 'Last 30 days', key: 'Last 30 days' },
    { name: 'Custom Range', key: 'Custom Range' }
]);

const parseLocalDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed
};

const selectedDisplayLabel = computed(() => {
    if (selectedKey.value === 'Custom Range') {
        if (startDate.value && endDate.value) {
            return `${formatDate(startDate.value)} - ${formatDate(
                endDate.value
            )}`;
        }
        return 'Custom Range';
    }

    const option = dropdownOptions.value.find(
        (opt) => opt.key === selectedKey.value
    );
    return option?.name || 'Pick a date range';
});

// Handle updates from custom date picker dialog
const handleDateRangeUpdate = ({
    startDate: customStart,
    endDate: customEnd
}) => {
    const parsedStart = parseLocalDate(customStart);
    const parsedEnd = parseLocalDate(customEnd);

    startDate.value = startOfDay(parsedStart);
    endDate.value = endOfDay(parsedEnd);
    selectedKey.value = 'Custom Range';
    openAdjudicationCustomDatePickerDialog.value = false;

    emit('fetch-data', {
        startDate: startDate.value,
        endDate: endDate.value
    });
};

const handleDropdownOptionClick = (option) => {
    if (option.key === 'Custom Range') {
        previousSelection.value = selectedKey.value; // Save current selection
        openAdjudicationCustomDatePickerDialog.value = true;
    }
};

const handleDialogCancel = () => {
    openAdjudicationCustomDatePickerDialog.value = false;
    selectedKey.value = previousSelection.value; // Revert to previous
};

// Format the date range
const formatDate = (date) =>
    date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

// React to date dropdown changes
watch(selectedKey, (newValue) => {
    const now = new Date();

    switch (newValue) {
        case 'All':
            startDate.value = null;
            endDate.value = null;
            break;
        case 'Today':
            startDate.value = startOfDay(now);
            endDate.value = endOfDay(now);
            break;
        case 'Yesterday': {
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            startDate.value = startOfDay(yesterday);
            endDate.value = endOfDay(yesterday);
            break;
        }
        case 'Last 7 days': {
            const past = new Date(now);
            past.setDate(past.getDate() - 6);
            startDate.value = startOfDay(past);
            endDate.value = endOfDay(now);
            break;
        }
        case 'Last 30 days': {
            const past = new Date(now);
            past.setDate(past.getDate() - 29);
            startDate.value = startOfDay(past);
            endDate.value = endOfDay(now);
            break;
        }
        case 'Custom Range':
            openAdjudicationCustomDatePickerDialog.value = true;
            return; // Wait for date dialog
    }

    emit('fetch-data', {
        startDate: startDate.value,
        endDate: endDate.value
    });
});
</script>

<template>
    <!-- Custom Date Range Dialog -->
    <AdjudicationCustomDatePickerDialog
        v-model:visible="openAdjudicationCustomDatePickerDialog"
        @update-date-range="handleDateRangeUpdate"
        @cancel="handleDialogCancel"
    />

    <Dropdown
        v-model="selectedKey"
        :options="dropdownOptions"
        optionLabel="name"
        optionValue="key"
        placeholder="Pick a date range"
        class="w-full md:w-14rem"
        data-testid="input-search-date"
    >
        <template #value>
            <div>{{ selectedDisplayLabel }}</div>
        </template>

        <template #option="slotProps">
            <div
                @click="handleDropdownOptionClick(slotProps.option)"
                class="w-full"
            >
                {{ slotProps.option.name }}
            </div>
        </template>
    </Dropdown>
</template>

<style scoped lang="scss"></style>
