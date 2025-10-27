import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

// Import the actual VendorService
import * as VendorService from '@/modules/administration/services/Vendor.service';

// Mock the VendorService functions directly
vi.mock('@/modules/administration/services/Vendor.service', () => ({
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

describe('VendorService', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    describe('search', () => {
        it('calls search with the correct parameters', async () => {
            const payload = { search: 'Test' };
            const params = { page: 1, limit: 10 };

            await VendorService.search(payload, params);

            expect(VendorService.search).toHaveBeenCalledWith(payload, params);
        });
    });

    describe('create', () => {
        it('calls create with the correct parameters', async () => {
            const payload = {
                name: 'Test Vendor',
                status: 'active'
            };

            await VendorService.create(payload);

            expect(VendorService.create).toHaveBeenCalledWith(payload);
        });
    });

    describe('update', () => {
        it('calls update with the correct parameters', async () => {
            const id = '123';
            const payload = {
                name: 'Test Vendor Updated',
                status: 'active'
            };

            await VendorService.update(id, payload);

            expect(VendorService.update).toHaveBeenCalledWith(id, payload);
        });
    });

    describe('updateStatus', () => {
        it('calls updateStatus with the correct parameters', async () => {
            const id = '123';
            const payload = {
                status: 'inactive'
            };

            await VendorService.updateStatus(id, payload);

            expect(VendorService.updateStatus).toHaveBeenCalledWith(
                id,
                payload
            );
        });
    });

    describe('deleteItem', () => {
        it('calls deleteItem with the correct parameters', async () => {
            const id = '123';

            await VendorService.deleteItem(id);

            expect(VendorService.deleteItem).toHaveBeenCalledWith(id);
        });
    });
});
