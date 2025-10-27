import { vi } from 'vitest';
import * as AssociatedPlanService from '@/modules/plans/services/AssociatedPlan.service';

export const getAssociatedPlanMock = () =>
    vi.spyOn(AssociatedPlanService, 'getAssociatedPlan').mockResolvedValue({
        data: {
            data: {
                id: 'bb80af01-0e36-4072-88e4-329bc5f7384b',
                effective_date: '2024-11-17',
                end_date: null,
                category: 'dependants',
                early_arrivals_type: null,
                early_arrivals_min_days: null,
                early_arrivals_max_days: null,
                gap_type: null,
                gap_min_days: null,
                gap_max_days: null,
                recent_graduate_eligible_days: null,
                recent_graduate_max_days: null,
                status: 'draft',
                accepted_statement_of_suitability: false,
                authorized: {
                    id: '8c8d1518-80d1-7015-a1d0-440820502401',
                    name: 'edrick+2@guard.me'
                },
                total_attached_benefits: 0,
                benefits_prices_sum: 0,
                duplicate_benefits: 0,
                plan: {
                    id: '879e4b4b-733d-4b4c-94bc-c34a7969e188',
                    name: {
                        en: 'rtyu',
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
                            end_date: '2024-11-12'
                        }
                    ],
                    total_attached_benefits: 0,
                    benefits_prices_sum: 0,
                    duplicate_benefits: 0,
                    created_at: '2024-11-01 02:20:29',
                    updated_at: '2024-11-04 11:25:33'
                },
                created_at: '2024-11-08T18:36:39.000000Z',
                updated_at: '2024-11-08T18:36:39.000000Z'
            }
        }
    });

export const getPlanBenefitsMock = () =>
    vi.spyOn(AssociatedPlanService, 'getPlanBenefits').mockResolvedValue({
        data: {
            data: [
                {
                    id: '7e9cefff-c0e8-4e7d-864d-08a8b3148a73',
                    name: {
                        en: 'test',
                        fr: null
                    },
                    effective_date: '2024-10-23',
                    end_date: null,
                    status: 'active',
                    category: {
                        id: 'f1f421b4-e10b-4742-a363-4b5b51a5f044',
                        name: {
                            en: 'new category',
                            fr: null
                        },
                        status: 'active',
                        created_at: '2024-10-07 15:20:51',
                        updated_at: '2024-10-07 15:20:51'
                    },
                    pivot: {
                        coverage: null,
                        max_amount: null,
                        rules: null,
                        created_at: '2024-11-08T18:58:41.000000Z',
                        updated_at: '2024-11-08T18:58:41.000000Z'
                    }
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/associated-plans/bb80af01-0e36-4072-88e4-329bc5f7384b/benefits/search?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/associated-plans/bb80af01-0e36-4072-88e4-329bc5f7384b/benefits/search?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/associated-plans/bb80af01-0e36-4072-88e4-329bc5f7384b/benefits/search?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/associated-plans/bb80af01-0e36-4072-88e4-329bc5f7384b/benefits/search',
                per_page: 10,
                to: 1,
                total: 1
            }
        }
    });

export const getBenefitGroupsMock = () =>
    vi.spyOn(AssociatedPlanService, 'getBenefitGroups').mockResolvedValue({
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
                        id: '50241812-cd84-450d-8793-b2b5a7aac716',
                        coverage: null,
                        max_amount: null,
                        created_at: '2024-11-08T19:01:24.000000Z',
                        updated_at: '2024-11-08T19:01:24.000000Z'
                    },
                    included_benefits_count: 1,
                    excluded_benefits_count: 0,
                    created_at: '2024-11-04 13:38:06',
                    updated_at: '2024-11-07 20:53:26'
                }
            ]
        }
    });

export const searchBenefitGroupsBenefitsMock = () =>
    vi
        .spyOn(AssociatedPlanService, 'searchBenefitGroupsBenefits')
        .mockResolvedValue({
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
                            created_at: '2024-11-08T19:01:24.000000Z',
                            updated_at: '2024-11-08T19:01:24.000000Z'
                        }
                    }
                ],
                links: {
                    first: 'https://api.develop.horus.guardme.dev/api/v1/associated-plan-benefit-groups/50241812-cd84-450d-8793-b2b5a7aac716/benefits/search?page=1',
                    last: 'https://api.develop.horus.guardme.dev/api/v1/associated-plan-benefit-groups/50241812-cd84-450d-8793-b2b5a7aac716/benefits/search?page=1',
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
                            url: 'https://api.develop.horus.guardme.dev/api/v1/associated-plan-benefit-groups/50241812-cd84-450d-8793-b2b5a7aac716/benefits/search?page=1',
                            label: '1',
                            active: true
                        },
                        {
                            url: null,
                            label: 'Next &raquo;',
                            active: false
                        }
                    ],
                    path: 'https://api.develop.horus.guardme.dev/api/v1/associated-plan-benefit-groups/50241812-cd84-450d-8793-b2b5a7aac716/benefits/search',
                    per_page: 10,
                    to: 1,
                    total: 1
                }
            }
        });

export const searchPlanPricesMock = () =>
    vi.spyOn(AssociatedPlanService, 'searchPlanPrices').mockResolvedValue({
        data: {
            data: [
                {
                    id: '0a33f9ac-0eb7-4f0f-bbae-938d1470b6ad',
                    unit_term: 'daily',
                    net_price: 123,
                    sale_price: 1234,
                    effective_date: '2024-10-21',
                    end_date: '9999-12-31',
                    min_days: null,
                    max_days: null,
                    countries: [
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
                    contributors: [
                        {
                            id: '7e9cefff-c0e8-4e7d-864d-08a8b3148a73',
                            name: {
                                en: 'test',
                                fr: null
                            },
                            type: 'Horus\\PlanModule\\Models\\Benefit',
                            sale_price: 1234,
                            net_price: 123
                        },
                        {
                            id: '1fe426dc-edac-4642-8394-ebec0bd54d6e',
                            name: {
                                en: 'ads',
                                fr: null
                            },
                            type: 'Horus\\PlanModule\\Models\\BenefitGroup',
                            sale_price: null,
                            net_price: null
                        }
                    ],
                    created_at: '2024-11-08 13:58:42',
                    updated_at: '2024-11-08 13:58:42'
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/associated-plans/bb80af01-0e36-4072-88e4-329bc5f7384b/prices/search?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/associated-plans/bb80af01-0e36-4072-88e4-329bc5f7384b/prices/search?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/associated-plans/bb80af01-0e36-4072-88e4-329bc5f7384b/prices/search?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/associated-plans/bb80af01-0e36-4072-88e4-329bc5f7384b/prices/search',
                per_page: 10,
                to: 1,
                total: 1
            }
        }
    });
