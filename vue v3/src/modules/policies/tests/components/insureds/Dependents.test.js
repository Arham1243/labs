import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import Dependents from '@/modules/policies/components/insureds/Dependents.vue';

describe('Insured Dependent Beneficiary Details', () => {
    it('renders correctly', async () => {
        const wrapper = mount(Dependents, {
            props: {
                insured: {
                    dependents: [
                        {
                            first_name: 'test',
                            last_name: 'test',
                            date_of_birth: new Date(),
                            relation: 'parent'
                        }
                    ]
                }
            }
        });

        const list = wrapper.findByTestId('insured-dependents');
        expect(list.exists()).toBe(true);
    });
});
