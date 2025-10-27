import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePreferredLanguageStore } from '@/modules/administration/stores';
import { PreferredLanguageService } from '@/modules/administration/services';

// Mock the PreferredLanguageService
vi.mock('@/modules/administration/services', () => ({
    PreferredLanguageService: {
        search: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateStatus: vi.fn(),
        deleteItem: vi.fn()
    }
}));

// Mock the GlobalStore
vi.mock('@/stores', () => ({
    useGlobalStore: vi.fn(() => ({
        actionWrapper: vi.fn((fn) => fn()),
        showSuccess: vi.fn(),
        clearErrors: vi.fn()
    }))
}));

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
    useI18n: () => ({
        t: (key) => key
    })
}));

describe('PreferredLanguageStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    describe('search', () => {
        it('calls PreferredLanguageService.search with the correct parameters', async () => {
            const store = usePreferredLanguageStore();
            const payload = { search: 'EN' };
            const params = { page: 1, limit: 10 };
            const mockResponse = {
                data: {
                    data: [
                        {
                            code: 'EN',
                            name: 'English',
                            default: true,
                            status: 'active'
                        }
                    ],
                    meta: {
                        total: 1
                    }
                }
            };

            PreferredLanguageService.search.mockResolvedValue(mockResponse);

            const result = await store.search(payload, params);

            expect(PreferredLanguageService.search).toHaveBeenCalledWith(
                payload,
                params
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('create', () => {
        it('calls PreferredLanguageService.create with the correct parameters and shows success message', async () => {
            const store = usePreferredLanguageStore();
            const payload = {
                code: 'EN',
                name: 'English',
                default: false,
                status: 'active'
            };
            const mockResponse = {
                data: {
                    code: 'EN',
                    name: 'English',
                    default: false,
                    status: 'active'
                }
            };

            PreferredLanguageService.create.mockResolvedValue(mockResponse);

            const result = await store.create(payload);

            expect(PreferredLanguageService.create).toHaveBeenCalledWith(
                payload
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('update', () => {
        it('calls PreferredLanguageService.update with the correct parameters and shows success message', async () => {
            const store = usePreferredLanguageStore();
            const id = 'EN';
            const payload = {
                name: 'English Updated',
                default: true,
                status: 'active'
            };
            const mockResponse = {
                data: {
                    code: 'EN',
                    name: 'English Updated',
                    default: true,
                    status: 'active'
                }
            };

            PreferredLanguageService.update.mockResolvedValue(mockResponse);

            const result = await store.update(id, payload);

            expect(PreferredLanguageService.update).toHaveBeenCalledWith(
                id,
                payload
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('updateStatus', () => {
        it('calls PreferredLanguageService.updateStatus with the correct parameters and shows success message', async () => {
            const store = usePreferredLanguageStore();
            const id = 'EN';
            const payload = {
                status: 'inactive'
            };
            const mockResponse = {
                data: {
                    code: 'EN',
                    name: 'English',
                    default: true,
                    status: 'inactive'
                }
            };

            PreferredLanguageService.updateStatus.mockResolvedValue(
                mockResponse
            );

            const result = await store.updateStatus(id, payload);

            expect(PreferredLanguageService.updateStatus).toHaveBeenCalledWith(
                id,
                payload
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('deleteItem', () => {
        it('calls PreferredLanguageService.deleteItem with the correct parameters and shows success message', async () => {
            const store = usePreferredLanguageStore();
            const id = 'EN';
            const mockResponse = {
                data: {
                    success: true
                }
            };

            PreferredLanguageService.deleteItem.mockResolvedValue(mockResponse);

            const result = await store.deleteItem(id);

            expect(PreferredLanguageService.deleteItem).toHaveBeenCalledWith(
                id
            );
            expect(result).toEqual(mockResponse.data);
        });
    });
});
