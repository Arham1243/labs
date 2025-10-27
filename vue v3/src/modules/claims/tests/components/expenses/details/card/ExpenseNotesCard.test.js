import { describe, beforeEach, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import ExpenseNotesCard from '@/modules/claims/components/expenses/details/card/ExpenseNotesCard.vue';

// Feed mock
const mockFeed = {
    id: '1',
    body: '<p>Sample body with <strong>HTML</strong> content</p>',
    created_at: '2024-01-01T12:00:00Z'
};

// Mock composables
vi.mock('@/composables', () => ({
    useHelpers: () => ({
        formatDate: () => '01-Jan-2024 12:00'
    })
}));

// Mock Feed Store
const mutateMock = vi.fn();
const onPageChangeMock = vi.fn();

vi.mock('@/stores/Feed', () => ({
    useFeedStore: () => ({
        searchFeeds: () => ({
            loading: ref(false),
            data: ref([mockFeed]),
            meta: { current_page: 1, last_page: 2 },
            pagination: { page: 1, limit: 15 },
            mutate: mutateMock,
            onPageChange: onPageChangeMock
        })
    })
}));

describe('ExpenseNotesCard.vue', () => {
    let wrapper;

    beforeEach(() => {
        mutateMock.mockClear();
        wrapper = mount(ExpenseNotesCard, {
            props: {
                clientId: '123'
            },
            global: {
                stubs: {
                    ActivityDialog: true // Don't mount full dialog
                }
            }
        });
    });

    it('renders the expense notes header with badge', () => {
        const title = wrapper.find('[data-testid="title-expense-notes"]');
        expect(title.exists()).toBe(true);
        expect(title.text()).toContain('Expense Notes');
    });

    it('calls loadFeeds on mount', () => {
        expect(mutateMock).toHaveBeenCalled();
    });

    it('renders feed preview content', () => {
        expect(wrapper.text()).toContain('Sample body with HTML content');
    });

    it('toggles visibility when chevron is clicked', async () => {
        const toggleBtn = wrapper.find(
            '[data-testid="btn-show-expense-notes"]'
        );
        expect(toggleBtn.exists()).toBe(true);

        await toggleBtn.trigger('click');

        // Content should now be hidden
        expect(
            wrapper.find('[data-testid="btn-show-expense-notes"]').exists()
        ).toBe(true);
        expect(wrapper.text()).not.toContain('Sample body with');
    });

    it('shows the ActivityDialog when plus icon is clicked', async () => {
        const plusIcon = wrapper.find('.pi-plus');
        expect(plusIcon.exists()).toBe(true);

        await plusIcon.trigger('click');
        expect(wrapper.vm.dialogState.visible).toBe(true);
    });

    it('shows the ActivityDialog with feed when edit icon is clicked', async () => {
        const editIcon = wrapper.find('.pi-pencil');
        expect(editIcon.exists()).toBe(true);

        await editIcon.trigger('click');
        expect(wrapper.vm.dialogState.visible).toBe(true);
        expect(wrapper.vm.dialogState.feed).toEqual(mockFeed);
    });
});
