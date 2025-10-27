import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useTeamRoleStore } from '@/modules/administration/stores';
import { TeamRoleService } from '@/modules/administration/services';

// Mock the TeamRoleService
vi.mock('@/modules/administration/services', () => ({
    TeamRoleService: {
        searchRoles: vi.fn(),
        syncRoles: vi.fn()
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

describe('TeamRoleStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    describe('searchRoles', () => {
        it('calls TeamRoleService.searchRoles and returns the data', async () => {
            const store = useTeamRoleStore();
            const id = '123';
            const action = 'included';
            const payload = { name: 'Admin' };
            const params = { page: 1, per_page: 10 };
            const mockResponse = {
                data: {
                    data: [
                        {
                            id: '456',
                            name: 'Admin',
                            description: 'Administrator role'
                        }
                    ],
                    meta: {
                        current_page: 1,
                        per_page: 10,
                        total: 1
                    }
                }
            };

            TeamRoleService.searchRoles.mockResolvedValue(mockResponse);

            const result = await store.searchRoles(id, action, payload, params);

            expect(TeamRoleService.searchRoles).toHaveBeenCalledWith(
                id,
                action,
                payload,
                params
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('syncRoles (attach)', () => {
        it('calls TeamRoleService.syncRoles with attach action and returns the data', async () => {
            const store = useTeamRoleStore();
            const id = '123';
            const action = 'attach';
            const payload = { resources: ['456'] };
            const mockResponse = {
                data: { attached: ['456'] }
            };

            TeamRoleService.syncRoles.mockResolvedValue(mockResponse);

            const result = await store.syncRoles(id, action, payload);

            expect(TeamRoleService.syncRoles).toHaveBeenCalledWith(
                id,
                action,
                payload
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('syncRoles (detach)', () => {
        it('calls TeamRoleService.syncRoles with detach action and returns the data', async () => {
            const store = useTeamRoleStore();
            const id = '123';
            const action = 'detach';
            const payload = { resources: ['456'] };
            const mockResponse = {
                data: { detached: ['456'] }
            };

            TeamRoleService.syncRoles.mockResolvedValue(mockResponse);

            const result = await store.syncRoles(id, action, payload);

            expect(TeamRoleService.syncRoles).toHaveBeenCalledWith(
                id,
                action,
                payload
            );
            expect(result).toEqual(mockResponse.data);
        });
    });
});
