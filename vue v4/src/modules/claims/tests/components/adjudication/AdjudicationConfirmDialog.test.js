import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import AdjudicationConfirmDialog from '@/modules/claims/components/adjudication/AdjudicationConfirmDialog.vue';
import { useAdjudicationQueueStoreMock } from '@/modules/claims/tests/mocks/Adjudication.service.mock';

vi.mock('@/modules/claims/stores/AdjudicationQueue', () => ({
    useAdjudicationQueueStore: vi.fn(() => ({
        ...useAdjudicationQueueStoreMock()
    }))
}));

describe('AdjudicationConfirmDialog', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = mount(AdjudicationConfirmDialog, {
            props: {
                queue: {
                    id: 1,
                    name: 'Test Queue',
                    status: 'inactive'
                },
                mode: 'active'
            },
            global: {
                stubs: {
                    teleport: true
                }
            }
        });

        // Set visible to true to open the dialog
        wrapper.vm.visible = true;
    });

    it('Dialog header renders correctly', () => {
        expect(wrapper.find('.p-dialog-title').text()).toBe(
            'Activate Auto Adjudication Queue'
        );
    });

    it('Dialog body renders correctly', () => {
        expect(wrapper.findByTestId('dialog-content').text()).toBe(
            'Are you sure you want to activate the queue Test Queue?'
        );

        expect(wrapper.findByTestId('cancel-button').text()).toBe('Cancel');

        expect(wrapper.findByTestId('active-button').text()).toBe('Activate');
    });
});
