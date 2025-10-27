import { describe, expect, it, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import NewPolicy from '@/modules/policies/components/insureds/NewPolicy.vue';
import { searchCountriesMock } from '@/../tests/mocks/Common.service.mocks';

describe('NewPolicy component', () => {
    let wrapper;

    beforeEach(() => {
        searchCountriesMock();
        wrapper = mount(NewPolicy, {
            props: {
                isOpen: true
            },
            global: {
                stubs: {
                    Sidebar: {
                        template:
                            '<div v-if="visible"><slot name="header"></slot><slot /><slot name="footer"></slot></div>',
                        props: ['visible']
                    }
                }
            }
        });
    });

    const findByTestId = (id) => wrapper.findByTestId(id);

    const checkText = (testId, expectedText) => {
        expect(findByTestId(testId).exists()).toBe(true);
        expect(findByTestId(testId).text()).toBe(expectedText);
    };

    const checkExists = async (testId) => {
        try {
            const element = await findByTestId(testId);
            expect(element.exists()).toBe(true);
        } catch (error) {
            console.error(`Error with testId: ${testId}`, error);
        }
    };

    it('renders correctly', async () => {
        await wrapper.vm.$nextTick();

        checkExists('applicant-sidebar-title');
        checkExists('applicant-sidebar-applicant-title');
        checkExists('type-label');
        checkExists('type-input');
        checkExists('first-name-label');
        checkExists('last-name-label');
        checkExists('date-of-birth-label');
        checkExists('gender-label');
        checkExists('gender-input');
        checkExists('email-label');
        checkExists('passport-number-label');
        checkExists('phone-number-label');
        checkExists('phone-number-input');
        checkExists('residence-country-label');
        checkExists('residence-country-input');
        checkExists('applicant-sidebar-policy-title');
        checkExists('plan-label');
        checkExists('plan-input');
        checkExists('destination-country-label');
        checkExists('destination-country-dropdown');
        checkExists('trip-start-date-label');
        checkExists('trip-end-date-label');
        checkExists('school-attended-label');
        checkExists('student-number-label');
        checkExists('destination-address-label');
        checkExists('group-name-label');
        checkExists('applicant-sidebar-cancel-button');
        checkExists('applicant-sidebar-save-add-button');
        checkExists('applicant-sidebar-save-close-button');

        checkText('applicant-sidebar-title', 'Order New Policy');
        checkText('applicant-sidebar-applicant-title', 'Organization');
        checkText('first-name-label', 'First Name *');
        checkText('last-name-label', 'Last Name *');
        checkText('date-of-birth-label', 'Date of Birth *');
        checkText('gender-label', 'Gender *');
        checkText('email-label', 'Email Address');
        checkText('passport-number-label', 'Passport Number');
        checkText('phone-number-label', 'Mobile Phone Number');
        checkText('residence-country-label', 'Country of Residence *');
        checkText('applicant-sidebar-policy-title', 'Policy Details');
        checkText('plan-label', 'Plan *');
        checkText('destination-country-label', 'Country of Destination *');
        checkText('trip-start-date-label', 'Trip Start Date *');
        checkText('trip-end-date-label', 'Trip End Date *');
        checkText('school-attended-label', 'Name of School Attended');
        checkText('student-number-label', 'Student Number');
        checkText('destination-address-label', 'Destination Address');
        checkText('group-name-label', 'Group Name');

        // Check the buttons
        checkText('applicant-sidebar-cancel-button', 'Cancel');
        checkText('applicant-sidebar-confirm-button', 'Confirm');
    });
});
