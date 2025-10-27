import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';

import DependantView from '@/modules/plans/views/plans/associated/new/dependant.vue';
import { searchCompanyUsersMock } from '@/../tests/mocks/Common.service.mocks';

// Mock the router
const mockPush = vi.fn();
vi.mock('vue-router', () => ({
    useRouter: () => ({
        push: mockPush
    })
}));

// Mock the AssociatedPlanStore
const mockUpdateAssociatedPlanSettings = vi.fn().mockResolvedValue({});
const mockGetPlan = vi.fn().mockResolvedValue({
    data: {
        id: 'bb80af01-0e36-4072-88e4-329bc5f7384b',
        plan: {
            periods: [
                {
                    id: 'period1',
                    name: 'Period 1',
                    start_date: '2023-01-01',
                    end_date: '2023-12-31'
                }
            ]
        },
        dependantsSetting: {
            max_num_of_dependants: 5,
            apply_pricing_discount: 1,
            enforce_start_date: 1,
            enforce_end_date: 0,
            pricing_discounts: [
                {
                    percentage: 10,
                    condition: 'more_than',
                    num_of_dependants: 2
                }
            ],
            dependants_types: [
                {
                    type: 'parent',
                    restrict_eligibility: true,
                    main_applicant_age_condition: 'over',
                    main_applicant_age: 25,
                    main_applicant_age_unit: 'years',
                    time_limit: true,
                    available_from: 30,
                    available_from_unit: 'days',
                    available_from_condition: 'after',
                    available_from_value: 'policy_start',
                    available_until: 60,
                    available_until_unit: 'days',
                    available_until_condition: 'after',
                    available_until_value: 'policy_start'
                },
                {
                    type: 'spouse_or_common_law',
                    time_limit: false
                },
                {
                    type: 'child',
                    min_child_age: 1,
                    min_child_age_unit: 'years',
                    max_child_age: 21,
                    max_child_age_unit: 'years',
                    time_limit: false
                }
            ]
        }
    }
});

vi.mock('@/modules/plans/stores/AssociatedPlan', () => ({
    useAssociatedPlanStore: () => ({
        getPlan: mockGetPlan,
        updateAssociatedPlanSettings: mockUpdateAssociatedPlanSettings,
        transferDependantSettingsObject: vi.fn().mockReturnValue({}),
        transferDependantSettingsPayload: vi.fn().mockReturnValue({})
    })
}));

describe('Dependant View', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        searchCompanyUsersMock();
    });

    it('renders correctly', async () => {
        const wrapper = mount(DependantView, {
            props: {
                id: 'bb80af01-0e36-4072-88e4-329bc5f7384b',
                plan: '879e4b4b-733d-4b4c-94bc-c34a7969e188'
            },
            global: {
                stubs: {
                    PlanDependantSettingsForm: true,
                    PlanDependantEnableForm: true,
                    Button: {
                        template:
                            '<button :data-testid="dataTestid">{{ label }}</button>',
                        props: ['label', 'dataTestid']
                    },
                    Confirmation: true,
                    Loader: true,
                    Card: {
                        template: '<div><slot name="content"></slot></div>',
                        props: ['class']
                    }
                }
            }
        });
        await flushPromises();

        // Check that the component renders the title
        const title = wrapper.find('h5[data-testid="dependant-title"]');
        expect(title.exists()).toBe(true);
        expect(title.text()).toBe('Dependant Settings');

        // Check that the PlanDependantSettingsForm component is rendered
        expect(
            wrapper
                .findComponent({ name: 'PlanDependantSettingsForm' })
                .exists()
        ).toBe(true);

        // Check that the back and save buttons are rendered
        const backButton = wrapper.find('[data-testid="back-button"]');
        expect(backButton.exists()).toBe(true);
        expect(backButton.text()).toBe('Back');

        const saveButton = wrapper.find('[data-testid="save-continue-button"]');
        expect(saveButton.exists()).toBe(true);
        expect(saveButton.text()).toBe('Save & Continue');

        // Check that the Confirmation component is rendered
        expect(wrapper.findComponent({ name: 'Confirmation' }).exists()).toBe(
            true
        );
    });

    it('navigates back when back button is clicked', async () => {
        const wrapper = mount(DependantView, {
            props: {
                id: 'bb80af01-0e36-4072-88e4-329bc5f7384b',
                plan: '879e4b4b-733d-4b4c-94bc-c34a7969e188'
            }
        });
        await flushPromises();

        await wrapper.findByTestId('back-button').trigger('click');

        expect(mockPush).toHaveBeenCalledWith({
            name: 'New Associated Plan Step 3',
            params: {
                id: 'bb80af01-0e36-4072-88e4-329bc5f7384b',
                plan: '879e4b4b-733d-4b4c-94bc-c34a7969e188'
            }
        });
    });

    it('saves and navigates to next step when save button is clicked', async () => {
        const wrapper = mount(DependantView, {
            props: {
                id: 'bb80af01-0e36-4072-88e4-329bc5f7384b',
                plan: '879e4b4b-733d-4b4c-94bc-c34a7969e188'
            }
        });
        await flushPromises();

        // The save method will call updateAssociatedPlanSettings, which we've already mocked
        await wrapper.findByTestId('save-continue-button').trigger('click');

        // Wait for the save operation to complete
        await flushPromises();

        // Verify that updateAssociatedPlanSettings was called
        expect(mockUpdateAssociatedPlanSettings).toHaveBeenCalled();

        // Verify that the navigation occurred
        expect(mockPush).toHaveBeenCalledWith({
            name: 'New Associated Plan Step 4',
            params: {
                id: 'bb80af01-0e36-4072-88e4-329bc5f7384b',
                plan: '879e4b4b-733d-4b4c-94bc-c34a7969e188'
            }
        });
    });
});
