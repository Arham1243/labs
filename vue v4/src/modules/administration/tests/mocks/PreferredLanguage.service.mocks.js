import { vi } from 'vitest';
import * as PreferredLanguageService from '@/modules/administration/services/PreferredLanguage.service';

export const searchMock = () =>
    vi.spyOn(PreferredLanguageService, 'search').mockResolvedValue({
        data: {
            data: [
                {
                    id: 'c0169ffa-1b96-41e9-a1f1-cacd6894a4c8',
                    name: 'Catalan',
                    code: 'ca',
                    status: 'active',
                    default: false,
                    systemic: 0,
                    created_at: '2024-10-07T17:53:44.000000Z',
                    updated_at: '2024-10-07T17:53:44.000000Z'
                },
                {
                    id: '048caa38-c956-4343-8b29-a68c4cfa95f5',
                    name: 'Italian',
                    code: 'it',
                    status: 'active',
                    default: false,
                    systemic: 0,
                    created_at: '2024-10-07T17:53:44.000000Z',
                    updated_at: '2024-10-07T17:53:44.000000Z'
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/languages/list?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/languages/list?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/languages/list?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/languages/list',
                per_page: 10,
                to: 2,
                total: 2
            }
        }
    });
