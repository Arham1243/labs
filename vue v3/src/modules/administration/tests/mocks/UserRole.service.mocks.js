import { vi } from 'vitest';
import * as UserRoleService from '@/modules/administration/services/UserRole.service';

export const searchRolesMock = () =>
    vi.spyOn(UserRoleService, 'searchRoles').mockResolvedValue({
        data: {
            data: [
                {
                    id: '10bd96fa-c3a0-42a6-88dc-eca9f476a73d',
                    name: 'test role',
                    description: 'test role',
                    type: 'company',
                    systemic: false,
                    created_at: '2024-12-02T13:09:21.000000Z',
                    updated_at: '2024-12-02T13:09:21.000000Z'
                },
                {
                    id: '10bd96fa-c3a0-42a6-88dc-eca94f476a73d',
                    name: 'test role 2',
                    description: 'test role 2',
                    type: 'company',
                    systemic: false,
                    created_at: '2024-12-02T13:09:21.000000Z',
                    updated_at: '2024-12-02T13:09:21.000000Z'
                }
            ],
            links: {
                first: 'https://api.develop.horus.guardme.dev/api/v1/company-users/1733234572824094607/roles/search?page=1',
                last: 'https://api.develop.horus.guardme.dev/api/v1/company-users/1733234572824094607/roles/search?page=1',
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
                        url: 'https://api.develop.horus.guardme.dev/api/v1/company-users/1733234572824094607/roles/search?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.develop.horus.guardme.dev/api/v1/company-users/1733234572824094607/roles/search',
                per_page: 10,
                to: 2,
                total: 2
            }
        }
    });
