import { describe, beforeEach, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import CreateNewClaimDialog from '@/modules/claims/components/claims/dialogs/CreateNewClaimDialog.vue';
import { userMock } from '@/modules/claims/tests/mocks/Claim.service.mock';

// --- Store mocks ---
const submissionStoreMock = {
    currentSubmission: ref({
        id: '1734033061661887632',
        ref_number: 'kmq60znqy',
        claim: [],
        policy: {
            id: '1734029938738548111',
            number: '1520000',
            holder: 'test test'
        },
        amount_approved: 0.0,
        amount_claimed: 690.0,
        status: 'review',
        expenses: [
            {
                id: '1734033061664459216',
                status: 'approved',
                amount_claimed: '230.00',
                amount_approved: '0.00'
            },
            {
                id: '1734033061665174299',
                status: 'review',
                amount_claimed: '230.00',
                amount_approved: '0.00'
            },
            {
                id: '1734033061666565307',
                status: 'review',
                amount_claimed: '230.00',
                amount_approved: '0.00'
            }
        ]
    }),
    getSubmissionById: vi.fn()
};

const createClaimMock = vi.fn(() => ({
    loading: ref(false),
    status: ref('idle'),
    error: ref(null),
    mutate: vi.fn()
}));

// --- Module mocks ---
vi.mock('@/modules/claims/stores/Submission', () => ({
    useSubmissionStore: () => submissionStoreMock
}));

vi.mock('@/modules/claims/stores/Claim', () => ({
    useClaimStore: () => ({
        createClaim: createClaimMock
    })
}));

vi.mock('@/composables', () => ({
    useHelpers: () => ({
        moneyFormat: vi.fn((value) => `$${Number(value).toFixed(2)}`)
    })
}));

// --- The actual tests ---
describe('CreateNewClaimDialog', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = mount(CreateNewClaimDialog, {
            props: {
                visible: true // defineModel prop
            },
            global: {
                stubs: {
                    teleport: true,
                    Dialog: {
                        template: '<div><slot/><slot name="footer"/></div>'
                    },
                    InputField: true,
                    Button: true
                },
                provide: {
                    currentUser: userMock
                }
            }
        });
    });

    it('renders correctly with submission data', () => {
        expect(
            wrapper
                .find('[data-testid="text-create-new-claim-suggestion"]')
                .text()
        ).toBe(
            'Are you sure you want to create a new claim for submission ID kmq60znqy?'
        );

        expect(wrapper.find('[data-testid="text-running-total"]').text()).toBe(
            '$0.00 CAD'
        );
        expect(wrapper.find('[data-testid="text-expense-total"]').text()).toBe(
            '$690.00 CAD'
        );
        expect(
            wrapper.find('[data-testid="input-reserved-amt"]').exists()
        ).toBe(true);
        expect(
            wrapper.find('[data-testid="btn-cancel-create-new-claim"]').exists()
        ).toBe(true);
        expect(
            wrapper.find('[data-testid="btn-create-new-claim"]').exists()
        ).toBe(true);
    });
});
