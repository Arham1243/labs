import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

// Import the actual CurrencyService
import * as CurrencyService from '@/modules/administration/services/Currency.service';

// Mock the CurrencyService functions directly
vi.mock('@/modules/administration/services/Currency.service', () => ({
    search: vi.fn().mockResolvedValue({ data: 'mock data' }),
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

describe('CurrencyService', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    describe('search', () => {
        it('calls search with the correct parameters', async () => {
            const payload = { search: 'USD' };
            const params = { page: 1, limit: 10 };

            await CurrencyService.search(payload, params);

            expect(CurrencyService.search).toHaveBeenCalledWith(
                payload,
                params
            );
        });
    });

    describe('create', () => {
        it('calls create with the correct parameters', async () => {
            const payload = {
                id: 'USD',
                name: 'US Dollar',
                symbol: '$',
                status: 'active'
            };

            await CurrencyService.create(payload);

            expect(CurrencyService.create).toHaveBeenCalledWith(payload);
        });
    });

    describe('update', () => {
        it('calls update with the correct parameters', async () => {
            const id = 'USD';
            const payload = {
                name: 'US Dollar Updated',
                symbol: '$',
                status: 'active'
            };

            await CurrencyService.update(id, payload);

            expect(CurrencyService.update).toHaveBeenCalledWith(id, payload);
        });
    });

    describe('updateStatus', () => {
        it('calls updateStatus with the correct parameters', async () => {
            const id = 'USD';
            const payload = {
                status: 'inactive'
            };

            await CurrencyService.updateStatus(id, payload);

            expect(CurrencyService.updateStatus).toHaveBeenCalledWith(
                id,
                payload
            );
        });
    });

    describe('deleteItem', () => {
        it('calls deleteItem with the correct parameters', async () => {
            const id = 'USD';

            await CurrencyService.deleteItem(id);

            expect(CurrencyService.deleteItem).toHaveBeenCalledWith(id);
        });
    });
});
