import { describe, expect, it } from 'vitest';
import { resolveComponent } from 'vue';
import InsuredOverview from '@/modules/policies/components/insureds/Overview.vue';

describe('Insured Overview Component Registration', () => {
    it('verifies child components are registered', () => {
        expect(resolveComponent('Details')).toBeTruthy();
        expect(resolveComponent('Address')).toBeTruthy();
        expect(resolveComponent('Settings')).toBeTruthy();
        expect(resolveComponent('OtherDetails')).toBeTruthy();
    });
});
