import { vi } from 'vitest';
import * as PermissionService from '@/modules/administration/services/Permission.service';

export const searchPermissionMock = () =>
    vi.spyOn(PermissionService, 'getPermissions').mockResolvedValue({
        data: {
            data: [
                {
                    id: '87f40fc9-4f77-49aa-803c-e26bda06b55e',
                    name: 'view benefit groups',
                    type: 'company',
                    meta: {
                        group: 'Benefit Groups',
                        category: 'Benefits',
                        features: []
                    },
                    guard_name: 'cognito',
                    created_at: '2024-10-08T16:55:11.000000Z',
                    updated_at: '2024-11-13T16:04:08.000000Z'
                },
                {
                    id: '87f40fc9-4f77-49aa-803c-e26bd2a06b55e',
                    name: 'create benefit groups',
                    type: 'company',
                    meta: {
                        group: 'Benefit Groups',
                        category: 'Benefits',
                        features: []
                    },
                    guard_name: 'cognito',
                    created_at: '2024-10-08T16:55:11.000000Z',
                    updated_at: '2024-11-13T16:04:08.000000Z'
                }
            ]
        }
    });
