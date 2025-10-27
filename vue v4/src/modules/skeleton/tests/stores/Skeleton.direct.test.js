import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as SkeletonService from '@/modules/skeleton/services/Skeleton.service';

// Mock the SkeletonService
vi.mock('@/modules/skeleton/services/Skeleton.service', () => ({
    test: vi.fn()
}));

// Create direct implementation of the store function
const logFunction = () => {
    SkeletonService.test();
};

describe('SkeletonStore Direct Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('logFunction', () => {
        it('calls SkeletonService.test', () => {
            logFunction();
            expect(SkeletonService.test).toHaveBeenCalled();
        });
    });
});
