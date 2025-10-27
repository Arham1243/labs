import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import NonInsuranceProductDetailsView from '@/modules/plans/views/non-insurance-product/new/details.vue';

vi.mock('vue-router', async (importOriginal) => {
    const mod = await importOriginal();

    return {
        ...mod,
        useRouter: () => ({
            push: vi.fn()
        })
    };
});

vi.mock('@/modules/plans/stores/NonInsuranceProduct', () => ({
    useNonInsuranceProductStore: () => ({
        getNonInsuranceProduct: vi.fn(),
        createNonInsuranceProduct: vi.fn(),
        updateNonInsuranceProduct: vi.fn(),
        setCurrentNonInsuranceProduct: vi.fn()
    })
}));

describe('MNonInsuranceProductDetailsView', () => {
    const mountOptions = {
        global: {
            mocks: {
                $t: (msg) => msg
            },
            stubs: {
                NonInsuranceProductDetailsForm: true
            }
        },
        props: {
            id: '-1'
        }
    };

    it('renders the Non-Insurance Product details view correctly', () => {
        const wrapper = mount(NonInsuranceProductDetailsView, mountOptions);

        const title = wrapper.find('[data-testid="details-title"]');
        expect(title.exists()).toBe(true);
        expect(title.text()).toBe('Non-Insurance Product Details');

        expect(wrapper.findByTestId('select-from-existing-button').text()).toBe(
            'Select from existing'
        );
    });

    it('displays save and select buttons', () => {
        const wrapper = mount(NonInsuranceProductDetailsView, mountOptions);

        const saveButton = wrapper.find('[data-testid="save-continue-button"]');
        expect(saveButton.exists()).toBe(true);
    });
});
