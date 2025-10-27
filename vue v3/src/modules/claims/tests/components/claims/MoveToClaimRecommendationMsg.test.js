import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import MoveToClaimRecommendationMsg from '@/modules/claims/components/claims/MoveToClaimRecommendationMsg.vue';
import { userMock } from '@/modules/claims/tests/mocks/Claim.service.mock';

describe('MoveToClaimRecommendationMsg', () => {
    it('component renders correctly', () => {
        const wrapper = mount(MoveToClaimRecommendationMsg, {
            props: {
                clientId: '123321123321123321'
            },
            global: {
                provide: {
                    currentUser: userMock
                }
            }
        });

        expect(wrapper.findByTestId('icon-claim-recommendation').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('text-claim-recommendation').text()).toBe(
            'Recommendation: Move Submission to Claim 1573818'
        );

        expect(wrapper.findByTestId('tag-accuracy').exists()).toBe(true);
        expect(wrapper.findByTestId('tag-accuracy').text()).toBe(
            '99% ACCURACY'
        );

        expect(
            wrapper
                .findByTestId('text-claim-recommendation-description')
                .exists()
        ).toBe(true);
        expect(wrapper.findByTestId('btn-accept-move').exists()).toBe(true);
        expect(wrapper.findByTestId('btn-decline-reassign').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('btn-create-new-claim').exists()).toBe(
            true
        );
    });
});
