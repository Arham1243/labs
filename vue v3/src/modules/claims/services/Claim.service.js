import AxiosService from '@/services/Axios.service';

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const test = () => {
    console.log('Claims service');
};

export const mock_data = (type = 'expenses') =>
    ({
        expenses: [
            {
                uuid: 1,
                status: 'Review',
                received_date: '2024-02-27',
                service_date: '2024-01-27',
                code: '02111',
                benefit: 'Diagnostic Test - MRI',
                diagnosis: 'Diagnosis 1',
                currency: '$',
                expense_amount: 875.0,
                approved_amount: 0.0,
                beneficiary: {
                    name: 'William Olser Health Center'
                },
                notes: {
                    insured_notes: 'Pain in both Leg',
                    examiner_notes: ''
                },
                coverage: {
                    include: true,
                    percentage: 0.8,
                    maximum: 1000,
                    left: 950
                },
                approval: {
                    co_pay_percentage: '',
                    co_pay_amount: '',
                    approved_by: '',
                    approved_on: ''
                }
            },
            {
                uuid: 2,
                status: 'Review',
                received_date: '2024-03-27',
                service_date: '2024-02-20',
                code: '12111',
                benefit: 'Diagnostic Test - MRI',
                diagnosis: '',
                currency: '$',
                expense_amount: 2250.0,
                approved_amount: 0.0,
                beneficiary: {
                    name: 'William Olser Health Center'
                },
                notes: {
                    insured_notes: 'Pain in Shoulder',
                    examiner_notes: ''
                },
                coverage: {
                    include: false
                },
                approval: {
                    co_pay_percentage: '',
                    co_pay_amount: '',
                    approved_by: '',
                    approved_on: ''
                }
            },
            {
                uuid: 3,
                status: 'Review',
                received_date: '2024-04-07',
                service_date: '2024-04-06',
                code: '12115',
                benefit: 'ER Facility',
                diagnosis: '',
                currency: '$',
                expense_amount: 1000.0,
                approved_amount: 0.0,
                beneficiary: {
                    name: 'William Olser Health Center'
                },
                notes: {
                    insured_notes: '',
                    examiner_notes: ''
                },
                coverage: {
                    include: true,
                    percentage: 0.8,
                    maximum: 1000,
                    left: 950
                },
                approved: {
                    co_pay_percentage: '',
                    co_pay_amount: '',
                    approved_by: '',
                    approved_on: ''
                }
            }
        ],
        documents: [
            {
                uuid: 1,
                name: 'Claims Form',
                link: '/claims/images/submissions/1.jpg',
                source: 'Fax',
                received: '2024-01-11',
                modified: '2024-07-17'
            },
            {
                uuid: 2,
                name: 'Receipt',
                link: '/claims/images/submissions/2.jpg',
                source: 'Fax',
                received: '2024-01-11',
                modified: '2024-07-17'
            },
            {
                uuid: 3,
                name: 'Invoice',
                link: '/claims/images/submissions/3.jpg',
                source: 'Fax',
                received: '2024-01-11',
                modified: '2024-07-17'
            },
            {
                uuid: 4,
                name: 'Invoice',
                link: '/claims/images/submissions/1.jpg',
                source: 'Fax',
                received: '2024-01-11',
                modified: '2024-07-17'
            },
            {
                uuid: 4,
                name: 'Invoice',
                link: '/claims/images/submissions/2.jpg',
                source: 'Fax',
                received: '2024-01-11',
                modified: '2024-07-17'
            }
        ],
        insured: {
            clientId: 27154657,
            firstname: 'Priyal Hiteshkumar',
            lastname: 'Roy',
            age: 20,
            dateOfBirth: '11-Dec-1990',
            gender: 'Female',
            prefLanguage: 'English',
            passportNumber: 'MU12346587',
            countryOfOrigin: 'India',
            primaryEmail: 'test@testtest.com',
            secondaryEmail: 'test123@testset.com',
            phone: '(647) 123 - 4567',
            altPhone: '',
            address: {
                address: '4 Chatworn St',
                address2: '',
                city: 'Markham',
                province: 'Ontario',
                postalCode: 'L1E 2L3',
                country: 'Canada'
            },
            policies: [
                {
                    policyNumber: '202121234MU',
                    policyTitle: 'GuardMe Enhanced',
                    startDate: 'Sep 01, 2023',
                    endDate: 'Aug 31, 2030',
                    policyTerms: '14 Days',
                    status: 'open'
                },
                {
                    policyNumber: '4567131222FW',
                    policyTitle: 'GuardMe Enhanced',
                    startDate: 'Feb 01, 2013',
                    endDate: 'Sep 31, 2023',
                    policyTerms: '14 Days',
                    status: 'expired'
                }
            ],
            organization: {
                name: 'Cape Brenton University',
                department: 'Cape Brenton University',
                phone: '+1 (416) 123 - 4567',
                fax: '+1 (416) 123 - 4567',
                email: 'teswtets@test.com',
                address: {
                    address: '4 Chatworn St',
                    address2: '',
                    city: 'Markham',
                    province: 'Ontario',
                    postalCode: 'L1E 2L3',
                    country: 'Canada'
                }
            }
        },
        submission: {
            subNumber: '123456789',
            receivedDate: 'Feb 27, 2024',
            source: 'Email',
            highPriority: true,
            policyNumber: '20212123456MU'
        },
        submissions: [
            {
                uuid: 1,
                status: 'Review',
                received_date: '2024-02-27',
                update_at: '2024-11-27 11:23',
                sub_id: '1679293',
                policy: {
                    name: 'Priyal Hiteshkumar Roy'
                },
                currency: '$',
                submission_amount: 4125.0,
                approved_amount: 0.0
            }
        ],
        submissionLogs: [
            {
                uuid: 1,
                status: 'Submission Received',
                content: 'Fax received from Cape Brenton University',
                created_at: '2024-11-11 16:52:05',
                created_by: '',
                icon: 'pi pi-arrow-right'
            },
            {
                uuid: 2,
                status: 'Submission Intake completed',
                content: 'Reviewed by intake team John Doe',
                created_at: '2024-11-12 11:40:05',
                created_by: 'John Doe',
                icon: 'pi pi-check-circle'
            },
            {
                uuid: 3,
                status: 'Submission Assigned',
                content: 'Assigned to examiner Jane Doe',
                created_at: '2024-11-14 10:25:05',
                created_by: '',
                icon: 'pi pi-user'
            },
            {
                uuid: 4,
                status: 'Reserved amount Updated',
                content:
                    'The reserved amount has been updated from $125.00 CAD to $4125.00 CAD',
                created_at: '2024-11-17 13:26:05',
                created_by: 'Jane Doe',
                icon: 'pi pi-dollar'
            },
            {
                uuid: 5,
                status: 'Send for Adjudication',
                content: '',
                created_at: '',
                icon: ''
            },
            {
                uuid: 6,
                status: 'Payment processing',
                content: '',
                created_at: '',
                icon: ''
            }
        ],
        notes: [
            {
                id: 1,
                name: 'David Smith',
                date: '2024-03-21 02:29:00',
                note: 'Reference site about   Lorem Ipsum, giving information on its origins, as well as a random generator. Reference site about   Lorem Ipsum, giving information on its origins, as well as a random Lipsum generator.',
                attachment: 'filename.doc',
                pinned: false
            },
            {
                id: 2,
                name: 'Joanna Smith',
                date: '2024-03-21 02:29:00',
                note: 'Reference site about   Lorem Ipsum, giving information on its origins, as well as a random generator. Reference site about   Lorem Ipsum, giving information on its origins.',
                attachment: 'filename.doc',
                pinned: false
            }
        ],
        tasks: [
            {
                id: 1,
                assign: 'David',
                date: '2024-03-21 02:29:00',
                description:
                    'Reference site about   Lorem Ipsum, giving information on its origins, as well as a random generator as well as a random Lipsum generator.',
                title: 'Task title A',
                due_date: '2024-11-23 02:29:00',
                priority: true
            },
            {
                id: 2,
                assign: 'Joanna',
                date: '2024-03-21 02:29:00',
                description:
                    'Reference site about   Lorem Ipsum, giving information on its origins, as well as a random generator. Reference site about   Lorem Ipsum, giving information on its origins.',
                title: 'Task title X',
                due_date: '2024-03-24 02:29:00',
                priority: false
            }
        ]
    })[type];

export const getClaims = (payload) => {
    return AxiosService.get(`${BASE_URL}/claims`, {
        params: payload
    });
};

export const searchClaims = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/claims/search`, payload, { params });
};

export const getClaimById = (tenantId, claimId) => {
    return AxiosService.get(
        `${BASE_URL}/clients/${tenantId}/claims/${claimId}`
    );
};

export const searchWithinClaims = (tenantId, claimId, payload) => {
    return AxiosService.post(
        `${BASE_URL}/clients/${tenantId}/claims/${claimId}/search`,
        payload
    );
};

export const createClaim = (tenantId, payload) => {
    return AxiosService.post(`${BASE_URL}/clients/${tenantId}/claims`, payload);
};

export const updateClaim = (tenantId, claimId, payload) => {
    return AxiosService.put(
        `${BASE_URL}/clients/${tenantId}/claims/${claimId}`,
        payload
    );
};

export const updateReservedAmount = (clientId, claimId, payload) => {
    return AxiosService.put(
        `${BASE_URL}/clients/${clientId}/claims/${claimId}`,
        payload
    );
};

export const moveSubmissionsToClaim = (clientId, claimId, payload) => {
    return AxiosService.patch(
        `${BASE_URL}/clients/${clientId}/claims/${claimId}/move-submissions`,
        payload
    );
};

export const exportClaims = (payload) => {
    return AxiosService.post(`${BASE_URL}/claims/export`, payload, {
        responseType: 'blob',
        headers: {
            Accept: 'text/csv'
        }
    });
};
