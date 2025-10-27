import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useRoleStore } from '@/modules/administration/stores';
import { RoleService } from '@/modules/administration/services';

// Mock the RoleService
vi.mock('@/modules/administration/services', () => ({
    RoleService: {
        getRole: vi.fn(),
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

describe('RoleStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    describe('getRole', () => {
        it('calls RoleService.getRole and returns the data', async () => {
            const store = useRoleStore();
            const id = '123';
            const mockResponse = {
                data: {
                    id: '123',
                    name: 'Admin',
                    description: 'Administrator role',
                    type: 'system'
                }
            };

            RoleService.getRole.mockResolvedValue(mockResponse);

            const result = await store.getRole(id);

            expect(RoleService.getRole).toHaveBeenCalledWith(id);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('search', () => {
        it('calls RoleService.search and returns the data', async () => {
            const store = useRoleStore();
            const payload = { name: 'Admin' };
            const params = { page: 1, per_page: 10 };
            const mockResponse = {
                data: {
                    data: [
                        {
                            id: '123',
                            name: 'Admin',
                            description: 'Administrator role',
                            type: 'system'
                        }
                    ],
                    meta: {
                        current_page: 1,
                        per_page: 10,
                        total: 1
                    }
                }
            };

            RoleService.search.mockResolvedValue(mockResponse);

            const result = await store.search(payload, params);

            expect(RoleService.search).toHaveBeenCalledWith(payload, params);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('create', () => {
        it('calls RoleService.create with the correct parameters and shows success message', async () => {
            const store = useRoleStore();
            const payload = {
                name: 'New Role',
                description: 'New role description',
                type: 'custom'
            };
            const mockResponse = {
                data: {
                    id: '456',
                    name: 'New Role',
                    description: 'New role description',
                    type: 'custom'
                }
            };

            RoleService.create.mockResolvedValue(mockResponse);

            const result = await store.create(payload);

            expect(RoleService.create).toHaveBeenCalledWith(payload);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('update', () => {
        it('calls RoleService.update with the correct parameters and shows success message', async () => {
            const store = useRoleStore();
            const id = '123';
            const payload = {
                name: 'Updated Role',
                description: 'Updated role description'
            };
            const mockResponse = {
                data: {
                    id: '123',
                    name: 'Updated Role',
                    description: 'Updated role description',
                    type: 'system'
                }
            };

            RoleService.update.mockResolvedValue(mockResponse);

            const result = await store.update(id, payload);

            expect(RoleService.update).toHaveBeenCalledWith(id, payload);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('deleteItem', () => {
        it('calls RoleService.deleteItem and shows success message', async () => {
            const store = useRoleStore();
            const id = '123';
            const mockResponse = {
                data: { success: true }
            };

            RoleService.deleteItem.mockResolvedValue(mockResponse);

            const result = await store.deleteItem(id);

            expect(RoleService.deleteItem).toHaveBeenCalledWith(id);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('setCurrentRole', () => {
        it('sets the current role', () => {
            const store = useRoleStore();
            const role = {
                id: '123',
                name: 'Admin',
                description: 'Administrator role',
                type: 'system'
            };

            store.setCurrentRole(role);

            expect(store.currentRole).toEqual(role);
        });
    });
});
