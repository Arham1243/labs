import { defineStore } from 'pinia';
import { ref, reactive, computed } from 'vue';

export const useInvoiceFilterStore = defineStore('InvoiceFilterStore', () => {
    // State
    const dateFilter = ref({
        startDate: null,
        endDate: null
    });

    const businessUnitFilter = ref([]);
    const statusFilter = ref([]);

    // Getters
    const getDateFilter = computed(() => dateFilter.value);
    const getBusinessUnitFilter = computed(() => businessUnitFilter.value);
    const getStatusFilter = computed(() => statusFilter.value);
    const hasDateFilter = computed(() => {
        return Boolean(dateFilter.value.startDate && dateFilter.value.endDate);
    });
    const hasBusinessUnitFilter = computed(() => {
        return Boolean(businessUnitFilter.value.length);
    });
    const hasStatusFilter = computed(() => {
        return Boolean(statusFilter.value.length);
    });
    const isFilterApplied = computed(() => {
        return (
            hasDateFilter.value ||
            hasBusinessUnitFilter.value ||
            hasStatusFilter.value
        );
    });

    // Actions
    function setDateFilter(start, end) {
        dateFilter.value.startDate = start;
        dateFilter.value.endDate = end;
    }

    function setBusinessUnitFilter(businessUnitIds) {
        businessUnitFilter.value = businessUnitIds;
    }

    function setStatusFilter(statuses) {
        statusFilter.value = statuses;
    }

    function clearDates() {
        dateFilter.value.startDate = null;
        dateFilter.value.endDate = null;
    }

    function clearBusinessUnits() {
        businessUnitFilter.value = [];
    }

    function clearStatuses() {
        statusFilter.value = [];
    }

    function clearAll() {
        clearDates();
        clearBusinessUnits();
        clearStatuses();
    }

    return {
        // State
        dateFilter,
        businessUnitFilter,
        statusFilter,

        // Getters
        getDateFilter,
        getBusinessUnitFilter,
        getStatusFilter,
        hasDateFilter,
        hasBusinessUnitFilter,
        hasStatusFilter,
        isFilterApplied,

        // Actions
        setDateFilter,
        setBusinessUnitFilter,
        setStatusFilter,
        clearDates,
        clearBusinessUnits,
        clearStatuses,
        clearAll
    };
});
