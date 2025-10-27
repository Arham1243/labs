import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import AddBenefits from '@/modules/plans/views/plans/associated/new/add-benefits.vue';
import * as AssociatedPlanStore from '@/modules/plans/stores/AssociatedPlan';

// Mock the AssociatedPlanStore
vi.mock('@/modules/plans/stores/AssociatedPlan', () => ({
    useAssociatedPlanStore: vi.fn()
}));

// Mock the router
const mockPush = vi.fn();
vi.mock('vue-router', () => ({
    useRouter: () => ({
        push: mockPush
    })
}));

// Mock the event bus
const mockBusGet = vi.fn();
const mockBusSet = vi.fn();
vi.mock('@/composables/event-bus', () => ({
    default: () => ({
        bus: {
            value: {
                get: mockBusGet,
                set: mockBusSet
            }
        }
    })
}));

// Mock the AttachBenefitInit component
vi.mock(
    '@/modules/plans/components/shared/AttachBenefit/AttachBenefitInit.vue',
    () => ({
        default: {
            name: 'AttachBenefitInit',
            template: '<div>Mock AttachBenefitInit</div>',
            props: {
                isNew: Boolean,
                isCopy: Boolean,
                id: String,
                title: String,
                store: Object,
                componentId: String
            }
        }
    })
);

// Mock the SyncPricesDialog component
vi.mock(
    '@/modules/plans/components/shared/AttachBenefit/dialogs/SyncPricesDialog.vue',
    () => ({
        default: {
            name: 'SyncPricesDialog',
            template: '<div>Mock SyncPricesDialog</div>',
            props: ['modelValue'],
            emits: ['update:modelValue']
        }
    })
);

describe('AddBenefits', () => {
    let wrapper;
    const mockGetPlan = vi.fn().mockResolvedValue({
        data: {
            id: 'test-id',
            accepted_statement_of_suitability: false
        }
    });
    const mockSetCurrentPlan = vi.fn();
    const mockAcceptAgreement = vi.fn();

    beforeEach(async () => {
        vi.clearAllMocks();

        // Mock the AssociatedPlanStore
        vi.mocked(AssociatedPlanStore.useAssociatedPlanStore).mockReturnValue({
            getPlan: mockGetPlan,
            setCurrentPlan: mockSetCurrentPlan,
            acceptAgreement: mockAcceptAgreement,
            currentPlan: {
                accepted_statement_of_suitability: false
            }
        });

        // Mock the bus.get for openSyncPricesDialog
        mockBusGet.mockReturnValue(null);

        wrapper = mount(AddBenefits, {
            props: {
                id: 'test-id',
                plan: 'test-plan'
            },
            global: {
                stubs: {
                    Card: {
                        template: '<div><slot name="content"></slot></div>'
                    },
                    Button: {
                        template:
                            '<button :data-testid="$attrs[\'data-testid\']" @click="$emit(\'click\')"><slot /></button>',
                        props: ['label', 'icon', 'iconPos', 'class'],
                        emits: ['click'],
                        inheritAttrs: false
                    },
                    InputField: {
                        template:
                            '<input :data-testid="$attrs[\'data-testid\']" type="checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />',
                        props: ['id', 'variant', 'binary', 'modelValue'],
                        emits: ['update:modelValue'],
                        inheritAttrs: false
                    },
                    Dialog: {
                        template:
                            '<div v-if="visible"><div>{{ header }}</div><slot /><div><slot name="footer" /></div></div>',
                        props: ['visible', 'header', 'style'],
                        emits: ['update:visible']
                    }
                },
                mocks: {
                    $t: (key) => key
                }
            }
        });

        await nextTick();
    });

    it('renders the component', () => {
        expect(wrapper.exists()).toBe(true);
    });

    it('calls getPlan and setCurrentPlan on mount', () => {
        expect(mockGetPlan).toHaveBeenCalledWith('test-plan', 'test-id', {
            include: 'authorized',
            aggregates: [
                { relation: 'benefits', type: 'count' },
                { relation: 'benefitGroupBenefits', type: 'count' }
            ]
        });
        expect(mockSetCurrentPlan).toHaveBeenCalled();
    });

    it('renders the AttachBenefitInit component', () => {
        const attachBenefitInit = wrapper.findComponent({
            name: 'AttachBenefitInit'
        });
        expect(attachBenefitInit.exists()).toBe(true);
        expect(attachBenefitInit.props('id')).toBe('test-id');
        expect(attachBenefitInit.props('isNew')).toBe(true);
        expect(attachBenefitInit.props('isCopy')).toBe(true);
    });

    it('renders the statement of suitability checkbox', () => {
        const checkbox = wrapper.find(
            '[data-testid="statement-of-suitability-input"]'
        );
        expect(checkbox.exists()).toBe(true);
    });

    it('renders the back button', () => {
        const backButton = wrapper.find('[data-testid="back-button"]');
        expect(backButton.exists()).toBe(true);
    });

    it('renders the save and continue button', () => {
        const saveButton = wrapper.find('[data-testid="save-continue-button"]');
        expect(saveButton.exists()).toBe(true);
    });

    it('navigates back when back button is clicked', async () => {
        const backButton = wrapper.find('[data-testid="back-button"]');
        await backButton.trigger('click');

        expect(mockPush).toHaveBeenCalledWith({ name: 'New Associated Plan' });
    });

    it('shows missing checked dialog when save button is clicked without checking the statement', async () => {
        const saveButton = wrapper.find('[data-testid="save-continue-button"]');
        await saveButton.trigger('click');

        expect(wrapper.vm.isMissingCheckedDialog).toBe(true);
    });

    it('accepts agreement and navigates to next step when save button is clicked with statement checked', async () => {
        // Check the statement checkbox
        wrapper.vm.isChecked = true;
        await nextTick();

        const saveButton = wrapper.find('[data-testid="save-continue-button"]');
        await saveButton.trigger('click');

        expect(mockAcceptAgreement).toHaveBeenCalledWith('test-id');
        expect(mockPush).toHaveBeenCalledWith({
            name: 'New Associated Plan Step 3',
            params: { id: 'test-id' }
        });
    });

    it('shows statement dialog when info icon is clicked', async () => {
        const infoIcon = wrapper.find('.pi-info-circle');
        await infoIcon.trigger('click');

        expect(wrapper.vm.isStatementDialog).toBe(true);
    });

    it('checks statement and continues when agree button is clicked in statement dialog', async () => {
        // Open the statement dialog
        wrapper.vm.isStatementDialog = true;
        await nextTick();

        // Find the agree and continue button in the dialog
        // Since we're using a stub for Dialog, we need to directly call the method
        // that would be triggered by the button click
        wrapper.vm.agreeAndContinue();
        await nextTick();

        expect(wrapper.vm.isChecked).toBe(true);
        expect(wrapper.vm.isStatementDialog).toBe(false);
        expect(mockAcceptAgreement).toHaveBeenCalledWith('test-id');
        expect(mockPush).toHaveBeenCalledWith({
            name: 'New Associated Plan Step 3',
            params: { id: 'test-id' }
        });
    });
});
