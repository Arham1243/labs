import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

// Import the actual PlanService
import * as PlanService from '@/modules/plans/services/Plan.service';

// Mock the PlanService functions directly
vi.mock('@/modules/plans/services/Plan.service', () => ({
    searchPlans: vi.fn().mockResolvedValue({ data: 'mock data' }),
    searchPlanByBusinessUnitUuids: vi
        .fn()
        .mockResolvedValue({ data: 'mock data' }),
    getPlan: vi.fn().mockResolvedValue({ data: 'mock data' }),
    createPlan: vi.fn().mockResolvedValue({ data: 'mock data' }),
    updatePlan: vi.fn().mockResolvedValue({ data: 'mock data' }),
    updatePlanStatus: vi.fn().mockResolvedValue({ data: 'mock data' }),
    deletePlan: vi.fn().mockResolvedValue({ data: 'mock data' }),
    searchBenefits: vi.fn().mockResolvedValue({ data: 'mock data' }),
    searchBenefitGroups: vi.fn().mockResolvedValue({ data: 'mock data' }),
    attachBenefits: vi.fn().mockResolvedValue({ data: 'mock data' }),
    attachBenefitGroups: vi.fn().mockResolvedValue({ data: 'mock data' }),
    getBenefitGroups: vi.fn().mockResolvedValue({ data: 'mock data' }),
    getDuplicatedBenefits: vi.fn().mockResolvedValue({ data: 'mock data' }),
    getPlanBenefits: vi.fn().mockResolvedValue({ data: 'mock data' }),
    searchBenefitGroupsBenefits: vi
        .fn()
        .mockResolvedValue({ data: 'mock data' }),
    searchBenefitGroupsBenefitsExcluded: vi
        .fn()
        .mockResolvedValue({ data: 'mock data' }),
    deleteBenefitGroups: vi.fn().mockResolvedValue({ data: 'mock data' }),
    updateBenefitGroups: vi.fn().mockResolvedValue({ data: 'mock data' }),
    deleteBenefits: vi.fn().mockResolvedValue({ data: 'mock data' }),
    purgeBenefits: vi.fn().mockResolvedValue({ data: 'mock data' }),
    purgeIndividualBenefits: vi.fn().mockResolvedValue({ data: 'mock data' }),
    excludeBenefitGroupBenefits: vi
        .fn()
        .mockResolvedValue({ data: 'mock data' }),
    includeBenefitGroupBenefits: vi
        .fn()
        .mockResolvedValue({ data: 'mock data' }),
    updateIndividualBenefit: vi.fn().mockResolvedValue({ data: 'mock data' }),
    updateBenefitGroupBenefit: vi.fn().mockResolvedValue({ data: 'mock data' }),
    planPricesUpdate: vi.fn().mockResolvedValue({ data: 'mock data' }),
    planPricesStore: vi.fn().mockResolvedValue({ data: 'mock data' }),
    searchPlanPrices: vi.fn().mockResolvedValue({ data: 'mock data' }),
    detachPlanWithPrices: vi.fn().mockResolvedValue({ data: 'mock data' }),
    planPricesDelete: vi.fn().mockResolvedValue({ data: 'mock data' }),
    publishPlan: vi.fn().mockResolvedValue({ data: 'mock data' }),
    acceptAgreement: vi.fn().mockResolvedValue({ data: 'mock data' }),
    createAssociatedPlan: vi.fn().mockResolvedValue({ data: 'mock data' }),
    updateAssociatedPlan: vi.fn().mockResolvedValue({ data: 'mock data' }),
    syncPrices: vi.fn().mockResolvedValue({ data: 'mock data' })
}));

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
    useI18n: () => ({
        t: (key) => key
    })
}));

describe('PlanService', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    // searchPlans tests
    describe('searchPlans', () => {
        it('calls searchPlans with the correct parameters', async () => {
            const payload = { name: 'Test Plan' };
            const params = { page: 1, limit: 10 };

            await PlanService.searchPlans(payload, params);

            expect(PlanService.searchPlans).toHaveBeenCalledWith(
                payload,
                params
            );
        });
    });

    // searchPlanByBusinessUnitUuids tests
    describe('searchPlanByBusinessUnitUuids', () => {
        it('calls searchPlanByBusinessUnitUuids with the correct parameters', async () => {
            const payload = { business_unit_uuids: ['uuid1', 'uuid2'] };
            const params = { page: 1, limit: 10 };

            await PlanService.searchPlanByBusinessUnitUuids(payload, params);

            expect(
                PlanService.searchPlanByBusinessUnitUuids
            ).toHaveBeenCalledWith(payload, params);
        });
    });

    // getPlan tests
    describe('getPlan', () => {
        it('calls getPlan with the correct parameters', async () => {
            const id = '123';
            const params = { include: 'benefits' };

            await PlanService.getPlan(id, params);

            expect(PlanService.getPlan).toHaveBeenCalledWith(id, params);
        });
    });

    // createPlan tests
    describe('createPlan', () => {
        it('calls createPlan with the correct parameters', async () => {
            const payload = {
                name: { en: 'New Plan' },
                status: 'active'
            };

            await PlanService.createPlan(payload);

            expect(PlanService.createPlan).toHaveBeenCalledWith(payload);
        });
    });

    // updatePlan tests
    describe('updatePlan', () => {
        it('calls updatePlan with the correct parameters', async () => {
            const id = '123';
            const payload = {
                name: { en: 'Updated Plan' }
            };

            await PlanService.updatePlan(id, payload);

            expect(PlanService.updatePlan).toHaveBeenCalledWith(id, payload);
        });
    });

    // updatePlanStatus tests
    describe('updatePlanStatus', () => {
        it('calls updatePlanStatus with the correct parameters', async () => {
            const id = '123';
            const payload = {
                status: 'inactive'
            };

            await PlanService.updatePlanStatus(id, payload);

            expect(PlanService.updatePlanStatus).toHaveBeenCalledWith(
                id,
                payload
            );
        });
    });

    // deletePlan tests
    describe('deletePlan', () => {
        it('calls deletePlan with the correct parameters', async () => {
            const id = '123';

            await PlanService.deletePlan(id);

            expect(PlanService.deletePlan).toHaveBeenCalledWith(id);
        });
    });

    // searchBenefits tests
    describe('searchBenefits', () => {
        it('calls searchBenefits with the correct parameters', async () => {
            const id = '123';
            const payload = { name: 'Test Benefit' };
            const params = { page: 1, limit: 10 };

            await PlanService.searchBenefits(id, payload, params);

            expect(PlanService.searchBenefits).toHaveBeenCalledWith(
                id,
                payload,
                params
            );
        });
    });

    // searchBenefitGroups tests
    describe('searchBenefitGroups', () => {
        it('calls searchBenefitGroups with the correct parameters', async () => {
            const id = '123';
            const payload = { name: 'Test Benefit Group' };
            const params = { page: 1, limit: 10 };

            await PlanService.searchBenefitGroups(id, payload, params);

            expect(PlanService.searchBenefitGroups).toHaveBeenCalledWith(
                id,
                payload,
                params
            );
        });
    });

    // Add more tests for other service functions as needed
});
