import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import AddDependent from '@/modules/policies/components/insureds/AddDependent.vue';

describe('Insured Add Dependent Dialog', () => {
    it('renders correctly default', async () => {
        const wrapper = mount(AddDependent);
        const dependentDropDown = wrapper.findByTestId('dependent-select');
        const policyDropDown = wrapper.findByTestId('insured-policy-select');
        const planDropDown = wrapper.findByTestId('dependent-plan-select');
        const relationDropDown = wrapper.findByTestId(
            'dependent-relation-select'
        );

        expect(dependentDropDown.exists()).toBe(true);
        expect(policyDropDown.exists()).toBe(false);
        expect(planDropDown.exists()).toBe(false);
        expect(relationDropDown.exists()).toBe(false);
    });

    it('renders correctly with dependent Selections', async () => {
        const wrapper = mount(AddDependent, {
            props: {
                insured: {
                    id: '10001'
                },
                dependent: {
                    dependent_id: '10002',
                    parent_policy_id: '20001'
                }
            }
        });

        const dependentDropDown = wrapper.findByTestId('dependent-select');
        const policyDropDown = wrapper.findByTestId('insured-policy-select');
        const planDropDown = wrapper.findByTestId('dependent-plan-select');
        const relationDropDown = wrapper.findByTestId(
            'dependent-relation-select'
        );

        expect(dependentDropDown.exists()).toBe(true);
        expect(policyDropDown.exists()).toBe(true);
        expect(planDropDown.exists()).toBe(true);
        expect(relationDropDown.exists()).toBe(true);
    });
});
