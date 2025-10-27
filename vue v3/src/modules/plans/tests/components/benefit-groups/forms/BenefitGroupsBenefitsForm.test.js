import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import BenefitGroupsBenefitsForm from '@/modules/plans/components/benefit-groups/forms/BenefitGroupsBenefitsForm.vue';
import { nextTick } from 'vue';

// --- Mocks Setup ---
const mockSyncBenefitGroupWithBenefits = vi.fn().mockResolvedValue({});
const mockGetAllBenefitsByCategory = vi.fn().mockResolvedValue({
    data: [
        { id: '1', name: { en: 'Benefit 1' } },
        { id: '2', name: { en: 'Benefit 2' } }
    ]
});
const mockSearchBenefitCategories = vi.fn().mockResolvedValue({
    data: [
        { id: '1', name: { en: 'Category 1' } },
        { id: '2', name: { en: 'Category 2' } }
    ]
});

vi.mock('@/modules/plans/stores/Benefit', () => ({
    useBenefitStore: vi.fn(() => ({
        syncBenefitGroupWithBenefits: mockSyncBenefitGroupWithBenefits,
        getAllBenefitsByCategory: mockGetAllBenefitsByCategory
    }))
}));

vi.mock('@/stores', () => ({
    useCommonStore: vi.fn(() => ({
        searchBenefitCategories: mockSearchBenefitCategories
    }))
}));

const mockEmit = vi.fn();
vi.mock('@/composables/event-bus', () => ({
    default: vi.fn(() => ({
        emit: mockEmit
    }))
}));

const ApiMultiselectStub = {
    name: 'ApiMultiselect',
    template: '<div :data-testid="dataTestid"><slot /></div>',
    props: ['dataTestid', 'modelValue'],
    emits: ['update:modelValue', 'search', 'change']
};

describe('BenefitGroupsBenefitsForm.vue', () => {
    let wrapper;

    beforeEach(async () => {
        vi.clearAllMocks();
        wrapper = mount(BenefitGroupsBenefitsForm, {
            props: {
                id: '123'
            },
            global: {
                stubs: {
                    ApiMultiselect: ApiMultiselectStub,
                    Button: {
                        template:
                            '<button :data-testid="dataTestid" @click="$emit(\'click\')"><slot /></button>',
                        props: ['dataTestid'],
                        emits: ['click']
                    }
                },
                mocks: {
                    $t: (key) => key
                }
            }
        });
        await nextTick();
    });

    it('renders the component correctly', () => {
        expect(wrapper.exists()).toBe(true);
        expect(wrapper.find('[data-testid="input-category"]').exists()).toBe(
            true
        );
        expect(wrapper.find('[data-testid="input-benefits"]').exists()).toBe(
            true
        );
        expect(wrapper.find('[data-testid="button-sync"]').exists()).toBe(true);
    });

    it('loads benefit categories when the category multiselect is searched', async () => {
        const categoryMultiselect = wrapper.findComponent(
            '[data-testid="input-category"]'
        );
        await categoryMultiselect.vm.$emit('search', '');

        expect(mockSearchBenefitCategories).toHaveBeenCalledWith({
            search: { value: '' },
            page: 1
        });
    });

    it('loads benefits when a category is selected', async () => {
        wrapper.vm.formData.categories = [
            { id: '1', name: { en: 'Category 1' } }
        ];

        const categoryMultiselect = wrapper.findComponent(
            '[data-testid="input-category"]'
        );
        await categoryMultiselect.vm.$emit('change');

        expect(mockGetAllBenefitsByCategory).toHaveBeenCalledWith({
            filters: [
                { field: 'category.id', operator: 'in', value: ['1'] },
                { field: 'status', operator: '=', value: 'active' }
            ],
            search: { value: '' },
            page: 1
        });
    });

    it('searches for benefits when a search term is entered', async () => {
        wrapper.vm.formData.categories = [
            { id: '1', name: { en: 'Category 1' } }
        ];

        const benefitsMultiselect = wrapper.findComponent(
            '[data-testid="input-benefits"]'
        );
        await benefitsMultiselect.vm.$emit('search', 'test term');

        expect(mockGetAllBenefitsByCategory).toHaveBeenCalledWith({
            filters: [
                { field: 'category.id', operator: 'in', value: ['1'] },
                { field: 'status', operator: '=', value: 'active' }
            ],
            search: { value: 'test term' },
            page: 1
        });
    });

    it('syncs selected benefits when the sync button is clicked', async () => {
        wrapper.vm.formData.benefits = [
            { id: '1', name: { en: 'Benefit 1' } },
            { id: '2', name: { en: 'Benefit 2' } }
        ];
        await nextTick();

        await wrapper.find('[data-testid="button-sync"]').trigger('click');

        expect(mockSyncBenefitGroupWithBenefits).toHaveBeenCalledWith('123', [
            '1',
            '2'
        ]);
        expect(mockEmit).toHaveBeenCalledWith('openSyncPricesDialog');
        expect(mockEmit).toHaveBeenCalledWith('reloadBenefits');
        expect(wrapper.emitted('setTotalBenefitIncluded')[0]).toEqual([2]);
        expect(wrapper.vm.formData.benefits).toEqual([]);
        expect(wrapper.vm.formData.categories).toEqual([]);
    });

    it('does not sync if no benefits are selected', async () => {
        wrapper.vm.formData.benefits = [];
        await nextTick();

        await wrapper.find('[data-testid="button-sync"]').trigger('click');

        expect(mockSyncBenefitGroupWithBenefits).not.toHaveBeenCalled();
    });
});
