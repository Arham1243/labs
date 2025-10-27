import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useRoleTeamStore } from '@/modules/administration/stores';
import { RoleTeamService } from '@/modules/administration/services';

// Mock the RoleTeamService
vi.mock('@/modules/administration/services', () => ({
    RoleTeamService: {
        searchTeams: vi.fn(),
        syncTeams: vi.fn()
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

describe('RoleTeamStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    describe('searchTeams', () => {
        it('calls RoleTeamService.searchTeams and returns the data', async () => {
            const store = useRoleTeamStore();
            const id = '123';
            const action = 'included';
            const payload = { name: 'Dev Team' };
            const params = { page: 1, per_page: 10 };
            const mockResponse = {
                data: {
                    data: [
                        {
                            id: '456',
                            name: 'Dev Team',
                            description: 'Development team'
                        }
                    ],
                    meta: {
                        current_page: 1,
                        per_page: 10,
                        total: 1
                    }
                }
            };

            RoleTeamService.searchTeams.mockResolvedValue(mockResponse);

            const result = await store.searchTeams(id, action, payload, params);

            expect(RoleTeamService.searchTeams).toHaveBeenCalledWith(
                id,
                action,
                payload,
                params
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('syncTeams (attach)', () => {
        it('calls RoleTeamService.syncTeams with attach action and returns the data', async () => {
            const store = useRoleTeamStore();
            const id = '123';
            const action = 'attach';
            const payload = { resources: ['456'] };
            const mockResponse = {
                data: { attached: ['456'] }
            };

            RoleTeamService.syncTeams.mockResolvedValue(mockResponse);

            const result = await store.syncTeams(id, action, payload);

            expect(RoleTeamService.syncTeams).toHaveBeenCalledWith(
                id,
                action,
                payload
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('syncTeams (detach)', () => {
        it('calls RoleTeamService.syncTeams with detach action and returns the data', async () => {
            const store = useRoleTeamStore();
            const id = '123';
            const action = 'detach';
            const payload = { resources: ['456'] };
            const mockResponse = {
                data: { detached: ['456'] }
            };

            RoleTeamService.syncTeams.mockResolvedValue(mockResponse);

            const result = await store.syncTeams(id, action, payload);

            expect(RoleTeamService.syncTeams).toHaveBeenCalledWith(
                id,
                action,
                payload
            );
            expect(result).toEqual(mockResponse.data);
        });
    });
});
