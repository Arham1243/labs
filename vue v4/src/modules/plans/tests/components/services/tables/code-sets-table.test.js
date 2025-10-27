import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ComponentName from '@/modules/plans/components/services/tables/CodeSetsTable.vue';
import { searchCodeSetsMock } from '@/modules/plans/tests/mocks/CodeSet.service.mocks';

vi.mock('vue-router', () => ({
    useRouter: vi.fn(() => ({
        push: vi.fn()
    }))
}));

vi.mock('../../../stores/CodeSet', () => ({
    useCodeSetStore: vi.fn(() => ({
        searchCodeSets: vi.fn().mockResolvedValue({
            data: [
                {
                    id: 1,
                    name: 'Test Code Set',
                    status: 'active',
                    effective_date: '2024-10-25'
                }
            ],
            meta: { total: 1 }
        })
    }))
}));

vi.mock('@/composables', () => ({
    useHelpers: vi.fn(() => ({
        getLocaleValue: vi.fn((value) => value),
        formatDate: vi.fn((date) => date)
    }))
}));

vi.mock('vue-i18n', () => ({
    useI18n: vi.fn(() => ({
        t: (key) => key,
        locale: { value: 'en' }
    }))
}));

describe('ComponentName - Rendering Tests', () => {
    let wrapper;

    beforeEach(async () => {
        searchCodeSetsMock();

        wrapper = mount(ComponentName, {
            global: {
                stubs: {
                    BaseTable: {
                        template: `
                            <div data-testid="code-sets-table">
                                <slot name="header"></slot>
                                <slot v-for="item in value" :data="item" />
                            </div>
                        `,
                        props: [
                            'value',
                            'loading',
                            'page',
                            'rows',
                            'totalRecords'
                        ]
                    },
                    Search: {
                        template:
                            '<input data-testid="input-search" v-model="modelValue" @input="$emit(\'search\')" />',
                        props: ['modelValue']
                    },
                    Menu: {
                        template:
                            '<div data-testid="actions-menu"><slot /></div>',
                        props: ['model', 'popup']
                    },
                    Button: {
                        template:
                            '<button data-testid="actions-button-0" @click="$emit(\'click\')"><slot /></button>',
                        props: ['label', 'icon']
                    },
                    Confirmation: {
                        template:
                            '<div v-if="modelValue" data-testid="status-update-dialog"><slot /></div>',
                        props: ['modelValue']
                    },
                    StatusTag: {
                        template:
                            '<span data-testid="status-tag-data-0">{{ status }}</span>',
                        props: ['status']
                    }
                }
            },
            data() {
                return {
                    items: [
                        {
                            id: 1,
                            name: 'Test Code Set',
                            status: 'active',
                            effective_date: '2024-10-25'
                        }
                    ],
                    selectedItem: { id: 1, status: 'active' }
                };
            }
        });

        await wrapper.vm.$nextTick();
    });

    it('renders the code sets table', () => {
        const table = wrapper.find('[data-testid="code-sets-table"]');
        expect(table.exists()).toBe(true);
    });

    it('renders the search input', () => {
        const searchInput = wrapper.find('[data-testid="input-search"]');
        expect(searchInput.exists()).toBe(true);
    });

    it('renders the status update dialog', async () => {
        wrapper.vm.statusUpdateDialog = true;
        await wrapper.vm.$nextTick();
        const statusUpdateDialog = wrapper.find(
            '[data-testid="status-update-dialog"]'
        );
        expect(statusUpdateDialog.exists()).toBe(true);
    });

    it('renders the delete dialog', async () => {
        wrapper.vm.deleteDialog = true;
        await wrapper.vm.$nextTick();
        const deleteDialog = wrapper.find('[data-testid="delete-dialog"]');
        expect(deleteDialog.exists()).toBe(true);
    });
});
