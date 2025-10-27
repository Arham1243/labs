import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ClientContactDetails from '@/modules/clients/components/ClientContactDetails.vue';
import { getContactTypesMock } from '@/modules/clients/tests/mocks/Client.service.mocks';
import { searchContactTypesMock } from '@/../tests/mocks/Common.service.mocks';
import { ref } from 'vue';
import { updateAbility } from '@/plugins/ability';

vi.mock('@/modules/clients/composables/useEditState', () => ({
    useEditState: () => ({
        activeEditComponent: ref(null),
        showUnsavedDialog: ref(false),
        setActiveComponent: vi.fn(),
        clearActiveComponent: vi.fn(),
        handleUnsavedChanges: vi.fn(),
        confirmDiscard: vi.fn(),
        cancelDiscard: vi.fn()
    })
}));

describe('ClientContactDetails', () => {
    beforeEach(() => {
        searchContactTypesMock();
    });

    it('component renders correctly', async () => {
        updateAbility(['create clients']);
        const wrapper = mount(ClientContactDetails, {
            props: {
                data: []
            }
        });

        expect(wrapper.findByTestId('contacts-title').text()).toBe('Contacts');

        expect(
            wrapper
                .findComponent({
                    name: 'NewContact',
                    props: { variant: 'client' }
                })
                .exists()
        ).toBe(true);
    });
});
