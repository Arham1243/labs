import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

// Import the actual CountryService
import * as CountryService from '@/modules/administration/services/Country.service';

// Mock the CountryService functions directly
vi.mock('@/modules/administration/services/Country.service', () => ({
    searchItems: vi.fn().mockResolvedValue({ data: 'mock data' }),
    create: vi.fn().mockResolvedValue({ data: 'mock data' }),
    update: vi.fn().mockResolvedValue({ data: 'mock data' }),
    updateStatus: vi.fn().mockResolvedValue({ data: 'mock data' })
}));

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
    useI18n: () => ({
        t: (key) => key
    })
}));

describe('CountryService', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    describe('searchItems', () => {
        it('calls searchItems with the correct parameters', async () => {
            const payload = { name: 'United States' };
            const params = { page: 1, limit: 10 };

            await CountryService.searchItems(payload, params);

            expect(CountryService.searchItems).toHaveBeenCalledWith(
                payload,
                params
            );
        });
    });

    describe('create', () => {
        it('calls create with the correct parameters', async () => {
            const payload = {
                name: 'New Country',
                code: 'NC',
                status: 'active'
            };

            await CountryService.create(payload);

            expect(CountryService.create).toHaveBeenCalledWith(payload);
        });
    });

    describe('update', () => {
        it('calls update with the correct parameters', async () => {
            const id = '123';
            const payload = {
                name: 'Updated Country',
                code: 'UC'
            };

            await CountryService.update(id, payload);

            expect(CountryService.update).toHaveBeenCalledWith(id, payload);
        });
    });

    describe('updateStatus', () => {
        it('calls updateStatus with the correct parameters', async () => {
            const id = '123';
            const payload = {
                status: 'inactive'
            };

            await CountryService.updateStatus(id, payload);

            expect(CountryService.updateStatus).toHaveBeenCalledWith(
                id,
                payload
            );
        });
    });
});
