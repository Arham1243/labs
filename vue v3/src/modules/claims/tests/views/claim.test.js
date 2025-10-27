import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ClaimDetailsView from '@/modules/claims/views/claim.vue';
import {
    getClaimByIdMock,
    getClaimsMock,
    userMock
} from '@/modules/claims/tests/mocks/Claim.service.mock';
import {
    getBusinessUnitMock,
    getPolicyBatchMock
} from '@/modules/claims/tests/mocks/General.service.mock';
import { getInsuredMock } from '@/modules/claims/tests/mocks/Insured.service.mock';
import { getPolicyMock } from '@/modules/claims/tests/mocks/Policy.service.mock';

describe('Claim Details view', () => {
    getClaimsMock();
    getClaimByIdMock();
    getInsuredMock();
    getPolicyMock();
    getPolicyBatchMock();
    getBusinessUnitMock();

    let wrapper;
    beforeEach(() => {
        wrapper = mount(ClaimDetailsView, {
            global: {
                provide: {
                    currentUser: { value: userMock }
                },
                mocks: {
                    useRouter: vi.fn()
                }
            },
            props: {
                objectId: '',
                clientId: ''
            }
        });
    });

    it('renders correctly', async () => {
        // const wrapper = mount(ClaimDetailsView, {
        //     global: {
        //         mocks: {
        //             useRouter: vi.fn()
        //         }
        //     }
        // });
        await flushPromises();

        expect(
            wrapper.findComponent({ name: 'DetailsViewHeader' }).exists()
        ).toBe(true);

        expect(
            wrapper.findComponent({ name: 'DetailsViewHeaderActions' }).exists()
        ).toBe(true);
    });
});
