import { vi } from 'vitest';
import * as ClientUserService from '@/modules/clients/services/ClientUser.service';
import * as PreferredLanguageService from '@/modules/administration/services/PreferredLanguage.service';
import * as CountryService from '@/modules/administration/services/Country.service';
import * as ProvinceService from '@/modules/administration/services/Province.service';

export const searchUserMock = () =>
    vi.spyOn(ClientUserService, 'search').mockResolvedValue({
        data: {
            data: [
                {
                    id: '1732915400109064615',
                    name: 'Hillin Russell',
                    first_name: 'Gangajyothi',
                    last_name: 'Raghvendra',
                    email: 'gangajyothi@guard.me',
                    username: 'gangajyothi@guard.me',
                    phone_number: '+16479266430',
                    type: 'client',
                    status: 'pending deletion',
                    permission: 'editor',
                    preferred_language: 'en',
                    updated_at: '2024-11-29T21:23:23.000000Z',
                    address: null,
                    city: null,
                    postal_code: null,
                    country: null,
                    province: null
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/client-users/search?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/client-users/search?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/client-users/search?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/client-users/search',
                per_page: 15,
                to: 1,
                total: 1
            }
        }
    });

export const searchLanguageMock = () =>
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

export const searchCountryMock = () =>
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
                first: 'https://api.develop.horus.guardme.dev/api/v1/countries/search?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/countries/search?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/countries/search?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/countries/search',
                per_page: 10,
                to: 2,
                total: 2
            }
        }
    });

export const searchProvinceMock = () =>
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
                first: 'https://api.develop.horus.guardme.dev/api/v1/provinces/search?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/provinces/search?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/provinces/search?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/provinces/search',
                per_page: 10,
                to: 2,
                total: 2
            }
        }
    });
