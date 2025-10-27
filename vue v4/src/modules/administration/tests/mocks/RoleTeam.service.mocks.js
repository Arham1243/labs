import { vi } from 'vitest';
import * as RoleTeamService from '@/modules/administration/services/RoleTeam.service';

export const searchTeamsMock = () =>
    vi.spyOn(RoleTeamService, 'searchTeams').mockResolvedValue({
        data: {
            data: [
                {
                    id: 'c6555903-24ac-4c4f-a50a-8f7a4404cbfa',
                    name: 'Core Team',
                    type: 'company',
                    updated_at: '2024-10-25T14:33:21.000000Z'
                },
                {
                    id: 'b7555903-24ac-4c4f-a50a-8f7a4404cbfb',
                    name: 'Viewers',
                    type: 'company',
                    updated_at: '2024-10-25T13:12:04.000000Z'
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/roles/role-1/teams/search?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/roles/role-1/teams/search?page=1',
                prev: null,
                next: null
            },
            meta: {
                current_page: 1,
                from: 1,
                last_page: 1,
                links: [
                    { url: null, label: '&laquo; Previous', active: false },
                    {
                        url: 'https://api.develop.horus.guardme.dev/api/v1/roles/role-1/teams/search?page=1',
                        label: '1',
                        active: true
                    },
                    { url: null, label: 'Next &raquo;', active: false }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/roles/role-1/teams/search',
                per_page: 10,
                to: 2,
                total: 2
            }
        }
    });

// Excluded teams search mock (used by legacy tests, mapped to searchTeams under the hood)
export const getExcludedTeamsForSearch = () =>
    vi.spyOn(RoleTeamService, 'searchTeams').mockResolvedValue({
        data: {
            data: [
                {
                    id: 'e8555903-24ac-4c4f-a50a-8f7a4404cbfc',
                    name: 'Service Provider',
                    description: null,
                    type: 'service_provider',
                    updated_at: '2024-10-25T15:27:45.000000Z'
                },
                {
                    id: 'f9555903-24ac-4c4f-a50a-8f7a4404cbfd',
                    name: 'Client Ops',
                    description: null,
                    type: 'client',
                    updated_at: '2024-10-25T13:12:04.000000Z'
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/roles/role-1/teams/excluded/search?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/roles/role-1/teams/excluded/search?page=1',
                prev: null,
                next: null
            },
            meta: {
                current_page: 1,
                from: 1,
                last_page: 1,
                links: [
                    { url: null, label: '&laquo; Previous', active: false },
                    {
                        url: 'https://api.develop.horus.guardme.dev/api/v1/roles/role-1/teams/excluded/search?page=1',
                        label: '1',
                        active: true
                    },
                    { url: null, label: 'Next &raquo;', active: false }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/roles/role-1/teams/excluded/search',
                per_page: 10,
                to: 2,
                total: 2
            }
        }
    });
