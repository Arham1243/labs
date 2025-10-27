import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import BenefitOverlay from '@/modules/claims/components/benefits/BenefitOverlay.vue';

describe('BenefitOverlay', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = mount(BenefitOverlay, {
            props: {}
        });
    });

    it('component renders correctly', () => {
        expect(wrapper.findByTestId('label-benefit-details').text()).toBe(
            'Benefit Details'
        );
    });
});
