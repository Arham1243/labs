import { vi } from 'vitest';
import * as UserTeamService from '@/modules/administration/services/UserTeam.service';

export const searchTeamsMock = () =>
    vi.spyOn(UserTeamService, 'searchTeams').mockResolvedValue({
        data: {
            data: [
                {
                    id: '35d22fa9-19af-46a3-8e54-424f48b79770',
                    name: 'test team',
                    description: 'test team',
                    type: 'company',
                    systemic: false,
                    created_at: '2024-12-03T19:34:52.000000Z',
                    updated_at: '2024-12-03T19:34:52.000000Z'
                },
                {
                    id: '35d22fa9-19af-46a3-82e54-424f48b79770',
                    name: 'test team 2',
                    description: 'test team 2',
                    type: 'company',
                    systemic: false,
                    created_at: '2024-12-03T19:34:52.000000Z',
                    updated_at: '2024-12-03T19:34:52.000000Z'
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/company-users/1733234572824094607/teams/search?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/company-users/1733234572824094607/teams/search?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/company-users/1733234572824094607/teams/search?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/company-users/1733234572824094607/teams/search',
                per_page: 10,
                to: 2,
                total: 2
            }
        }
    });
