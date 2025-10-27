import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import NonInsuranceProductReviewView from '@/modules/plans/views/non-insurance-product/new/review.vue';
import NonInsuranceProductDetails from '@/modules/plans/components/non-insurance-product/NonInsuranceProductDetails.vue';
import DocumentsTable from '@/components/documents/DocumentsTable.vue';

const mockRouter = {
    push: vi.fn()
};

const mockNonInsuranceProductStore = {
    getNonInsuranceProduct: vi.fn(),
    publishNonInsuranceProduct: vi.fn(),
    setCurrentNonInsuranceProduct: vi.fn(),
    searchNonInsuranceProductPrices: vi.fn()
};

const mockHelpers = {
    getLocaleValue: vi.fn()
};

vi.mock('vue-router', () => ({
    useRouter: () => mockRouter
}));

vi.mock('@/modules/plans/stores/NonInsuranceProduct', () => ({
    useNonInsuranceProductStore: () => mockNonInsuranceProductStore
}));

vi.mock('@/composables', () => ({
    useHelpers: () => mockHelpers
}));

describe('NonInsuranceProductReviewView', () => {
    const mountOptions = {
        global: {
            mocks: {
                $t: (msg) => msg
            },
            stubs: {
                Button: true,
                NonInsuranceProductDetails: true,
                DocumentsTable: true
            }
        },
        props: {
            id: '123',
            isHide: false
        }
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockNonInsuranceProductStore.getNonInsuranceProduct.mockResolvedValue({
            data: {
                id: '123',
                name: { en: 'Test Non-Insurance Product' }
            }
        });
    });

    it('renders the review view with Non-Insurance Product data', async () => {
        const wrapper = mount(NonInsuranceProductReviewView, mountOptions);

        await wrapper.vm.$nextTick();

        const title = wrapper.find('[data-testid="review-title"]');
        expect(title.exists()).toBe(true);
        expect(title.text()).toBe(
            'non_insurance_products.review_non_insurance_product_summary'
        );

        expect(wrapper.findComponent(NonInsuranceProductDetails).exists()).toBe(
            true
        );
        expect(wrapper.findComponent(DocumentsTable).exists()).toBe(true);
    });

    it('loads Non-Insurance Product data on mount', async () => {
        const wrapper = mount(NonInsuranceProductReviewView, mountOptions);
        await wrapper.vm.$nextTick();

        expect(
            mockNonInsuranceProductStore.getNonInsuranceProduct
        ).toHaveBeenCalledWith('123');
        expect(
            mockNonInsuranceProductStore.setCurrentNonInsuranceProduct
        ).toHaveBeenCalledWith({
            id: '123',
            name: { en: 'Test Non-Insurance Product' }
        });
    });

    it('navigates back when back button is clicked', async () => {
        const wrapper = mount(NonInsuranceProductReviewView, mountOptions);
        await wrapper.vm.$nextTick();

        const backButton = wrapper.find('[data-testid="back-button"]');
        await backButton.trigger('click');

        expect(mockRouter.push).toHaveBeenCalledWith({
            name: 'New Non-Insurance Product Step 3',
            params: { id: '123' }
        });
    });

    it('shows confirmation dialog when publish button is clicked', async () => {
        const wrapper = mount(NonInsuranceProductReviewView, mountOptions);
        await wrapper.vm.$nextTick();

        const publishButton = wrapper.find(
            '[data-testid="confirm-publish-button"]'
        );
        await publishButton.trigger('click');

        expect(wrapper.vm.isPublishDialog).toBe(true);
    });

    it('publishes Non-Insurance Product and navigates on confirmation', async () => {
        const wrapper = mount(NonInsuranceProductReviewView, mountOptions);
        await wrapper.vm.$nextTick();

        mockNonInsuranceProductStore.publishNonInsuranceProduct.mockResolvedValue(
            {}
        );
        mockNonInsuranceProductStore.searchNonInsuranceProductPrices.mockResolvedValue(
            {}
        );

        await wrapper.vm.publishNonInsuranceProduct();

        expect(
            mockNonInsuranceProductStore.publishNonInsuranceProduct
        ).toHaveBeenCalledWith(
            '123',
            expect.objectContaining({ status: 'active' }),
            expect.any(Object)
        );

        expect(mockRouter.push).toHaveBeenCalledWith({
            name: 'Non-Insurance Products',
            params: { id: '123' }
        });
    });
});
