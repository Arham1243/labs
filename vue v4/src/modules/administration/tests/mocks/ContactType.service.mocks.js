import { vi } from 'vitest';
import * as ContactTypeService from '@/modules/administration/services/ContactType.service';

export const searchContactTypeMock = () =>
    vi.spyOn(ContactTypeService, 'search').mockResolvedValue({
        data: {
            data: [
                {
                    id: '287dfe57-a627-439c-b551-a28d1f24be9f',
                    name: 'Libero illum voluptas.',
                    status: 'inactive',
                    created_at: '2024-10-07T17:54:08.000000Z',
                    updated_at: '2024-11-01T13:27:15.000000Z'
                },
                {
                    id: '287dfe57-a627-439c-b551-a28d1sf24be9f',
                    name: 'Libero illum voluptas s',
                    status: 'inactive',
                    created_at: '2024-10-07T17:54:08.000000Z',
                    updated_at: '2024-11-01T13:27:15.000000Z'
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/contact-types/search?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/contact-types/search?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/contact-types/search?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/contact-types/search',
                per_page: 10,
                to: 2,
                total: 2
            }
        }
    });
