import { vi } from 'vitest';
import * as BenefitService from '@/modules/plans/services/Benefit.service';

export const searchBenefitGroupBenefitsMock = () =>
    vi.spyOn(BenefitService, 'searchBenefitGroupBenefits').mockResolvedValue({
        data: {
            data: [
                {
                    id: '23afc7e6-a528-4655-8bf4-5b4a37086164',
                    name: {
                        en: 'atque maxime voluptatem',
                        fr: 'autem excepturi molestiae'
                    },
                    code: '01J9M1VX80A64YT24BZXADAN37',
                    effective_date: '2024-10-07',
                    end_date: '2024-10-09',
                    benefit_category: {
                        id: 'ca83ddc9-94fa-4e81-a65e-1283cc7fdf49',
                        name: {
                            en: 'accusantium in',
                            fr: 'totam consequatur'
                        },
                        status: 'active',
                        created_at: '2024-10-07 13:54:06',
                        updated_at: '2024-10-07 13:54:06'
                    },
                    pivot: {
                        coverage: 59,
                        max_amount: 2199
                    }
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/benefits/search?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/benefits/search?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/benefits/search?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/benefits/search',
                per_page: 10,
                to: 3,
                total: 3
            }
        }
    });

export const searchBenefitsMock = () =>
    vi.spyOn(BenefitService, 'searchBenefits').mockResolvedValue({
        data: {
            data: [
                {
                    id: '23afc7e6-a528-4655-8bf4-5b4a37086164',
                    name: {
                        en: 'atque maxime voluptatem',
                        fr: 'autem excepturi molestiae'
                    },
                    coverage: 59,
                    max_amount: 2199,
                    code: '01J9M1VX80A64YT24BZXADAN37',
                    effective_date: '2024-10-07',
                    end_date: '2024-10-09',
                    status: 'active',
                    status_label: 'active',
                    is_locked: false,
                    is_reportable_to_vendors: false,
                    is_individual: false,
                    rules: [
                        {
                            value: 20,
                            supply: 'units',
                            timeline: 'calendar_year',
                            join_type: 'and',
                            timeline_unit: 9
                        },
                        {
                            value: 22,
                            supply: 'units',
                            timeline: 'calendar_year',
                            join_type: null,
                            timeline_unit: 9
                        }
                    ],
                    min_time_req: {
                        value: 2,
                        period: 'quarter',
                        operator: 'lte'
                    },
                    benefit_category: {
                        id: 'ca83ddc9-94fa-4e81-a65e-1283cc7fdf49',
                        name: {
                            en: 'accusantium in',
                            fr: 'totam consequatur'
                        },
                        status: 'active',
                        created_at: '2024-10-07 13:54:06',
                        updated_at: '2024-10-07 13:54:06'
                    },
                    total_attached_service_codes: 0,
                    duplicate_benefits: 0,
                    created_at: '2024-10-07 13:54:06',
                    updated_at: '2024-10-08 14:41:57'
                },
                {
                    id: '79dcb04e-0303-490d-8b9c-89a0f02df0c6',
                    name: {
                        en: 'delectus placeat eveniet',
                        fr: 'atque aut odio'
                    },
                    coverage: 25,
                    max_amount: 1779,
                    code: '01J9M1VP4HEQBYQ9F6F9J57BSD',
                    effective_date: '2024-10-07',
                    end_date: '2024-10-09',
                    status: 'inactive',
                    status_label: 'inactive',
                    is_locked: false,
                    is_reportable_to_vendors: false,
                    is_individual: false,
                    rules: [
                        {
                            value: 20,
                            supply: 'units',
                            timeline: 'calendar_year',
                            join_type: 'and',
                            timeline_unit: 9
                        },
                        {
                            value: 22,
                            supply: 'units',
                            timeline: 'calendar_year',
                            join_type: null,
                            timeline_unit: 9
                        }
                    ],
                    min_time_req: {
                        value: 2,
                        period: 'quarter',
                        operator: 'lte'
                    },
                    benefit_category: {
                        id: 'e4ac185e-7131-4532-b42d-f15257ec965f',
                        name: {
                            en: 'recusandae perspiciatis',
                            fr: 'autem esse'
                        },
                        status: 'active',
                        created_at: '2024-10-07 13:53:59',
                        updated_at: '2024-10-07 13:53:59'
                    },
                    total_attached_service_codes: 0,
                    duplicate_benefits: 0,
                    created_at: '2024-10-07 13:53:59',
                    updated_at: '2024-10-07 13:53:59'
                },
                {
                    id: '053b5291-84f0-4f74-ae39-d91a995dcaa4',
                    name: {
                        en: 'sunt voluptates consequuntur',
                        fr: 'alias vel voluptatem'
                    },
                    coverage: 16,
                    max_amount: 4773,
                    code: '01J9M1VH0BVN4V6ZWFZ5SF1CF8',
                    effective_date: '2024-10-07',
                    end_date: '2024-10-09',
                    status: 'active',
                    status_label: 'active',
                    is_locked: false,
                    is_reportable_to_vendors: false,
                    is_individual: false,
                    rules: [
                        {
                            value: 20,
                            supply: 'units',
                            timeline: 'calendar_year',
                            join_type: 'and',
                            timeline_unit: 9
                        },
                        {
                            value: 22,
                            supply: 'units',
                            timeline: 'calendar_year',
                            join_type: null,
                            timeline_unit: 9
                        }
                    ],
                    min_time_req: {
                        value: 2,
                        period: 'quarter',
                        operator: 'lte'
                    },
                    benefit_category: {
                        id: 'f2f1ea15-0582-4549-aa0f-b2ebb734db95',
                        name: {
                            en: 'minus atque',
                            fr: 'omnis ut'
                        },
                        status: 'active',
                        created_at: '2024-10-07 13:53:54',
                        updated_at: '2024-10-07 13:53:54'
                    },
                    total_attached_service_codes: 0,
                    duplicate_benefits: 0,
                    created_at: '2024-10-07 13:53:54',
                    updated_at: '2024-10-07 13:53:54'
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/benefits/search?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/benefits/search?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/benefits/search?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/benefits/search',
                per_page: 10,
                to: 3,
                total: 3
            }
        }
    });

export const searchBenefitGroupsMock = () =>
    vi.spyOn(BenefitService, 'searchBenefitGroups').mockResolvedValue({
        data: {
            data: [
                {
                    id: 'eb4aa54b-859b-4e7c-a002-a94517c67fc3',
                    name: {
                        en: 'Sequi laudantium.',
                        fr: 'Voluptatem dolorem.'
                    },
                    coverage: 42,
                    max_amount: 1481,
                    effective_date: '2024-10-07',
                    end_date: '2024-10-09',
                    status: 'active',
                    status_label: 'active',
                    is_locked: false,
                    created_at: '2024-10-07 13:54:06',
                    updated_at: '2024-10-07 13:54:06'
                },
                {
                    id: '7e3b9fa9-4f0c-48bc-a7a7-d29ea075f478',
                    name: {
                        en: 'Aliquid est.',
                        fr: 'Dolorum esse voluptatem.'
                    },
                    coverage: 38,
                    max_amount: 4859,
                    effective_date: '2024-10-07',
                    end_date: '2024-10-09',
                    status: 'active',
                    status_label: 'active',
                    is_locked: false,
                    created_at: '2024-10-07 13:53:59',
                    updated_at: '2024-10-07 13:53:59'
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/benefit-groups/search?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/benefit-groups/search?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/benefit-groups/search?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/benefit-groups/search',
                per_page: 10,
                to: 2,
                total: 2
            }
        }
    });

export const searchBenefitGroupPricesMock = () =>
    vi.spyOn(BenefitService, 'searchBenefitGroupPrices').mockResolvedValue({
        data: {
            data: [
                {
                    id: 'e3a836ad-57c2-41fc-8022-87d6ec4b1943',
                    unit_term: 'daily',
                    net_price: 18.81,
                    sale_price: 78.23,
                    effective_date: '2024-10-07',
                    end_date: '2024-10-09',
                    min_days: null,
                    max_days: null,
                    countries: [],
                    regions: [],
                    contributors: [],
                    created_at: '2024-10-07 13:54:06',
                    updated_at: '2024-10-07 13:54:06'
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/benefit-groups/eb4aa54b-859b-4e7c-a002-a94517c67fc3/prices/search?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/benefit-groups/eb4aa54b-859b-4e7c-a002-a94517c67fc3/prices/search?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/benefit-groups/eb4aa54b-859b-4e7c-a002-a94517c67fc3/prices/search?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/benefit-groups/eb4aa54b-859b-4e7c-a002-a94517c67fc3/prices/search',
                per_page: 10,
                to: 1,
                total: 1
            }
        }
    });

export const getAllBenefitCategoryForListMock = () =>
    vi.spyOn(BenefitService, 'getAllBenefitCategoryForList').mockResolvedValue({
        data: {
            data: [
                {
                    id: 'f1f421b4-e10b-4742-a363-4b5b51a5f044',
                    name: {
                        en: 'new category',
                        fr: null
                    },
                    status: 'active',
                    created_at: '2024-10-07 15:20:51',
                    updated_at: '2024-10-07 15:20:51'
                },
                {
                    id: 'ca83ddc9-94fa-4e81-a65e-1283cc7fdf49',
                    name: {
                        en: 'accusantium in',
                        fr: 'totam consequatur'
                    },
                    status: 'active',
                    created_at: '2024-10-07 13:54:06',
                    updated_at: '2024-10-07 13:54:06'
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/benefit-categories/search?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/benefit-categories/search?page=1',
                prev: null,
                next: null
            },
            meta: {
                current_page: 1,
                from: 1,
                last_page: 3,
                links: [
                    {
                        url: null,
                        label: '&laquo; Previous',
                        active: false
                    },
                    {
                        url: 'https://api.develop.horus.guardme.dev/api/v1/benefit-categories/search?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/benefit-categories/search',
                per_page: 15,
                to: 2,
                total: 2
            }
        }
    });

export const getBenefitGroupMock = () =>
    vi.spyOn(BenefitService, 'getBenefitGroup').mockResolvedValue({
        data: {
            data: {
                id: 'eb4aa54b-859b-4e7c-a002-a94517c67fc3',
                name: {
                    en: 'Sequi laudantium.',
                    fr: 'Voluptatem dolorem.'
                },
                coverage: 42,
                max_amount: 1481,
                effective_date: '2024-10-07',
                end_date: '2024-10-09',
                status: 'active',
                status_label: 'active',
                is_locked: false,
                created_at: '2024-10-07 13:54:06',
                updated_at: '2024-10-07 13:54:06'
            }
        }
    });

export const searchBenefitCategoriesMock = () =>
    vi.spyOn(BenefitService, 'searchBenefitCategories').mockResolvedValue({
        data: {
            data: [
                {
                    id: 'ca83ddc9-94fa-4e81-a65e-1283cc7fdf49',
                    name: {
                        en: 'accusantium in',
                        fr: 'totam consequatur'
                    },
                    status: 'active',
                    created_at: '2024-10-07 13:54:06',
                    updated_at: '2024-10-07 13:54:06'
                },
                {
                    id: '268e9a7f-2b6f-46fe-b72a-566be9690836',
                    name: {
                        en: 'consequatur sint',
                        fr: 'ipsa earum'
                    },
                    status: 'active',
                    created_at: '2024-10-07 13:53:59',
                    updated_at: '2024-10-07 13:53:59'
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/benefit-categories/search?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/benefit-categories/search?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/benefit-categories/search?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/benefit-categories/search',
                per_page: 10,
                to: 2,
                total: 2
            }
        }
    });

export const searchAllBenefitCategoriesMock = () =>
    vi.spyOn(BenefitService, 'searchBenefitCategories').mockResolvedValue({
        data: [
            {
                id: 'f1f421b4-e10b-4742-a363-4b5b51a5f044',
                name: {
                    en: 'new category',
                    fr: null
                },
                status: 'active',
                created_at: '2024-10-07 15:20:51',
                updated_at: '2024-10-07 15:20:51'
            },
            {
                id: 'ca83ddc9-94fa-4e81-a65e-1283cc7fdf49',
                name: {
                    en: 'accusantium in',
                    fr: 'totam consequatur'
                },
                status: 'active',
                created_at: '2024-10-07 13:54:06',
                updated_at: '2024-10-07 13:54:06'
            }
        ]
    });

export const getBenefitMock = () =>
    vi.spyOn(BenefitService, 'getBenefit').mockResolvedValue({
        data: {
            data: {
                id: '7e9cefff-c0e8-4e7d-864d-08a8b3148a73',
                name: {
                    en: 'test benefit name',
                    fr: null
                },
                coverage: 1,
                max_amount: 1,
                code: '01J9S8VHYM0NX0TY8RKFSNE19M',
                effective_date: '2024-10-23',
                end_date: null,
                status: 'active',
                status_label: 'active',
                is_locked: false,
                is_reportable_to_vendors: false,
                is_individual: true,
                rules: [],
                min_time_req: null,
                benefit_category: {
                    id: 'f1f421b4-e10b-4742-a363-4b5b51a5f044',
                    name: {
                        en: 'new category',
                        fr: null
                    },
                    status: 'active',
                    created_at: '2024-10-07 15:20:51',
                    updated_at: '2024-10-07 15:20:51'
                },
                vendors: [],
                underwriter: {
                    id: '7a6403b6-e41d-40f9-b481-5b0542c1fb93',
                    name: 'maiores'
                },
                total_attached_service_codes: 1,
                individual_service_codes_count: 1,
                duplicate_benefits: 0,
                created_at: '2024-10-09 14:32:27',
                updated_at: '2024-10-30 13:05:21'
            }
        }
    });

export const getBenefitCodeServicesGroupsMock = () =>
    vi.spyOn(BenefitService, 'getBenefitCodeServicesGroups').mockResolvedValue({
        data: {
            data: [
                {
                    id: '643f3114-839d-44db-805a-d286c4a1749c',
                    name: {
                        en: 'corporis qui velit',
                        fr: 'incidunt explicabo dignissimos'
                    },
                    description: {
                        en: 'Molestiae itaque rerum commodi quo doloremque rem.',
                        fr: 'Nihil incidunt dolores neque nulla vero ex illum est.'
                    },
                    pivot: {
                        id: '9021825f-7877-40f9-af6c-01e9017679bf',
                        coverage: null,
                        max_amount: null,
                        created_at: '2024-11-09T19:30:38.000000Z',
                        updated_at: '2024-11-09T19:30:38.000000Z'
                    },
                    included_service_codes_count: 3,
                    excluded_service_codes_count: 0,
                    created_at: '2024-10-07 13:54:05',
                    updated_at: '2024-10-07 13:54:05'
                },
                {
                    id: 'bd8e6b1e-6f01-4165-838e-a666b3b4bdef',
                    name: {
                        en: 'totam vel omnis',
                        fr: 'mollitia officiis odit'
                    },
                    description: {
                        en: 'Quia soluta molestiae ratione voluptas ex fugiat necessitatibus.',
                        fr: 'Nihil tempora impedit aperiam recusandae nemo nostrum molestiae.'
                    },
                    pivot: {
                        id: '683efe13-b5fc-464a-9b09-7b0b9a96a6cc',
                        coverage: null,
                        max_amount: null,
                        created_at: '2024-11-09T19:30:38.000000Z',
                        updated_at: '2024-11-09T19:30:38.000000Z'
                    },
                    included_service_codes_count: 3,
                    excluded_service_codes_count: 0,
                    created_at: '2024-10-07 13:54:04',
                    updated_at: '2024-10-07 13:54:04'
                }
            ]
        }
    });

export const searchBenefitEntityServiceCodesMock = () =>
    vi
        .spyOn(BenefitService, 'searchBenefitEntityServiceCodes')
        .mockResolvedValue({
            data: {
                data: [
                    {
                        id: 'a50d4b25-9f66-4783-88cc-bff167b0ff43',
                        code: '63657',
                        description: {
                            en: 'Molestiae modi sit aliquid hic.',
                            fr: 'Numquam maiores vel non vel est.'
                        },
                        pivot: {
                            service_code_id:
                                'a50d4b25-9f66-4783-88cc-bff167b0ff43',
                            coverage: null,
                            max_amount: null,
                            rules: null,
                            created_at: '2024-11-09T19:30:38.000000Z',
                            updated_at: '2024-11-09T19:30:38.000000Z'
                        }
                    },
                    {
                        id: '82a26ff4-3c21-4b5d-80aa-d01b45b67aa1',
                        code: '28180',
                        description: {
                            en: 'Consequatur est earum dolor iste voluptatem delectus.',
                            fr: 'Facilis sint sit illo beatae dolores numquam.'
                        },
                        pivot: {
                            service_code_id:
                                '82a26ff4-3c21-4b5d-80aa-d01b45b67aa1',
                            coverage: null,
                            max_amount: null,
                            rules: null,
                            created_at: '2024-11-09T19:30:38.000000Z',
                            updated_at: '2024-11-09T19:30:38.000000Z'
                        }
                    },
                    {
                        id: 'c3e60516-8b15-4254-a9a4-f05fa9c3bc68',
                        code: '99035',
                        description: {
                            en: 'Enim asperiores tenetur laboriosam unde voluptatem voluptas autem.',
                            fr: 'Praesentium id blanditiis et.'
                        },
                        pivot: {
                            service_code_id:
                                'c3e60516-8b15-4254-a9a4-f05fa9c3bc68',
                            coverage: null,
                            max_amount: null,
                            rules: null,
                            created_at: '2024-11-09T19:30:38.000000Z',
                            updated_at: '2024-11-09T19:30:38.000000Z'
                        }
                    }
                ],
                links: {
                    first: 'https://api.develop.horus.guardme.dev/api/v1/benefit-service-code-groups/683efe13-b5fc-464a-9b09-7b0b9a96a6cc/service-codes/search?page=1',
                    last: 'https://api.develop.horus.guardme.dev/api/v1/benefit-service-code-groups/683efe13-b5fc-464a-9b09-7b0b9a96a6cc/service-codes/search?page=1',
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
                            url: 'https://api.develop.horus.guardme.dev/api/v1/benefit-service-code-groups/683efe13-b5fc-464a-9b09-7b0b9a96a6cc/service-codes/search?page=1',
                            label: '1',
                            active: true
                        },
                        {
                            url: null,
                            label: 'Next &raquo;',
                            active: false
                        }
                    ],
                    path: 'https://api.develop.horus.guardme.dev/api/v1/benefit-service-code-groups/683efe13-b5fc-464a-9b09-7b0b9a96a6cc/service-codes/search',
                    per_page: 10,
                    to: 3,
                    total: 3
                }
            }
        });

export const searchBenefitPricesMock = () =>
    vi.spyOn(BenefitService, 'searchBenefitPrices').mockResolvedValue({
        data: {
            data: [
                {
                    id: 'c5187da0-bf00-4ec2-8147-6fbfff7f904f',
                    unit_term: 'daily',
                    net_price: 12,
                    sale_price: 32,
                    effective_date: '2024-11-11',
                    end_date: null,
                    min_days: null,
                    max_days: null,
                    countries: [
                        {
                            id: 'AO',
                            name: 'Angola'
                        },
                        {
                            id: 'DZ',
                            name: 'Algeria'
                        }
                    ],
                    regions: [
                        {
                            id: 'AF',
                            name: 'Africa'
                        },
                        {
                            id: 'AN',
                            name: 'Antarctica'
                        }
                    ],
                    contributors: [],
                    created_at: '2024-11-09 15:28:28',
                    updated_at: '2024-11-09 15:28:28'
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/benefits/c9fa3f8e-5f27-47f5-8814-3a2938754508/prices/search?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/benefits/c9fa3f8e-5f27-47f5-8814-3a2938754508/prices/search?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/benefits/c9fa3f8e-5f27-47f5-8814-3a2938754508/prices/search?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/benefits/c9fa3f8e-5f27-47f5-8814-3a2938754508/prices/search',
                per_page: 10,
                to: 1,
                total: 1
            }
        }
    });

export const searchBenefitServicesCodesMock = () =>
    vi.spyOn(BenefitService, 'searchBenefitServicesCodes').mockResolvedValue({
        data: { data: [], links: [], meta: { path: '' } }
    });
