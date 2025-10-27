import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import NewBusinessUnit from '@/modules/clients/components/dialogs/NewBusinessUnit.vue';
import { searchClientsMock } from '@/modules/clients/tests/mocks/Client.service.mocks';

describe('NewBusinessUnit', () => {
    beforeEach(() => {
        searchClientsMock();
    });

    it('component renders correctly', async () => {
        const wrapper = mount(NewBusinessUnit, {
            props: {
                modelValue: true
            }
        });

        expect(wrapper.findComponent({ name: 'Dialog' }).exists()).toBe(true);
    });
});
