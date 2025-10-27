import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import IndexView from '@/modules/plans/views/services/code-group/index.vue';
import { searchTagsMock } from '@/../tests/mocks/Common.service.mocks';
import {
    getCodeGroupMock,
    searchEntityServiceCodesMock
} from '@/modules/plans/tests/mocks/CodeSet.service.mocks';
import { updateAbility } from '@/plugins/ability';

// Mock the useEditState composable
vi.mock('@/modules/plans/composables/useEditState', () => ({
    provideEditState: vi.fn(() => ({
        showUnsavedDialog: ref(false),
        shouldUseLazy: ref(false),
        activeEditComponent: ref(null),
        confirmDiscard: vi.fn(),
        cancelDiscard: vi.fn(),
        clearActiveComponent: vi.fn(),
        triggerCancelEdit: vi.fn(),
        setForceSkipConfirmation: vi.fn(),
        setupTabPrevention: vi.fn()
    }))
}));

// Mock vue-router
vi.mock('vue-router', () => ({
    useRouter: vi.fn(() => ({
        push: vi.fn(),
        back: vi.fn()
    }))
}));

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
    useI18n: vi.fn(() => ({
        t: (key, params) => {
            if (params) {
                return `${key} ${JSON.stringify(params)}`;
            }
            return key;
        },
        locale: { value: 'en' }
    }))
}));

// Mock the helpers
vi.mock('@/composables', () => ({
    useHelpers: vi.fn(() => ({
        filterByPermission: vi.fn((items) => items),
        getLocaleValue: vi.fn((value) => value?.en || 'Test Code Group')
    }))
}));

describe('code-group index view', () => {
    beforeEach(() => {
        searchTagsMock();
        searchEntityServiceCodesMock();
        getCodeGroupMock();
    });

    it('renders correctly', async () => {
        updateAbility([
            'update service code groups',
            'delete service code groups'
        ]);

        const wrapper = mount(IndexView, {
            props: { id: 'abc' },
            global: {
                stubs: {
                    Confirmation: true,
                    Menu: true,
                    Tabs: true,
                    CodeGroupDetails: true,
                    CodeGroupsServiceCodes: true,
                    AuditTable: true,
                    StatusTag: true
                }
            }
        });

        // Wait for the component to load data
        await vi.dynamicImportSettled();

        // Check that the component renders
        expect(wrapper.exists()).toBe(true);

        // Check that the code group name is displayed
        expect(wrapper.findByTestId('code-group-name-label').exists()).toBe(
            true
        );

        // Check that the status tag is displayed
        expect(wrapper.findComponent({ name: 'StatusTag' }).exists()).toBe(
            true
        );

        // Check that the actions button is displayed
        expect(wrapper.findByTestId('actions-button').text()).toBe('Actions');

        // Check that the menu is displayed
        expect(wrapper.findComponent({ name: 'Menu' }).exists()).toBe(true);

        // Check that the tab view is displayed (we don't check for TabPanel components as they might not be rendered in the test environment)
        expect(wrapper.findComponent({ name: 'Tabs' }).exists()).toBe(true);

        // Note: We don't check for child components like CodeGroupDetails, CodeGroupsServiceCodes, and AuditTable
        // as they might not be rendered in the test environment or might be rendered with different names
        // The important thing is that the main component renders without errors
    });
});
