import { id, label } from 'happy-dom/lib/PropertySymbol.js';

export const DATE_OPTIONS = [
    {
        label: '7 Days',
        value: 'LAST_7_DAYS'
    },
    {
        label: '30 Days',
        value: 'LAST_30_DAYS'
    },
    {
        label: '60 Days',
        value: 'LAST_60_DAYS'
    },
    {
        label: '12 Months',
        value: 'LAST_12_MONTHS'
    }
];

export const DATE_CLAUSE_OPTIONS = [
    {
        label: 'Is before',
        value: 'BEFORE_DATE',
        showCalendar: true,
        showRange: false
    },
    {
        label: 'Is within last',
        value: 'IS_WITHIN',
        options: DATE_OPTIONS,
        showCalendar: false,
        showDateOptions: true,
        showRange: false
    },
    { label: 'Is on', value: 'ON_DATE', showCalendar: true, showRange: false },
    {
        label: 'Is after',
        value: 'AFTER_DATE',
        showCalendar: true,
        showRange: false
    },
    {
        label: 'Is between',
        value: 'DATE_BETWEEN',
        showCalendar: true,
        showRange: true
    }
];

export const NUMBER_CLAUSE_OPTIONS = [
    { label: 'Is equal to', value: 'EQUAL', range: false },
    { label: 'Is less than', value: 'LESS_THAN', range: false },
    { label: 'Is greater than', value: 'GREATER_THAN', range: false },
    { label: 'Is between', value: 'BETWEEN', range: true }
];

export const MULTIPLE_CLAUSE_OPTIONS = [
    { label: 'Any of', value: 'in' },
    { label: 'None of', value: 'not in' }
];

export const STRING_CLAUSE_OPTIONS = [
    { label: 'Contains', value: 'LIKE' },
    { label: 'Is exactly', value: 'EQUAL' }
];

export const SELECTION_CLAUSE_OPTIONS = [
    { label: 'Is', value: 'EQUAL' },
    { label: 'Is not', value: 'NOT EQUAL' }
];

export const CONDITION_TYPES = {
    AND: { label: 'AND', value: 'and' },
    OR: { label: 'OR', value: 'or' }
};

/**
 * use this method to format the filters before sending to the backend
 */
export const getFormattedFilter = (filters) => {
    return filters.map((filter) => {
        let formattedValue = {
            boolean: filter.boolean,
            field: filter.field,
            operator: filter.operator,
            value: filter.value,
            type: filter.type
        };

        if (filter.type == 'date') {
            // the calendar view on the filter dialog will return a date object, convert to YYYY-MM-DD format
            // possible values can be a single date or a date range
            const clause = DATE_CLAUSE_OPTIONS.find(
                (option) => option.value === filter.operator
            );
            if (clause.showRange) {
                formattedValue.value = filter.value.map(
                    (date) => new Date(date).toISOString().split('T')[0]
                );
            } else if (clause.showCalendar) {
                formattedValue.value = new Date(filter.value)
                    .toISOString()
                    .split('T')[0];
            } else if (clause.showDateOptions) {
                formattedValue.operator = formattedValue.value.id;
                formattedValue.value = null;
            }
            return formattedValue;
        }

        if (filter.type == 'multi_select') {
            formattedValue.value = filter.value.map((item) =>
                item.id ? item.id : item
            );
        }
        return formattedValue;
    });
};

/**
 * use this method to format the filters when loading them on the frontend
 */
export const getDeformattedFilter = (filters) => {
    return filters.map((filter) => {
        let formattedValue = {
            boolean: filter.boolean,
            field: filter.field,
            operator: filter.operator,
            value: filter.value,
            type: filter.type,
            options: []
        };

        if (filter.type == 'date') {
            // the calendar view on the filter dialog will return a date object, convert to YYYY-MM-DD format
            // possible values can be a single date or a date range
            const dateOption = DATE_OPTIONS.find(
                (option) => option.value === filter.operator
            );
            if (dateOption) {
                formattedValue.operator = 'IS_WITHIN';
                formattedValue.temp_val = {
                    id: dateOption.value,
                    name: dateOption.label
                }; //setting this directly to value key does not work
                formattedValue.value = {
                    id: dateOption.value,
                    name: dateOption.label
                }; //setting this directly to value key does not work
                return formattedValue;
            }

            const clause = DATE_CLAUSE_OPTIONS.find(
                (option) => option.value === filter.operator
            );

            if (clause.showRange) {
                formattedValue.value = filter.value.map((date) =>
                    parseDateString(date)
                );
            } else if (clause.showCalendar) {
                const parts = filter.value.split('-');
                const date = new Date(parts[0], parts[1] - 1, parts[2]);
                formattedValue.value = date;
            } else if (clause.showDateOptions) {
                formattedValue.operator = formattedValue.value.id;
                formattedValue.value = null;
            }
            return formattedValue;
        }

        if (filter.type == 'multi_select') {
            //in the database we are storing ids, capture these ids in temp_ids and then later in the filter map them to their objects
            formattedValue.temp_ids = formattedValue.value;
            formattedValue.value = [];
        }
        return formattedValue;
    });
};

function parseDateString(dateString) {
    const [year, month, day] = dateString.split('-');
    return new Date(year, month - 1, day);
}

export const MODULE_TYPES = {
    ACCOUNTING: { value: 'accounting', display_name: 'Accounting' },
    CLAIMS: { value: 'claims', display_name: 'Claims' }
};
