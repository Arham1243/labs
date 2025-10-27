import { vi } from 'vitest';
import * as CodeSetService from '@/modules/plans/services/CodeSet.service';

export const getCodeGroupMock = () =>
    vi.spyOn(CodeSetService, 'getCodeGroup').mockResolvedValue({
        data: {
            data: {
                id: 'b35cac8c-66ee-4720-9ee9-0b118cc999a9',
                name: {
                    en: 'rerum quidem totam',
                    fr: 'distinctio dolor et'
                },
                description: {
                    en: 'Dicta praesentium aut odio est dolores.',
                    fr: 'Et aliquid dolorem dolores tempore aspernatur eveniet.'
                },
                effective_date: '2025-03-08',
                is_locked: false,
                status: 'active',
                status_label: 'constants.service_code_group_statuses.active',
                service_code_set: {
                    id: '759e6675-e87b-409d-9be1-108e965d5541',
                    name: {
                        en: 'et aut non',
                        fr: 'velit doloremque est'
                    }
                },
                created_at: '2024-10-07 13:53:53',
                updated_at: '2024-10-07 13:53:53'
            }
        }
    });

export const searchCodeGroupsMock = () =>
    vi.spyOn(CodeSetService, 'searchCodeGroups').mockResolvedValue({
        data: {
            data: [
                {
                    id: '61c45d6e-2096-4062-874d-de0794a08b54',
                    name: {
                        en: 'est nam error',
                        fr: 'nesciunt aut et'
                    },
                    description: {
                        en: 'Dignissimos aliquam magni provident rerum est.',
                        fr: 'Culpa aut consequuntur non omnis.'
                    },
                    effective_date: '2024-12-30',
                    is_locked: false,
                    status: 'active',
                    status_label:
                        'constants.service_code_group_statuses.active',
                    service_code_set: {
                        id: '6ef670a0-7c1f-47d7-981d-2bdb9cd52619',
                        name: {
                            en: 'et soluta aperiam',
                            fr: 'est id rerum'
                        }
                    },
                    created_at: '2024-10-07 13:54:02',
                    updated_at: '2024-10-07 13:54:02'
                },
                {
                    id: '275fc5a7-cf37-4217-b64c-1b682e6f148a',
                    name: {
                        en: 'in error exercitationem',
                        fr: 'voluptatibus nulla excepturi'
                    },
                    description: {
                        en: 'Distinctio minus dolorum qui eos adipisci esse in rerum.',
                        fr: 'Autem ut fuga accusantium qui et sunt deleniti.'
                    },
                    effective_date: '2024-10-18',
                    is_locked: false,
                    status: 'active',
                    status_label:
                        'constants.service_code_group_statuses.active',
                    service_code_set: {
                        id: '759e6675-e87b-409d-9be1-108e965d5541',
                        name: {
                            en: 'et aut non',
                            fr: 'velit doloremque est'
                        }
                    },
                    created_at: '2024-10-07 13:53:53',
                    updated_at: '2024-10-07 13:53:53'
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/service-code-groups/search?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/service-code-groups/search?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/service-code-groups/search?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/service-code-groups/search',
                per_page: 10,
                to: 2,
                total: 2
            }
        }
    });

export const getCodeSetMock = () =>
    vi.spyOn(CodeSetService, 'getCodeSet').mockResolvedValue({
        data: {
            data: {
                id: '70546efd-e417-44d0-9f11-a2c660d6fff5',
                name: {
                    en: 'eveniet nisi dignissimos',
                    fr: 'molestiae tenetur dolorem'
                },
                description: {
                    en: 'Debitis illum beatae consequuntur.',
                    fr: 'Enim autem sunt adipisci.'
                },
                effective_date: '2025-04-01',
                created_at: '2024-10-07 13:54:04',
                updated_at: '2024-10-07 13:54:04',
                status: 'active',
                is_locked: false,
                status_label: 'constants.service_code_set_statuses.active'
            }
        }
    });

export const searchCodeSetsMock = () =>
    vi.spyOn(CodeSetService, 'searchCodeSets').mockResolvedValue({
        data: {
            data: [
                {
                    id: '70546efd-e417-44d0-9f11-a2c660d6fff5',
                    name: {
                        en: 'eveniet nisi dignissimos',
                        fr: 'molestiae tenetur dolorem'
                    },
                    description: {
                        en: 'Debitis illum beatae consequuntur.',
                        fr: 'Enim autem sunt adipisci.'
                    },
                    effective_date: '2025-04-01',
                    created_at: '2024-10-07 13:54:04',
                    updated_at: '2024-10-07 13:54:04',
                    status: 'active',
                    is_locked: false,
                    status_label: 'constants.service_code_set_statuses.active'
                },
                {
                    id: '22d70250-f303-444f-aa22-2b5a93ee26db',
                    name: {
                        en: 'delectus qui sed',
                        fr: 'eum est accusantium'
                    },
                    description: {
                        en: 'Nostrum vitae doloribus est culpa architecto.',
                        fr: 'Consectetur vel omnis aliquam dolorum id nam omnis.'
                    },
                    effective_date: '2024-12-17',
                    created_at: '2024-10-07 13:53:57',
                    updated_at: '2024-10-07 13:53:57',
                    status: 'active',
                    is_locked: false,
                    status_label: 'constants.service_code_set_statuses.active'
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/service-code-sets/search?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/service-code-sets/search?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/service-code-sets/search?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/service-code-sets/search',
                per_page: 10,
                to: 2,
                total: 2
            }
        }
    });

export const getCodeSetTagsMock = () =>
    vi
        .spyOn(CodeSetService, 'getCodeSetTags')
        .mockResolvedValue({ data: { data: [] } });

export const searchEntityServiceCodesMock = () =>
    vi.spyOn(CodeSetService, 'searchEntityServiceCodes').mockResolvedValue({
        data: {
            data: [
                {
                    id: 'a11d6049-00e1-4fd3-a7c2-1450e779801e',
                    code: '90660',
                    description: {
                        en: 'Praesentium rem fugit molestiae veniam velit et.',
                        fr: 'Temporibus facilis totam adipisci sint.'
                    },
                    created_at: '2024-10-07 13:53:53',
                    updated_at: '2024-10-07 13:53:53',
                    tags: []
                },
                {
                    id: 'bcb133fe-a978-47bf-8ffa-9280c0603fd7',
                    code: '8063',
                    description: {
                        en: 'Nisi minima ut dicta ut veniam explicabo id.',
                        fr: 'Ipsum dolore eos aperiam ad.'
                    },
                    created_at: '2024-10-07 13:53:53',
                    updated_at: '2024-10-07 13:53:53',
                    tags: []
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/service-code-sets/759e6675-e87b-409d-9be1-108e965d5541/service-codes/search?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/service-code-sets/759e6675-e87b-409d-9be1-108e965d5541/service-codes/search?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/service-code-sets/759e6675-e87b-409d-9be1-108e965d5541/service-codes/search?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/service-code-sets/759e6675-e87b-409d-9be1-108e965d5541/service-codes/search',
                per_page: 10,
                to: 2,
                total: 2
            }
        }
    });

export const searchExcludedServicesCodesMock = () =>
    vi.spyOn(CodeSetService, 'searchExcludedServicesCodes').mockResolvedValue({
        data: {
            data: [
                {
                    id: '083b16c2-3db6-4c88-a36f-647abe0055a0',
                    code: '31483',
                    description: {
                        en: 'Voluptatibus recusandae facere doloribus fugiat et.',
                        fr: 'Reiciendis ducimus consequatur atque iure.'
                    },
                    created_at: '2024-10-07 13:54:03',
                    updated_at: '2024-10-07 13:54:03',
                    tags: []
                },
                {
                    id: '4d19f3d0-f381-407a-a0e8-b0c0092d6a4a',
                    code: '4290',
                    description: {
                        en: 'Quasi voluptatibus repudiandae fuga exercitationem dignissimos sunt velit tempore.',
                        fr: 'Consequuntur voluptatibus voluptatibus quia voluptatum non enim.'
                    },
                    created_at: '2024-10-07 13:54:03',
                    updated_at: '2024-10-07 13:54:03',
                    tags: []
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/service-code-groups/b06dd24d-b68d-458b-94dd-766c7e8a9640/service-codes/excluded/search?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/service-code-groups/b06dd24d-b68d-458b-94dd-766c7e8a9640/service-codes/excluded/search?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/service-code-groups/b06dd24d-b68d-458b-94dd-766c7e8a9640/service-codes/excluded/search?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/service-code-groups/b06dd24d-b68d-458b-94dd-766c7e8a9640/service-codes/excluded/search',
                per_page: 10,
                to: 2,
                total: 2
            }
        }
    });
