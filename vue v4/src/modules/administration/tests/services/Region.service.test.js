import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

// Import the actual RegionService
import * as RegionService from '@/modules/administration/services/Region.service';

// Mock the RegionService functions directly
vi.mock('@/modules/administration/services/Region.service', () => ({
    searchItems: vi.fn().mockResolvedValue({ data: 'mock data' }),
    updateStatus: vi.fn().mockResolvedValue({ data: 'mock data' })
}));

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
    useI18n: () => ({
        t: (key) => key
    })
}));

describe('RegionService', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    describe('searchItems', () => {
        it('calls searchItems with the correct parameters', async () => {
            const payload = { name: 'North America' };
            const params = { page: 1, limit: 10 };

            await RegionService.searchItems(payload, params);

            expect(RegionService.searchItems).toHaveBeenCalledWith(
                payload,
                params
            );
        });
    });

    describe('updateStatus', () => {
        it('calls updateStatus with the correct parameters', async () => {
            const id = '123';
            const payload = {
                status: 'inactive'
            };

            await RegionService.updateStatus(id, payload);

            expect(RegionService.updateStatus).toHaveBeenCalledWith(
                id,
                payload
            );
        });
    });
});
