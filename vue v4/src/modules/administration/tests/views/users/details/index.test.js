import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import IndexView from '@/modules/administration/views/users/details/index.vue';

// Mock the UserStore
vi.mock('@/modules/administration/stores', async () => {
    const actual = await vi.importActual('@/modules/administration/stores');
    return {
        ...actual,
        useUserStore: vi.fn(() => ({
            getUser: vi.fn().mockResolvedValue({
                id: 'u-1',
                name: 'John Doe',
                type: 'company'
            }),
            setCurrentUser: vi.fn(),
            currentUser: {
                name: 'John Doe',
                type: 'company'
            }
        }))
    };
});

describe('User details index view', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('displays the correct page title and back button', async () => {
        const wrapper = mount(IndexView);
        wrapper.vm.loading = false;
        await wrapper.vm.$nextTick();
        expect(wrapper.findByTestId('back-button').exists()).toBe(true);
        expect(wrapper.findByTestId('page-title').text()).toBe('John Doe');
    });

    it('returns correct tab menu items', () => {
        const wrapper = mount(IndexView);
        wrapper.vm.userId = '1';
        const items = wrapper.vm.tabItems;
        expect(Array.isArray(items)).toBe(true);
        expect(items[0].label).toBe('Teams');
        expect(items[1].label).toBe('Roles');
        expect(items[2].label).toBe('Scopes');
    });
});
