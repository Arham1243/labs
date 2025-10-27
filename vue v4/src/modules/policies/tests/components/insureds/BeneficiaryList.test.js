import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import Beneficiaries from '@/modules/policies/components/insureds/Beneficiaries.vue';

describe('Insured Add Dependent Dialog', () => {
    it('renders correctly default', async () => {
        const wrapper = mount(Beneficiaries, {
            props: {
                insured: {
                    id: '10001',
                    beneficiaries: [
                        {
                            id: '10001',
                            meta: {
                                first_name: 'test',
                                last_name: 'test',
                                date_of_birth: new Date(),
                                relation: 'parent'
                            }
                        },
                        {
                            id: '10002',
                            meta: {
                                first_name: 'test',
                                last_name: 'test',
                                date_of_birth: new Date(),
                                relation: 'parent'
                            }
                        },
                        {
                            id: '10003',
                            meta: {
                                first_name: 'test',
                                last_name: 'test',
                                date_of_birth: new Date(),
                                relation: 'parent'
                            }
                        }
                    ]
                }
            }
        });

        const button = wrapper.findByTestId('beneficiaries-more-button');
        const list = wrapper.findByTestId('insured-beneficiaries');

        expect(button.exists()).toBe(true);
        expect(list.exists()).toBe(true);
    });
});
