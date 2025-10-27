import { vi } from 'vitest';
import * as TeamRoleService from '@/modules/administration/services/TeamRole.service';

export const searchRolesMock = () =>
    vi.spyOn(TeamRoleService, 'searchRoles').mockResolvedValue({
        data: {
            data: [
                {
                    id: 'a48ab259-a4dd-46b5-aedc-6f54f3c5814d',
                    name: 'Client Role',
                    type: 'company',
                    updated_at: '2024-10-25T15:27:37.000000Z'
                },
                {
                    id: '34e0fa55-f5fd-49ac-9d3c-dc4ff6bdf629',
                    name: 'Viewers',
                    type: 'company',
                    updated_at: '2024-10-25T13:12:04.000000Z'
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/teams/d69732da-f982-4e7d-ab2c-250c81b82861/roles/search?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/teams/d69732da-f982-4e7d-ab2c-250c81b82861/roles/search?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/teams/d69732da-f982-4e7d-ab2c-250c81b82861/roles/search?page=1',
                        label: '1',
                        active: true
                    },
                    { url: null, label: 'Next &raquo;', active: false }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/teams/d69732da-f982-4e7d-ab2c-250c81b82861/roles/search',
                per_page: 10,
                to: 2,
                total: 2
            }
        }
    });
