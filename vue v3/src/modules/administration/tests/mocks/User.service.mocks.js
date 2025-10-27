import { vi } from 'vitest';
import * as UserService from '@/modules/administration/services/User.service';

export const searchMock = () =>
    vi.spyOn(UserService, 'search').mockResolvedValue({
        data: {
            data: [
                {
                    id: 'c6555903-24ac-4c4f-a50a-8f7a4404cbfa',
                    name: 'test user',
                    type: 'company',
                    created_at: '2024-10-25T14:33:21.000000Z',
                    updated_at: '2024-10-25T14:33:21.000000Z'
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/company-users/search?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/company-users/search?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/company-users/search?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/company-users/search',
                per_page: 15,
                to: 1,
                total: 1
            }
        }
    });
