import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useVendorStore } from '@/modules/administration/stores';
import { VendorService } from '@/modules/administration/services';

// Mock the VendorService
vi.mock('@/modules/administration/services', () => ({
    VendorService: {
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

describe('VendorStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    describe('search', () => {
        it('calls VendorService.search with the correct parameters', async () => {
            const store = useVendorStore();
            const payload = { search: 'Test' };
            const params = { page: 1, limit: 10 };
            const mockResponse = {
                data: {
                    data: [
                        {
                            id: '123',
                            name: 'Test Vendor',
                            status: 'active'
                        }
                    ],
                    meta: {
                        total: 1
                    }
                }
            };

            VendorService.search.mockResolvedValue(mockResponse);

            const result = await store.search(payload, params);

            expect(VendorService.search).toHaveBeenCalledWith(payload, params);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('create', () => {
        it('calls VendorService.create with the correct parameters and shows success message', async () => {
            const store = useVendorStore();
            const payload = {
                name: 'Test Vendor',
                status: 'active'
            };
            const mockResponse = {
                data: {
                    id: '123',
                    name: 'Test Vendor',
                    status: 'active'
                }
            };

            VendorService.create.mockResolvedValue(mockResponse);

            const result = await store.create(payload);

            expect(VendorService.create).toHaveBeenCalledWith(payload);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('update', () => {
        it('calls VendorService.update with the correct parameters and shows success message', async () => {
            const store = useVendorStore();
            const id = '123';
            const payload = {
                name: 'Test Vendor Updated',
                status: 'active'
            };
            const mockResponse = {
                data: {
                    id: '123',
                    name: 'Test Vendor Updated',
                    status: 'active'
                }
            };

            VendorService.update.mockResolvedValue(mockResponse);

            const result = await store.update(id, payload);

            expect(VendorService.update).toHaveBeenCalledWith(id, payload);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('updateStatus', () => {
        it('calls VendorService.updateStatus with the correct parameters and shows success message', async () => {
            const store = useVendorStore();
            const id = '123';
            const payload = {
                status: 'inactive'
            };
            const mockResponse = {
                data: {
                    id: '123',
                    name: 'Test Vendor',
                    status: 'inactive'
                }
            };

            VendorService.updateStatus.mockResolvedValue(mockResponse);

            const result = await store.updateStatus(id, payload);

            expect(VendorService.updateStatus).toHaveBeenCalledWith(
                id,
                payload
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('deleteItem', () => {
        it('calls VendorService.deleteItem with the correct parameters and shows success message', async () => {
            const store = useVendorStore();
            const id = '123';
            const mockResponse = {
                data: {
                    success: true
                }
            };

            VendorService.deleteItem.mockResolvedValue(mockResponse);

            const result = await store.deleteItem(id);

            expect(VendorService.deleteItem).toHaveBeenCalledWith(id);
            expect(result).toEqual(mockResponse.data);
        });
    });
});
