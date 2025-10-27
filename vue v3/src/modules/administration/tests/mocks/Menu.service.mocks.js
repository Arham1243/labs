import { vi } from 'vitest';
import * as MenuService from '@/modules/administration/services/Menu.service';

export const searchMenuMock = () =>
    vi.spyOn(MenuService, 'search').mockResolvedValue({
        data: {
            data: [
                {
                    id: '2b919380-79c4-4155-93de-3c921b2801e6',
                    system: 1,
                    name: 'Services',
                    url: '/services',
                    icon: 'pi pi-fw pi-folder',
                    order: 3,
                    status: 'active',
                    permission: {
                        id: '98a627b1-ab80-42ec-9e33-e7548fbe7532',
                        name: 'view service codes',
                        type: 'company',
                        meta: {
                            group: 'Service Codes',
                            category: 'Services',
                            features: []
                        },
                        guard_name: 'cognito',
                        created_at: '2024-10-08T16:55:11.000000Z',
                        updated_at: '2024-11-13T16:04:08.000000Z'
                    }
                },
                {
                    id: '2b919380-79c4-4155-93de-3cs921b2801e6',
                    system: 1,
                    name: 'Services 2',
                    url: '/services-2',
                    icon: 'pi pi-fw pi-folder',
                    order: 3,
                    status: 'active',
                    permission: {
                        id: '98a627b1-ab80-42ec-9e33-e7548fbe7532',
                        name: 'view service codes',
                        type: 'company',
                        meta: {
                            group: 'Service Codes',
                            category: 'Services',
                            features: []
                        },
                        guard_name: 'cognito',
                        created_at: '2024-10-08T16:55:11.000000Z',
                        updated_at: '2024-11-13T16:04:08.000000Z'
                    }
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/menu/search?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/menu/search?page=1',
                prev: null,
                next: null
            },
            meta: {
                current_page: 1,
                from: 1,
                last_page: 1,
                links: [
                    {
                        url: null,
                        label: '&laquo; Previous',
                        active: false
                    },
                    {
                        url: 'https://api.develop.horus.guardme.dev/api/v1/menu/search?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/menu/search',
                per_page: 10,
                to: 2,
                total: 2
            }
        }
    });
