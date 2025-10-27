import { vi } from 'vitest';
import * as UserService from '@/services/User.service';

export const searchUsersMock = () =>
    vi
        .spyOn(UserService, 'searchUsers')
        .mockResolvedValue({ data: { data: [], meta: { path: '' } } });
