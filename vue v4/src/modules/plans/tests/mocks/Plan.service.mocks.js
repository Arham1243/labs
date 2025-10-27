import { vi } from 'vitest';
import * as PlanService from '@/modules/plans/services/Plan.service';

export const searchPlanByBusinessUnitUuidsMock = () =>
    vi.spyOn(PlanService, 'searchPlanByBusinessUnitUuids').mockResolvedValue({
        data: {
            data: [
                {
                    id: '55ad0ec5-41ce-4c29-96f1-a542151ad2ff',
                    name: {
                        en: 'erwerw',
                        fr: null
                    },
                    effective_date: '2024-10-07',
                    end_date: null,
                    bound: 'out',
                    type: 'international',
                    status: 'active',
                    status_label: 'active',
                    minimum_age: null,
                    minimum_age_type: null,
                    maximum_age: null,
                    maximum_age_type: null,
                    enrolment_period: null,
                    enrolment_period_type: null,
                    policy_term: null,
                    policy_term_type: null,
                    is_required_student_number: true,
                    is_required_employee_number: true,
                    is_cancellations: true,
                    cancellation_type: 'open',
                    extension_type: null,
                    early_return_type: null,
                    is_extensions: false,
                    is_early_returns: true,
                    is_opt_out: false,
                    is_overlap: false,
                    is_refundable: true,
                    accepted_statement_of_suitability: true,
                    associated_plans: [
                        {
                            id: '8d07b6b9-7da2-4ee2-8161-5cfb1c809188',
                            effective_date: '2024-10-28',
                            end_date: null,
                            category: 'recent_graduate',
                            early_arrivals_type: null,
                            early_arrivals_min_days: null,
                            early_arrivals_max_days: null,
                            gap_type: null,
                            gap_min_days: null,
                            gap_max_days: null,
                            recent_graduate_eligible_days: 12,
                            recent_graduate_max_days: 23,
                            status: 'active',
                            accepted_statement_of_suitability: true,
                            total_attached_benefits: 0,
                            benefits_prices_sum: 0,
                            duplicate_benefits: 0,
                            created_at: '2024-10-30T18:24:23.000000Z',
                            updated_at: '2024-10-30T18:42:54.000000Z'
                        }
                    ],
                    total_attached_benefits: 0,
                    benefits_prices_sum: 0,
                    duplicate_benefits: 0,
                    created_at: '2024-10-20 23:33:59',
                    updated_at: '2024-10-20 23:34:58'
                }
            ]
        }
    });

export const searchPlansMock = () =>
    vi.spyOn(PlanService, 'searchPlans').mockResolvedValue({
        data: {
            data: [
                {
                    id: 'ea6f1d26-7751-4f39-9919-906c634f5c8d',
                    name: {
                        en: 'adasdasdasdasdasd asd asd as asd sa as adas das asd asdasd as',
                        fr: null
                    },
                    effective_date: '2024-11-01',
                    end_date: null,
                    bound: 'in',
                    type: 'domestic',
                    status: 'draft',
                    status_label: 'draft',
                    minimum_age: null,
                    minimum_age_type: null,
                    maximum_age: null,
                    maximum_age_type: null,
                    enrolment_period: null,
                    enrolment_period_type: null,
                    policy_term: null,
                    policy_term_type: null,
                    is_required_student_number: false,
                    is_required_employee_number: false,
                    is_cancellations: false,
                    cancellation_type: null,
                    extension_type: null,
                    early_return_type: null,
                    is_extensions: false,
                    is_early_returns: false,
                    is_opt_out: false,
                    is_overlap: false,
                    is_refundable: false,
                    accepted_statement_of_suitability: false,
                    total_attached_benefits: 0,
                    benefits_prices_sum: 0,
                    duplicate_benefits: 0,
                    created_at: '2024-11-08 14:17:07',
                    updated_at: '2024-11-08 14:17:07'
                },
                {
                    id: 'af4f8a9c-28e2-49ae-938e-29475e123384',
                    name: {
                        en: 'Quam laborum in.',
                        fr: 'Adipisci quo.'
                    },
                    effective_date: '2024-10-07',
                    end_date: '2024-10-09',
                    bound: 'in',
                    type: 'international',
                    status: 'active',
                    status_label: 'active',
                    minimum_age: 25,
                    minimum_age_type: 'years',
                    maximum_age: 34,
                    maximum_age_type: 'years',
                    enrolment_period: 2623,
                    enrolment_period_type: 'years',
                    policy_term: 9184,
                    policy_term_type: 'years',
                    is_required_student_number: false,
                    is_required_employee_number: false,
                    is_cancellations: true,
                    cancellation_type: null,
                    extension_type: null,
                    early_return_type: null,
                    is_extensions: true,
                    is_early_returns: true,
                    is_opt_out: true,
                    is_overlap: false,
                    is_refundable: false,
                    accepted_statement_of_suitability: false,
                    total_attached_benefits: 0,
                    benefits_prices_sum: 0,
                    duplicate_benefits: 0,
                    created_at: '2024-10-07 13:54:04',
                    updated_at: '2024-10-07 13:54:04'
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/plans/search?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/plans/search?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/plans/search?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/plans/search',
                per_page: 10,
                to: 2,
                total: 2
            }
        }
    });

export const getPlanMock = () =>
    vi.spyOn(PlanService, 'getPlan').mockResolvedValue({
        data: {
            data: {
                id: '879e4b4b-733d-4b4c-94bc-c34a7969e188',
                name: {
                    en: 'test plan',
                    fr: null
                },
                effective_date: '2024-11-07',
                end_date: null,
                bound: 'in',
                type: 'domestic',
                status: 'active',
                status_label: 'active',
                minimum_age: null,
                minimum_age_type: null,
                maximum_age: null,
                maximum_age_type: null,
                enrolment_period: null,
                enrolment_period_type: null,
                policy_term: null,
                policy_term_type: null,
                is_required_student_number: false,
                is_required_employee_number: false,
                is_cancellations: false,
                cancellation_type: null,
                extension_type: 'fixed',
                early_return_type: null,
                is_extensions: true,
                is_early_returns: false,
                is_opt_out: false,
                is_overlap: false,
                is_refundable: false,
                accepted_statement_of_suitability: true,
                periods: [
                    {
                        id: 'a4c30f94-1a96-4cad-9360-c70c8ee67532',
                        name: '334',
                        start_date: '2024-11-04',
                        end_date: '2024-11-12',
                        cancellation_periods: [],
                        extension_periods: [
                            {
                                id: 1,
                                name: '334',
                                days: 1,
                                plan_period_precedence: 'after',
                                plan_period_date_reference: 'start_date'
                            }
                        ],
                        early_return_periods: []
                    }
                ],
                authorized: {
                    id: 'fccdb5a8-c021-70c1-835f-324c7ca17a12',
                    name: 'name'
                },
                total_attached_benefits: 0,
                benefits_prices_sum: 0,
                duplicate_benefits: 0,
                created_at: '2024-11-01 02:20:29',
                updated_at: '2024-11-04 11:25:33',
                business_unit: {
                    id: 'a6d03875-43a6-4a77-93da-e1c91acc823d',
                    name: {
                        en: 'hgfhgf',
                        fr: null
                    }
                }
            }
        }
    });

export const getPlanBenefitsMock = () =>
    vi.spyOn(PlanService, 'getPlanBenefits').mockResolvedValue({
        data: {
            data: [
                {
                    id: '66eef7b0-2297-40cf-b816-e71e31f24d68',
                    name: {
                        en: 'minima accusantium voluptas',
                        fr: 'non qui ut'
                    },
                    effective_date: '2024-10-07',
                    end_date: '2024-10-09',
                    status: 'inactive',
                    category: {
                        id: '8cf46005-fe50-4007-a40f-3ca523397c4e',
                        name: {
                            en: 'nisi eum',
                            fr: 'aut sit'
                        },
                        status: 'active',
                        created_at: '2024-10-07 13:54:04',
                        updated_at: '2024-10-07 13:54:04'
                    },
                    pivot: {
                        coverage: 3,
                        max_amount: 24940,
                        rules: ['Eos suscipit neque dicta qui est quisquam.'],
                        created_at: '2024-10-07T17:54:04.000000Z',
                        updated_at: '2024-10-07T17:54:04.000000Z'
                    }
                },
                {
                    id: '5f3bfc4c-925a-439a-9140-27cd02ce46e0',
                    name: {
                        en: 'vel saepe harum',
                        fr: 'est non et'
                    },
                    effective_date: '2024-10-07',
                    end_date: '2024-10-09',
                    status: 'inactive',
                    category: {
                        id: '9b5bd980-0b4a-46cf-b5bf-3484a41da943',
                        name: {
                            en: 'ipsam repudiandae',
                            fr: 'minima cupiditate'
                        },
                        status: 'active',
                        created_at: '2024-10-07 13:54:04',
                        updated_at: '2024-10-07 13:54:04'
                    },
                    pivot: {
                        coverage: 3,
                        max_amount: 24940,
                        rules: ['Eos suscipit neque dicta qui est quisquam.'],
                        created_at: '2024-10-07T17:54:04.000000Z',
                        updated_at: '2024-10-07T17:54:04.000000Z'
                    }
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/plans/af4f8a9c-28e2-49ae-938e-29475e123384/benefits/search?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/plans/af4f8a9c-28e2-49ae-938e-29475e123384/benefits/search?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/plans/af4f8a9c-28e2-49ae-938e-29475e123384/benefits/search?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/plans/af4f8a9c-28e2-49ae-938e-29475e123384/benefits/search',
                per_page: 10,
                to: 2,
                total: 2
            }
        }
    });

export const getBenefitGroupsMock = () =>
    vi.spyOn(PlanService, 'getBenefitGroups').mockResolvedValue({
        data: {
            data: [
                {
                    id: '1fe426dc-edac-4642-8394-ebec0bd54d6e',
                    name: {
                        en: 'ads',
                        fr: null
                    },
                    effective_date: '2024-11-04',
                    end_date: '2025-03-13',
                    benefits_count: null,
                    pivot: {
                        id: 'b06a1fd7-7ca1-4d76-9387-2f3679c77eb9',
                        coverage: null,
                        max_amount: null,
                        created_at: '2024-11-08T01:54:04.000000Z',
                        updated_at: '2024-11-08T01:54:04.000000Z'
                    },
                    included_benefits_count: 1,
                    excluded_benefits_count: 0,
                    created_at: '2024-11-04 13:38:06',
                    updated_at: '2024-11-07 20:53:26'
                }
            ]
        }
    });

export const searchPlanPricesMock = () =>
    vi.spyOn(PlanService, 'searchPlanPrices').mockResolvedValue({
        data: {
            data: [
                {
                    id: '6ca39ec0-5123-4baa-a874-6440b283741a',
                    unit_term: 'daily',
                    net_price: null,
                    sale_price: 123,
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
                        }
                    ],
                    contributors: [],
                    created_at: '2024-11-07 20:49:03',
                    updated_at: '2024-11-07 20:49:03'
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/plans/e5639696-45bc-481f-9404-891f31555033/prices/search?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/plans/e5639696-45bc-481f-9404-891f31555033/prices/search?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/plans/e5639696-45bc-481f-9404-891f31555033/prices/search?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/plans/e5639696-45bc-481f-9404-891f31555033/prices/search',
                per_page: 10,
                to: 1,
                total: 1
            }
        }
    });

export const searchBenefitGroupsBenefitsMock = () =>
    vi.spyOn(PlanService, 'searchBenefitGroupsBenefits').mockResolvedValue({
        data: {
            data: [
                {
                    id: '23afc7e6-a528-4655-8bf4-5b4a37086164',
                    name: {
                        en: 'atque maxime voluptatem',
                        fr: 'autem excepturi molestiae'
                    },
                    effective_date: '2024-10-07',
                    end_date: '2024-10-09',
                    status: 'active',
                    category: {
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
                        coverage: null,
                        max_amount: null,
                        created_at: '2024-11-08T04:55:06.000000Z',
                        updated_at: '2024-11-08T04:55:06.000000Z'
                    }
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/benefit-group-plans/6ccdff94-24a6-4e1b-bd56-0f8a23164d19/benefits/search?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/benefit-group-plans/6ccdff94-24a6-4e1b-bd56-0f8a23164d19/benefits/search?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/benefit-group-plans/6ccdff94-24a6-4e1b-bd56-0f8a23164d19/benefits/search?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/benefit-group-plans/6ccdff94-24a6-4e1b-bd56-0f8a23164d19/benefits/search',
                per_page: 10,
                to: 1,
                total: 1
            }
        }
    });
