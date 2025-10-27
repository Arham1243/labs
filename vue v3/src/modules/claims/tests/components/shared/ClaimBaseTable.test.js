// ClaimBaseTable.test.js
import { mount, flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import { vi, describe, it, expect } from 'vitest';
import ClaimBaseTable from '@/modules/claims/components/shared/ClaimBaseTable.vue';

const fakeRow = {
    examiner_name: 'John Doe',
    status: 'open',
    policy_number: 'PN123',
    claim_ref_number: 'CR123',
    coverage: 50,
    max_amount: 1000,
    amount: 250,
    last_updated_by: 'Joe',
    created_at: '2025-08-21'
};

const BaseTable = {
    props: ['value', 'loading', 'paginator'],
    template: `
        <div>
            <div v-if="loading"><slot name="loading" /></div>
            <div v-else-if="!value || !value.length"><slot name="empty" /></div>
            <div v-else>
                <slot name="header" />
                <slot v-for="(row, i) in value" :data="row" :index="i" :key="i"></slot>
            </div>
        </div>
    `
};

const Column = {
    props: [
        'field',
        'header',
        'sortable',
        'sortField',
        'hidden',
        'headerClass',
        'footerStyle',
        'footer'
    ],
    setup(props, { slots }) {
        const row = fakeRow;
        return () => {
            if (props.hidden) return null;
            return slots.default
                ? slots.default({ data: row, index: 0 })
                : row[props.field];
        };
    }
};

const stubs = {
    BaseTable,
    Column,
    ClaimStatusTag: {
        template: '<div class="status-tag">StatusTag</div>',
        props: ['status']
    },
    Tag: { template: '<span><slot /></span>' },
    Button: {
        template: `<button v-bind="$attrs" @click="$emit('click')"><slot /></button>`
    },
    Search: { template: '<input />' },
    SearchableFieldDialog: { template: '<div>Dialog</div>' },
    RouterLink: { template: '<a><slot /></a>' }
};

function factory({
    data = ref([{ id: 1 }]),
    loading = false,
    exportAction = vi.fn(),
    payload = [],
    sortFilters
} = {}) {
    return mount(ClaimBaseTable, {
        props: {
            columns: [
                { label: 'Examiner', field: 'examiner_name', hidden: false },
                { label: 'Status', field: 'status', hidden: false },
                {
                    label: 'Policy',
                    field: 'policy_number',
                    type: 'link',
                    hidden: false
                },
                { label: 'Coverage', field: 'coverage', hidden: false },
                {
                    label: 'Amount',
                    field: 'amount',
                    type: 'currency',
                    hidden: false
                },
                {
                    label: 'Last Updated By',
                    field: 'last_updated_by',
                    hidden: true
                },
                {
                    label: 'Created At',
                    field: 'created_at',
                    type: 'date',
                    hidden: false
                }
            ],
            storeAction: () => ({
                mutate: vi.fn(),
                data,
                loading,
                meta: { total: data.value.length },
                pagination: { page: 1, limit: 10 },
                sortFilters: sortFilters ?? { getSortFilters: () => [] },
                onSearch: vi.fn(),
                onPageChange: vi.fn(),
                onSortChange: vi.fn()
            }),
            exportAction,
            payload,
            showExportButton: true
        },
        global: {
            stubs,
            mocks: { $t: (msg) => msg }
        }
    });
}

describe('ClaimBaseTable.vue', () => {
    it('renders empty state', async () => {
        const wrapper = factory({ data: ref([]) });
        await flushPromises();
        expect(wrapper.text()).toContain('common.datatable_no_found');
    });

    it('renders table row with fakeRow', async () => {
        const wrapper = factory({ data: ref([fakeRow]) });
        await flushPromises();

        expect(wrapper.text()).toContain('John Doe');
        expect(wrapper.text()).toContain('PN123');
        expect(wrapper.text()).toContain('250');
    });

    it('calls exportAction with correct payload when export button is clicked', async () => {
        const mockExportAction = vi.fn();

        const wrapper = factory({
            data: ref([fakeRow]),
            exportAction: mockExportAction,
            payload: { foo: 'bar' },
            sortFilters: {
                getSortFilters: () => [{ field: 'status', direction: 'asc' }]
            }
        });
        await flushPromises();

        const exportButton = wrapper.find('[data-testid="export-button"]');
        expect(exportButton.exists()).toBe(true);

        await exportButton.trigger('click');
        await flushPromises();

        // Validate the payload passed to exportAction
        const calledWith = mockExportAction.mock.calls[0][0];
        expect(calledWith.columns).toEqual([
            'examiner_name',
            'status',
            'policy_number',
            'coverage',
            'amount',
            'created_at'
        ]);
        expect(calledWith.foo).toBe('bar');
        expect(calledWith[0]).toMatchObject({
            field: 'status',
            direction: 'asc'
        });
    });

    it('renders columns without hidden column', async () => {
        const wrapper = factory({ data: ref([fakeRow]) });
        await flushPromises();

        expect(wrapper.text()).not.toContain('Joe');
    });

    it('renders column button and show dropdown after column button click', async () => {
        const wrapper = factory({ data: ref([fakeRow]) });
        await flushPromises();

        // Find the "columns" button and click it
        const columnButton = wrapper.find('[data-testid="column-button"]');
        expect(columnButton.exists()).toBe(true);
        await columnButton.trigger('click');

        const multiSelect = wrapper.findComponent({
            ref: 'columnSelectionsRef'
        });
        expect(multiSelect.exists()).toBe(true);
    });
});
