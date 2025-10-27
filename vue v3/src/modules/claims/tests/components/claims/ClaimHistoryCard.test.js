import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ClaimHistoryCard from '@/modules/claims/components/claims/ClaimHistoryCard.vue';
import { userMock } from '@/modules/claims/tests/mocks/Claim.service.mock';

describe('ClaimHistoryCard', () => {
    it('component renders correctly', () => {
        const wrapper = mount(ClaimHistoryCard, {
            props: {
                claims: {
                    data: [
                        {
                            id: 1,
                            ref_number: '123456',
                            policy: {
                                number: '123456'
                            },
                            status: 'Submitted',
                            created_at: '2021-07-01T00:00:00.000Z',
                            updated_at: '2021-07-01T00:00:00.000Z',
                            user: {
                                id: 1,
                                name: 'John Doe'
                            }
                        },
                        {
                            id: 2,
                            ref_number: '123456',
                            policy: {
                                number: '123456'
                            },
                            status: 'Approved',
                            created_at: '2021-07-02T00:00:00.000Z',
                            updated_at: '2021-07-02T00:00:00.000Z',
                            user: {
                                id: 1,
                                name: 'John Doe'
                            }
                        }
                    ]
                },
                clientId: '123321123321123321',
                currentClaimId: 1,
                isFromClaim: true
            },
            global: {
                provide: {
                    currentSubmission: {
                        id: 1,
                        status: 'Submitted',
                        created_at: '2021-07-01T00:00:00.000Z',
                        updated_at: '2021-07-01T00:00:00.000Z',
                        user: {
                            id: 1,
                            name: 'John Doe'
                        }
                    },
                    currentUser: userMock
                }
            }
        });

        expect(wrapper.findByTestId('btn-claim-history-filter').exists()).toBe(
            true
        );
    });
});
