import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';

import BenefitGroupDetails from '@/modules/plans/views/benefit-groups/new/benefit-group-details.vue';
import BenefitGroupsDetailsForm from '@/modules/plans/components/benefit-groups/forms/BenefitGroupsDetailsForm.vue';

describe('Benefit groups new details view', () => {
    it('page renders correctly', () => {
        // Preparation Parent component
        const wrapper = mount(BenefitGroupDetails, {
            props: {
                id: '-1'
            }
        });
        const pageTitle = wrapper.findByTestId('page-title');
        const buttonCancel = wrapper.findByTestId('cancel-button');
        const buttonSaveAndContinue = wrapper.findByTestId(
            'save-continue-button'
        );

        // Preparation Child Component
        const benefitGroupsDetailsForm = wrapper.findComponent(
            BenefitGroupsDetailsForm,
            {
                props: {
                    modelValue: {},
                    isNew: true
                }
            }
        );
        const inputName = benefitGroupsDetailsForm.findByTestId('input-name');
        const inputCoverage =
            benefitGroupsDetailsForm.findByTestId('input-coverage');
        const inputMaxAmount =
            benefitGroupsDetailsForm.findByTestId('input-max-amount');
        const inputEffectiveDate = benefitGroupsDetailsForm.findByTestId(
            'input-effective-date'
        );
        const inputEndDate =
            benefitGroupsDetailsForm.findByTestId('input-end-date');

        // Assertion parent component
        expect(pageTitle.exists()).toBe(true);
        expect(buttonCancel.exists()).toBe(true);
        expect(buttonSaveAndContinue.exists()).toBe(true);
        expect(pageTitle.text()).toBe('Benefit Group Details');
        expect(buttonCancel.text()).toBe('Cancel');
        expect(buttonSaveAndContinue.text()).toBe('Save & Continue');

        // Assertion child component
        expect(benefitGroupsDetailsForm.exists()).toBe(true);
        expect(inputName.exists()).toBe(true);
        expect(inputName.element.type).toBe('text');
        expect(inputCoverage.exists()).toBe(true);
        expect(inputMaxAmount.exists()).toBe(true);
        expect(inputEffectiveDate.exists()).toBe(true);
        expect(inputEndDate.exists()).toBe(true);
    });
});
