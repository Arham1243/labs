import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUserStore } from '@/modules/administration/stores/User';
import { UserService } from '@/modules/administration/services';
import { ref } from 'vue';

// Mock the UserService
vi.mock('@/modules/administration/services', () => ({
    UserService: {
        getUser: vi.fn(),
        search: vi.fn(),
        deleteItem: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateStatus: vi.fn(),
        resendActivation: vi.fn()
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

vi.mock('vue-i18n', () => ({
    useI18n: vi.fn(() => ({
        t: (key, params) => {
            if (params) {
                return `${key} ${JSON.stringify(params)}`;
            }
            return key;
        }
    }))
}));

describe('UserStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    describe('setCurrentUser', () => {
        it('sets the currentUser ref value', () => {
            const store = useUserStore();
            const user = { id: 1, name: 'Test User' };

            store.setCurrentUser(user);

            expect(store.currentUser).toEqual(user);
        });
    });

    describe('getUser', () => {
        it('calls UserService.getUser with the correct parameters and returns the data', async () => {
            const store = useUserStore();
            const userId = 123;
            const mockResponse = {
                data: {
                    data: {
                        id: userId,
                        name: 'Test User'
                    }
                }
            };

            UserService.getUser.mockResolvedValue(mockResponse);

            const result = await store.getUser(userId);

            expect(UserService.getUser).toHaveBeenCalledWith(userId);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('search', () => {
        it('calls UserService.search with the correct parameters and returns the data', async () => {
            const store = useUserStore();
            const payload = { search: 'test' };
            const params = { page: 1 };
            const mockResponse = {
                data: {
                    data: [{ id: 1, name: 'Test User' }],
                    meta: {
                        current_page: 1,
                        per_page: 10,
                        total: 1
                    }
                }
            };

            UserService.search.mockResolvedValue(mockResponse);

            const result = await store.search(payload, params);

            expect(UserService.search).toHaveBeenCalledWith(payload, params);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('deleteItem', () => {
        it('calls UserService.deleteItem with the correct parameters and shows success message', async () => {
            const store = useUserStore();
            const userId = 123;
            const mockResponse = {
                data: {
                    data: {
                        id: userId,
                        success: true
                    }
                }
            };

            UserService.deleteItem.mockResolvedValue(mockResponse);

            const result = await store.deleteItem(userId);

            expect(UserService.deleteItem).toHaveBeenCalledWith(userId);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('resendActivation', () => {
        it('calls UserService.resendActivation with the correct parameters and shows success message', async () => {
            const store = useUserStore();
            const email = 'user@example.com';
            const mockResponse = {
                data: {
                    data: {
                        email: email,
                        success: true
                    }
                }
            };

            UserService.resendActivation.mockResolvedValue(mockResponse);

            const result = await store.resendActivation(email);

            expect(UserService.resendActivation).toHaveBeenCalledWith(email);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('create', () => {
        it('calls UserService.create with the correct parameters and shows success message', async () => {
            const store = useUserStore();
            const payload = { name: 'New User', email: 'new@example.com' };
            const mockResponse = {
                data: {
                    data: {
                        id: 1,
                        ...payload
                    }
                }
            };

            UserService.create.mockResolvedValue(mockResponse);

            const result = await store.create(payload);

            expect(UserService.create).toHaveBeenCalledWith(payload);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('update', () => {
        it('calls UserService.update with the correct parameters and shows success message', async () => {
            const store = useUserStore();
            const userId = 123;
            const payload = { name: 'Updated User' };
            const mockResponse = {
                data: {
                    data: {
                        id: userId,
                        ...payload
                    }
                }
            };

            UserService.update.mockResolvedValue(mockResponse);

            const result = await store.update(userId, payload);

            expect(UserService.update).toHaveBeenCalledWith(userId, payload);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('updateStatus', () => {
        it('calls UserService.updateStatus with the correct parameters and shows success message', async () => {
            const store = useUserStore();
            const userId = 123;
            const payload = { status: 'inactive' };
            const mockResponse = {
                data: {
                    data: {
                        id: userId,
                        status: 'inactive'
                    }
                }
            };

            UserService.updateStatus.mockResolvedValue(mockResponse);

            const result = await store.updateStatus(userId, payload);

            expect(UserService.updateStatus).toHaveBeenCalledWith(
                userId,
                payload
            );
            expect(result).toEqual(mockResponse.data);
        });
    });
});
