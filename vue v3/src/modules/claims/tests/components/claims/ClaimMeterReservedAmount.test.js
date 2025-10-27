import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { currentClaimMock } from '@/modules/claims/tests/mocks/Claim.service.mock';
import ClaimMeterReservedAmount from '@/modules/claims/components/claims/ClaimMeterReservedAmount.vue';

describe('ClaimMeterReservedAmount', async () => {
    let wrapper;

    beforeEach(() => {
        wrapper = mount(ClaimMeterReservedAmount, {
            props: {
                claim: currentClaimMock
            }
        });
    });

    it('component renders correctly', async () => {
        expect(
            wrapper.findByTestId('meter-text-label-running_total').exists()
        ).toBe(true);
        expect(
            wrapper.findByTestId('meter-text-reserved_amount').text()
        ).toContain(
            `${(+currentClaimMock.reserved_amount).toLocaleString()}.00 CAD`
        );
    });

    it('component renders show dialog icon', async () => {
        const showDialog = await wrapper.findByTestId('meter-show-dialog');
        expect(showDialog.exists()).toBe(true);
        expect(showDialog.wrapperElement.tagName.toLowerCase()).toBe('a');
    });
});
