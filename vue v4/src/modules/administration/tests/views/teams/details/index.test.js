import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import IndexView from '@/modules/administration/views/teams/details/index.vue';

vi.mock('@/modules/administration/stores', async () => {
    const actual = await vi.importActual('@/modules/administration/stores');
    return {
        ...actual,
        useTeamStore: vi.fn(() => ({
            getTeam: vi.fn().mockResolvedValue({
                id: 'u-1',
                name: 'John Doe',
                type: 'company'
            }),
            setCurrentTeam: vi.fn(),
            currentTeam: {
                name: 'John Doe',
                type: 'company'
            }
        }))
    };
});

describe('Team details index view', () => {
    let wrappers = [];

    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        wrappers.forEach(wrapper => wrapper?.unmount());
        wrappers = [];
        vi.clearAllTimers();
    });

    it('displays the correct page title and back button', async () => {
        const wrapper = mount(IndexView);
        wrappers.push(wrapper);
        wrapper.vm.loading = false;
        await wrapper.vm.$nextTick();
        expect(wrapper.findByTestId('back-button').exists()).toBe(true);
        expect(wrapper.findByTestId('page-title').text()).toBe('John Doe');
    });

    it('returns correct tab menu items', () => {
        const wrapper = mount(IndexView);
        wrappers.push(wrapper);
        wrapper.vm.teamId = '1';
        const items = wrapper.vm.tabItems;
        expect(Array.isArray(items)).toBe(true);
        expect(items[0].label).toBe('Users');
        expect(items[1].label).toBe('Roles');
        expect(items[2].label).toBe('Scopes');
    });
});
