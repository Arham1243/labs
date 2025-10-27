import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import MyComponent from '@/modules/plans/components/services/CodeSetsServiceCodes.vue';
import ServiceCodesTable from '@/modules/plans/components/services/tables/ServiceCodesTable.vue';
import { searchTagsMock } from '@/../tests/mocks/Common.service.mocks';
import { searchEntityServiceCodesMock } from '@/modules/plans/tests/mocks/CodeSet.service.mocks';
import { ref } from 'vue';

vi.mock('@/modules/plans/composables/useEditState', () => ({
    useEditState: () => ({
        activeEditComponent: ref(null),
        showUnsavedDialog: ref(false),
        setActiveComponent: vi.fn(),
        clearActiveComponent: vi.fn(),
        handleUnsavedChanges: vi.fn(),
        confirmDiscard: vi.fn(),
        cancelDiscard: vi.fn(),
        registerCancelCallback: vi.fn(),
        unregisterCancelCallback: vi.fn(),
        triggerCancelEdit: vi.fn()
    })
}));

describe('MyComponent', () => {
    let wrapper;

    beforeEach(() => {
        searchTagsMock();
        searchEntityServiceCodesMock();

        wrapper = mount(MyComponent, {
            props: {
                id: '123',
                isNew: false
            },
            global: {
                stubs: {
                    Button: true
                }
            }
        });
    });

    it('renders the page title correctly for existing service codes', () => {
        const pageTitle = wrapper.find('[data-testid="page-title"]');
        expect(pageTitle.exists()).toBe(true);
        expect(pageTitle.text()).toBe('Services');
    });

    it('renders the page title correctly for new service codes', async () => {
        await wrapper.setProps({ isNew: true });
        const pageTitle = wrapper.find('[data-testid="page-title"]');
        expect(pageTitle.exists()).toBe(true);
        expect(pageTitle.text()).toBe(
            'Add service codes to include in code set'
        );
    });

    it('renders the ServiceCodesTable with correct props', () => {
        const serviceCodesTable = wrapper.findComponent(ServiceCodesTable);
        expect(serviceCodesTable.exists()).toBe(true);
        expect(serviceCodesTable.props('id')).toBe('123');
        expect(serviceCodesTable.props('entity')).toBe('sets');
    });
});
