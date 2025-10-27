import { vi } from 'vitest';
import * as ClientService from '@/modules/clients/services/Client.service';

export const getHoldingMock = () =>
    vi.spyOn(ClientService, 'getHolding').mockResolvedValue({
        data: {
            data: {
                id: '247e4d94-8cb1-4e6e-8556-a4d637d593cd',
                name: {
                    en: 'efsdfsd',
                    fr: null
                },
                short_name: {
                    en: null,
                    fr: null
                },
                phone_number: null,
                website_url: null,
                address: null,
                address2: null,
                country_id: null,
                city: null,
                postal_code: null,
                contacts: [
                    {
                        id: '7a23ab10-ae48-45ef-9912-4ce780a58e13',
                        first_name: 'ewewe',
                        last_name: null,
                        email: null,
                        phone_number: '2121212',
                        use_as_primary_contact: true
                    }
                ],
                clients: [],
                status: 'active'
            }
        }
    });

export const getContactTypesMock = () =>
    vi.spyOn(ClientService, 'getContactTypes').mockResolvedValue({
        data: {
            data: [
                {
                    id: '5e0fc8cc-64b8-496c-8b64-92e3f7ec4a90',
                    name: 'test1',
                    status: 'inactive',
                    created_at: '2024-10-30T13:17:53.000000Z',
                    updated_at: '2024-10-31T20:59:48.000000Z'
                },
                {
                    id: 'dcf334e7-d8c8-4128-8e08-221cbd1c0cf0',
                    name: '3333',
                    status: 'active',
                    created_at: '2024-10-30T13:17:16.000000Z',
                    updated_at: '2024-10-30T13:17:16.000000Z'
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/contact-types?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/contact-types?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/contact-types?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/contact-types',
                per_page: 15,
                to: 2,
                total: 2
            }
        }
    });

export const searchClientsMock = () =>
    vi.spyOn(ClientService, 'searchClients').mockResolvedValue({
        data: {
            data: [
                {
                    id: '102f68db-d7e0-44e4-8131-6569c88833b4',
                    name: {
                        en: 'sit est dolorem',
                        fr: 'ut culpa quisquam'
                    },
                    short_name: {
                        en: 'quia in quo',
                        fr: 'dolores id accusamus'
                    },
                    client_sector_id: '805466c9-403f-4ac7-ba82-5ba404ebad3f',
                    client_sector: {
                        id: '805466c9-403f-4ac7-ba82-5ba404ebad3f',
                        name: 'Gia Brekke II',
                        status: 'active',
                        created_at: '2024-10-07T17:54:07.000000Z',
                        updated_at: '2024-10-07T17:54:07.000000Z'
                    },
                    enrollment_type: 'api',
                    phone_number: '+201203131319',
                    website_url: null,
                    country_id: null,
                    address:
                        'Maxime cum excepturi et laboriosam nesciunt architecto fuga.',
                    address2:
                        'Perspiciatis consequatur reprehenderit in qui et omnis dolor.',
                    city: 'Alexandria',
                    postal_code: null,
                    status: 'draft',
                    type: 'shared',
                    client: 'shared',
                    provisioning_status: 'unprovisioned',
                    preferred_language: 'fr',
                    logo: null
                },
                {
                    id: 'cb50dc5a-9c34-4f32-bb83-6840ae5a9b5e',
                    name: {
                        en: 'iste sit et',
                        fr: 'amet ut et'
                    },
                    short_name: {
                        en: 'temporibus unde fugit',
                        fr: 'et ipsa odit'
                    },
                    client_sector_id: 'b3c940f0-0696-4ddf-9e17-e13b4a44e7e7',
                    client_sector: {
                        id: 'b3c940f0-0696-4ddf-9e17-e13b4a44e7e7',
                        name: 'Lavon Beatty',
                        status: 'active',
                        created_at: '2024-10-07T17:54:06.000000Z',
                        updated_at: '2024-10-07T17:54:06.000000Z'
                    },
                    enrollment_type: 'api',
                    phone_number: '+201203131319',
                    website_url: null,
                    country_id: null,
                    address:
                        'Autem possimus optio qui voluptas rerum aut maxime.',
                    address2: 'Ullam inventore eius alias numquam neque vero.',
                    city: 'Alexandria',
                    postal_code: null,
                    status: 'draft',
                    type: 'shared',
                    client: 'shared',
                    provisioning_status: 'unprovisioned',
                    preferred_language: 'fr',
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
                per_page: 10,
                to: 2,
                total: 2
            }
        }
    });

export const getClientMock = () =>
    vi.spyOn(ClientService, 'getClient').mockResolvedValue({
        data: {
            data: {
                id: '95a40c95-0d80-470b-9c61-173576affd32',
                name: {
                    en: 'Davies christopher',
                    fr: null
                },
                short_name: {
                    en: 'Davies',
                    fr: null
                },
                client_sector_id: '33cc6553-4da0-4362-b0b2-93f5232d7bbb',
                client_sector: {
                    id: '33cc6553-4da0-4362-b0b2-93f5232d7bbb',
                    name: 'Private Schools',
                    status: 'active',
                    created_at: '2024-10-07T17:53:40.000000Z',
                    updated_at: '2024-10-07T17:53:40.000000Z'
                },
                enrollment_type: 'api',
                phone_number: '+108064263154',
                website_url: null,
                country_id: null,
                address: '14 Adams Manuel Street Sabo Yaba Lagos',
                address2: 'Cone Street Lagos',
                city: 'Lagos',
                postal_code: '101011',
                status: 'draft',
                type: 'shared',
                client: 'shared',
                provisioning_status: 'provisioned',
                contacts: [],
                billing_detail: {},
                business_units: [
                    {
                        id: 'e8202ef0-9d81-4bc3-a9d3-fbc2975cd700',
                        name: {
                            en: 'erew',
                            fr: null
                        },
                        short_name: {
                            en: null,
                            fr: null
                        },
                        client_id: '95a40c95-0d80-470b-9c61-173576affd32',
                        client: {
                            id: '95a40c95-0d80-470b-9c61-173576affd32',
                            name: {
                                en: 'Davies christopher',
                                fr: null
                            },
                            short_name: {
                                en: 'Davies',
                                fr: null
                            },
                            client_sector_id:
                                '33cc6553-4da0-4362-b0b2-93f5232d7bbb',
                            client_sector: {
                                id: '33cc6553-4da0-4362-b0b2-93f5232d7bbb',
                                name: 'Private Schools',
                                status: 'active',
                                created_at: '2024-10-07T17:53:40.000000Z',
                                updated_at: '2024-10-07T17:53:40.000000Z'
                            },
                            enrollment_type: 'api',
                            phone_number: '+108064263154',
                            website_url: null,
                            country_id: null,
                            address: '14 Adams Manuel Street Sabo Yaba Lagos',
                            address2: 'Cone Street Lagos',
                            city: 'Lagos',
                            postal_code: '101011',
                            status: 'draft',
                            type: 'shared',
                            client: 'shared',
                            provisioning_status: 'provisioned',
                            preferred_language: 'en',
                            logo: null
                        },
                        enrollment_type: 'api',
                        billing_access_status: false,
                        is_phone_number_same_as_client: false,
                        phone_number: null,
                        is_website_url_same_as_client: false,
                        website_url: null,
                        account_manager_user_id: null,
                        is_location_details_same_as_client: false,
                        location_details: {
                            country_id: null,
                            address: null,
                            address2: null,
                            city: null,
                            postal_code: null
                        },
                        active_plans_count: 1,
                        status: 'draft'
                    }
                ],
                preferred_language: 'en',
                logo: null
            }
        }
    });

export const getBusinessUnitMock = () =>
    vi.spyOn(ClientService, 'getBusinessUnit').mockResolvedValue({
        data: {
            data: {
                id: 'e8202ef0-9d81-4bc3-a9d3-fbc2975cd700',
                name: {
                    en: 'erew',
                    fr: null
                },
                short_name: {
                    en: null,
                    fr: null
                },
                client_id: '95a40c95-0d80-470b-9c61-173576affd32',
                client: {
                    id: '95a40c95-0d80-470b-9c61-173576affd32',
                    name: {
                        en: 'Davies christopher',
                        fr: null
                    },
                    short_name: {
                        en: 'Davies',
                        fr: null
                    },
                    client_sector_id: '33cc6553-4da0-4362-b0b2-93f5232d7bbb',
                    client_sector: {
                        id: '33cc6553-4da0-4362-b0b2-93f5232d7bbb',
                        name: 'Private Schools',
                        status: 'active',
                        created_at: '2024-10-07T17:53:40.000000Z',
                        updated_at: '2024-10-07T17:53:40.000000Z'
                    },
                    enrollment_type: 'api',
                    phone_number: '+108064263154',
                    website_url: null,
                    country_id: null,
                    address: '14 Adams Manuel Street Sabo Yaba Lagos',
                    address2: 'Cone Street Lagos',
                    city: 'Lagos',
                    postal_code: '101011',
                    status: 'draft',
                    type: 'shared',
                    client: 'shared',
                    provisioning_status: 'provisioned',
                    preferred_language: 'en',
                    logo: null
                },
                enrollment_type: 'api',
                billing_access_status: false,
                is_phone_number_same_as_client: false,
                phone_number: null,
                is_website_url_same_as_client: false,
                website_url: null,
                account_manager_user_id: null,
                account_manager_user: {
                    id: 'ccbdb568-d0e1-7083-0747-905e9a5093a2',
                    name: 'jacob joshua ekanem'
                },
                is_location_details_same_as_client: false,
                location_details: {
                    country_id: null,
                    address: null,
                    address2: null,
                    city: null,
                    postal_code: null
                },
                contacts: [],
                active_plans_count: 0,
                status: 'draft',
                billing_detail: {}
            }
        }
    });

export const searchBusinessUnits = () =>
    vi.spyOn(ClientService, 'searchBusinessUnits').mockResolvedValue({
        data: {
            data: [
                {
                    id: 'ca411e90-86d4-4575-87e8-514eefc6d2a3',
                    name: 'Brook Sawayn',
                    status: 'active',
                    created_at: '2024-10-07T17:54:08.000000Z',
                    updated_at: '2024-10-31T18:06:47.000000Z'
                },
                {
                    id: '27251412-5b21-4810-bc60-30ca790e8f0b',
                    name: 'Colten Grady',
                    status: 'active',
                    created_at: '2024-10-07T17:54:07.000000Z',
                    updated_at: '2024-10-07T17:54:07.000000Z'
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/client-sectors/search?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/client-sectors/search?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/client-sectors/search?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/client-sectors/search',
                per_page: 100,
                to: 2,
                total: 2
            }
        }
    });
export const searchClientSectorsMock = () =>
    vi.spyOn(ClientService, 'searchClientSectors').mockResolvedValue({
        data: {
            data: [
                {
                    id: 'ca411e90-86d4-4575-87e8-514eefc6d2a3',
                    name: 'Brook Sawayn',
                    status: 'active',
                    created_at: '2024-10-07T17:54:08.000000Z',
                    updated_at: '2024-10-31T18:06:47.000000Z'
                },
                {
                    id: '27251412-5b21-4810-bc60-30ca790e8f0b',
                    name: 'Colten Grady',
                    status: 'active',
                    created_at: '2024-10-07T17:54:07.000000Z',
                    updated_at: '2024-10-07T17:54:07.000000Z'
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/client-sectors/search?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/client-sectors/search?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/client-sectors/search?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/client-sectors/search',
                per_page: 100,
                to: 2,
                total: 2
            }
        }
    });

export const searchHoldingsMock = () =>
    vi.spyOn(ClientService, 'searchHoldings').mockResolvedValue({
        data: {
            data: [
                {
                    id: '061aa61f-bbfb-4e46-ae3a-ab3b27ca5049',
                    name: {
                        en: 'uytyuty',
                        fr: null
                    },
                    short_name: {
                        en: null,
                        fr: null
                    },
                    phone_number: null,
                    website_url: null,
                    address: null,
                    address2: null,
                    country_id: null,
                    city: null,
                    postal_code: null,
                    status: 'active'
                },
                {
                    id: '247e4d94-8cb1-4e6e-8556-a4d637d593cd',
                    name: {
                        en: 'efsdfsd',
                        fr: null
                    },
                    short_name: {
                        en: null,
                        fr: null
                    },
                    phone_number: null,
                    website_url: null,
                    address: null,
                    address2: null,
                    country_id: null,
                    city: null,
                    postal_code: null,
                    status: 'active'
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/holdings/search?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/holdings/search?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/holdings/search?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/holdings/search',
                per_page: 10,
                to: 2,
                total: 2
            }
        }
    });
