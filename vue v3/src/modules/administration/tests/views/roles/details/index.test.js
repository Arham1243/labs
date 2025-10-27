import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import IndexView from '@/modules/administration/views/roles/details/index.vue';

vi.mock('@/modules/administration/stores', async () => {
    const actual = await vi.importActual('@/modules/administration/stores');
    return {
        ...actual,
        useRoleStore: vi.fn(() => ({
            getRole: vi.fn().mockResolvedValue({
                id: 'r-1',
                name: 'Admin Role',
                type: 'company'
            }),
            setCurrentRole: vi.fn(),
            currentRole: {
                name: 'Admin Role',
                type: 'company'
            }
        }))
    };
});

describe('Role details index view', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('displays the correct page title and back button', async () => {
        const wrapper = mount(IndexView);
        wrapper.vm.loading = false;
        await wrapper.vm.$nextTick();
        expect(wrapper.findByTestId('back-button').exists()).toBe(true);
        expect(wrapper.findByTestId('page-title').text()).toBe('Admin Role');
    });

    it('returns correct tab menu items', () => {
        const wrapper = mount(IndexView);
        wrapper.vm.roleId = '1';
        const items = wrapper.vm.tabItems;
        expect(Array.isArray(items)).toBe(true);
        expect(items[0].label).toBe('Permissions');
        expect(items[1].label).toBe('Teams');
        expect(items[2].label).toBe('Users');
    });
});
