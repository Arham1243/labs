import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import ExpenseForm from '@/modules/claims/components/expenses/ExpenseForm.vue';

describe('ExpenseForm', () => {
    it('component renders correctly', () => {
        const wrapper = mount(ExpenseForm, {
            props: {}
        });

        expect(wrapper.findByTestId('label-service-date').exists()).toBe(true);
        expect(wrapper.findByTestId('date-picker-service-date').exists()).toBe(
            true
        );

        expect(wrapper.findByTestId('label-received-date').exists()).toBe(true);
        expect(wrapper.findByTestId('date-picker-received-date').exists()).toBe(
            true
        );

        // expect(wrapper.findByTestId('label-benefit-code').exists()).toBe(true);
        // expect(wrapper.findByTestId('dropdown-benefit-code').exists()).toBe(
        //     true
        // );

        // expect(wrapper.findByTestId('label-benefit').exists()).toBe(true);
        // expect(wrapper.findByTestId('input-benefit').exists()).toBe(true);

        expect(wrapper.findByTestId('label-insured-notes').exists()).toBe(true);
        expect(wrapper.findByTestId('textarea-insured-notes').exists()).toBe(
            true
        );

        expect(wrapper.findByTestId('label-diagnosis').exists()).toBe(true);
        expect(wrapper.findByTestId('input-diagnosis').exists()).toBe(true);

        expect(wrapper.findByTestId('label-expense-amt').exists()).toBe(true);
        expect(wrapper.findByTestId('input-expense-amt').exists()).toBe(true);

        // expect(wrapper.findByTestId('label-beneficiary').exists()).toBe(true);
        // expect(wrapper.findByTestId('dropdown-beneficiary').exists()).toBe(
        //     true
        // );

        expect(wrapper.findByTestId('label-attachment').exists()).toBe(true);
        expect(wrapper.findByTestId('upload-attachment').exists()).toBe(true);

        expect(wrapper.findByTestId('btn-expense-form-cancel').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('btn-save-new-expense').exists()).toBe(
            true
        );
    });
});
