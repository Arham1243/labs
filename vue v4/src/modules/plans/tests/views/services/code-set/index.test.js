import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import IndexView from '@/modules/plans/views/services/code-set/index.vue';
import { searchTagsMock } from '@/../tests/mocks/Common.service.mocks';
import {
    getCodeSetMock,
    searchEntityServiceCodesMock
} from '@/modules/plans/tests/mocks/CodeSet.service.mocks';
import { updateAbility } from '@/plugins/ability';

// Mock useEditState
vi.mock('@/modules/plans/composables/useEditState', () => {
    const { ref } = require('vue');
    return {
        provideEditState: () => ({
            activeEditComponent: ref(null),
            showUnsavedDialog: ref(false),
            shouldUseLazy: ref(true),
            confirmDiscard: vi.fn(),
            cancelDiscard: vi.fn(),
            clearActiveComponent: vi.fn(),
            triggerCancelEdit: vi.fn(),
            setForceSkipConfirmation: vi.fn(),
            setupTabPrevention: vi.fn(),
            clearTabListeners: vi.fn(),
            registerCancelCallback: vi.fn(),
            unregisterCancelCallback: vi.fn()
        }),
        useEditState: () => ({
            activeEditComponent: ref(null),
            isAnyComponentEditing: ref(false),
            registerCancelCallback: vi.fn(),
            unregisterCancelCallback: vi.fn()
        })
    };
});

// Mock vue3-cookies
vi.mock('vue3-cookies', () => ({
    default: {
        VueCookies: {
            get: vi.fn(),
            set: vi.fn(),
            remove: vi.fn(),
            isKey: vi.fn(),
            keys: vi.fn()
        }
    }
}));

// Mock axios to prevent actual HTTP requests
vi.mock('axios', () => ({
    default: {
        create: () => ({
            interceptors: {
                request: { use: vi.fn(), eject: vi.fn() },
                response: { use: vi.fn(), eject: vi.fn() }
            },
            post: vi.fn().mockRejectedValue(new Error('Network Error')),
            get: vi.fn().mockRejectedValue(new Error('Network Error')),
            put: vi.fn().mockRejectedValue(new Error('Network Error')),
            delete: vi.fn().mockRejectedValue(new Error('Network Error')),
            request: vi.fn().mockRejectedValue(new Error('Network Error'))
        })
    }
}));

// Mock AuditTable API calls
vi.mock('@/components/common/AuditTable.vue', () => ({
    default: {
        name: 'AuditTable',
        props: {
            entity: String,
            entity_id: String
        },
        render() {
            return null;
        }
    }
}));

describe('code-set index view', () => {
    beforeEach(() => {
        searchTagsMock();
        searchEntityServiceCodesMock();
        getCodeSetMock();
    });

    it('renders correctly', async () => {
        updateAbility(['update service code sets', 'delete service code sets']);

        const wrapper = mount(IndexView, {
            props: { id: 'abc' },
            global: {
                stubs: {
                    AuditTable: true
                }
            }
        });

        expect(wrapper.findByTestId('code-set-name-label').exists()).toBe(true);

        expect(wrapper.findComponent({ name: 'StatusTag' }).exists()).toBe(
            true
        );

        expect(wrapper.findByTestId('actions-button').text()).toBe('Actions');
        expect(wrapper.findComponent({ name: 'Menu' }).exists()).toBe(true);
        expect(wrapper.findComponent({ name: 'CodeSetDetails' }).exists()).toBe(
            true
        );
        expect(
            wrapper.findComponent({ name: 'CodeSetsServiceCodes' }).exists()
        ).toBe(true);

        const activeTab = wrapper.find('.p-tabpanels > div:first-child');
        const auditTable = activeTab.findComponent({ name: 'AuditTable' });
        expect(auditTable.exists()).toBe(false);
    });
});
