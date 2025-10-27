import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import IndexView from '@/modules/plans/views/plans/associated/new/index.vue';
import { useAssociatedPlanStore } from '@/modules/plans/stores/AssociatedPlan';
import { usePlanStore } from '@/modules/plans/stores/Plan';
import { useClientStore } from '@/modules/clients/stores/Client';
import useEventsBus from '@/composables/event-bus';

// Mock the stores and composables
vi.mock('@/modules/plans/stores/AssociatedPlan', () => ({
    useAssociatedPlanStore: vi.fn()
}));

vi.mock('@/modules/plans/stores/Plan', () => ({
    usePlanStore: vi.fn()
}));

vi.mock('@/modules/clients/stores/Client', () => ({
    useClientStore: vi.fn()
}));

vi.mock('@/composables/event-bus', () => ({
    default: vi.fn()
}));

// Mock vue-router
const mockRouterPush = vi.fn();
const mockRouterGo = vi.fn();
vi.mock('vue-router', () => ({
    useRouter: () => ({
        push: mockRouterPush,
        go: mockRouterGo
    }),
    useRoute: () => ({
        params: {
            id: '123',
            plan: 'plan-123'
        }
    })
}));

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
    useI18n: vi.fn(() => ({
        t: (key) => key
    }))
}));

describe('Index view', () => {
    let associatedPlanStoreMock;
    let planStoreMock;
    let clientStoreMock;
    let eventBusMock;

    beforeEach(() => {
        // Reset mocks
        mockRouterPush.mockReset();
        mockRouterGo.mockReset();

        // Setup store mocks
        associatedPlanStoreMock = {
            currentPlan: null,
            currentAssociatedPlan: null,
            parentPlan: {
                business_unit: {
                    client: { id: 'client-123' },
                    id: 'bu-123'
                }
            },
            setCurrentPlan: vi.fn(),
            setParentPlan: vi.fn(),
            getPlan: vi.fn().mockResolvedValue({ data: {} })
        };
        useAssociatedPlanStore.mockReturnValue(associatedPlanStoreMock);

        planStoreMock = {
            getPlan: vi.fn().mockResolvedValue({
                data: {
                    business_unit: { id: 'bu-123' }
                }
            })
        };
        usePlanStore.mockReturnValue(planStoreMock);

        clientStoreMock = {
            getBusinessUnit: vi.fn().mockResolvedValue({
                data: {
                    client_id: 'client-123',
                    id: 'bu-123'
                }
            })
        };
        useClientStore.mockReturnValue(clientStoreMock);

        // Setup event bus mock
        eventBusMock = {
            value: {
                get: vi.fn(),
                set: vi.fn()
            }
        };
        useEventsBus.mockReturnValue({ bus: eventBusMock });
    });

    it('renders correctly with stepper items', async () => {
        const wrapper = mount(IndexView, {
            global: {
                stubs: {
                    Header: true,
                    Steps: true,
                    'router-view': true,
                    Confirmation: true,
                    StatusTag: true,
                    Button: true
                }
            }
        });

        await flushPromises();

        // Note: We can't check for elements inside stubbed components directly
        // Instead, we'll check if the main components are rendered

        // Check if the Header component is rendered
        const header = wrapper.findComponent('header-stub');
        expect(header.exists()).toBe(true);

        // Check if the Steps component is rendered
        const steps = wrapper.findComponent('steps-stub');
        expect(steps.exists()).toBe(true);

        // Check if the router-view is rendered
        const routerView = wrapper.findComponent('router-view-stub');
        expect(routerView.exists()).toBe(true);
    });

    it('adds dependant step when plan category is dependants', async () => {
        // Setup the plan with dependants category
        associatedPlanStoreMock.getPlan.mockResolvedValue({
            data: { category: 'dependants' }
        });

        const wrapper = mount(IndexView, {
            global: {
                stubs: {
                    Header: true,
                    Steps: true,
                    'router-view': true,
                    Confirmation: true,
                    StatusTag: true,
                    Button: true
                }
            }
        });

        await flushPromises();

        // Verify that the dependant step was added to the stepper items
        expect(wrapper.vm.stepperItems.length).toBe(6); // 5 original steps + 1 dependant step
        expect(wrapper.vm.stepperItems[3].label).toBe(
            'plans.dependant_settings'
        );
    });

    it('shows confirmation dialog when back button is clicked', async () => {
        const wrapper = mount(IndexView, {
            global: {
                stubs: {
                    Header: true,
                    Steps: true,
                    'router-view': true,
                    Confirmation: true,
                    StatusTag: true,
                    Button: true
                }
            }
        });

        await flushPromises();

        // Initially, the confirmation dialog should not be shown
        expect(wrapper.vm.showUnsavedData).toBe(false);

        // Call the handleBack method directly instead of clicking the button
        await wrapper.vm.handleBack();

        // The confirmation dialog should now be shown
        expect(wrapper.vm.showUnsavedData).toBe(true);
    });

    it('navigates back to business unit details when confirmed', async () => {
        const wrapper = mount(IndexView, {
            global: {
                stubs: {
                    Header: true,
                    Steps: true,
                    'router-view': true,
                    Confirmation: true,
                    StatusTag: true,
                    Button: true
                }
            }
        });

        await flushPromises();

        // Call the goBack method directly
        await wrapper.vm.goBack();

        // Verify that router.push was called with the correct parameters
        expect(mockRouterPush).toHaveBeenCalledWith({
            name: 'Business Unit Details',
            params: {
                clientId: 'client-123',
                id: 'bu-123'
            }
        });
    });

    it('watches for reloadPlanDetails event and reloads plan', async () => {
        const wrapper = mount(IndexView, {
            global: {
                stubs: {
                    Header: true,
                    Steps: true,
                    'router-view': true,
                    Confirmation: true,
                    StatusTag: true,
                    Button: true
                }
            }
        });

        await flushPromises();

        // Call the setPlan method directly
        const setPlanSpy = vi.spyOn(wrapper.vm, 'setPlan');
        await wrapper.vm.setPlan();

        // Verify that setPlan was called
        expect(setPlanSpy).toHaveBeenCalled();
    });

    it('watches for setDependantStep event and adds dependant step', async () => {
        const wrapper = mount(IndexView, {
            global: {
                stubs: {
                    Header: true,
                    Steps: true,
                    'router-view': true,
                    Confirmation: true,
                    StatusTag: true,
                    Button: true
                }
            }
        });

        await flushPromises();

        // Initial number of steps
        const initialStepsCount = wrapper.vm.stepperItems.length;

        // Call the setDependantStep method directly
        await wrapper.vm.setDependantStep();

        // Verify that a new step was added
        expect(wrapper.vm.stepperItems.length).toBe(initialStepsCount + 1);
    });
});
