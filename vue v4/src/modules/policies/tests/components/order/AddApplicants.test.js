import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import AddApplicants from '@/modules/policies/components/order/AddApplicants.vue';
import { searchCountriesMock } from '@/../tests/mocks/Common.service.mocks';
import { searchPlanByBusinessUnitUuidsMock } from '@/modules/plans/tests/mocks/Plan.service.mocks';

// Mocking the store
vi.mock('@/modules/policies/stores/Policies', () => ({
    usePoliciesStore: vi.fn(() => ({
        client: {
            id: 'de4e4e9d-68a5-4410-ad82-15efcd838de0',
            name: { en: 'et quo tempore', fr: 'voluptates sit cupiditate' }
        },
        businessUnit: {
            id: '14f5b089-d4d8-4eef-9861-89d6269674a3',
            name: {
                en: 'et molestiae reprehenderit',
                fr: 'deserunt aut aliquam'
            }
        },
        contactSource: { id: 'email', name: 'E-mail' },
        setOrderDetails: vi.fn(),
        createCart: vi.fn().mockResolvedValue({ id: '1733944253725203701' }),
        cart: { id: '1733944253725203701' },
        searchEnrollments: vi.fn().mockResolvedValue({ data: [], meta: {} }),
        searchEnrollmentTypes: vi.fn().mockResolvedValue({ data: [] }),
        getFormattedErrors: vi.fn().mockResolvedValue({})
    }))
}));

describe('AddApplicants component', () => {
    let wrapper;

    // Setup reusable mock data
    const plans = [
        {
            id: '55ad0ec5-41ce-4c29-96f1-a542151ad2ff',
            name: { en: 'erwerw', fr: null }
        },
        {
            id: '55ad0ec5-41cde-4c29-96f1-a542151ad2ff',
            name: { en: 'erwerw 2', fr: null }
        },
        {
            id: '55ad0ec5-41c3de-4c29-96f1-a542151ad2ff',
            name: { en: 'erwerw 3', fr: null }
        }
    ];
    beforeEach(() => {
        searchCountriesMock();
        searchPlanByBusinessUnitUuidsMock();
        wrapper = mount(AddApplicants, {
            global: {
                stubs: {
                    PlanDetails: true
                }
            }
        });
        wrapper.vm.plans = plans;
    });

    const findByTestId = (id) => wrapper.findByTestId(id);

    const checkText = (testId, expectedText) => {
        expect(findByTestId(testId).exists()).toBe(true);
        expect(findByTestId(testId).text()).toBe(expectedText);
    };

    const checkExists = (testId) => {
        expect(findByTestId(testId).exists()).toBe(true);
    };

    it('renders sections and elements correctly', async () => {
        await wrapper.vm.$nextTick();

        // Section titles
        checkText(
            'plans-section-title',
            'Here is a quick overview of the 3 plans that you have available'
        );
        checkText(
            'applicants-section-title',
            'Let’s start adding your applicants'
        );

        // Selectable icon buttons
        checkExists('selectable-icon-button-icon-0');
        checkExists('selectable-icon-button-icon-1');
        checkExists('selectable-icon-button-label-0');
        checkExists('selectable-icon-button-label-1');
        checkText(
            'selectable-icon-button-label-0',
            'I will upload a file with my applicant information'
        );
        checkText(
            'selectable-icon-button-label-1',
            'I will add the applicants individually'
        );

        // Action buttons
        checkExists('view-as-list-button');
        checkText('view-as-list-button', 'View as List');
        checkExists('previous-plan-slide-button');
        checkExists('next-plan-slide-button');

        // Checkout warning and buttons
        checkExists('checkout-warning-message');
        checkExists('cancel-button');
        checkExists('continue-button');
        checkText('cancel-button', 'Cancel');
        checkText('continue-button', 'Continue');

        // Simulate file upload UI elements
        await findByTestId('selectable-icon-button-label-0').trigger('click');
        await wrapper.vm.$nextTick();
        checkExists('file-upload-choose-button');
        checkText('file-upload-choose-button', 'Choose');
        checkExists('file-upload-cancel-button');
        checkText('file-upload-cancel-button', 'Cancel');
        checkExists('file-upload-drag-and-drop-text');
        checkText(
            'file-upload-drag-and-drop-text',
            'Drag and drop file to here to upload.'
        );
    });

    it('should display file upload elements correctly', async () => {
        await findByTestId('selectable-icon-button-label-0').trigger('click');
        await wrapper.vm.$nextTick();

        // File upload related checks
        checkExists('file-upload-choose-button');
        checkText('file-upload-choose-button', 'Choose');
        checkExists('file-upload-cancel-button');
        checkText('file-upload-cancel-button', 'Cancel');
        checkExists('file-upload-drag-and-drop-text');
        checkText(
            'file-upload-drag-and-drop-text',
            'Drag and drop file to here to upload.'
        );
    });

    it('should display applicants table when adding individually', async () => {
        await findByTestId('selectable-icon-button-label-1').trigger('click');
        await wrapper.vm.$nextTick();
        // Assert  button
        checkExists('add-new-applicant-button');
        checkText('add-new-applicant-button', 'Add Applicant');

        // Assert  table Header
        checkText('type-header-data-table', 'Type');
        checkText('first-name-header-data-table', 'First Name');
        checkText('last-name-header-data-table', 'Last Name');
        checkText('date-of-birth-header-data-table', 'Date of Birth');
        checkText('gender-header-data-table', 'Gender');
        checkText('passport-header-data-table', 'Passport');
        checkText(
            'destination-country-header-data-table',
            'Country of Destination'
        );
    });

    it('should open the enrollment sidebar when adding individually', async () => {
        await findByTestId('selectable-icon-button-label-1').trigger('click');
        await wrapper.vm.$nextTick();

        await findByTestId('add-new-applicant-button').trigger('click');

        await wrapper.vm.$nextTick();
        expect(wrapper.vm.openEnrollmentSidebar).toBe(true);
    });
});
