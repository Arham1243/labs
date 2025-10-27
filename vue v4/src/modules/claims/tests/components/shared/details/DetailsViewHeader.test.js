import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { getInsuredMock } from '@/modules/claims/tests/mocks/Insured.service.mock';
import { getPolicyMock } from '@/modules/claims/tests/mocks/Policy.service.mock';
import DetailsViewHeader from '@/modules/claims/components/shared/details/DetailsViewHeader.vue';

// Mock the currentSubmission value on submissionStore
const submissionStoreMock = {
    currentSubmission: {
        value: {
            id: '1734033061661887632',
            ref_number: 'kmq60znqy',
            claim: [],
            policy: {
                id: '1734029938738548111',
                number: '1520000',
                holder: 'test test',
                start_date: '2023-10-01',
                end_date: '2024-10-01',
                status: 'active'
            },
            insured: {
                id: '1535376854543513513',
                name: 'Allen Smith',
                dob: '1992-02-06'
            },
            status: 'review',
            source: 'hive_email',
            expenses: [
                {
                    id: '1734033061664459216',
                    status: 'approved',
                    submission_id: '1734033061661887632',
                    amount_claimed: '230.00',
                    amount_approved: '0.00'
                },
                {
                    id: '1734033061665174299',
                    status: 'review',
                    submission_id: '1734033061661887632',
                    amount_claimed: '230.00',
                    amount_approved: '0.00'
                },
                {
                    id: '1734033061666565307',
                    status: 'review',
                    submission_id: '1734033061661887632',
                    amount_claimed: '230.00',
                    amount_approved: '0.00'
                }
            ]
        }
    }
};

vi.mock('@/modules/claims/stores/Submission', () => ({
    useSubmissionStore: vi.fn(() => submissionStoreMock)
}));

describe('DetailsViewHeader', () => {
    getInsuredMock();
    getPolicyMock();

    it('component renders correctly', async () => {
        const wrapper = mount(DetailsViewHeader, {
            props: {
                moduleType: 'submission'
            }
        });

        expect(wrapper.findByTestId('link-open-insured-sidebar').text()).toBe(
            'Allen Smith'
        );

        expect(wrapper.findByTestId('text-insured-birth-and-age').text()).toBe(
            '06-Feb-1992 (33 Years Old) • Policy # 1520000 (01-Oct-2023 to 01-Oct-2024)'
        );

        expect(wrapper.findByTestId('link-open-policy-sidebar').text()).toBe(
            '1520000'
        );
    });
});
