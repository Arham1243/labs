// filepath: /Users/yassirawad/Projects/horus/horus-platform-app/tests/services/User.service.test.js
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

// Import the actual UserService
import * as UserService from '@/services/User.service';

// Mock the UserService functions directly
vi.mock('@/services/User.service', () => ({
    searchUsers: vi.fn().mockResolvedValue({ data: 'mock data' })
}));

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
    useI18n: () => ({
        t: (key) => key
    })
}));

describe('UserService', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    describe('searchUsers', () => {
        it('calls searchUsers with the correct parameters', async () => {
            const payload = { search: 'test' };
            const params = { page: 1, limit: 10 };

            await UserService.searchUsers(payload, params);

            expect(UserService.searchUsers).toHaveBeenCalledWith(
                payload,
                params
            );
        });
    });
});
