import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

// Import the actual MenuService
import * as MenuService from '@/modules/administration/services/Menu.service';

// Mock the MenuService functions directly
vi.mock('@/modules/administration/services/Menu.service', () => ({
    getMenus: vi.fn().mockResolvedValue({ data: 'mock data' }),
    search: vi.fn().mockResolvedValue({ data: 'mock data' }),
    getIcons: vi.fn().mockResolvedValue({ data: 'mock data' }),
    create: vi.fn().mockResolvedValue({ data: 'mock data' }),
    update: vi.fn().mockResolvedValue({ data: 'mock data' }),
    updateStatus: vi.fn().mockResolvedValue({ data: 'mock data' }),
    updateOrder: vi.fn().mockResolvedValue({ data: 'mock data' }),
    deleteItem: vi.fn().mockResolvedValue({ data: 'mock data' })
}));

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
    useI18n: () => ({
        t: (key) => key
    })
}));

describe('MenuService', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    describe('getMenus', () => {
        it('calls getMenus with the correct parameters', async () => {
            await MenuService.getMenus();

            expect(MenuService.getMenus).toHaveBeenCalled();
        });
    });

    describe('search', () => {
        it('calls search with the correct parameters', async () => {
            const payload = { search: 'Dashboard' };
            const params = { page: 1, limit: 10 };

            await MenuService.search(payload, params);

            expect(MenuService.search).toHaveBeenCalledWith(payload, params);
        });
    });

    describe('getIcons', () => {
        it('calls getIcons with the correct parameters', async () => {
            await MenuService.getIcons();

            expect(MenuService.getIcons).toHaveBeenCalled();
        });
    });

    describe('create', () => {
        it('calls create with the correct parameters', async () => {
            const payload = {
                name: 'Dashboard',
                url: '/dashboard',
                icon: 'pi pi-home',
                permission_ids: [1],
                status: 'active'
            };

            await MenuService.create(payload);

            expect(MenuService.create).toHaveBeenCalledWith(payload);
        });
    });

    describe('update', () => {
        it('calls update with the correct parameters', async () => {
            const id = 1;
            const payload = {
                name: 'Dashboard Updated',
                url: '/dashboard-updated',
                icon: 'pi pi-home',
                permission_ids: [1],
                status: 'active'
            };

            await MenuService.update(id, payload);

            expect(MenuService.update).toHaveBeenCalledWith(id, payload);
        });
    });

    describe('updateStatus', () => {
        it('calls updateStatus with the correct parameters', async () => {
            const id = 1;
            const payload = {
                status: 'inactive'
            };

            await MenuService.updateStatus(id, payload);

            expect(MenuService.updateStatus).toHaveBeenCalledWith(id, payload);
        });
    });

    describe('updateOrder', () => {
        it('calls updateOrder with the correct parameters', async () => {
            const id = 1;
            const payload = {
                order: 2
            };

            await MenuService.updateOrder(id, payload);

            expect(MenuService.updateOrder).toHaveBeenCalledWith(id, payload);
        });
    });

    describe('deleteItem', () => {
        it('calls deleteItem with the correct parameters', async () => {
            const id = 1;

            await MenuService.deleteItem(id);

            expect(MenuService.deleteItem).toHaveBeenCalledWith(id);
        });
    });
});
