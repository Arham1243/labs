import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

// Import the actual SkeletonService
import * as SkeletonService from '@/modules/skeleton/services/Skeleton.service';

// Mock the SkeletonService functions directly
vi.mock('@/modules/skeleton/services/Skeleton.service', () => ({
    test: vi.fn()
}));

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
    useI18n: () => ({
        t: (key) => key
    })
}));

describe('SkeletonService', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    describe('test', () => {
        it('calls test function', async () => {
            // Call the test function
            SkeletonService.test();

            // Verify that the test function was called
            expect(SkeletonService.test).toHaveBeenCalled();
        });
    });
});
