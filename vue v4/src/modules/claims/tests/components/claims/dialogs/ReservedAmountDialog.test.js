import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import { mount } from '@vue/test-utils';
import {
    useClaimStoreMock,
    currentClaimMock,
    userMock
} from '@/modules/claims/tests/mocks/Claim.service.mock';
import ReservedAmountDialog from '@/modules/claims/components/claims/dialogs/ReservedAmountDialog.vue';

// Mock the store
vi.mock('@/modules/claims/stores/Claim', () => ({
    useClaimStore: vi.fn(() => useClaimStoreMock())
}));

describe('ReservedAmountDialog', () => {
    let wrapper;
    let visible;

    beforeEach(() => {
        visible = ref(true); // Make visible reactive and accessible in test

        wrapper = mount(ReservedAmountDialog, {
            props: {
                claim: currentClaimMock,
                clientId: currentClaimMock.submissions[0].client_id,
                visible: true
            },
            global: {
                stubs: {
                    teleport: true
                },
                provide: {
                    currentUser: userMock
                }
            }
        });
    });

    it('component renders correctly', () => {
        expect(
            wrapper
                .find("[data-testid='dialog-btn-save-reserved-amount']")
                .exists()
        ).toBe(true);

        expect(
            wrapper
                .find("[data-testid='dialog-btn-cancel-reserved-amount']")
                .exists()
        ).toBe(true);

        expect(
            wrapper
                .find("[data-testid='dialog-input-reserved-amount']")
                .exists()
        ).toBe(true);

        expect(
            wrapper.find("[data-testid='dialog-label-running-total']").text()
        ).toBe('Running Total:');
    });
});
