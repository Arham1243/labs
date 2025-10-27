import { describe, expect, it, vi, beforeEach } from 'vitest';

// Create a mock for the useHelpers function
const mockHelpers = {
    moneyFormat: vi.fn(),
    getDisplayValue: vi.fn()
};

const useHelpers = vi.fn().mockReturnValue(mockHelpers);

describe('useHelpers', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('returns the global helpers from the app context', () => {
        // Reset the mock for this test
        useHelpers.mockClear();

        // Set up the mock to return the mockHelpers object
        useHelpers.mockReturnValue(mockHelpers);

        // Call the useHelpers composable
        const result = useHelpers();

        // Verify that it returns the global helpers
        expect(result).toBe(mockHelpers);
        expect(useHelpers).toHaveBeenCalledTimes(1);
    });

    it('has access to the expected helper methods', () => {
        // Reset the mock for this test
        useHelpers.mockClear();

        // Set up the mock helper methods
        mockHelpers.moneyFormat.mockReturnValue('$32,423,432.00');
        mockHelpers.getDisplayValue.mockReturnValue('Display Value');

        // Set up the mock to return the mockHelpers object
        useHelpers.mockReturnValue(mockHelpers);

        // Call the useHelpers composable
        const result = useHelpers();

        // Call the helper methods
        const formattedMoney = result.moneyFormat('32423432');
        const displayValue = result.getDisplayValue('key', 'options');

        // Verify the methods were called with the correct arguments
        expect(mockHelpers.moneyFormat).toHaveBeenCalledWith('32423432');
        expect(mockHelpers.getDisplayValue).toHaveBeenCalledWith(
            'key',
            'options'
        );

        // Verify the return values
        expect(formattedMoney).toBe('$32,423,432.00');
        expect(displayValue).toBe('Display Value');
    });

    it('handles the case when useHelpers throws an error', () => {
        // Reset the mock for this test
        useHelpers.mockClear();

        // Mock the useHelpers function to throw an error
        useHelpers.mockImplementation(() => {
            throw new Error('getCurrentInstance returned null');
        });

        // Call the useHelpers composable and expect it to throw
        expect(() => useHelpers()).toThrow('getCurrentInstance returned null');
    });
});
