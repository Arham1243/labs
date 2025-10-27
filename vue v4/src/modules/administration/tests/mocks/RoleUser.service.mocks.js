import { vi } from 'vitest';
import * as RoleUserService from '@/modules/administration/services/RoleUser.service';

export const searchUsersMock = () =>
    vi.spyOn(RoleUserService, 'searchUsers').mockResolvedValue({
        data: {
            data: [
                {
                    id: 'user-1',
                    name: 'John Doe',
                    type: 'company',
                    systemic: false,
                    created_at: '2024-12-03T19:34:52.000000Z',
                    updated_at: '2024-12-03T19:34:52.000000Z'
                },
                {
                    id: 'user-2',
                    name: 'Jane Doe',
                    type: 'company',
                    systemic: false,
                    created_at: '2024-12-03T19:34:52.000000Z',
                    updated_at: '2024-12-03T19:34:52.000000Z'
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/roles/1/company-users/search?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/roles/1/company-users/search?page=1',
                prev: null,
                next: null
            },
            meta: {
                current_page: 1,
                from: 1,
                last_page: 1,
                links: [
                    { url: null, label: '\u00ab Previous', active: false },
                    {
                        url: 'https://api.develop.horus.guardme.dev/api/v1/roles/1/company-users/search?page=1',
                        label: '1',
                        active: true
                    },
                    { url: null, label: 'Next \u00bb', active: false }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/roles/1/company-users/search',
                per_page: 10,
                to: 2,
                total: 2
            }
        }
    });
