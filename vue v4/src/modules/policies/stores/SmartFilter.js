import { ref } from 'vue';
import { defineStore } from 'pinia';
import { useI18n } from 'vue-i18n';

export const useSmartFilterStore = defineStore('SmartFilterStore', () => {
    const { t } = useI18n();
    const selectedFilters = ref([]);
    const rawFilters = ref([]);
    const selectedSavedFilter = ref(null);

    const operatorTypes = {
        ANY_OF: { label: t('policies.smart_filter.any_of'), value: 'in' },
        NONE_OF: { label: t('policies.smart_filter.none_of'), value: 'not in' },
        IS_EMPTY: {
            label: t('policies.smart_filter.is_empty'),
            value: 'IS_EMPTY'
        },
        IS_NOT_EMPTY: {
            label: t('policies.smart_filter.is_not_empty'),
            value: 'IS_NOT_EMPTY'
        },
        LAST_7_DAYS: {
            label: t('policies.smart_filter.last_7_days'),
            value: 'LAST_7_DAYS'
        },
        LAST_30_DAYS: {
            label: t('policies.smart_filter.last_30_days'),
            value: 'LAST_30_DAYS'
        },
        LAST_QUARTER: {
            label: t('policies.smart_filter.last_quarter'),
            value: 'LAST_QUARTER'
        },
        LAST_YEAR: {
            label: t('policies.smart_filter.last_year'),
            value: 'LAST_YEAR'
        },
        BETWEEN: {
            label: t('policies.smart_filter.between'),
            value: 'BETWEEN'
        },
        ON: { label: t('policies.smart_filter.on'), value: '=' },
        BEFORE: { label: t('policies.smart_filter.before'), value: '<' },
        AFTER: { label: t('policies.smart_filter.after'), value: '>' },
        LESS_THAN: { label: t('policies.smart_filter.less_than'), value: '<' },
        LESS_THAN_EQUAL_TO: {
            label: t('policies.smart_filter.less_than_equal_to'),
            value: '<='
        },
        GREATER_THAN: {
            label: t('policies.smart_filter.greater_than'),
            value: '>'
        },
        GREATER_THAN_EQUAL_TO: {
            label: t('policies.smart_filter.greater_than_equal_to'),
            value: '>='
        },
        EQUAL_TO: { label: t('policies.smart_filter.equal_to'), value: '=' }
    };

    const fieldDataTypeEnum = {
        NUMBER: 'number',
        DATE: 'date',
        MULTI_SELECT: 'multi-select'
    };

    const removeFilter = (filter) => {
        selectedFilters.value = selectedFilters.value.filter(
            (f) => f.field !== filter?.field
        );
        rawFilters.value = rawFilters.value.filter(
            (f) => f.field !== filter?.field
        );
    };

    const clearFilters = () => {
        selectedFilters.value = [];
        rawFilters.value = [];
        selectedSavedFilter.value = null;
    };

    const setSelectedSavedFilter = (filter) => {
        selectedSavedFilter.value = filter;
    };

    return {
        selectedFilters,
        rawFilters,
        operatorTypes,
        fieldDataTypeEnum,
        removeFilter,
        clearFilters,
        selectedSavedFilter,
        setSelectedSavedFilter
    };
});
