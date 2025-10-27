import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import BusinessUnits from '@/modules/clients/components/BusinessUnits.vue';
import { searchClientsMock } from '@/modules/clients/tests/mocks/Client.service.mocks';
import { updateAbility } from '@/plugins/ability';

describe('BusinessUnits', () => {
    beforeEach(() => {
        searchClientsMock();
        updateAbility(['create business units']);
    });

    it('component renders correctly', async () => {
        const wrapper = mount(BusinessUnits, {
            props: {
                data: []
            }
        });

        expect(wrapper.findByTestId('new-business-unit-button').text()).toBe(
            'New Business Unit'
        );

        expect(
            wrapper.findComponent({ name: 'NewBusinessUnit' }).exists()
        ).toBe(true);
        expect(wrapper.findComponent({ name: 'Menu' }).exists()).toBe(true);

        expect(
            wrapper.findAllComponents({ name: 'Confirmation' })
        ).toHaveLength(3);
    });
});
