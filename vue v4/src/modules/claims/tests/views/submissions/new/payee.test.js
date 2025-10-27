import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import PayeeView from '@/modules/claims/views/submissions/new/payee.vue';
import { insuredMock } from '@/modules/claims/tests/mocks/General.service.mock';

vi.mock('@/modules/claims/stores/Insured', () => ({
    useClaimInsuredStore: vi.fn(() => ({
        currentInsured: {
            value: insuredMock
        }
    }))
}));

describe('PayeeView', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = mount(PayeeView);
    });

    it('component renders correctly', () => {
        expect(wrapper.findByTestId('label-step-select-payee').text()).toBe(
            'Select Payee'
        );
        expect(
            wrapper
                .findByTestId('text-Has the service already been paid for?')
                .text()
        ).toBe('Has the service already been paid for? *');
        expect(wrapper.findByTestId('label-payee_select_yes').exists()).toBe(
            true
        );
    });
});
