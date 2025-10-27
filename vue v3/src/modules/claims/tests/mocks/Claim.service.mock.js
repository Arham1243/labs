import { vi } from 'vitest';
import * as ClaimService from '@/modules/claims/services/Claim.service';
import { userMock } from '@/modules/claims/tests/mocks/User.mock';

export { userMock };

export const currentClaimMock = {
    id: '1965033061661574632',
    ref_number: 'sn234jsdfl',
    policy: {
        id: '1734029938738548111',
        number: '1520000',
        holder: 'test test'
    },
    insured: {
        id: '1733416764855519728',
        name: ''
    },
    status: 'review',
    reserved_amount: '5000.00',
    running_total: 100,
    expense_total: 1150,
    submissions: [
        {
            id: '1737483257117368661',
            ref_number: '84i73am9y',
            client_id: '1737477088384577827',
            examiner_id: '1737477078188149817',
            examiner_name: 'John Doe',
            status: 'pending',
            policy: {
                id: '112233445566',
                number: '1122334455',
                holder: 'Abe Lincoln'
            },
            amount_claimed: 750,
            amount_approved: 0,
            created_at: '2025-01-21T18:14:17.000000Z',
            updated_at: '2025-01-22T15:00:09.000000Z'
        },
        {
            id: '1737557784003743055',
            ref_number: 'j6293f5d9',
            client_id: '1737477088384577827',
            examiner_id: '1737477078188149817',
            examiner_name: 'John Doe',
            status: 'pending',
            policy: {
                id: '112233445566',
                number: '1122334455',
                holder: 'Abe Lincoln'
            },
            amount_claimed: 400,
            amount_approved: 0,
            created_at: '2025-01-21T18:14:17.000000Z',
            updated_at: '2025-01-22T15:00:09.000000Z'
        }
    ],
    created_at: '2025-01-14T14:42:46.000000Z',
    updated_at: '2025-01-14T14:42:48.000000Z'
};

const getSingleClaim = () =>
    vi.fn(() => ({
        loading: false, // or set true if you want to test the loading state
        currentClaim: currentClaimMock,
        data: currentClaimMock
    }));

export const createClaimMock = () => {
    vi.spyOn(ClaimService, 'createClaim').mockResolvedValue({
        data: currentClaimMock,
        loading: false,
        status: 'success',
        mutate: vi.fn()
    });
};

export const getClaimByIdMock = () => {
    vi.spyOn(ClaimService, 'getClaimById').mockResolvedValue({
        data: currentClaimMock
    });
};

export const getClaimsMock = () => {
    vi.spyOn(ClaimService, 'getClaims').mockResolvedValue({
        data: [
            {
                id: '1965033061661574632',
                ref_number: 'sn234jsdfl'
            },
            {
                id: '196503306161231231',
                ref_number: 'sn234sdfsl'
            }
        ]
    });
};

export const exportClaimsMock = () => {
    vi.spyOn(ClaimService, 'exportClaims').mockResolvedValue({
        data: {
            success: true,
            message: 'Export queued successfully.',
            export_log_id: '1234567890'
        }
    });
};

export const useClaimStoreMock = () => ({
    currentClaim: currentClaimMock,
    getClaimsBuildUp: getSingleClaim(),
    getClaimById: getSingleClaim(),
    searchClaims: () => ({
        data: currentClaimMock,
        loading: false,
        mutate: () => {}
    }),
    updateReservedAmount: vi.fn(() => ({
        loading: false,
        mutate: vi.fn(),
        status: 'success'
    })),
    createClaim: createClaimMock(),
    exportClaims: exportClaimsMock()
});
