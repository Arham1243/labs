import { vi } from 'vitest';
import * as CurrencyService from '@/modules/administration/services/Currency.service';

export const searchMock = () =>
    vi.spyOn(CurrencyService, 'search').mockResolvedValue({
        data: {
            data: [
                {
                    id: 'AED',
                    name: 'United Arab Emirates dirham',
                    symbol: 'د.إ',
                    status: 'active',
                    created_at: '2024-10-07T17:53:43.000000Z',
                    updated_at: '2024-10-15T13:50:47.000000Z'
                },
                {
                    id: 'KRW',
                    name: 'South Korean won',
                    symbol: '₩',
                    status: 'active',
                    created_at: '2024-10-07T17:53:43.000000Z',
                    updated_at: '2024-10-07T17:53:43.000000Z'
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/currencies/list?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/currencies/list?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/currencies/list?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/currencies/list',
                per_page: 300,
                to: 2,
                total: 2
            }
        }
    });
