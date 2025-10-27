import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import DiagnosisCard from '@/modules/claims/components/expenses/details/card/DiagnosisCard.vue';
import { mountUserMock } from '@/modules/claims/tests/mocks/User.mock';
import { expenseStoreMock } from '@/modules/claims/tests/mocks/Expense.service.mock';

vi.mock('@/modules/claims/stores/Expense', () => ({
    useExpenseStore: vi.fn(() => expenseStoreMock())
}));

describe('DiagnosisCard', () => {
    let wrapper;
    beforeEach(() => {
        wrapper = mount(DiagnosisCard, {
            ...mountUserMock,
            props: {
                clientId: 123456789
            }
        });
    });

    it('component renders correctly', async () => {
        expect(wrapper.findByTestId('btn-show-diagnosis').exists()).toBe(true);
        expect(wrapper.findByTestId('title-diagnosis').text()).toBe(
            'Diagnosis'
        );

        expect(wrapper.findByTestId('input-diagnosis').exists()).toBe(true);
    });
});
