import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useMenuStore } from '@/modules/administration/stores';
import { MenuService } from '@/modules/administration/services';

// Mock the MenuService
vi.mock('@/modules/administration/services', () => ({
    MenuService: {
        getMenus: vi.fn(),
        search: vi.fn(),
        getIcons: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateStatus: vi.fn(),
        updateOrder: vi.fn(),
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

describe('MenuStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    describe('getMenus', () => {
        it('calls MenuService.getMenus and returns the data', async () => {
            const store = useMenuStore();
            const mockResponse = {
                data: {
                    data: [
                        {
                            id: 1,
                            name: 'Dashboard',
                            url: '/dashboard',
                            icon: 'pi pi-home',
                            permissions: [{ name: 'view_dashboard' }],
                            status: 'active'
                        }
                    ]
                }
            };

            MenuService.getMenus.mockResolvedValue(mockResponse);

            const result = await store.getMenus();

            expect(MenuService.getMenus).toHaveBeenCalled();
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('search', () => {
        it('calls MenuService.search with the correct parameters', async () => {
            const store = useMenuStore();
            const payload = { search: 'Dashboard' };
            const params = { page: 1, limit: 10 };
            const mockResponse = {
                data: {
                    data: [
                        {
                            id: 1,
                            name: 'Dashboard',
                            url: '/dashboard',
                            icon: 'pi pi-home',
                            permissions: [{ name: 'view_dashboard' }],
                            status: 'active'
                        }
                    ],
                    meta: {
                        total: 1
                    }
                }
            };

            MenuService.search.mockResolvedValue(mockResponse);

            const result = await store.search(payload, params);

            expect(MenuService.search).toHaveBeenCalledWith(payload, params);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('getIcons', () => {
        it('calls MenuService.getIcons and returns the data', async () => {
            const store = useMenuStore();
            const mockResponse = [
                { name: 'pi pi-home', label: 'Home' },
                { name: 'pi pi-user', label: 'User' }
            ];

            MenuService.getIcons.mockResolvedValue(mockResponse);

            const result = await store.getIcons();

            expect(MenuService.getIcons).toHaveBeenCalled();
            expect(result).toEqual(mockResponse);
        });
    });

    describe('create', () => {
        it('calls MenuService.create with the correct parameters and shows success message', async () => {
            const store = useMenuStore();
            const payload = {
                name: 'Dashboard',
                url: '/dashboard',
                icon: 'pi pi-home',
                permission_ids: [1],
                status: 'active'
            };
            const mockResponse = {
                data: {
                    id: 1,
                    name: 'Dashboard',
                    url: '/dashboard',
                    icon: 'pi pi-home',
                    permissions: [{ name: 'view_dashboard' }],
                    status: 'active'
                }
            };

            MenuService.create.mockResolvedValue(mockResponse);

            const result = await store.create(payload);

            expect(MenuService.create).toHaveBeenCalledWith(payload);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('update', () => {
        it('calls MenuService.update with the correct parameters and shows success message', async () => {
            const store = useMenuStore();
            const id = 1;
            const payload = {
                name: 'Dashboard Updated',
                url: '/dashboard-updated',
                icon: 'pi pi-home',
                permission_ids: [1],
                status: 'active'
            };
            const mockResponse = {
                data: {
                    id: 1,
                    name: 'Dashboard Updated',
                    url: '/dashboard-updated',
                    icon: 'pi pi-home',
                    permissions: [{ name: 'view_dashboard' }],
                    status: 'active'
                }
            };

            MenuService.update.mockResolvedValue(mockResponse);

            const result = await store.update(id, payload);

            expect(MenuService.update).toHaveBeenCalledWith(id, payload);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('updateStatus', () => {
        it('calls MenuService.updateStatus with the correct parameters and shows success message', async () => {
            const store = useMenuStore();
            const id = 1;
            const payload = {
                status: 'inactive'
            };
            const mockResponse = {
                data: {
                    id: 1,
                    name: 'Dashboard',
                    url: '/dashboard',
                    icon: 'pi pi-home',
                    permissions: [{ name: 'view_dashboard' }],
                    status: 'inactive'
                }
            };

            MenuService.updateStatus.mockResolvedValue(mockResponse);

            const result = await store.updateStatus(id, payload);

            expect(MenuService.updateStatus).toHaveBeenCalledWith(id, payload);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('updateOrder', () => {
        it('calls MenuService.updateOrder with the correct parameters and shows success message', async () => {
            const store = useMenuStore();
            const id = 1;
            const payload = {
                order: 2
            };
            const mockResponse = {
                data: {
                    id: 1,
                    name: 'Dashboard',
                    url: '/dashboard',
                    icon: 'pi pi-home',
                    permissions: [{ name: 'view_dashboard' }],
                    status: 'active',
                    order: 2
                }
            };

            MenuService.updateOrder.mockResolvedValue(mockResponse);

            const result = await store.updateOrder(id, payload);

            expect(MenuService.updateOrder).toHaveBeenCalledWith(id, payload);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('deleteItem', () => {
        it('calls MenuService.deleteItem with the correct parameters and shows success message', async () => {
            const store = useMenuStore();
            const id = 1;
            const mockResponse = {
                data: {
                    success: true
                }
            };

            MenuService.deleteItem.mockResolvedValue(mockResponse);

            const result = await store.deleteItem(id);

            expect(MenuService.deleteItem).toHaveBeenCalledWith(id);
            expect(result).toEqual(mockResponse.data);
        });
    });
});
