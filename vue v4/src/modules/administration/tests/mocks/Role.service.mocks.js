import { vi } from 'vitest';
import * as RoleService from '@/modules/administration/services/Role.service';

export const searchMock = () =>
    vi.spyOn(RoleService, 'search').mockResolvedValue({
        data: {
            data: [
                {
                    id: '7f13c5a7-1ca6-499c-bc9d-35eb637d9725',
                    name: 'Service Provider',
                    description: null,
                    type: 'service_provider',
                    systemic: false,
                    created_at: '2024-10-25T15:27:45.000000Z',
                    updated_at: '2024-10-25T15:27:45.000000Z'
                },
                {
                    id: '34e0fa55-f5fd-49ac-9d3c-dc4ff6bdf629',
                    name: 'Viewers',
                    description: null,
                    type: 'client',
                    systemic: true,
                    created_at: '2024-10-25T13:12:04.000000Z',
                    updated_at: '2024-10-25T13:12:04.000000Z'
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/roles/search?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/roles/search?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/roles/search?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/roles/search',
                per_page: 10,
                to: 2,
                total: 2
            }
        }
    });
