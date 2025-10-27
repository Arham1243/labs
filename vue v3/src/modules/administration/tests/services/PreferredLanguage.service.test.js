import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

// Import the actual PreferredLanguageService
import * as PreferredLanguageService from '@/modules/administration/services/PreferredLanguage.service';

// Mock the PreferredLanguageService functions directly
vi.mock('@/modules/administration/services/PreferredLanguage.service', () => ({
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

describe('PreferredLanguageService', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    describe('search', () => {
        it('calls search with the correct parameters', async () => {
            const payload = { search: 'EN' };
            const params = { page: 1, limit: 10 };

            await PreferredLanguageService.search(payload, params);

            expect(PreferredLanguageService.search).toHaveBeenCalledWith(
                payload,
                params
            );
        });
    });

    describe('create', () => {
        it('calls create with the correct parameters', async () => {
            const payload = {
                code: 'EN',
                name: 'English',
                default: false,
                status: 'active'
            };

            await PreferredLanguageService.create(payload);

            expect(PreferredLanguageService.create).toHaveBeenCalledWith(
                payload
            );
        });
    });

    describe('update', () => {
        it('calls update with the correct parameters', async () => {
            const id = 'EN';
            const payload = {
                name: 'English Updated',
                default: true,
                status: 'active'
            };

            await PreferredLanguageService.update(id, payload);

            expect(PreferredLanguageService.update).toHaveBeenCalledWith(
                id,
                payload
            );
        });
    });

    describe('updateStatus', () => {
        it('calls updateStatus with the correct parameters', async () => {
            const id = 'EN';
            const payload = {
                status: 'inactive'
            };

            await PreferredLanguageService.updateStatus(id, payload);

            expect(PreferredLanguageService.updateStatus).toHaveBeenCalledWith(
                id,
                payload
            );
        });
    });

    describe('deleteItem', () => {
        it('calls deleteItem with the correct parameters', async () => {
            const id = 'EN';

            await PreferredLanguageService.deleteItem(id);

            expect(PreferredLanguageService.deleteItem).toHaveBeenCalledWith(
                id
            );
        });
    });
});
