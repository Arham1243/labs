import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import Beneficiaries from '@/modules/policies/components/insureds/Beneficiaries.vue';
import { updateAbility } from '@/plugins/ability';
import { PolicyModulePermission } from '@/config';

describe('Insured Add Dependent Dialog', () => {
    it('renders correctly default', async () => {
        updateAbility([PolicyModulePermission.INSUREDS.BENEFICIARIES.CREATE]);

        const wrapper = mount(Beneficiaries, {
            props: {
                insured: {
                    id: '10001'
                }
            }
        });
        const button = wrapper.findByTestId('new-beneficiary-button');

        expect(button.exists()).toBe(true);
    });
});
