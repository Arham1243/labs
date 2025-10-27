import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import Holdings from '@/modules/clients/views/holdings.vue';
import { searchHoldingsMock } from '@/modules/clients/tests/mocks/Client.service.mocks';

describe('Holdings view', () => {
    beforeEach(() => {
        searchHoldingsMock();
    });

    it('renders correctly', async () => {
        const wrapper = mount(Holdings);

        expect(wrapper.findComponent({ name: 'HoldingsTable' }).exists()).toBe(
            true
        );
    });
});
