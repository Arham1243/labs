import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import PricingView from '@/modules/plans/views/plans/associated/new/pricing.vue';
import { useAssociatedPlanStore } from '@/modules/plans/stores/AssociatedPlan';

// Mock the stores
vi.mock('@/modules/plans/stores/AssociatedPlan', () => ({
    useAssociatedPlanStore: vi.fn()
}));

// Mock vue-router
const mockRouterPush = vi.fn();
vi.mock('vue-router', () => ({
    useRouter: () => ({
        push: mockRouterPush
    })
}));

describe('Pricing view', () => {
    let associatedPlanStoreMock;

    beforeEach(() => {
        // Reset mocks
        mockRouterPush.mockReset();

        // Setup store mock
        associatedPlanStoreMock = {
            currentPlan: {
                category: 'standard'
            }
        };
        useAssociatedPlanStore.mockReturnValue(associatedPlanStoreMock);
    });

    it('renders correctly', async () => {
        const wrapper = mount(PricingView, {
            props: {
                id: '123',
                plan: 'plan-123'
            },
            global: {
                stubs: {
                    AttachPricingInit: true,
                    Card: true,
                    Button: true
                }
            }
        });

        await flushPromises();

        // Note: We can't check for the AttachPricingInit component directly because it's inside a Card stub
        // and the Card stub doesn't render its slots by default. Instead, we'll just check if the buttons are rendered.

        // Check if buttons are rendered
        expect(wrapper.findByTestId('back-button').exists()).toBe(true);
        expect(wrapper.findByTestId('save-continue-button').exists()).toBe(
            true
        );
    });

    it('navigates back to benefits page when back button is clicked', async () => {
        const wrapper = mount(PricingView, {
            props: {
                id: '123',
                plan: 'plan-123'
            },
            global: {
                stubs: {
                    AttachPricingInit: true,
                    Card: true,
                    Button: true
                }
            }
        });

        await flushPromises();

        await wrapper.findByTestId('back-button').trigger('click');

        expect(mockRouterPush).toHaveBeenCalledWith({
            name: 'New Associated Plan Step 2',
            params: { id: '123', plan: 'plan-123' }
        });
    });

    it('navigates to documents page when save & continue button is clicked for standard category', async () => {
        const wrapper = mount(PricingView, {
            props: {
                id: '123',
                plan: 'plan-123'
            },
            global: {
                stubs: {
                    AttachPricingInit: true,
                    Card: true,
                    Button: true
                }
            }
        });

        await flushPromises();

        await wrapper.findByTestId('save-continue-button').trigger('click');

        expect(mockRouterPush).toHaveBeenCalledWith({
            name: 'New Associated Plan Step 4',
            params: { id: '123', plan: 'plan-123' }
        });
    });

    it('navigates to dependant page when save & continue button is clicked for dependants category', async () => {
        // Update store mock to have dependants category
        associatedPlanStoreMock.currentPlan.category = 'dependants';

        const wrapper = mount(PricingView, {
            props: {
                id: '123',
                plan: 'plan-123'
            },
            global: {
                stubs: {
                    AttachPricingInit: true,
                    Card: true,
                    Button: true
                }
            }
        });

        await flushPromises();

        await wrapper.findByTestId('save-continue-button').trigger('click');

        expect(mockRouterPush).toHaveBeenCalledWith({
            name: 'New Associated Plan Dependant',
            params: { id: '123', plan: 'plan-123' }
        });
    });
});
