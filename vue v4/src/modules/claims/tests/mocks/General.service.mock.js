import { vi } from 'vitest';
import * as GeneralService from '@/modules/claims/services/General.service';
import * as CommonService from '@/services/Common.service';
import { ref } from 'vue';

export const getCurrenciesMock = () => {
    vi.spyOn(GeneralService, 'getCurrencies').mockResolvedValue({
        data: {
            data: [
                {
                    id: 'CAD',
                    name: 'Canadian Dollar',
                    symbol: '$',
                    status: 'draft',
                    created_at: '2024-01-01T01:01:01.000000Z',
                    updated_at: '2024-01-01T01:01:01.000000Z'
                }
            ]
        }
    });
};

export const getCountriesMock = () => {
    vi.spyOn(CommonService, 'searchCountries').mockResolvedValue({
        data: {
            data: [
                {
                    id: 'CA',
                    name: 'Canada',
                    status: 'draft',
                    created_at: '2024-01-01T01:01:01.000000Z',
                    updated_at: '2024-01-01T01:01:01.000000Z'
                }
            ]
        }
    });
};

export const getProvincesMock = () => {
    vi.spyOn(CommonService, 'searchProvinces').mockResolvedValue({
        data: {
            data: [
                {
                    id: 'ON',
                    name: 'Ontario',
                    status: 'draft',
                    created_at: '2024-01-01T01:01:01.000000Z',
                    updated_at: '2024-01-01T01:01:01.000000Z'
                }
            ]
        }
    });
};

export const getInsuredMock = () => {
    vi.spyOn(GeneralService, 'getInsured').mockResolvedValue({
        data: {
            first_name: 'Allen',
            last_name: 'Smith',
            date_of_birth: '1992-02-06',
            gender: 'male',
            email: 'test@testttt.com',
            passport_number: 'MU12346587',
            phone_number: '6471234567',
            address: '1 country road',
            address2: '',
            city: 'Toronto',
            country_id: 'CA',
            postal_code: 'M1M 1M1',
            policies: [
                {
                    policy_number: '1520000',
                    start_date: '2024-12-01',
                    end_date: '2024-12-31',
                    duration: 30,
                    status: 'active'
                }
            ]
        }
    });
};

export const getPolicyMock = () => {
    vi.spyOn(GeneralService, 'getPolicy').mockResolvedValue({
        data: {
            id: '1739563103725320026',
            insured_id: '1739563103718029233',
            policy_batch_id: '1739563103632545333',
            benefits: [
                {
                    id: '1740673204818273049',
                    name: 'recusandae qui molestiae',
                    service_codes: [
                        {
                            id: '1740673204618279382',
                            service_code_id: '1740673204681300658',
                            policy_id: '1740673238183129700',
                            benefit_id: '1740673204807317613',
                            code: '01JN43AGJ88CQDEWNXX5',
                            description: 'Earum blanditiis aut ut et.',
                            coverage: 68,
                            max_amount: 3617
                        }
                    ]
                }
            ]
        }
    });
};

export const getPolicyBatchMock = () => {
    vi.spyOn(GeneralService, 'getPolicyBatch').mockResolvedValue({
        data: {
            id: '135154768511123123395',
            policy_id: '1739563103725320026',
            business_unit_id: '1351547685111246599'
        }
    });
};

export const getBusinessUnitMock = () => {
    vi.spyOn(GeneralService, 'getBusinessUnit').mockResolvedValue({
        data: {
            id: '1223372036854775807',
            name: {
                en: 'test',
                fr: 'test'
            },
            location_details: {
                address:
                    'Exercitation sunt tempor non esse commodo. Nulla cupidatat eu enim in.',
                address2:
                    'Exercitation sunt tempor non esse commodo. Nulla cupidatat eu enim in.',
                country_id: 'CA',
                city: 'Alexandria',
                postal_code: '21500'
            },
            website_url: 'http://phoenix.net',
            phone_number: '+201203131319'
        }
    });
};

export const insuredMock = {
    first_name: 'Allen',
    last_name: 'Smith',
    date_of_birth: '1992-02-06',
    gender: 'male',
    email: 'test@testttt.com',
    passport_number: 'MU12346587',
    phone_number: '6471234567',
    address: '1 country road',
    address2: '',
    city: 'Toronto',
    country_id: 'CA',
    postal_code: 'M1M 1M1',
    policies: [
        {
            policy_number: '1520000',
            start_date: '2024-12-01',
            end_date: '2024-12-31',
            duration: 30,
            status: 'active'
        }
    ]
};

export const countriesMock = [
    { id: 'AF', name: 'Afghanistan', region_id: 'AS' },
    { id: 'CA', name: 'Canada', region_id: 'NA' }
];

export const countryMock = {
    id: 'CA',
    name: 'Canada',
    region_id: 'NA'
};

export const provincesMock = [
    {
        id: '1740423952882039067',
        name: 'Alabama',
        code: 'AL',
        country: { id: 'US', name: 'United States of America' }
    },
    {
        id: '1740423952882039069',
        name: 'Alaska',
        code: 'AK',
        country: { id: 'US', name: 'United States of America' }
    },
    {
        id: '1740423952882039068',
        name: 'Alberta',
        code: 'AB',
        country: { id: 'CA', name: 'Canada' }
    },
    {
        id: '1740423952890435452',
        name: 'British Columbia',
        code: 'BC',
        country: { id: 'CA', name: 'Canada' }
    },
    {
        id: '1740423952890435453',
        name: 'Ontario',
        code: 'ON',
        country: { id: 'CA', name: 'Canada' }
    },
    {
        id: '1740423952882039168',
        name: 'Cavan',
        code: 'CA',
        country: { id: 'IE', name: 'Ireland' }
    },
    {
        id: '1740423952882039169',
        name: 'Clare',
        code: 'CL',
        country: { id: 'IE', name: 'Ireland' }
    }
];

export const provinceMock = {
    id: '1740423952890435453',
    name: 'Ontario',
    code: 'ON',
    country: { id: 'CA', name: 'Canada' }
};

export const getPlansMock = () => [
    {
        id: '1742243538581493792',
        name: {
            en: 'Debitis maxime.',
            fr: 'Aut optio magnam.'
        },
        effective_date: '2025-03-17',
        end_date: '2025-03-19',
        bound: 'in',
        policy_number_format: null,
        type: 'international',
        status: 'active'
    },
    {
        id: '1742243538846069890',
        name: {
            en: 'Quae sed.',
            fr: 'Exercitationem aut.'
        },
        effective_date: '2025-03-17',
        end_date: '2025-03-19',
        bound: 'in',
        policy_number_format: null,
        type: 'international',
        status: 'active'
    }
];

export const useGeneralStoreMock = () => ({
    currentInsured: insuredMock,
    getInsured: getInsuredMock(),
    getBusinessUnit: () =>
        Promise.resolve({
            data: {
                id: '1223372036854775807',
                name: {
                    en: 'Cape Brenton University',
                    fr: 'Cape Brenton University'
                },
                location_details: {
                    address: '4 Chatworn St',
                    address2: '',
                    country_id: 'CA',
                    city: 'Markham',
                    postal_code: 'L1E 2L3'
                },
                website_url: 'teswtets@test.com',
                phone_number: '+1 (416) 123 - 4567'
            }
        }),
    countries: ref(countriesMock),
    getCountries: () => countriesMock,
    getCountryById: () => countryMock,
    provinces: ref(provincesMock),
    getProvinces: () => provincesMock,
    getProvinceById: () => provinceMock,
    getCurrencies: () => getCurrenciesMock(),
    plans: getPlansMock(),
    getPlans: () => getPlansMock()
});
