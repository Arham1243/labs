import { vi } from 'vitest';
import * as ClientSectorService from '@/modules/administration/services/ClientSector.service';

export const searchClientSectorMock = () =>
    vi.spyOn(ClientSectorService, 'search').mockResolvedValue({
        data: {
            data: [
                {
                    id: '017f9b58-3948-4aa3-8c49-cs0a2f98956e9',
                    name: 'Bridie Rippin MD',
                    status: 'active',
                    created_at: '2024-10-07T17:54:07.000000Z',
                    updated_at: '2024-10-07T17:54:07.000000Z'
                },
                {
                    id: '017f9b58-3948-4aa3-8c49-cs0a2fs98956e9',
                    name: 'Bridie Rippin MDas',
                    status: 'active',
                    created_at: '2024-10-07T17:54:07.000000Z',
                    updated_at: '2024-10-07T17:54:07.000000Z'
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/client-sectors/search?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/client-sectors/search?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/client-sectors/search?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/client-sectors/search',
                per_page: 10,
                to: 2,
                total: 2
            }
        }
    });
