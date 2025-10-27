import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useRoleUserStore } from '@/modules/administration/stores';
import { RoleUserService } from '@/modules/administration/services';

// Mock the RoleUserService
vi.mock('@/modules/administration/services', () => ({
    RoleUserService: {
        searchUsers: vi.fn(),
        syncUsers: vi.fn()
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

describe('RoleUserStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    describe('searchUsers', () => {
        it('calls RoleUserService.searchUsers and returns the data', async () => {
            const store = useRoleUserStore();
            const id = '123';
            const action = 'included';
            const payload = { name: 'John' };
            const params = { page: 1, per_page: 10 };
            const mockResponse = {
                data: {
                    data: [
                        {
                            id: '456',
                            name: 'John Doe',
                            email: 'john.doe@example.com'
                        }
                    ],
                    meta: {
                        current_page: 1,
                        per_page: 10,
                        total: 1
                    }
                }
            };

            RoleUserService.searchUsers.mockResolvedValue(mockResponse);

            const result = await store.searchUsers(id, action, payload, params);

            expect(RoleUserService.searchUsers).toHaveBeenCalledWith(
                id,
                action,
                payload,
                params
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('syncUsers (attach)', () => {
        it('calls RoleUserService.syncUsers with attach action and returns the data', async () => {
            const store = useRoleUserStore();
            const id = '123';
            const action = 'attach';
            const payload = { resources: ['456'] };
            const mockResponse = {
                data: {
                    attached: ['456']
                }
            };

            RoleUserService.syncUsers.mockResolvedValue(mockResponse);

            const result = await store.syncUsers(id, action, payload);

            expect(RoleUserService.syncUsers).toHaveBeenCalledWith(
                id,
                action,
                payload
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('syncUsers (detach)', () => {
        it('calls RoleUserService.syncUsers with detach action and returns the data', async () => {
            const store = useRoleUserStore();
            const id = '123';
            const action = 'detach';
            const payload = { resources: ['456'] };
            const mockResponse = {
                data: {
                    detached: ['456']
                }
            };

            RoleUserService.syncUsers.mockResolvedValue(mockResponse);

            const result = await store.syncUsers(id, action, payload);

            expect(RoleUserService.syncUsers).toHaveBeenCalledWith(
                id,
                action,
                payload
            );
            expect(result).toEqual(mockResponse.data);
        });
    });
});
