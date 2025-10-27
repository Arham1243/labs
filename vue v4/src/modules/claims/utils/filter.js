import {
    DATE_CLAUSE_OPTIONS,
    NUMBER_CLAUSE_OPTIONS,
    SELECTION_CLAUSE_OPTIONS
} from '@/config/filter.js';
import { useHelpers } from '@/composables/index.js';

export const filter_operators = [
    { label: 'EQUALS', value: '=' },
    { label: 'LESS_THAN', value: '<' },
    { label: 'GREATER_THAN', value: '>' },
    { label: 'BETWEEN' }
];

export const formatDateToYYYYMMDD = (date) => {
    const dateObject = new Date(date);
    return dateObject.toISOString().split('T')[0];
};

export const formatColumnForTableFilter = (column) => {
    if (!column || typeof column !== 'string') {
        return '';
    }
    return column
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const formatNumber = (value) => {
    return Number(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

export const formatFilterLabelForTableFilter = (filter, helpers, t) => {
    switch (filter.type) {
        case 'date':
            if (
                filter.operator === 'LAST_7_DAYS' ||
                filter.operator === 'LAST_30_DAYS' ||
                filter.operator === 'LAST_60_DAYS' ||
                filter.operator === 'LAST_12_MONTHS'
            ) {
                return filter.operator.toLowerCase().replace(/_/g, ' ');
            }

            const clause = DATE_CLAUSE_OPTIONS.find(
                (option) => option.value === filter.operator
            );
            if (!clause?.showRange) {
                return `${clause.label.toLowerCase()} ${helpers.formatDate(filter.value)}`;
            }
            return `${clause.label.toLowerCase()} ${helpers.formatDate(filter.value[0])} ${t('filter.to')} ${helpers.formatDate(filter.value[1])}`;

        case 'number': {
            if (filter.operator === '=') {
                return `is equal to ${formatNumber(filter.value)}`;
            }
            const clause = NUMBER_CLAUSE_OPTIONS.find(
                (option) => option.value === filter.operator
            );
            if (clause.range)
                return `${clause.label.toLowerCase()} ${formatNumber(filter.value[0])} ${t('filter.to')} ${formatNumber(filter.value[1])}`;
            return `${clause.label.toLowerCase()} ${formatNumber(filter.value)}`;
        }

        case 'multi_select':
            let names = filter.value.map((value) =>
                helpers.capitalizeWords(value)
            );
            let joinText = names.join(', ');
            if (joinText.length > 20) {
                joinText =
                    joinText.slice(0, 20) +
                    '...' +
                    ' (' +
                    (names.length - 1) +
                    ' selected)';
            }
            return filter.operator + ' ' + joinText;

        case 'select':
            let op = SELECTION_CLAUSE_OPTIONS.find(
                (op) => op.value === filter.operator
            );
            let opt = filter.options.find(
                (option) => option.id === filter.value
            );

            if (op && opt) {
                return `(${op.label.toLowerCase()}) ${opt.name}`;
            }

            return filter.id;

        default:
            return '';
    }
};

export const formatClaimFilterForApi = (filters) => {
    return filters.flatMap((filter) => {
        const matchedOp = filter_operators.find(
            (op) => op.label === filter.operator
        );

        // Handle BETWEEN operator for date ranges
        if (filter.operator === 'DATE_BETWEEN' && Array.isArray(filter.value)) {
            const [min, max] = filter.value;
            return [
                {
                    field: filter.field,
                    operator: 'BETWEEN',
                    value: [
                        formatDateToYYYYMMDD(min),
                        formatDateToYYYYMMDD(max)
                    ],
                    type: filter.boolean
                }
            ];
        }

        // Handle ON_DATE operator for single date
        if (filter.operator === 'ON_DATE') {
            return [
                {
                    field: filter.field,
                    operator: '=',
                    value: formatDateToYYYYMMDD(filter.value),
                    type: filter.boolean
                }
            ];
        }

        // Handle BEFORE_DATE operator
        if (filter.operator === 'BEFORE_DATE') {
            return [
                {
                    field: filter.field,
                    operator: '<',
                    value: formatDateToYYYYMMDD(filter.value),
                    type: filter.boolean
                }
            ];
        }

        // Handle AFTER_DATE operator
        if (filter.operator === 'AFTER_DATE') {
            return [
                {
                    field: filter.field,
                    operator: '>',
                    value: formatDateToYYYYMMDD(filter.value),
                    type: filter.boolean
                }
            ];
        }

        // Handle IS_WITHIN operator for relative date ranges
        if (filter.operator === 'IS_WITHIN') {
            filter.operator = filter.value.id;
            filter.value = null;
        }

        // Handle BETWEEN operator for multi-select values
        if (filter.operator === 'BETWEEN' && Array.isArray(filter.value)) {
            const [min, max] = filter.value;
            return [
                {
                    field: filter.field,
                    operator: '>=',
                    value: min,
                    type: filter.boolean
                },
                {
                    field: filter.field,
                    operator: '<=',
                    value: max,
                    type: filter.boolean
                }
            ];
        }

        // Handle multi-select values
        if (
            (filter.operator === 'in' || filter.operator === 'not in') &&
            Array.isArray(filter.value)
        ) {
            filter.value = filter.value.map((item) =>
                item.id ? item.id : item
            );
        }

        // Handle equals operator
        if (filter.operator === 'EQUAL') {
            filter.operator = '=';
        }

        // Default: normal operator replacement
        return [
            {
                field: filter.field,
                operator: matchedOp?.value ?? filter.operator,
                value: filter.value,
                type: filter.boolean
            }
        ];
    });
};
