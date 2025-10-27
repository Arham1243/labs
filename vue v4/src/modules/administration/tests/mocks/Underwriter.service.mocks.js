import { vi } from 'vitest';
import * as UnderwriterService from '@/modules/administration/services/Underwriter.service';

export const searchUnderwritersMock = () =>
    vi.spyOn(UnderwriterService, 'searchUnderwriters').mockResolvedValue({
        data: {
            data: [
                {
                    id: '66b2cfca-5578-4871-9c14-d1996291a938',
                    name: 'test edited',
                    code: 'TE1',
                    status: 'active',
                    created_at: '2024-10-09T14:14:00.000000Z',
                    updated_at: '2024-10-10T22:33:01.000000Z',
                    benefits_count: 0
                },
                {
                    id: '7a6403b6-e41d-40f9-b481-5b0542c1fb93',
                    name: 'maiores',
                    code: 'V4U',
                    status: 'active',
                    created_at: '2024-10-07T17:53:53.000000Z',
                    updated_at: '2024-10-07T17:53:53.000000Z',
                    benefits_count: 1
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1//underwriters/list?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1//underwriters/list?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1//underwriters/list?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1//underwriters/list',
                per_page: 10,
                to: 2,
                total: 2
            }
        }
    });
