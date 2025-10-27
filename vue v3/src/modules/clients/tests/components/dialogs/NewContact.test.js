import { describe, expect, it, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import NewContact from '@/modules/clients/components/dialogs/NewContact.vue';
import { searchContactTypesMock } from '@/../tests/mocks/Common.service.mocks';

describe('NewContact', () => {
    beforeEach(() => {
        searchContactTypesMock();
    });

    it('component renders correctly', async () => {
        const wrapper = mount(NewContact, {
            props: {
                modelValue: false
            }
        });

        expect(wrapper.findComponent({ name: 'Dialog' }).exists()).toBe(true);
    });
});
