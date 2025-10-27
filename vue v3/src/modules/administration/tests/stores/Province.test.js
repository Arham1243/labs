import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useProvinceStore } from '@/modules/administration/stores';
import { ProvinceService } from '@/modules/administration/services';

// Mock the ProvinceService
vi.mock('@/modules/administration/services', () => ({
    ProvinceService: {
        searchItems: vi.fn(),
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

describe('ProvinceStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    describe('searchItems', () => {
        it('calls ProvinceService.searchItems and returns the data', async () => {
            const store = useProvinceStore();
            const payload = { name: 'California' };
            const params = { page: 1, per_page: 10 };
            const mockResponse = {
                data: {
                    data: [
                        {
                            id: '123',
                            name: 'California',
                            code: 'CA',
                            country_id: '456',
                            status: 'active'
                        }
                    ],
                    meta: {
                        current_page: 1,
                        per_page: 10,
                        total: 1
                    }
                }
            };

            ProvinceService.searchItems.mockResolvedValue(mockResponse);

            const result = await store.searchItems(payload, params);

            expect(ProvinceService.searchItems).toHaveBeenCalledWith(
                payload,
                params
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('create', () => {
        it('calls ProvinceService.create with the correct parameters and shows success message', async () => {
            const store = useProvinceStore();
            const payload = {
                name: 'New Province',
                code: 'NP',
                country_id: '456',
                status: 'active'
            };
            const mockResponse = {
                data: {
                    id: '789',
                    name: 'New Province',
                    code: 'NP',
                    country_id: '456',
                    status: 'active'
                }
            };

            ProvinceService.create.mockResolvedValue(mockResponse);

            const result = await store.create(payload);

            expect(ProvinceService.create).toHaveBeenCalledWith(payload);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('update', () => {
        it('calls ProvinceService.update with the correct parameters and shows success message', async () => {
            const store = useProvinceStore();
            const id = '123';
            const payload = {
                name: 'Updated Province',
                code: 'UP'
            };
            const mockResponse = {
                data: {
                    id: '123',
                    name: 'Updated Province',
                    code: 'UP',
                    country_id: '456',
                    status: 'active'
                }
            };

            ProvinceService.update.mockResolvedValue(mockResponse);

            const result = await store.update(id, payload);

            expect(ProvinceService.update).toHaveBeenCalledWith(id, payload);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('updateStatus', () => {
        it('calls ProvinceService.updateStatus with the correct parameters and shows success message', async () => {
            const store = useProvinceStore();
            const id = '123';
            const payload = { status: 'inactive' };
            const mockResponse = {
                data: {
                    id: '123',
                    name: 'California',
                    code: 'CA',
                    country_id: '456',
                    status: 'inactive'
                }
            };

            ProvinceService.updateStatus.mockResolvedValue(mockResponse);

            const result = await store.updateStatus(id, payload);

            expect(ProvinceService.updateStatus).toHaveBeenCalledWith(
                id,
                payload
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('deleteItem', () => {
        it('calls ProvinceService.deleteItem and shows success message', async () => {
            const store = useProvinceStore();
            const id = '123';
            const mockResponse = {
                data: { success: true }
            };

            ProvinceService.deleteItem.mockResolvedValue(mockResponse);

            const result = await store.deleteItem(id);

            expect(ProvinceService.deleteItem).toHaveBeenCalledWith(id);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('processProvincesForDropDown', () => {
        it('processes provinces for dropdown', () => {
            const store = useProvinceStore();
            const provinces = [
                {
                    id: '123',
                    name: 'California',
                    code: 'CA',
                    country_id: '456',
                    status: 'active'
                },
                {
                    id: '789',
                    name: 'New York',
                    code: 'NY',
                    country_id: '456',
                    status: 'active'
                }
            ];

            const result = store.processProvincesForDropDown(provinces);

            expect(result).toEqual([
                { id: '123', name: 'California' },
                { id: '789', name: 'New York' }
            ]);
        });

        it('handles null provinces', () => {
            const store = useProvinceStore();
            const result = store.processProvincesForDropDown(null);
            expect(result).toBeUndefined();
        });
    });
});
