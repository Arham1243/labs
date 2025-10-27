import { vi } from 'vitest';
import * as PolicyService from '@/modules/claims/services/Policy.service';
import { ref } from 'vue';

export const getPolicyMock = () => {
    vi.spyOn(PolicyService, 'getPolicy').mockResolvedValue({
        data: {
            data: {
                policy_number: '1520000',
                start_date: '2024-12-01',
                end_date: '2024-12-31',
                duration: 30,
                status: 'active',
                business_unit_id: '1223372036854775807'
            }
        }
    });
};

export const currentPolicyMock = {
    id: '1740673238183129700',
    insured_id: '1740424075926071671',
    policy_batch_id: '1740424075920973286',
    plan_id: '1740423989380622540',
    enrollment_id: '1740424075849631159',
    dependency_id: null,
    group_leader_id: null,
    order_number: 'ORD3270',
    policy_number: 'POL4859',
    destination_country_id: 'TR',
    status: 'active',
    passport_number: 'ej699wyd',
    student_number: 'STU2565',
    first_name: 'Velda',
    last_name: 'Schroeder',
    email: 'graham.heller@example.net',
    gender: 'female',
    date_of_birth: '1986-10-25T00:00:00.000000Z',
    phone_number: '+1 (435) 842-9848',
    address: "17985 O'Hara Springs",
    residence_country_id: 'TK',
    group_name: null,
    start_date: '1982-02-16T00:00:00.000000Z',
    end_date: '2009-09-13T00:00:00.000000Z',
    type: 'student',
    duration: 6,
    paid_duration: 6,
    booking_date: '1983-03-15T00:00:00.000000Z',
    created_at: '2025-02-24T19:07:55.000000Z',
    updated_at: '2025-02-24T19:07:55.000000Z',
    client_id: '1740423993129558127',
    benefits: [
        {
            id: '1739563538900274484',
            benefit_id: '1740423989409556688',
            policy_id: '1740424075934477073',
            code: '1',
            name: 'Lorem une',
            coverage: 51,
            max_amount: 26672,
            benefit_group_coverage: null,
            benefit_group_max_amount: null,
            effective_date: '2025-02-20',
            end_date: '2025-02-22',
            status: 'active',
            min_time_req: {
                value: 2,
                period: 'quarter',
                operator: 'lte'
            },
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
            service_codes: [
                {
                    id: '1749563538900274484',
                    service_code_id: '1740423989210178597',
                    policy_id: '1740424075934477073',
                    benefit_id: '1740423989409556688',
                    code: '32934',
                    description: 'Et dolorem ut rerum laboriosam.',
                    coverage: 70,
                    max_amount: 2000,
                    rules: ['Beatae temporibus molestias aut mollitia autem.'],
                    service_code_group_coverage: null,
                    service_code_group_max_amount: null,
                    created_at: '2025-03-06T17:05:41.000000Z',
                    updated_at: '2025-03-06T17:05:41.000000Z'
                }
            ],
            created_at: '2025-03-06T17:05:41.000000Z',
            updated_at: '2025-03-06T17:05:41.000000Z'
        },
        {
            id: '1739563538900274485',
            benefit_id: '1740423989404958217',
            policy_id: '1740424075934477073',
            code: '1',
            name: 'Numero deux',
            coverage: 51,
            max_amount: 26672,
            benefit_group_coverage: null,
            benefit_group_max_amount: null,
            effective_date: '2025-02-20',
            end_date: '2025-02-22',
            status: 'active',
            min_time_req: {
                value: 2,
                period: 'quarter',
                operator: 'lte'
            },
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
            service_codes: [
                {
                    id: '1749563538900274485',
                    service_code_id: '1740423989205629800',
                    policy_id: '1740424075934477073',
                    benefit_id: '1740423989404958217',
                    code: '32934',
                    description: 'Et dolorem ut rerum laboriosam.',
                    coverage: 80,
                    max_amount: 5000,
                    rules: ['Beatae temporibus molestias aut mollitia autem.'],
                    service_code_group_coverage: null,
                    service_code_group_max_amount: null,
                    created_at: '2025-03-06T17:05:41.000000Z',
                    updated_at: '2025-03-06T17:05:41.000000Z'
                }
            ],
            created_at: '2025-03-06T17:05:41.000000Z',
            updated_at: '2025-03-06T17:05:41.000000Z'
        }
    ]
};

export const currentBusinessUnitMock = {
    name: {
        en: 'Cape Brenton University'
    },
    phone_number: '+1 (416) 123 - 4567',
    website_url: 'teswtets@test.com',
    location_details: {
        address: '4 Chatworn St',
        address2: '',
        city: 'Markham',
        province_id: 'Ontario',
        postal_code: 'L1E 2L3',
        country_id: 'CA'
    }
};

export const useClaimPolicyStoreMock = () => ({
    currentPolicy: ref(currentPolicyMock),
    currentBusinessUnit: ref(currentBusinessUnitMock),
    getPolicyById: () => currentPolicyMock,
    // searchPolicy: () => [currentPolicyMock]
    searchPolicy: vi.fn(() => ({
        loading: false,
        mutate: vi.fn(),
        data: [currentPolicyMock],
        status: 'success'
    }))
});
