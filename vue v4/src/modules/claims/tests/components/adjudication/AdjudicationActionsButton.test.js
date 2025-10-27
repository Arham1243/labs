import { describe, beforeEach, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import Button from 'primevue/button';
import Menu from 'primevue/menu';

import AdjudicationActionsButton from '@/modules/claims/components/adjudication/AdjudicationActionsButton.vue';

// Mock dialog to avoid complexity
vi.mock(
    '@/modules/claims/components/adjudication/AdjudicationConfirmDialog.vue',
    () => ({
        default: {
            name: 'AdjudicationConfirmDialog',
            props: ['visible', 'mode', 'queue'],
            emits: ['confirm'],
            template: '<div class="mock-dialog" />'
        }
    })
);

describe('AdjudicationActionsButton.vue', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = mount(AdjudicationActionsButton, {
            props: {
                data: {
                    id: 1,
                    status: 'draft'
                },
                index: 1,
                buttonOutline: false
            },
            global: {
                plugins: [PrimeVue],
                components: {
                    Button,
                    Menu
                }
            }
        });
    });

    it('renders the action button', () => {
        const button = wrapper.find('[data-testid="actions-button-1"]');
        expect(button.exists()).toBe(true);
        expect(button.text().toLowerCase()).toContain('actions');
    });

    it('calls showActions and opens menu without error', async () => {
        const button = wrapper.find('[data-testid="actions-button-1"]');
        await button.trigger('click');

        // Ensure it updated menuItems with proper actions
        const menuItems = wrapper.vm.menuItems;
        expect(menuItems.length).toBe(2);
        expect(menuItems[0].label).toBe('Delete');
        expect(menuItems[1].label).toBe('Activate');

        // The toggle() method should be callable now without throwing
        expect(wrapper.vm.menuRef?.toggle).toBeTypeOf('function');
    });

    it('opens dialog with correct mode when menu item is clicked', async () => {
        // Simulate manually triggering command (bypassing real Menu click)
        wrapper.vm.openDialog('delete');
        expect(wrapper.vm.dialogState.visible).toBe(true);
        expect(wrapper.vm.dialogState.mode).toBe('delete');
    });

    it('hides dialog on confirm', async () => {
        wrapper.vm.dialogState.visible = true;
        await wrapper.vm.handleConfirm();
        expect(wrapper.vm.dialogState.visible).toBe(false);
    });
});
