import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import DependantSettings from '@/modules/plans/components/plans/associated/DependantSettings.vue';
import * as AssociatedPlanStore from '@/modules/plans/stores/AssociatedPlan';
import { ref } from 'vue';

vi.mock('@/modules/plans/composables/useEditState', () => ({
    useEditState: () => ({
        activeEditComponent: ref(null),
        showUnsavedDialog: ref(false),
        setActiveComponent: vi.fn(),
        clearActiveComponent: vi.fn(),
        handleUnsavedChanges: vi.fn(),
        confirmDiscard: vi.fn(),
        cancelDiscard: vi.fn(),
        registerCancelCallback: vi.fn(),
        unregisterCancelCallback: vi.fn(),
        triggerCancelEdit: vi.fn()
    })
}));

const mockData = {
    id: '1',
    dependantsSetting: {
        max_num_of_dependants: 5,
        apply_pricing_discount: 1,
        enforce_start_date: 1,
        enforce_end_date: 0,
        pricing_discounts: []
    }
};

vi.mock('@/modules/plans/stores/AssociatedPlan');
vi.mock('@/composables/event-bus', () => ({
    default: () => ({ emit: vi.fn() })
}));

vi.mock(
    '@/modules/plans/components/plans/associated/forms/PlanDependantSettingsForm.vue',
    () => ({
        default: {
            name: 'PlanDependantSettingsForm',
            template: '<div>Mock Form</div>',
            props: ['modelValue'],
            emits: ['update:modelValue']
        }
    })
);

describe('DependantSettings', () => {
    let wrapper;
    const mockUpdateSettings = vi.fn().mockResolvedValue({});

    beforeEach(() => {
        vi.mocked(AssociatedPlanStore.useAssociatedPlanStore).mockReturnValue({
            updateAssociatedPlanDependantsSettings: mockUpdateSettings,
            currentPlan: { id: '1' },
            transferDependantSettingsObject: vi.fn().mockReturnValue({}),
            transferDependantSettingsPayload: vi.fn().mockReturnValue({})
        });

        wrapper = mount(DependantSettings, {
            props: {
                data: mockData,
                planDetails: {},
                isNew: false,
                plan: 'test-plan'
            },
            global: {
                mocks: {
                    $t: (msg) => msg
                },
                stubs: {
                    Button: true,
                    Confirmation: true
                }
            }
        });
    });

    it('should render edit button when not editing', () => {
        const editButton = wrapper.find('[data-testid="edit-button"]');
        expect(editButton.exists()).toBe(true);
    });

    it('should show save and cancel buttons when editing', async () => {
        await wrapper.find('[data-testid="edit-button"]').trigger('click');
        expect(wrapper.find('[data-testid="save-button"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="cancel-button"]').exists()).toBe(
            true
        );
    });

    it('should disable save button when no changes made', async () => {
        await wrapper.find('[data-testid="edit-button"]').trigger('click');
        expect(
            wrapper.find('[data-testid="save-button"]').attributes('disabled')
        ).toBeDefined();
    });

    it('should call updateAssociatedPlanDependantsSettings when saving', async () => {
        await wrapper.find('[data-testid="edit-button"]').trigger('click');

        const form = wrapper.findComponent({
            name: 'PlanDependantSettingsForm'
        });
        await form.vm.$emit('update:modelValue', {
            max_num_of_dependants: 6,
            apply_pricing_discount: 1,
            enforce_start_date: 1,
            enforce_end_date: 0,
            pricing_discounts: []
        });

        await wrapper.find('[data-testid="save-button"]').trigger('click');
        await vi.waitFor(() => {
            expect(mockUpdateSettings).toHaveBeenCalled();
        });
    });

    it('should show confirmation dialog when canceling with changes', async () => {
        await wrapper.find('[data-testid="edit-button"]').trigger('click');

        const form = wrapper.findComponent({
            name: 'PlanDependantSettingsForm'
        });
        await form.vm.$emit('update:modelValue', {
            max_num_of_dependants: 6
        });

        await wrapper.find('[data-testid="cancel-button"]').trigger('click');
    });
});
