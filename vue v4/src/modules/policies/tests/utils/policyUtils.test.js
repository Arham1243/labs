import { maskPolicyNumber } from '@/modules/policies/utils/policyUtils.js';

describe('maskPolicyNumber', () => {
    it('should mask the policy number with POL- prefix correctly', () => {
        const result = maskPolicyNumber('POL-12345678');
        expect(result).toBe('12****78');
    });

    it('should mask the policy number with POL prefix correctly', () => {
        const result = maskPolicyNumber('POL12345678');
        expect(result).toBe('12****78');
    });

    it('should mask the policy number without POL prefix correctly', () => {
        const result = maskPolicyNumber('12345678');
        expect(result).toBe('45*78');
    });
});
