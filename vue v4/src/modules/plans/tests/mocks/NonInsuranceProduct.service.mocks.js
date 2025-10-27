import { vi } from 'vitest';
import * as NonInsuranceProductService from '@/modules/plans/services/NonInsuranceProduct.service';

export const getNonInsuranceProductMock = () =>
    vi
        .spyOn(NonInsuranceProductService, 'getNonInsuranceProduct')
        .mockResolvedValue({
            data: {
                data: {
                    id: '1736189029049067394',
                    name: {
                        en: 'Atque reprehenderit.',
                        fr: 'Quaerat consequuntur.'
                    },
                    description: {
                        en: 'Fugiat quisquam ut.',
                        fr: 'Sint rerum.'
                    },
                    status: 'active',
                    type: 'Telehealth',
                    plan_enabled: true,
                    authorized: {
                        id: '1736189024989444425',
                        name: 'Slwan Muhammad'
                    }
                }
            }
        });

export const searchNonInsuranceProductMock = () =>
    vi
        .spyOn(NonInsuranceProductService, 'searchNonInsuranceProduct')
        .mockResolvedValue({
            data: {
                data: [
                    {
                        id: '1736520641618864298',
                        name: {
                            en: 'Test copy Dicta est numquam Na Copy',
                            fr: 'null Copy'
                        },
                        description: {
                            en: 'Occaecat enim qui of',
                            fr: null
                        },
                        status: 'active',
                        type: 'FPI',
                        plan_enabled: true
                    },
                    {
                        id: '1736520592100850377',
                        name: {
                            en: 'Test copy Dicta est numquam Na',
                            fr: null
                        },
                        description: {
                            en: 'Occaecat enim qui of',
                            fr: null
                        },
                        status: 'active',
                        type: 'FPI',
                        plan_enabled: true
                    }
                ],
                links: {
                    first: 'http://localhost:2000/api/v1/non-insurance-products/search?page=1',
                    last: 'http://localhost:2000/api/v1/non-insurance-products/search?page=1',
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
                            url: 'http://localhost:2000/api/v1/non-insurance-products/search?page=1',
                            label: '1',
                            active: true
                        },
                        {
                            url: null,
                            label: 'Next &raquo;',
                            active: false
                        }
                    ],
                    path: 'http://localhost:2000/api/v1/non-insurance-products/search',
                    per_page: 15,
                    to: 2,
                    total: 2
                }
            }
        });
