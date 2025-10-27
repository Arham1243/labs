import { describe, expect, it, vi, beforeEach } from 'vitest';
import useCoverageRestrictionBus from '@/composables/coverage-restriction';
import { useHelpers } from '@/composables';

// Mock the config values
vi.mock('@/config', () => ({
    ruleTimeline: [
        { key: 'month', value: 'Month' },
        { key: 'year', value: 'Year' }
    ],
    ruleSupply: [
        { key: 'visits', value: 'Visits' },
        { key: 'prescriptions', value: 'Prescriptions' }
    ]
}));

// Mock the useHelpers composable
vi.mock('@/composables', () => ({
    useHelpers: vi.fn()
}));

describe('useCoverageRestrictionBus', () => {
    beforeEach(() => {
        vi.resetAllMocks();

        // Setup the mock implementation for useHelpers
        useHelpers.mockReturnValue({
            getDisplayValue: vi.fn((key, options) => {
                // Simple mock implementation that returns the value for the key
                const option = options.find((opt) => opt.key === key);
                return option ? option.value : key;
            })
        });
    });

    it('returns an object with the expected methods', () => {
        const coverageRestriction = useCoverageRestrictionBus();

        expect(coverageRestriction).toBeDefined();
        expect(typeof coverageRestriction.generateRuleString).toBe('function');
    });

    it('returns "None" for empty or non-array input', () => {
        const coverageRestriction = useCoverageRestrictionBus();

        expect(coverageRestriction.generateRuleString([])).toBe('None');
        expect(coverageRestriction.generateRuleString(null)).toBe('None');
        expect(coverageRestriction.generateRuleString(undefined)).toBe('None');
        expect(coverageRestriction.generateRuleString('not an array')).toBe(
            'None'
        );
    });

    it('generates a rule string for a single rule without join_type', () => {
        const coverageRestriction = useCoverageRestrictionBus();
        const mockHelpers = useHelpers();

        // Setup specific mock returns for this test
        mockHelpers.getDisplayValue
            .mockReturnValueOnce('Visits') // For supply
            .mockReturnValueOnce('Month'); // For timeline

        const rules = [
            {
                value: 10,
                supply: 'visits',
                timeline_unit: 1,
                timeline: 'month'
            }
        ];

        const result = coverageRestriction.generateRuleString(rules);

        expect(result).toBe('10 Visits every 1 Month');
        expect(mockHelpers.getDisplayValue).toHaveBeenCalledTimes(2);
        expect(mockHelpers.getDisplayValue).toHaveBeenCalledWith(
            'visits',
            expect.any(Array)
        );
        expect(mockHelpers.getDisplayValue).toHaveBeenCalledWith(
            'month',
            expect.any(Array)
        );
    });

    it('generates a rule string for a single rule with join_type', () => {
        const coverageRestriction = useCoverageRestrictionBus();
        const mockHelpers = useHelpers();

        // Setup specific mock returns for this test
        mockHelpers.getDisplayValue
            .mockReturnValueOnce('Prescriptions') // For supply
            .mockReturnValueOnce('Year'); // For timeline

        const rules = [
            {
                value: 5,
                supply: 'prescriptions',
                timeline_unit: 2,
                timeline: 'year',
                join_type: 'AND'
            }
        ];

        const result = coverageRestriction.generateRuleString(rules);

        expect(result).toBe('5 Prescriptions every 2 Year AND');
        expect(mockHelpers.getDisplayValue).toHaveBeenCalledTimes(2);
        expect(mockHelpers.getDisplayValue).toHaveBeenCalledWith(
            'prescriptions',
            expect.any(Array)
        );
        expect(mockHelpers.getDisplayValue).toHaveBeenCalledWith(
            'year',
            expect.any(Array)
        );
    });

    it('generates a rule string for multiple rules', () => {
        const coverageRestriction = useCoverageRestrictionBus();
        const mockHelpers = useHelpers();

        // Setup specific mock returns for this test
        mockHelpers.getDisplayValue
            .mockReturnValueOnce('Visits') // For first rule supply
            .mockReturnValueOnce('Month') // For first rule timeline
            .mockReturnValueOnce('Prescriptions') // For second rule supply
            .mockReturnValueOnce('Year'); // For second rule timeline

        const rules = [
            {
                value: 10,
                supply: 'visits',
                timeline_unit: 1,
                timeline: 'month',
                join_type: 'OR'
            },
            {
                value: 5,
                supply: 'prescriptions',
                timeline_unit: 2,
                timeline: 'year'
            }
        ];

        const result = coverageRestriction.generateRuleString(rules);

        expect(result).toBe(
            '10 Visits every 1 Month OR 5 Prescriptions every 2 Year'
        );
        expect(mockHelpers.getDisplayValue).toHaveBeenCalledTimes(4);
    });

    it('handles null join_type correctly', () => {
        const coverageRestriction = useCoverageRestrictionBus();
        const mockHelpers = useHelpers();

        // Setup specific mock returns for this test
        mockHelpers.getDisplayValue
            .mockReturnValueOnce('Visits') // For supply
            .mockReturnValueOnce('Month'); // For timeline

        const rules = [
            {
                value: 10,
                supply: 'visits',
                timeline_unit: 1,
                timeline: 'month',
                join_type: null
            }
        ];

        const result = coverageRestriction.generateRuleString(rules);

        expect(result).toBe('10 Visits every 1 Month');
        expect(mockHelpers.getDisplayValue).toHaveBeenCalledTimes(2);
    });
});
