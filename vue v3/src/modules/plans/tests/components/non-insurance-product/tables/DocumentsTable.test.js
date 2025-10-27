import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import DocumentsTable from '@/components/documents/DocumentsTable.vue';
import { ref } from 'vue';

vi.mock('@/modules/plans/composables/useEditState', async () => {
    const actual = await vi.importActual(
        '@/modules/plans/composables/useEditState'
    );
    return {
        ...actual,
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
        }),
        provideEditState: vi.fn()
    };
});

const mockDocumentStore = {
    listDocuments: vi.fn(),
    deleteDocument: vi.fn(),
    duplicateDocument: vi.fn(),
    moveDocument: vi.fn(),
    renameDocument: vi.fn()
};

const mockGlobalStore = {
    showError: vi.fn()
};

const mockHelpers = {
    formatDate: vi.fn((date) => date)
};

const mockI18n = {
    t: (key) => key,
    availableLocales: ['en', 'es']
};

vi.mock('@/stores', () => ({
    useDocumentStore: () => mockDocumentStore,
    useGlobalStore: () => mockGlobalStore
}));

vi.mock('@/composables', () => ({
    useHelpers: () => mockHelpers
}));

vi.mock('vue-i18n', () => ({
    useI18n: () => mockI18n
}));

describe('DocumentsTable', () => {
    const defaultProps = {
        type: 'nonInsuranceProduct',
        id: '123',
        isNew: true,
        isHide: false
    };

    const mockDocuments = {
        data: {
            tree: {
                all: [
                    {
                        key: 'folder1',
                        data: {
                            name: 'Folder 1',
                            size: 'N/A',
                            type: 'folder',
                            is_attached: false,
                            info: {
                                last_modified: '2024-01-01'
                            }
                        }
                    },
                    {
                        key: 'file1.pdf',
                        data: {
                            name: 'File 1.pdf',
                            size: '1MB',
                            type: 'file',
                            is_attached: false,
                            info: {
                                last_modified: '2024-01-01',
                                download_url: 'http://example.com/file1.pdf'
                            }
                        }
                    }
                ]
            },
            all: {}
        }
    };

    const mountOptions = {
        global: {
            mocks: {
                $t: (msg) => msg
            },
            stubs: {
                Button: true,
                InputField: true
            }
        },
        props: defaultProps
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockDocumentStore.listDocuments.mockResolvedValue(mockDocuments);
    });

    it('renders the documents table with correct initial state', async () => {
        const wrapper = mount(DocumentsTable, mountOptions);
        await wrapper.vm.$nextTick();

        expect(wrapper.find('[data-testid="page-title"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="locale-list-input"]').exists()).toBe(
            true
        );
        expect(wrapper.find('[data-testid="upload-button"]').exists()).toBe(
            true
        );
        expect(wrapper.find('[data-testid="new-folder-button"]').exists()).toBe(
            true
        );
    });

    it('loads documents on mount', async () => {
        const wrapper = mount(DocumentsTable, mountOptions);
        await wrapper.vm.$nextTick();

        expect(mockDocumentStore.listDocuments).toHaveBeenCalledWith(
            'nonInsuranceProduct',
            '123',
            'en'
        );
        expect(wrapper.vm.tree).toEqual(mockDocuments.data.tree);
    });

    it('handles locale change correctly', async () => {
        const wrapper = mount(DocumentsTable, mountOptions);
        await wrapper.vm.$nextTick();

        wrapper.vm.currentLocale = { id: 'es', name: 'Spanish' };
        await wrapper.vm.$nextTick();

        expect(mockDocumentStore.listDocuments).toHaveBeenCalledWith(
            'nonInsuranceProduct',
            '123',
            'es'
        );
    });

    it('shows edit/cancel buttons correctly when not in new mode', async () => {
        const wrapper = mount(DocumentsTable, {
            ...mountOptions,
            props: { ...defaultProps, isNew: false }
        });
        await wrapper.vm.$nextTick();

        expect(wrapper.find('[data-testid="edit-button"]').exists()).toBe(true);

        await wrapper.find('[data-testid="edit-button"]').trigger('click');
        expect(wrapper.vm.isEditing).toBe(true);
        expect(wrapper.find('[data-testid="cancel-button"]').exists()).toBe(
            true
        );
    });
});
