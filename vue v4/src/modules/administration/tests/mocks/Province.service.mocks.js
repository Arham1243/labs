import { vi } from 'vitest';
import * as ProvinceService from '@/modules/administration/services/Province.service';

export const searchItemsMock = () =>
    vi.spyOn(ProvinceService, 'searchItems').mockResolvedValue({
        data: {
            data: [
                {
                    id: '0f89312a-06a6-4ca9-8842-1590ad1aacd4',
                    name: 'Alberta',
                    code: 'AB',
                    status: 'active',
                    created_at: '2024-10-07T17:53:52.000000Z',
                    updated_at: '2024-10-28T13:37:04.000000Z',
                    country: {
                        id: 'CA',
                        name: 'Canada',
                        phone_code: '+1',
                        status: 'active',
                        risk_level: 'low',
                        sanctioned: false,
                        created_at: '2024-10-07T17:53:47.000000Z',
                        updated_at: '2024-10-07T17:53:47.000000Z'
                    }
                },
                {
                    id: 'b43c0101-ef05-4f00-b87c-f86b44873924',
                    name: 'Newfoundland and Labrador',
                    code: 'NL',
                    status: 'active',
                    created_at: '2024-10-07T17:53:52.000000Z',
                    updated_at: '2024-10-07T17:53:52.000000Z',
                    country: {
                        id: 'CA',
                        name: 'Canada',
                        phone_code: '+1',
                        status: 'active',
                        risk_level: 'low',
                        sanctioned: false,
                        created_at: '2024-10-07T17:53:47.000000Z',
                        updated_at: '2024-10-07T17:53:47.000000Z'
                    }
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/provinces/list?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/provinces/list?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/provinces/list?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/provinces/list',
                per_page: 10,
                to: 2,
                total: 2
            }
        }
    });
