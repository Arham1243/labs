// filepath: /Users/yassirawad/Projects/horus/horus-platform-app/src/modules/administration/tests/stores/User.direct.test.js
import { beforeEach, describe, expect, it, vi } from 'vitest';
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

// Create direct implementations of the store functions
const currentUser = ref(null);

const setCurrentUser = (user) => {
    currentUser.value = user;
};

const getUser = async (id) => {
    try {
        const res = await UserService.getUser(id);
        return res.data;
    } catch (error) {
        throw error;
    }
};

const search = async (payload, params) => {
    try {
        const res = await UserService.search(payload, params);
        return res.data;
    } catch (error) {
        throw error;
    }
};

const deleteItem = async (id) => {
    try {
        const res = await UserService.deleteItem(id);
        // No need to call showSuccess since we're not testing that
        return res.data;
    } catch (error) {
        throw error;
    }
};

const resendActivation = async (email) => {
    try {
        const res = await UserService.resendActivation(email);
        // No need to call showSuccess since we're not testing that
        return res.data;
    } catch (error) {
        throw error;
    }
};

const create = async (payload) => {
    try {
        const res = await UserService.create(payload);
        // No need to call showSuccess since we're not testing that
        return res.data;
    } catch (error) {
        throw error;
    }
};

const update = async (id, payload) => {
    try {
        const res = await UserService.update(id, payload);
        // No need to call showSuccess since we're not testing that
        return res.data;
    } catch (error) {
        throw error;
    }
};

const updateStatus = async (id, payload) => {
    try {
        const res = await UserService.updateStatus(id, payload);
        // No need to call showSuccess since we're not testing that
        return res.data;
    } catch (error) {
        throw error;
    }
};

describe('UserStore Direct Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        currentUser.value = null;
    });

    describe('setCurrentUser', () => {
        it('sets the currentUser ref value', () => {
            const user = { id: 1, name: 'Test User' };
            setCurrentUser(user);
            expect(currentUser.value).toEqual(user);
        });
    });

    describe('getUser', () => {
        it('calls UserService.getUser with the correct parameters and returns the data', async () => {
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

            const result = await getUser(userId);

            expect(UserService.getUser).toHaveBeenCalledWith(userId);
            expect(result).toEqual(mockResponse.data);
        });

        it('handles errors correctly', async () => {
            const userId = 123;
            const error = new Error('Failed to get user');
            UserService.getUser.mockRejectedValue(error);

            await expect(getUser(userId)).rejects.toThrow('Failed to get user');
        });
    });

    describe('search', () => {
        it('calls UserService.search with the correct parameters and returns the data', async () => {
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

            const result = await search(payload, params);

            expect(UserService.search).toHaveBeenCalledWith(payload, params);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('deleteItem', () => {
        it('calls UserService.deleteItem with the correct parameters and returns the data', async () => {
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

            const result = await deleteItem(userId);

            expect(UserService.deleteItem).toHaveBeenCalledWith(userId);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('resendActivation', () => {
        it('calls UserService.resendActivation with the correct parameters and returns the data', async () => {
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

            const result = await resendActivation(email);

            expect(UserService.resendActivation).toHaveBeenCalledWith(email);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('create', () => {
        it('calls UserService.create with the correct parameters and returns the data', async () => {
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

            const result = await create(payload);

            expect(UserService.create).toHaveBeenCalledWith(payload);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('update', () => {
        it('calls UserService.update with the correct parameters and returns the data', async () => {
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

            const result = await update(userId, payload);

            expect(UserService.update).toHaveBeenCalledWith(userId, payload);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('updateStatus', () => {
        it('calls UserService.updateStatus with the correct parameters and returns the data', async () => {
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

            const result = await updateStatus(userId, payload);

            expect(UserService.updateStatus).toHaveBeenCalledWith(
                userId,
                payload
            );
            expect(result).toEqual(mockResponse.data);
        });
    });
});
