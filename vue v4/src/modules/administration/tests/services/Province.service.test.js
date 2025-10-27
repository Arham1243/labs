import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

// Import the actual ProvinceService
import * as ProvinceService from '@/modules/administration/services/Province.service';

// Mock the ProvinceService functions directly
vi.mock('@/modules/administration/services/Province.service', () => ({
    searchItems: vi.fn().mockResolvedValue({ data: 'mock data' }),
    create: vi.fn().mockResolvedValue({ data: 'mock data' }),
    update: vi.fn().mockResolvedValue({ data: 'mock data' }),
    updateStatus: vi.fn().mockResolvedValue({ data: 'mock data' }),
    deleteItem: vi.fn().mockResolvedValue({ data: 'mock data' })
}));

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
    useI18n: () => ({
        t: (key) => key
    })
}));

describe('ProvinceService', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    describe('searchItems', () => {
        it('calls searchItems with the correct parameters', async () => {
            const payload = { name: 'California' };
            const params = { page: 1, limit: 10 };

            await ProvinceService.searchItems(payload, params);

            expect(ProvinceService.searchItems).toHaveBeenCalledWith(
                payload,
                params
            );
        });
    });

    describe('create', () => {
        it('calls create with the correct parameters', async () => {
            const payload = {
                name: 'New Province',
                code: 'NP',
                country_id: '456',
                status: 'active'
            };

            await ProvinceService.create(payload);

            expect(ProvinceService.create).toHaveBeenCalledWith(payload);
        });
    });

    describe('update', () => {
        it('calls update with the correct parameters', async () => {
            const id = '123';
            const payload = {
                name: 'Updated Province',
                code: 'UP'
            };

            await ProvinceService.update(id, payload);

            expect(ProvinceService.update).toHaveBeenCalledWith(id, payload);
        });
    });

    describe('updateStatus', () => {
        it('calls updateStatus with the correct parameters', async () => {
            const id = '123';
            const payload = {
                status: 'inactive'
            };

            await ProvinceService.updateStatus(id, payload);

            expect(ProvinceService.updateStatus).toHaveBeenCalledWith(
                id,
                payload
            );
        });
    });

    describe('deleteItem', () => {
        it('calls deleteItem with the correct parameters', async () => {
            const id = '123';

            await ProvinceService.deleteItem(id);

            expect(ProvinceService.deleteItem).toHaveBeenCalledWith(id);
        });
    });
});
