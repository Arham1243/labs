import { vi } from 'vitest';
import * as PaymentMethodsService from '@/modules/administration/services/PaymentMethods.service';

const mockPaymentMethod = {
    id: '66b2cfca-5578-4871-9c14-d1996291a938',
    payment_provider_id: 'test',
    payment_type: 'test',
    enrollment_types: ['test'],
    status: 'active',
    created_at: '2024-10-09T14:14:00.000000Z',
    updated_at: '2024-10-10T22:33:01.000000Z'
};

const mockPaginatedResponse = {
    data: {
        data: [mockPaymentMethod],
        links: {
            first: 'https://api.develop.horus.guardme.dev/api/v1/payment-methods/search?page=1',
            last: 'https://api.develop.horus.guardme.dev/api/v1/payment-methods/search?page=1',
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
                    url: 'https://api.develop.horus.guardme.dev/api/v1/payment-methods/search?page=1',
                    label: '1',
                    active: true
                },
                {
                    url: null,
                    label: 'Next &raquo;',
                    active: false
                }
            ],
            path: 'https://api.develop.horus.guardme.dev/api/v1/payment-methods/search',
            per_page: 10,
            to: 2,
            total: 2
        }
    }
};

export const searchPaymentMethodsMock = () =>
    vi
        .spyOn(PaymentMethodsService, 'search')
        .mockResolvedValue(mockPaginatedResponse);

export const listPaymentMethodsMock = () =>
    vi
        .spyOn(PaymentMethodsService, 'list')
        .mockResolvedValue(mockPaginatedResponse);

export const createPaymentMethodMock = () =>
    vi.spyOn(PaymentMethodsService, 'create').mockResolvedValue({
        data: mockPaymentMethod
    });

export const updatePaymentMethodMock = () =>
    vi.spyOn(PaymentMethodsService, 'update').mockResolvedValue({
        data: mockPaymentMethod
    });

export const updatePaymentMethodStatusMock = () =>
    vi.spyOn(PaymentMethodsService, 'updateStatus').mockResolvedValue({
        data: {
            ...mockPaymentMethod,
            status: 'inactive'
        }
    });

export const deletePaymentMethodMock = () =>
    vi.spyOn(PaymentMethodsService, 'deleteItem').mockResolvedValue({
        data: { success: true }
    });
