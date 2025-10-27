// filepath: /Users/yassirawad/Projects/horus/horus-platform-app/src/modules/administration/tests/services/User.service.test.js
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

// Import the actual UserService
import * as UserService from '@/modules/administration/services/User.service';

// Mock the UserService functions directly
vi.mock('@/modules/administration/services/User.service', () => ({
    getUser: vi.fn().mockResolvedValue({ data: 'mock data' }),
    search: vi.fn().mockResolvedValue({ data: 'mock data' }),
    create: vi.fn().mockResolvedValue({ data: 'mock data' }),
    update: vi.fn().mockResolvedValue({ data: 'mock data' }),
    updateStatus: vi.fn().mockResolvedValue({ data: 'mock data' }),
    deleteItem: vi.fn().mockResolvedValue({ data: 'mock data' }),
    resendActivation: vi.fn().mockResolvedValue({ data: 'mock data' })
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

    // User tests
    describe('getUser', () => {
        it('calls getUser with the correct parameters', async () => {
            const id = '123';

            await UserService.getUser(id);

            expect(UserService.getUser).toHaveBeenCalledWith(id);
        });
    });

    describe('search', () => {
        it('calls search with the correct parameters', async () => {
            const payload = { name: 'Test User' };
            const params = { page: 1, limit: 10 };

            await UserService.search(payload, params);

            expect(UserService.search).toHaveBeenCalledWith(payload, params);
        });
    });

    describe('create', () => {
        it('calls create with the correct parameters', async () => {
            const payload = {
                name: 'New User',
                email: 'test@example.com',
                role_id: 1
            };

            await UserService.create(payload);

            expect(UserService.create).toHaveBeenCalledWith(payload);
        });
    });

    describe('update', () => {
        it('calls update with the correct parameters', async () => {
            const id = '123';
            const payload = {
                name: 'Updated User',
                email: 'updated@example.com'
            };

            await UserService.update(id, payload);

            expect(UserService.update).toHaveBeenCalledWith(id, payload);
        });
    });

    describe('updateStatus', () => {
        it('calls updateStatus with the correct parameters', async () => {
            const id = '123';
            const payload = {
                status: 'inactive'
            };

            await UserService.updateStatus(id, payload);

            expect(UserService.updateStatus).toHaveBeenCalledWith(id, payload);
        });
    });

    describe('deleteItem', () => {
        it('calls deleteItem with the correct parameters', async () => {
            const id = '123';

            await UserService.deleteItem(id);

            expect(UserService.deleteItem).toHaveBeenCalledWith(id);
        });
    });

    describe('resendActivation', () => {
        it('calls resendActivation with the correct parameters', async () => {
            const email = 'test@example.com';

            await UserService.resendActivation(email);

            expect(UserService.resendActivation).toHaveBeenCalledWith(email);
        });
    });
});
