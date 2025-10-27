import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';

import IndexView from '@/modules/plans/views/services/index.vue';
import { updateAbility } from '@/plugins/ability';
import { useHelpers } from '@/composables';

// Mock vue-router
const mockPush = vi.fn();
const mockRoute = {
    params: {},
    query: {},
    path: '/',
    name: undefined,
    meta: {}
};
vi.mock('vue-router', () => ({
    useRouter: vi.fn(() => ({
        push: mockPush
    })),
    useRoute: vi.fn(() => mockRoute)
}));

// Mock the CodeSetStore
vi.mock('@/modules/plans/stores/CodeSet', () => ({
    useCodeSetStore: vi.fn(() => ({
        setCurrentCodeSet: vi.fn(),
        setCurrentCodeGroup: vi.fn()
    }))
}));

// Mock the GlobalStore
vi.mock('@/stores', () => ({
    useGlobalStore: vi.fn(() => ({
        clearErrors: vi.fn()
    }))
}));

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
    useI18n: vi.fn(() => ({
        t: (key) => key
    }))
}));

// Mock the helpers
vi.mock('@/composables', () => ({
    useHelpers: vi.fn(() => ({
        filterByPermission: vi.fn((items) => items)
    }))
}));

describe('Services index view', () => {
    let wrapper;

    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();

        // Set up permissions
        updateAbility([
            'create service code sets',
            'view service code sets',
            'create service code groups',
            'view service code groups'
        ]);
    });

    it('renders correctly with all permissions', async () => {
        // Mount the component
        wrapper = mount(IndexView, {
            global: {
                stubs: {
                    Header: true,
                    Tabs: true,
                    Button: true,
                    Menu: true,
                    Label: true,
                    'router-view': true
                }
            }
        });

        // Check that the component renders
        expect(wrapper.exists()).toBe(true);
    });

    it('has a showMenu method that toggles the menu', async () => {
        // Create a mock for the toggle method
        const toggleMock = vi.fn();

        // Mount the component with stubbed components
        wrapper = mount(IndexView, {
            global: {
                stubs: {
                    Header: true,
                    Tabs: true,
                    Button: true,
                    Menu: true,
                    Label: true,
                    'router-view': true
                }
            }
        });

        // Set the menu ref
        wrapper.vm.menu = { toggle: toggleMock };

        // Call the showMenu method directly
        const event = {};
        wrapper.vm.showMenu(event);

        // Check that the toggle method was called with the event
        expect(toggleMock).toHaveBeenCalledWith(event);
    });

    it('navigates to the correct route when pushRoute is called', async () => {
        // Mount the component with stubbed components
        wrapper = mount(IndexView, {
            global: {
                stubs: {
                    Header: true,
                    Tabs: true,
                    Button: true,
                    Menu: true,
                    Label: true,
                    'router-view': true
                }
            }
        });

        // Call the pushRoute method directly
        await wrapper.vm.pushRoute('New Code Set');

        // Check that the router.push method was called with the correct arguments
        expect(mockPush).toHaveBeenCalledWith({
            name: 'New Code Set',
            params: { id: -1 }
        });
    });

    it('filters menu items based on permissions', async () => {
        // Mock the filterByPermission method to return only items with specific permissions
        const filterByPermissionMock = vi.fn((items) => {
            return items.filter(
                (item) => item.permission === 'create service code sets'
            );
        });

        // Mock the useHelpers function to return our mock
        vi.mocked(useHelpers).mockReturnValue({
            filterByPermission: filterByPermissionMock
        });

        // Mount the component with stubbed components
        wrapper = mount(IndexView, {
            global: {
                stubs: {
                    Header: true,
                    Tabs: true,
                    Button: true,
                    Menu: true,
                    Label: true,
                    'router-view': true
                }
            }
        });

        // Access the computed properties directly to trigger the filterByPermission calls
        const menuItemsComputed = wrapper.vm.menuItems;
        const tabItemsComputed = wrapper.vm.tabItems;

        // Check that filterByPermission was called
        expect(filterByPermissionMock).toHaveBeenCalled();
    });
});
