import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { nextTick } from 'vue';
import PlanDetailsForm from '@/modules/plans/components/plans/forms/PlanDetailsForm.vue';

// Mock the CommonStore
const mockSearchCompanyUsers = vi.fn().mockResolvedValue({
    data: [
        { id: '1', name: 'User 1' },
        { id: '2', name: 'User 2' }
    ]
});

vi.mock('@/stores', () => ({
    useCommonStore: vi.fn(() => ({
        searchCompanyUsers: mockSearchCompanyUsers
    }))
}));

describe('PlanDetailsForm - Rendering Tests', () => {
    let wrapper;
    const mockModelValue = {
        name: { en: 'Test Plan' },
        bound: { name: 'Inbound', value: 'in' },
        type: { name: 'Domestic', value: 'domestic' },
        effective_date: '2023-01-01',
        end_date: '2023-12-31',
        authorized: { id: '1', name: 'User 1' }
    };

    beforeEach(async () => {
        vi.clearAllMocks();

        wrapper = mount(PlanDetailsForm, {
            props: {
                modelValue: mockModelValue,
                isNew: false
            },
            global: {
                stubs: {
                    LocaleField: {
                        template:
                            '<div data-testid="locale-field"><slot /></div>',
                        props: [
                            'id',
                            'label',
                            'type',
                            'variant',
                            'multiple',
                            'modelValue'
                        ],
                        emits: ['update:modelValue']
                    },
                    InputField: {
                        template:
                            '<div data-testid="input-field"><slot /></div>',
                        props: [
                            'id',
                            'variant',
                            'modelValue',
                            'options',
                            'optionLabel'
                        ],
                        emits: ['update:modelValue']
                    },
                    DatePicker: {
                        template:
                            '<input type="date" :data-testid="id" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
                        props: ['id', 'modelValue'],
                        emits: ['update:modelValue']
                    },
                    ApiDropdown: {
                        template: '<div :data-testid="id"><slot /></div>',
                        props: [
                            'id',
                            'optionLabel',
                            'modelValue',
                            'loading',
                            'items'
                        ],
                        emits: ['update:modelValue', 'search']
                    }
                },
                mocks: {
                    $t: (key) => {
                        const translations = {
                            'common.effective_date': 'Effective Date',
                            'common.end_date': 'End Date',
                            'common.authorized_by': 'Authorized By'
                        };
                        return translations[key] || key;
                    }
                }
            }
        });

        await nextTick();
    });

    it('renders the component', () => {
        expect(wrapper.exists()).toBe(true);
    });

    it('renders the name field', () => {
        const nameField = wrapper.findByTestId('name');
        expect(nameField.exists()).toBe(true);
    });

    it('renders the bound field', () => {
        const boundField = wrapper.findByTestId('bound');
        expect(boundField.exists()).toBe(true);
    });

    it('renders the type field', () => {
        const typeField = wrapper.findByTestId('type');
        expect(typeField.exists()).toBe(true);
    });

    it('renders the effective_date field', () => {
        const effectiveDateField = wrapper.findByTestId('effective_date');
        expect(effectiveDateField.exists()).toBe(true);
    });

    it('renders the end_date field', () => {
        const endDateField = wrapper.findByTestId('end_date');
        expect(endDateField.exists()).toBe(true);
    });

    it('renders the authorized_by_id field', () => {
        const authorizedByField = wrapper.findByTestId('authorized_by_id');
        expect(authorizedByField.exists()).toBe(true);
    });

    it('loads users on mount', () => {
        expect(mockSearchCompanyUsers).toHaveBeenCalledWith(
            { scopes: [] },
            { limit: 100 }
        );
    });
});

describe('PlanDetailsForm - Interaction Tests', () => {
    let wrapper;
    const mockModelValue = {
        name: { en: 'Test Plan' },
        bound: { name: 'Inbound', value: 'in' },
        type: { name: 'Domestic', value: 'domestic' },
        effective_date: '2023-01-01',
        end_date: '2023-12-31',
        authorized: { id: '1', name: 'User 1' }
    };

    beforeEach(async () => {
        vi.clearAllMocks();

        wrapper = mount(PlanDetailsForm, {
            props: {
                modelValue: mockModelValue,
                isNew: false
            },
            global: {
                stubs: {
                    LocaleField: {
                        template:
                            '<div data-testid="locale-field"><input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /></div>',
                        props: [
                            'id',
                            'label',
                            'type',
                            'variant',
                            'multiple',
                            'modelValue'
                        ],
                        emits: ['update:modelValue']
                    },
                    InputField: {
                        template:
                            '<div data-testid="input-field"><input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /></div>',
                        props: [
                            'id',
                            'variant',
                            'modelValue',
                            'options',
                            'optionLabel'
                        ],
                        emits: ['update:modelValue']
                    },
                    DatePicker: {
                        template:
                            '<input type="date" :data-testid="id" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
                        props: ['id', 'modelValue'],
                        emits: ['update:modelValue']
                    },
                    ApiDropdown: {
                        template:
                            '<div :data-testid="id"><input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /><button data-testid="search-button" @click="$emit(\'search\', \'search-term\')">Search</button></div>',
                        props: [
                            'id',
                            'optionLabel',
                            'modelValue',
                            'loading',
                            'items'
                        ],
                        emits: ['update:modelValue', 'search']
                    }
                },
                mocks: {
                    $t: (key) => {
                        const translations = {
                            'common.effective_date': 'Effective Date',
                            'common.end_date': 'End Date',
                            'common.authorized_by': 'Authorized By'
                        };
                        return translations[key] || key;
                    }
                }
            }
        });

        await nextTick();
    });

    it('searches users when search is triggered', async () => {
        const searchButton = wrapper.findByTestId('search-button');
        await searchButton.trigger('click');

        expect(mockSearchCompanyUsers).toHaveBeenCalledWith(
            {
                scopes: [{ name: 'fullNameLike', parameters: ['search-term'] }]
            },
            { limit: 100 }
        );
    });

    it('updates users when search is successful', async () => {
        // Initial users should contain the mock data from onMounted
        expect(wrapper.vm.users).toEqual([
            { id: '1', name: 'User 1' },
            { id: '2', name: 'User 2' }
        ]);

        // Mock a different response for the search
        mockSearchCompanyUsers.mockResolvedValueOnce({
            data: [
                { id: '3', name: 'User 3' },
                { id: '4', name: 'User 4' }
            ]
        });

        // Trigger search
        const searchButton = wrapper.findByTestId('search-button');
        await searchButton.trigger('click');

        // Wait for the search to complete
        await nextTick();

        // Check that users were updated with the new data
        expect(wrapper.vm.users).toEqual([
            { id: '3', name: 'User 3' },
            { id: '4', name: 'User 4' }
        ]);
    });

    it('sets loadingUsers to true during search', async () => {
        // Mock a delayed response
        mockSearchCompanyUsers.mockImplementationOnce(() => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        data: [
                            { id: '1', name: 'User 1' },
                            { id: '2', name: 'User 2' }
                        ]
                    });
                }, 100);
            });
        });

        // Trigger search
        const searchButton = wrapper.findByTestId('search-button');
        await searchButton.trigger('click');

        // Check that loadingUsers is true during search
        expect(wrapper.vm.loadingUsers).toBe(true);

        // Wait for the search to complete
        await new Promise((resolve) => setTimeout(resolve, 150));
        await nextTick();

        // Check that loadingUsers is false after search
        expect(wrapper.vm.loadingUsers).toBe(false);
    });

    it('handles search error gracefully', async () => {
        // Mock a rejected promise
        mockSearchCompanyUsers.mockRejectedValueOnce(
            new Error('Search failed')
        );

        // Trigger search
        const searchButton = wrapper.findByTestId('search-button');
        await searchButton.trigger('click');

        // Wait for the search to complete
        await nextTick();

        // Check that loadingUsers is false after error
        expect(wrapper.vm.loadingUsers).toBe(false);
    });

    it('updates model value when form fields change', async () => {
        // Change effective date
        const effectiveDateField = wrapper.find(
            '[data-testid="effective_date"] input'
        );
        await effectiveDateField.setValue('2023-02-01');

        // Check that model value was updated
        expect(wrapper.vm.formData.effective_date).toBe('2023-02-01');
    });
});
