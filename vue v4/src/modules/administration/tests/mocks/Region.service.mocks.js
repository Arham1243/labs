import { vi } from 'vitest';
import * as RegionService from '@/modules/administration/services/Region.service';

export const searchItemsMock = () =>
    vi.spyOn(RegionService, 'searchItems').mockResolvedValue({
        data: {
            data: [
                {
                    id: 'AN',
                    name: 'Antarctica',
                    status: 'active',
                    created_at: '2024-10-07T17:53:47.000000Z',
                    updated_at: '2024-10-09T15:07:15.000000Z'
                },
                {
                    id: 'OC',
                    name: 'Oceania',
                    status: 'active',
                    created_at: '2024-10-07T17:53:46.000000Z',
                    updated_at: '2024-10-07T17:53:46.000000Z'
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/regions/list?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/regions/list?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/regions/list?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/regions/list',
                per_page: 10,
                to: 2,
                total: 2
            }
        }
    });
