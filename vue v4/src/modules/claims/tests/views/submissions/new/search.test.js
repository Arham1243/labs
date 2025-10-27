import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import SearchView from '@/modules/claims/views/submissions/new/search.vue';
import {
    getInsuredMock,
    searchInsuredMock
} from '@/modules/claims/tests/mocks/Insured.service.mock';
import { userMock } from '@/modules/claims/tests/mocks/Claim.service.mock';

describe('SearchView', () => {
    let wrapper;

    searchInsuredMock();
    getInsuredMock();

    beforeEach(() => {
        wrapper = mount(SearchView, {
            global: {
                provide: {
                    currentUser: userMock
                }
            }
        });
    });

    it('component renders correctly', () => {
        expect(wrapper.findByTestId('title-create-submission').text()).toBe(
            'Create Submission'
        );
        expect(wrapper.findByTestId('title-policy-search').text()).toBe(
            'Search Policy'
        );

        expect(wrapper.findByTestId('input-search-policy').exists()).toBe(true);
        expect(wrapper.findByTestId('btn-search-policy').exists()).toBe(true);
    });
});
