import { vi } from 'vitest';
import * as CommonService from '@/services/Common.service';

export const searchTagsMock = () =>
    vi.spyOn(CommonService, 'searchTags').mockResolvedValue({
        data: {
            data: [
                {
                    id: 'b31cb187-409a-4dad-8e7a-f615e204c3c0',
                    name: 'Supplementary Classifications-Common Diagnostic Codes'
                },
                {
                    id: '211e65d5-dabb-48db-8100-cff5bf048700',
                    name: 'Supplementary ClassificationsPhysiotherapy'
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/tags/search?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/tags/search?page=2',
                prev: null,
                next: 'https://api.develop.horus.guardme.dev/api/v1/tags/search?page=2'
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/tags/search?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/tags/search',
                per_page: 15,
                to: 2,
                total: 2
            }
        }
    });

export const searchLanguagesMock = () =>
    vi.spyOn(CommonService, 'searchLanguages').mockResolvedValue({
        data: {
            data: [
                {
                    id: 'd4cb52f6-e663-490f-86d1-39397d79b492',
                    name: 'English'
                },
                {
                    id: '9a3ea844-5394-4f59-b7f5-3a5065e79e0f',
                    name: 'Spanish'
                }
            ],
            meta: { path: '' }
        }
    });
export const searchProvincesMock = () =>
    vi.spyOn(CommonService, 'searchProvinces').mockResolvedValue({
        data: {
            data: [
                {
                    id: 'd4cb52f6-e663-490f-86d1-39397d79b492',
                    name: 'English'
                },
                {
                    id: '9a3ea844-5394-4f59-b7f5-3a5065e79e0f',
                    name: 'Spanish'
                }
            ],
            meta: { path: '' }
        }
    });
export const searchCompanyUsersMock = () =>
    vi.spyOn(CommonService, 'searchCompanyUsers').mockResolvedValue({
        data: {
            data: [
                {
                    id: 'd4cb52f6-e663-490f-86d1-39397d79b492',
                    name: 'Dr. Anya Smitham'
                },
                {
                    id: '9a3ea844-5394-4f59-b7f5-3a5065e79e0f',
                    name: 'Hilario Pollich'
                }
            ],
            meta: { path: '' }
        }
    });

export const getTaxTypesMock = () =>
    vi
        .spyOn(CommonService, 'getTaxTypes')
        .mockResolvedValue({ data: { data: [] } });
export const searchCurrenciesMock = () =>
    vi
        .spyOn(CommonService, 'searchCurrencies')
        .mockResolvedValue({ data: { data: [], meta: { path: '' } } });
export const getAppsByCategoryMock = () =>
    vi
        .spyOn(CommonService, 'getAppsByCategory')
        .mockResolvedValue({ data: { data: [], meta: { path: '' } } });
export const searchCountriesMock = () =>
    vi
        .spyOn(CommonService, 'searchCountries')
        .mockResolvedValue({ data: { data: [], meta: { path: '' } } });

export const searchRegionsMock = () =>
    vi
        .spyOn(CommonService, 'searchRegions')
        .mockResolvedValue({ data: { data: [], meta: { path: '' } } });

export const searchUnderwritersMock = () =>
    vi.spyOn(CommonService, 'searchUnderwriters').mockResolvedValue({
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

export const searchVendorsMock = () =>
    vi.spyOn(CommonService, 'searchVendors').mockResolvedValue({
        data: {
            data: [
                {
                    id: 'd4cb52f6-e663-490f-86d1-39397d79b492',
                    name: 'Dr. Anya Smitham'
                },
                {
                    id: '9a3ea844-5394-4f59-b7f5-3a5065e79e0f',
                    name: 'Hilario Pollich'
                },
                {
                    id: '2bbe9477-fa0c-4d60-a55c-c2dcfa4755e1',
                    name: 'Krystel Heaney'
                },
                {
                    id: 'f97523e5-9061-4fa1-94e0-dc82103e38a2',
                    name: 'Rudy Thompson V'
                },
                {
                    id: 'f4b43467-b8db-43c2-8e17-19ff1cd0cd5d',
                    name: 'Leora Schmidt'
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/vendors?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/vendors?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/vendors?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/vendors',
                per_page: 15,
                to: 5,
                total: 5
            }
        }
    });
export const searchClientSectorsMock = () =>
    vi.spyOn(CommonService, 'searchClientSectors').mockResolvedValue({
        data: {
            data: [
                {
                    id: 'd4cb52f6-e663-490f-86d1-39397d79b492',
                    name: 'Dr. Anya Smitham'
                },
                {
                    id: '9a3ea844-5394-4f59-b7f5-3a5065e79e0f',
                    name: 'Hilario Pollich'
                },
                {
                    id: '2bbe9477-fa0c-4d60-a55c-c2dcfa4755e1',
                    name: 'Krystel Heaney'
                },
                {
                    id: 'f97523e5-9061-4fa1-94e0-dc82103e38a2',
                    name: 'Rudy Thompson V'
                },
                {
                    id: 'f4b43467-b8db-43c2-8e17-19ff1cd0cd5d',
                    name: 'Leora Schmidt'
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/client-sectors?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/client-sectors?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/client-sectors?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/client-sectors',
                per_page: 15,
                to: 5,
                total: 5
            }
        }
    });
export const searchContactTypesMock = () =>
    vi.spyOn(CommonService, 'searchContactTypes').mockResolvedValue({
        data: {
            data: [
                {
                    id: 'd4cb52f6-e663-490f-86d1-39397d79b492',
                    name: 'Dr. Anya Smitham'
                },
                {
                    id: '9a3ea844-5394-4f59-b7f5-3a5065e79e0f',
                    name: 'Hilario Pollich'
                },
                {
                    id: '2bbe9477-fa0c-4d60-a55c-c2dcfa4755e1',
                    name: 'Krystel Heaney'
                },
                {
                    id: 'f97523e5-9061-4fa1-94e0-dc82103e38a2',
                    name: 'Rudy Thompson V'
                },
                {
                    id: 'f4b43467-b8db-43c2-8e17-19ff1cd0cd5d',
                    name: 'Leora Schmidt'
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/contact-types/list?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/contact-types/list?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/contact-types/list?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/contact-types/list',
                per_page: 15,
                to: 5,
                total: 5
            }
        }
    });
export const searchBenefitCategoriesMock = () =>
    vi.spyOn(CommonService, 'searchBenefitCategories').mockResolvedValue({
        data: {
            data: [
                {
                    id: 'd4cb52f6-e663-490f-86d1-39397d79b492',
                    name: 'Dr. Anya Smitham'
                },
                {
                    id: '9a3ea844-5394-4f59-b7f5-3a5065e79e0f',
                    name: 'Hilario Pollich'
                },
                {
                    id: '2bbe9477-fa0c-4d60-a55c-c2dcfa4755e1',
                    name: 'Krystel Heaney'
                },
                {
                    id: 'f97523e5-9061-4fa1-94e0-dc82103e38a2',
                    name: 'Rudy Thompson V'
                },
                {
                    id: 'f4b43467-b8db-43c2-8e17-19ff1cd0cd5d',
                    name: 'Leora Schmidt'
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/benefit-categories/list?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/benefit-categories/list?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/benefit-categories/list?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/benefit-categories/list',
                per_page: 15,
                to: 5,
                total: 5
            }
        }
    });

export const getGeneralSettingsMock = () =>
    vi.spyOn(CommonService, 'getGeneralSettings').mockResolvedValue({
        data: {
            announcements: [],
            menu_items: [],
            settings: {}
        }
    });
