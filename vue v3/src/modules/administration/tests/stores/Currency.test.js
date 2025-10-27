import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCurrencyStore } from '@/modules/administration/stores';
import { CurrencyService } from '@/modules/administration/services';

// Mock the CurrencyService
vi.mock('@/modules/administration/services', () => ({
    CurrencyService: {
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

describe('CurrencyStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    describe('search', () => {
        it('calls CurrencyService.search with the correct parameters', async () => {
            const store = useCurrencyStore();
            const payload = { search: 'USD' };
            const params = { page: 1, limit: 10 };
            const mockResponse = {
                data: {
                    data: [
                        {
                            id: 'USD',
                            name: 'US Dollar',
                            symbol: '$',
                            status: 'active'
                        }
                    ],
                    meta: {
                        total: 1
                    }
                }
            };

            CurrencyService.search.mockResolvedValue(mockResponse);

            const result = await store.search(payload, params);

            expect(CurrencyService.search).toHaveBeenCalledWith(
                payload,
                params
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('create', () => {
        it('calls CurrencyService.create with the correct parameters and shows success message', async () => {
            const store = useCurrencyStore();
            const payload = {
                id: 'USD',
                name: 'US Dollar',
                symbol: '$',
                status: 'active'
            };
            const mockResponse = {
                data: {
                    id: 'USD',
                    name: 'US Dollar',
                    symbol: '$',
                    status: 'active'
                }
            };

            CurrencyService.create.mockResolvedValue(mockResponse);

            const result = await store.create(payload);

            expect(CurrencyService.create).toHaveBeenCalledWith(payload);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('update', () => {
        it('calls CurrencyService.update with the correct parameters and shows success message', async () => {
            const store = useCurrencyStore();
            const id = 'USD';
            const payload = {
                name: 'US Dollar Updated',
                symbol: '$',
                status: 'active'
            };
            const mockResponse = {
                data: {
                    id: 'USD',
                    name: 'US Dollar Updated',
                    symbol: '$',
                    status: 'active'
                }
            };

            CurrencyService.update.mockResolvedValue(mockResponse);

            const result = await store.update(id, payload);

            expect(CurrencyService.update).toHaveBeenCalledWith(id, payload);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('updateStatus', () => {
        it('calls CurrencyService.updateStatus with the correct parameters and shows success message', async () => {
            const store = useCurrencyStore();
            const id = 'USD';
            const payload = {
                status: 'inactive'
            };
            const mockResponse = {
                data: {
                    id: 'USD',
                    name: 'US Dollar',
                    symbol: '$',
                    status: 'inactive'
                }
            };

            CurrencyService.updateStatus.mockResolvedValue(mockResponse);

            const result = await store.updateStatus(id, payload);

            expect(CurrencyService.updateStatus).toHaveBeenCalledWith(
                id,
                payload
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('deleteItem', () => {
        it('calls CurrencyService.deleteItem with the correct parameters and shows success message', async () => {
            const store = useCurrencyStore();
            const id = 'USD';
            const mockResponse = {
                data: {
                    success: true
                }
            };

            CurrencyService.deleteItem.mockResolvedValue(mockResponse);

            const result = await store.deleteItem(id);

            expect(CurrencyService.deleteItem).toHaveBeenCalledWith(id);
            expect(result).toEqual(mockResponse.data);
        });
    });
});
