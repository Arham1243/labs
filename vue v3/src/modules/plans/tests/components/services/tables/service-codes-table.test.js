import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ComponentName from '@/modules/plans/components/services/tables/ServiceCodesTable.vue';
import { searchTagsMock } from '@/../tests/mocks/Common.service.mocks';
import { searchEntityServiceCodesMock } from '@/modules/plans/tests/mocks/CodeSet.service.mocks';

vi.mock('vue-i18n', () => ({
    useI18n: vi.fn(() => ({
        t: (key) => key,
        locale: { value: 'en' }
    }))
}));

vi.mock('../../../stores/CodeSet', () => ({
    useCodeSetStore: vi.fn(() => ({
        searchEntityServiceCodes: vi.fn().mockResolvedValue({
            data: [
                {
                    id: 1,
                    code: 'ABC123',
                    description: { en: 'Description 1' },
                    tags: []
                },
                {
                    id: 2,
                    code: 'XYZ789',
                    description: { en: 'Description 2' },
                    tags: ['Tag1', 'Tag2']
                }
            ],
            meta: { total: 2 }
        })
    }))
}));

vi.mock('@/composables', () => ({
    useHelpers: vi.fn(() => ({
        getLocaleValue: vi.fn((value) => value),
        formatDate: vi.fn((date) => date)
    })),
    useEventsBus: vi.fn(() => ({
        emit: vi.fn()
    }))
}));

describe('ComponentName - Items Rendering Test', () => {
    let wrapper;

    beforeEach(async () => {
        searchTagsMock();
        searchEntityServiceCodesMock();

        wrapper = mount(ComponentName, {
            props: {
                entity: 'groups'
            },
            global: {
                stubs: {
                    BaseTable: {
                        template: `
                            <div data-testid="items-table">
                                <slot name="header"></slot>
                                <div v-for="item in value" :key="item.id" data-testid="table-row">
                                    <div data-testid="code">{{ item.code }}</div>
                                    <div data-testid="description">{{ item.description.en }}</div>
                                    <div v-if="item.tags.length">
                                        <span v-for="tag in item.tags" :key="tag" data-testid="tag">{{ tag }}</span>
                                    </div>
                                    <div v-else>
                                        <button data-testid="add-tag">Add Tag</button>
                                    </div>
                                </div>
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
                            '<input data-testid="search-input" v-model="modelValue" @input="$emit(\'search\')" />',
                        props: ['modelValue']
                    }
                }
            }
        });

        await wrapper.vm.getItems();
        await wrapper.vm.$nextTick();
    });

    it('renders the items table', () => {
        const table = wrapper.find('[data-testid="service-codes-table"]');
        expect(table.exists()).toBe(true);
    });

    it('renders the search input', () => {
        const searchInput = wrapper.find('[data-testid="search-input"]');
        expect(searchInput.exists()).toBe(true);
    });
});
