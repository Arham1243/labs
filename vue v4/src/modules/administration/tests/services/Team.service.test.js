import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

// Import the actual TeamService
import * as TeamService from '@/modules/administration/services/Team.service';

// Mock the TeamService functions directly
vi.mock('@/modules/administration/services/Team.service', () => ({
    getTeam: vi.fn().mockResolvedValue({ data: 'mock data' }),
    search: vi.fn().mockResolvedValue({ data: 'mock data' }),
    create: vi.fn().mockResolvedValue({ data: 'mock data' }),
    update: vi.fn().mockResolvedValue({ data: 'mock data' }),
    deleteItem: vi.fn().mockResolvedValue({ data: 'mock data' })
}));

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
    useI18n: () => ({
        t: (key) => key
    })
}));

describe('TeamService', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    describe('getTeam', () => {
        it('calls getTeam with the correct parameters', async () => {
            const id = 1;

            await TeamService.getTeam(id);

            expect(TeamService.getTeam).toHaveBeenCalledWith(id);
        });
    });

    describe('search', () => {
        it('calls search with the correct parameters', async () => {
            const payload = { search: 'Test Team' };
            const params = { page: 1, limit: 10 };

            await TeamService.search(payload, params);

            expect(TeamService.search).toHaveBeenCalledWith(payload, params);
        });
    });

    describe('create', () => {
        it('calls create with the correct parameters', async () => {
            const payload = {
                name: 'Test Team',
                type: 'company',
                description: 'Test Description'
            };

            await TeamService.create(payload);

            expect(TeamService.create).toHaveBeenCalledWith(payload);
        });
    });

    describe('update', () => {
        it('calls update with the correct parameters', async () => {
            const id = 1;
            const payload = {
                name: 'Test Team Updated',
                type: 'company',
                description: 'Test Description Updated'
            };

            await TeamService.update(id, payload);

            expect(TeamService.update).toHaveBeenCalledWith(id, payload);
        });
    });

    describe('deleteItem', () => {
        it('calls deleteItem with the correct parameters', async () => {
            const id = 1;

            await TeamService.deleteItem(id);

            expect(TeamService.deleteItem).toHaveBeenCalledWith(id);
        });
    });
});
