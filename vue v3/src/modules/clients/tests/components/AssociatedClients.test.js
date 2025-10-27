import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import AssociatedClients from '@/modules/clients/components/AssociatedClients.vue';
import { ref } from 'vue';

// Mock the entire composable
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

describe('AssociatedClients', () => {
    it('component renders correctly', async () => {
        const wrapper = mount(AssociatedClients, {
            props: {
                data: {}
            }
        });

        expect(
            wrapper.findByTestId('associated-client-details-title').text()
        ).toBe('Associated Client Details');

        expect(wrapper.findByTestId('edit-button').text()).toBe('Edit');

        expect(
            wrapper
                .findComponent({
                    name: 'ClientReassignmentWarningConfirmation'
                })
                .exists()
        ).toBe(true);
    });
});
