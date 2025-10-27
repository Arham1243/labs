import { vi } from 'vitest';
import * as TeamService from '@/modules/administration/services/Team.service';

export const searchMock = () =>
    vi.spyOn(TeamService, 'search').mockResolvedValue({
        data: {
            data: [
                {
                    id: 'c6555903-24ac-4c4f-a50a-8f7a4404cbfa',
                    name: 'httttt',
                    description: null,
                    type: 'insured',
                    created_at: '2024-10-25T14:33:21.000000Z',
                    updated_at: '2024-10-25T14:33:21.000000Z'
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/teams/search?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/teams/search?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/teams/search?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/teams/search',
                per_page: 15,
                to: 1,
                total: 1
            }
        }
    });
