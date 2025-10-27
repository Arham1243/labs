import { vi } from 'vitest';
import * as CountryService from '@/modules/administration/services/Country.service';

export const searchItemsMock = () =>
    vi.spyOn(CountryService, 'searchItems').mockResolvedValue({
        data: {
            data: [
                {
                    id: 'SA',
                    name: 'Saudi Arabia',
                    phone_code: '+966',
                    status: 'active',
                    risk_level: 'low',
                    sanctioned: false,
                    created_at: '2024-10-07T17:53:51.000000Z',
                    updated_at: '2024-10-07T17:53:51.000000Z',
                    currency: {
                        id: 'SAR',
                        name: 'Saudi riyal',
                        symbol: 'ر.س',
                        status: 'active',
                        created_at: '2024-10-07T17:53:43.000000Z',
                        updated_at: '2024-10-07T17:53:43.000000Z'
                    },
                    region: {
                        id: 'AS',
                        name: 'Asia',
                        status: 'inactive',
                        created_at: '2024-10-07T17:53:46.000000Z',
                        updated_at: '2024-10-10T14:10:00.000000Z'
                    }
                },
                {
                    id: 'GW',
                    name: 'Guinea-Bissau',
                    phone_code: '+245',
                    status: 'active',
                    risk_level: 'low',
                    sanctioned: false,
                    created_at: '2024-10-07T17:53:48.000000Z',
                    updated_at: '2024-10-07T17:53:48.000000Z',
                    currency: {
                        id: 'XOF',
                        name: 'West African CFA franc',
                        symbol: 'Fr',
                        status: 'active',
                        created_at: '2024-10-07T17:53:40.000000Z',
                        updated_at: '2024-10-07T17:53:40.000000Z'
                    },
                    region: {
                        id: 'AF',
                        name: 'Africa',
                        status: 'active',
                        created_at: '2024-10-07T17:53:46.000000Z',
                        updated_at: '2024-10-22T18:33:36.000000Z'
                    }
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/countries/list?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/countries/list?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/countries/list?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/countries/list',
                per_page: 10,
                to: 2,
                total: 2
            }
        }
    });
