import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useTeamStore } from '@/modules/administration/stores';
import { TeamService } from '@/modules/administration/services';

// Mock the TeamService
vi.mock('@/modules/administration/services', () => ({
    TeamService: {
        getTeam: vi.fn(),
        search: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        deleteItem: vi.fn()
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

describe('TeamStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    describe('getTeam', () => {
        it('calls TeamService.getTeam with the correct parameters and returns the data', async () => {
            const store = useTeamStore();
            const id = 1;
            const mockResponse = {
                data: {
                    data: {
                        id: 1,
                        name: 'Test Team',
                        type: 'company',
                        description: 'Test Description'
                    }
                }
            };

            TeamService.getTeam.mockResolvedValue(mockResponse);

            const result = await store.getTeam(id);

            expect(TeamService.getTeam).toHaveBeenCalledWith(id);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('setCurrentTeam', () => {
        it('sets the current team', () => {
            const store = useTeamStore();
            const team = {
                id: 1,
                name: 'Test Team',
                type: 'company',
                description: 'Test Description'
            };

            store.setCurrentTeam(team);

            expect(store.currentTeam).toEqual(team);
        });
    });

    describe('search', () => {
        it('calls TeamService.search with the correct parameters and returns the data', async () => {
            const store = useTeamStore();
            const payload = { search: 'Test Team' };
            const params = { page: 1, limit: 10 };
            const mockResponse = {
                data: {
                    data: [
                        {
                            id: 1,
                            name: 'Test Team',
                            type: 'company',
                            description: 'Test Description'
                        }
                    ],
                    meta: {
                        total: 1
                    }
                }
            };

            TeamService.search.mockResolvedValue(mockResponse);

            const result = await store.search(payload, params);

            expect(TeamService.search).toHaveBeenCalledWith(payload, params);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('create', () => {
        it('calls TeamService.create with the correct parameters and shows success message', async () => {
            const store = useTeamStore();
            const payload = {
                name: 'Test Team',
                type: 'company',
                description: 'Test Description'
            };
            const mockResponse = {
                data: {
                    data: {
                        id: 1,
                        name: 'Test Team',
                        type: 'company',
                        description: 'Test Description'
                    }
                }
            };

            TeamService.create.mockResolvedValue(mockResponse);

            const result = await store.create(payload);

            expect(TeamService.create).toHaveBeenCalledWith(payload);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('update', () => {
        it('calls TeamService.update with the correct parameters and shows success message', async () => {
            const store = useTeamStore();
            const id = 1;
            const payload = {
                name: 'Test Team Updated',
                type: 'company',
                description: 'Test Description Updated'
            };
            const mockResponse = {
                data: {
                    data: {
                        id: 1,
                        name: 'Test Team Updated',
                        type: 'company',
                        description: 'Test Description Updated'
                    }
                }
            };

            TeamService.update.mockResolvedValue(mockResponse);

            const result = await store.update(id, payload);

            expect(TeamService.update).toHaveBeenCalledWith(id, payload);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('deleteItem', () => {
        it('calls TeamService.deleteItem with the correct parameters and shows success message', async () => {
            const store = useTeamStore();
            const id = 1;
            const mockResponse = {
                data: {
                    data: {
                        name: 'Test Team'
                    }
                }
            };

            TeamService.deleteItem.mockResolvedValue(mockResponse);

            const result = await store.deleteItem(id);

            expect(TeamService.deleteItem).toHaveBeenCalledWith(id);
            expect(result).toEqual(mockResponse.data);
        });
    });
});
