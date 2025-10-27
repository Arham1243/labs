import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import NonInsuranceProductDocumentsView from '@/modules/plans/views/non-insurance-product/new/documents.vue';
import DocumentsTable from '@/components/documents/DocumentsTable.vue';

const mockRouter = {
    push: vi.fn()
};

vi.mock('vue-router', () => ({
    useRouter: () => mockRouter
}));

describe('NonInsuranceProductDocumentsView', () => {
    const mountOptions = {
        global: {
            mocks: {
                $t: (msg) => msg
            },
            stubs: {
                Button: true,
                DocumentsTable: true
            }
        },
        props: {
            id: '123'
        }
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the documents view correctly', () => {
        const wrapper = mount(NonInsuranceProductDocumentsView, mountOptions);

        const documentsTable = wrapper.findComponent(DocumentsTable);
        expect(documentsTable.exists()).toBe(true);
        expect(documentsTable.props()).toEqual(
            expect.objectContaining({
                type: 'non-insurance-products',
                id: '123',
                isHide: false,
                isNew: true
            })
        );
    });

    it('navigates back when back button is clicked', async () => {
        const wrapper = mount(NonInsuranceProductDocumentsView, mountOptions);

        const backButton = wrapper.find('[data-testid="back-button"]');
        expect(backButton.exists()).toBe(true);

        await backButton.trigger('click');

        expect(mockRouter.push).toHaveBeenCalledWith({
            name: 'New Non-Insurance Product Step 2',
            params: { id: '123' }
        });
    });

    it('navigates forward when save and continue button is clicked', async () => {
        const wrapper = mount(NonInsuranceProductDocumentsView, mountOptions);

        const continueButton = wrapper.find(
            '[data-testid="save-continue-button"]'
        );
        expect(continueButton.exists()).toBe(true);

        await continueButton.trigger('click');

        expect(mockRouter.push).toHaveBeenCalledWith({
            name: 'New Non-Insurance Product Step 4',
            params: { id: '123' }
        });
    });
});
