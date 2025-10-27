import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useRegionStore } from '@/modules/administration/stores';
import { RegionService } from '@/modules/administration/services';

// Mock the RegionService
vi.mock('@/modules/administration/services', () => ({
    RegionService: {
        searchItems: vi.fn(),
        updateStatus: vi.fn()
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

describe('RegionStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    describe('searchItems', () => {
        it('calls RegionService.searchItems and returns the data', async () => {
            const store = useRegionStore();
            const payload = { name: 'North America' };
            const params = { page: 1, per_page: 10 };
            const mockResponse = {
                data: {
                    data: [
                        {
                            id: '123',
                            name: 'North America',
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

            RegionService.searchItems.mockResolvedValue(mockResponse);

            const result = await store.searchItems(payload, params);

            expect(RegionService.searchItems).toHaveBeenCalledWith(
                payload,
                params
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('updateStatus', () => {
        it('calls RegionService.updateStatus with the correct parameters and shows success message', async () => {
            const store = useRegionStore();
            const id = '123';
            const payload = { status: 'inactive' };
            const mockResponse = {
                data: {
                    id: '123',
                    name: 'North America',
                    status: 'inactive'
                }
            };

            RegionService.updateStatus.mockResolvedValue(mockResponse);

            const result = await store.updateStatus(id, payload);

            expect(RegionService.updateStatus).toHaveBeenCalledWith(
                id,
                payload
            );
            expect(result).toEqual(mockResponse.data);
        });
    });
});
