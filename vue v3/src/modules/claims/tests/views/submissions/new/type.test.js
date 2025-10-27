import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import TypeView from '@/modules/claims/views/submissions/new/type.vue';

describe('TypeView', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = mount(TypeView);
    });

    it('component renders correctly', () => {
        expect(wrapper.findByTestId('heading-claim-type').text()).toBe(
            'Claim Type'
        );
    });
});
