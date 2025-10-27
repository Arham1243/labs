import { vi } from 'vitest';
import * as VendorService from '@/modules/administration/services/Vendor.service';

export const searchMock = () =>
    vi.spyOn(VendorService, 'search').mockResolvedValue({
        data: {
            data: [
                {
                    id: 'AED',
                    name: 'United Arab Emirates dirham',
                    status: 'active',
                    created_at: '2024-10-07T17:53:43.000000Z',
                    updated_at: '2024-10-15T13:50:47.000000Z'
                },
                {
                    id: 'KRW',
                    name: 'South Korean won',
                    status: 'active',
                    created_at: '2024-10-07T17:53:43.000000Z',
                    updated_at: '2024-10-07T17:53:43.000000Z'
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/vendors/search?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/vendors/search?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/vendors/search?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/vendors/search',
                per_page: 300,
                to: 2,
                total: 2
            }
        }
    });
