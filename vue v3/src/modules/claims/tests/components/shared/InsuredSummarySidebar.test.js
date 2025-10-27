import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import InsuredSummarySidebar from '@/modules/claims/components/shared/InsuredSummarySidebar.vue';
import {
    useGeneralStoreMock,
    insuredMock
} from '@/modules/claims/tests/mocks/General.service.mock';

vi.mock('@/modules/claims/stores/General', () => ({
    useGeneralStore: vi.fn(() => useGeneralStoreMock())
}));

describe('InsuredSummarySidebar', () => {
    it('component renders correctly', async () => {
        const wrapper = mount(InsuredSummarySidebar, {
            props: {
                activeSideBarTab: 1
            },
            global: {
                provide: {
                    currentInsured: insuredMock
                }
            }
        });

        // Fetch tab views titles and check if they are rendered correctly
        const tabviewTitles = wrapper.findAll('.p-tabview-header');
        expect(tabviewTitles).toHaveLength(3);
        expect(tabviewTitles[0].text()).toBe('Insured Details');
        expect(tabviewTitles[1].text()).toBe('Policies');
        expect(tabviewTitles[2].text()).toBe('Organization');
    });
});
