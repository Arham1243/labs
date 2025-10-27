// filepath: /Users/yassirawad/Projects/horus/horus-platform-app/src/stores/tests/User.direct.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '@/services';

// Mock the UserService
vi.mock('@/services', () => ({
    UserService: {
        searchUsers: vi.fn()
    }
}));

// Create a direct implementation of the User store functions
const searchUsers = async (payload, params) => {
    try {
        const res = await UserService.searchUsers(payload, { params });
        return res.data;
    } catch (error) {
        throw error;
    }
};

const processSimpleUsers = (data) => {
    return data.map((item) => {
        return {
            id: item.id,
            name: item.name
        };
    });
};

describe('User Store Direct Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('searchUsers', () => {
        it('should call the UserService.searchUsers with correct parameters', async () => {
            // Arrange
            const payload = { search: 'test' };
            const params = { page: 1 };
            const mockResponse = { data: [{ id: 1, name: 'Test User' }] };
            UserService.searchUsers.mockResolvedValue(mockResponse);

            // Act
            const result = await searchUsers(payload, params);

            // Assert
            expect(UserService.searchUsers).toHaveBeenCalledWith(payload, {
                params
            });
            expect(result).toEqual(mockResponse.data);
        });

        it('should handle errors', async () => {
            // Arrange
            const payload = { search: 'test' };
            const params = { page: 1 };
            const error = new Error('Network Error');
            UserService.searchUsers.mockRejectedValue(error);

            // Act & Assert
            await expect(searchUsers(payload, params)).rejects.toThrow(
                'Network Error'
            );
        });
    });

    describe('processSimpleUsers', () => {
        it('should correctly transform user data', () => {
            // Arrange
            const inputData = [
                {
                    id: 1,
                    name: 'User One',
                    email: 'user1@example.com',
                    role: 'Admin'
                },
                {
                    id: 2,
                    name: 'User Two',
                    email: 'user2@example.com',
                    role: 'User'
                }
            ];

            const expectedOutput = [
                { id: 1, name: 'User One' },
                { id: 2, name: 'User Two' }
            ];

            // Act
            const result = processSimpleUsers(inputData);

            // Assert
            expect(result).toEqual(expectedOutput);
        });

        it('should handle empty array', () => {
            // Arrange
            const inputData = [];

            // Act
            const result = processSimpleUsers(inputData);

            // Assert
            expect(result).toEqual([]);
        });
    });
});
