import { vi } from 'vitest';
import { ClientService } from '@/modules/clients/services';

export const searchClientsMock = () =>
    vi.spyOn(ClientService, 'searchClients').mockResolvedValue({
        data: {
            data: [
                {
                    id: '474649c3-80da-4e72-adfb-3dbc89d538f0',
                    name: {
                        en: 'dolor soluta quod',
                        fr: 'incidunt eum velit'
                    },
                    short_name: {
                        en: 'quasi molestias unde',
                        fr: 'neque delectus enim'
                    },
                    client_sector_id: '81146c63-aa7f-444d-bcdc-ee2d8fb57690',
                    client_sector: {
                        id: '81146c63-aa7f-444d-bcdc-ee2d8fb57690',
                        name: 'Dustin Metz',
                        status: 'active',
                        created_at: '2024-11-29T21:23:37.000000Z',
                        updated_at: '2024-11-29T21:23:37.000000Z'
                    },
                    enrollment_type: 'api',
                    phone_number: '+201203131319',
                    website_url: null,
                    country_id: null,
                    address: 'Dolorem aut ipsa rem et tenetur.',
                    address2: 'Veniam quaerat eveniet sit earum.',
                    city: 'Alexandria',
                    postal_code: null,
                    status: 'draft',
                    type: 'shared',
                    client: 'shared',
                    provisioning_status: 'unprovisioned',
                    preferred_language: 'en',
                    logo: null
                },
                {
                    id: 'c0e6acaf-7ae2-4704-bc60-2f1b5178c460',
                    name: {
                        en: 'consequuntur harum possimus',
                        fr: 'itaque eligendi est'
                    },
                    short_name: {
                        en: 'aut iure cumque',
                        fr: 'fugiat sit nulla'
                    },
                    client_sector_id: '32b53a1a-351c-4cd9-bf72-00fdbbec0efa',
                    client_sector: {
                        id: '32b53a1a-351c-4cd9-bf72-00fdbbec0efa',
                        name: 'Miss Joy Becker Sr.',
                        status: 'active',
                        created_at: '2024-11-29T21:23:37.000000Z',
                        updated_at: '2024-11-29T21:23:37.000000Z'
                    },
                    enrollment_type: 'api',
                    phone_number: '+201203131319',
                    website_url: null,
                    country_id: null,
                    address: 'Sed doloribus dicta sit quos.',
                    address2: 'Explicabo possimus animi mollitia cum.',
                    city: 'Alexandria',
                    postal_code: null,
                    status: 'draft',
                    type: 'shared',
                    client: 'shared',
                    provisioning_status: 'unprovisioned',
                    preferred_language: 'en',
                    logo: null
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/clients/search?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/clients/search?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/clients/search?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/clients/search',
                per_page: 100,
                to: 50,
                total: 50
            }
        }
    });
