import { vi } from 'vitest';
import * as InsuredService from '@/modules/claims/services/Insured.service';
import { ref } from 'vue';

export const currentInsuredMock = {
    id: '1740424075926071671',
    token: 'INS-mgal26',
    country_id: 'CA',
    email: 'houston39@example.com',
    secondary_email: null,
    address: '672 Melody Mills',
    address2: null,
    city: 'East Trever',
    postal_code: '27634',
    province_id: '1740423952890435453',
    first_name: 'Itzel',
    last_name: 'Schumm',
    gender: 'non_binary_or_non_conforming',
    date_of_birth: '2002-05-19T00:00:00.000000Z',
    passport_number: 'tt530052',
    phone_number: '(620) 630-0408',
    status: 'active',
    group_claims: 0,
    block_enrollment: 0,
    allow_print_visa_letter: 0,
    allow_file_upload: 0,
    client_id: '1740423993129558127',
    created_at: '2025-02-24T19:07:55.000000Z',
    updated_at: '2025-02-24T19:07:55.000000Z',
    deleted_at: null,
    policies: [
        {
            id: '1740424075934477073',
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
            client_id: '1740423993129558127'
        }
    ]
};

export const getInsuredMock = () => {
    vi.spyOn(InsuredService, 'getInsuredById').mockResolvedValue({
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

export const searchInsuredMock = () => {
    vi.spyOn(InsuredService, 'searchInsured').mockResolvedValue({
        data: [
            {
                first_name: 'Allen',
                last_name: 'Smith',
                date_of_birth: '1992-02-06'
            },
            {
                first_name: 'John',
                last_name: 'Doe',
                date_of_birth: '1992-02-06'
            }
        ]
    });
};

export const useClaimInsuredStoreMock = () => ({
    currentInsured: ref(currentInsuredMock),
    getInsuredById: () => currentInsuredMock
});
