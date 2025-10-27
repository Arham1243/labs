import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import CodeGroups from '@/modules/plans/views/services/code-groups.vue';
import { searchCodeGroupsMock } from '@/modules/plans/tests/mocks/CodeSet.service.mocks';
import { useCodeSetStore } from '@/modules/plans/stores/CodeSet';

// Mock the CodeSetStore
vi.mock('@/modules/plans/stores/CodeSet', () => ({
    useCodeSetStore: vi.fn(() => ({
        searchCodeGroups: vi.fn().mockResolvedValue({
            data: [
                {
                    id: '1',
                    name: { en: 'Test Code Group' },
                    status: 'active',
                    effective_date: '2023-01-01'
                }
            ],
            meta: { total: 1 }
        })
    }))
}));

// Mock vue-router
vi.mock('vue-router', () => ({
    useRouter: vi.fn(() => ({
        push: vi.fn()
    }))
}));

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
    useI18n: vi.fn(() => ({
        t: (key) => key,
        locale: { value: 'en' }
    }))
}));

describe('CodeGroups view', () => {
    let wrapper;
    let codeSetStore;

    beforeEach(() => {
        searchCodeGroupsMock();
        codeSetStore = useCodeSetStore();

        wrapper = mount(CodeGroups, {
            global: {
                stubs: {
                    Card: {
                        template:
                            '<div class="card"><slot name="content"></slot></div>'
                    },
                    CodeGroupsTable: {
                        template: '<div data-testid="code-groups-table"></div>',
                        name: 'CodeGroupsTable'
                    }
                }
            }
        });
    });

    it('renders correctly', async () => {
        expect(
            wrapper.findComponent({ name: 'CodeGroupsTable' }).exists()
        ).toBe(true);
    });

    it('renders the Card component', () => {
        expect(wrapper.find('.card').exists()).toBe(true);
    });

    it('renders the CodeGroupsTable inside the Card content slot', () => {
        const card = wrapper.find('.card');
        expect(card.find('[data-testid="code-groups-table"]').exists()).toBe(
            true
        );
    });
});
