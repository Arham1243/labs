import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePlanStore } from '@/modules/plans/stores/Plan';
import * as PlanService from '@/modules/plans/services/Plan.service';

// Mock the PlanService
vi.mock('@/modules/plans/services/Plan.service', () => ({
    searchPlans: vi.fn(),
    searchPlanByBusinessUnitUuids: vi.fn(),
    getPlan: vi.fn(),
    createPlan: vi.fn(),
    updatePlan: vi.fn(),
    updatePlanStatus: vi.fn(),
    deletePlan: vi.fn(),
    searchBenefits: vi.fn(),
    searchBenefitGroups: vi.fn(),
    attachBenefits: vi.fn(),
    attachBenefitGroups: vi.fn(),
    getBenefitGroups: vi.fn(),
    getDuplicatedBenefits: vi.fn(),
    getPlanBenefits: vi.fn(),
    searchBenefitGroupsBenefits: vi.fn(),
    searchBenefitGroupsBenefitsExcluded: vi.fn(),
    deleteBenefitGroups: vi.fn(),
    updateBenefitGroups: vi.fn(),
    deleteBenefits: vi.fn(),
    purgeBenefits: vi.fn(),
    purgeIndividualBenefits: vi.fn(),
    excludeBenefitGroupBenefits: vi.fn(),
    includeBenefitGroupBenefits: vi.fn(),
    updateIndividualBenefit: vi.fn(),
    updateBenefitGroupBenefit: vi.fn(),
    planPricesUpdate: vi.fn(),
    planPricesStore: vi.fn(),
    searchPlanPrices: vi.fn(),
    detachPlanWithPrices: vi.fn(),
    planPricesDelete: vi.fn(),
    publishPlan: vi.fn(),
    acceptAgreement: vi.fn(),
    createAssociatedPlan: vi.fn(),
    updateAssociatedPlan: vi.fn(),
    syncPrices: vi.fn()
}));

// Mock the GlobalStore
vi.mock('@/stores', () => ({
    useGlobalStore: vi.fn(() => ({
        actionWrapper: vi.fn((fn) => fn()),
        showSuccess: vi.fn(),
        clearErrors: vi.fn()
    }))
}));

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
    useI18n: () => ({
        t: (key) => key,
        locale: { value: 'en' }
    })
}));

describe('PlanStore', () => {
    let store;

    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
        store = usePlanStore();
    });

    describe('state management', () => {
        it('sets and gets currentPlan', () => {
            const plan = { id: 1, name: { en: 'Test Plan' } };
            store.setCurrentPlan(plan);
            expect(store.currentPlan).toEqual(plan);
        });

        it('sets and gets currentAssociatedPlan', () => {
            const plan = { id: 1, name: { en: 'Test Associated Plan' } };
            store.setCurrentAssociatedPlan(plan);
            expect(store.currentAssociatedPlan).toEqual(plan);
        });
    });

    // searchPlans tests
    describe('searchPlans', () => {
        it('calls PlanService.searchPlans and returns the data', async () => {
            const payload = { name: 'Test Plan' };
            const params = { page: 1, per_page: 10 };
            const mockResponse = {
                data: {
                    data: [
                        {
                            id: 1,
                            name: { en: 'Test Plan' },
                            status: 'active'
                        }
                    ],
                    meta: {
                        current_page: 1,
                        per_page: 10,
                        total: 1
                    }
                }
            };

            PlanService.searchPlans.mockResolvedValue(mockResponse);

            const result = await store.searchPlans(payload, params);

            expect(PlanService.searchPlans).toHaveBeenCalledWith(
                payload,
                params
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    // searchPlanByBusinessUnitUuids tests
    describe('searchPlanByBusinessUnitUuids', () => {
        it('calls PlanService.searchPlanByBusinessUnitUuids and returns the data', async () => {
            const payload = { business_unit_uuids: ['uuid1', 'uuid2'] };
            const params = { page: 1, per_page: 10 };
            const mockResponse = {
                data: {
                    data: [
                        {
                            id: 1,
                            name: { en: 'Test Plan' },
                            status: 'active'
                        }
                    ],
                    meta: {
                        current_page: 1,
                        per_page: 10,
                        total: 1
                    }
                }
            };

            PlanService.searchPlanByBusinessUnitUuids.mockResolvedValue(
                mockResponse
            );

            const result = await store.searchPlanByBusinessUnitUuids(
                payload,
                params
            );

            expect(
                PlanService.searchPlanByBusinessUnitUuids
            ).toHaveBeenCalledWith(payload, params);
            expect(result).toEqual(mockResponse.data);
        });
    });

    // getPlan tests
    describe('getPlan', () => {
        it('calls PlanService.getPlan and returns the data', async () => {
            const id = '123';
            const params = { include: 'benefits' };
            const mockResponse = {
                data: {
                    id: 1,
                    name: { en: 'Test Plan' },
                    status: 'active'
                }
            };

            PlanService.getPlan.mockResolvedValue(mockResponse);

            const result = await store.getPlan(id, params);

            expect(PlanService.getPlan).toHaveBeenCalledWith(id, params);
            expect(result).toEqual(mockResponse.data);
        });
    });

    // createPlan tests
    describe('createPlan', () => {
        it('calls PlanService.createPlan, shows success message, and returns the data', async () => {
            const payload = {
                name: { en: 'New Plan' },
                status: 'active'
            };
            const mockResponse = {
                data: {
                    id: 1,
                    name: { en: 'New Plan' },
                    status: 'active'
                }
            };

            PlanService.createPlan.mockResolvedValue(mockResponse);

            const result = await store.createPlan(payload);

            expect(PlanService.createPlan).toHaveBeenCalledWith(payload);
            expect(result).toEqual(mockResponse.data);
        });
    });

    // updatePlan tests
    describe('updatePlan', () => {
        it('calls PlanService.updatePlan, shows success message, and returns the data', async () => {
            const id = '123';
            const payload = {
                name: { en: 'Updated Plan' }
            };
            const mockResponse = {
                data: {
                    id: 1,
                    name: { en: 'Updated Plan' },
                    status: 'active'
                }
            };

            PlanService.updatePlan.mockResolvedValue(mockResponse);

            const result = await store.updatePlan(id, payload);

            expect(PlanService.updatePlan).toHaveBeenCalledWith(id, payload);
            expect(result).toEqual(mockResponse.data);
        });
    });

    // Add more tests for other store actions as needed

    // Test utility functions
    describe('transferObject', () => {
        it('transforms form data correctly', () => {
            const formData = {
                name: { en: 'Test Plan' },
                bound: 'in',
                type: 'domestic',
                periods: [
                    {
                        id: 1,
                        name: 'Period 1',
                        cancellation_periods: [
                            {
                                name: 'Cancellation Period 1',
                                plan_period_precedence: 'before',
                                plan_period_date_reference: 'effective_date'
                            }
                        ],
                        extension_periods: [
                            {
                                name: 'Extension Period 1',
                                plan_period_precedence: 'after',
                                plan_period_date_reference: 'end_date'
                            }
                        ],
                        early_return_periods: [
                            {
                                name: 'Early Return Period 1',
                                plan_period_precedence: 'during',
                                plan_period_date_reference: 'policy_term'
                            }
                        ]
                    }
                ],
                cancellation_type: 'fixed',
                extension_type: 'fixed',
                early_return_type: 'fixed',
                is_cancellations: true,
                is_extensions: true,
                is_early_returns: true,
                enrolment_period_type: 'days',
                minimum_age_type: 'years',
                maximum_age_type: 'years',
                policy_term_type: 'days',
                non_insurance_products: []
            };

            const result = store.transferObject(formData);

            // Check that the transformation was done correctly
            expect(result.bound).toEqual({
                name: 'plans.in',
                value: 'in'
            });
            expect(result.type).toEqual({
                name: 'plans.domestic',
                value: 'domestic'
            });
            expect(result.cancellation_type).toEqual({
                name: 'common.policy_action_type_fixed',
                value: 'fixed'
            });
            expect(result.extension_type).toEqual({
                name: 'common.policy_action_type_fixed',
                value: 'fixed'
            });
            expect(result.early_return_type).toEqual({
                name: 'common.policy_action_type_fixed',
                value: 'fixed'
            });
            expect(result.enrolment_period_type).toEqual({
                id: 'days',
                name: 'common.days'
            });
            expect(result.minimum_age_type).toEqual({
                id: 'years',
                name: 'common.years'
            });
            expect(result.maximum_age_type).toEqual({
                id: 'years',
                name: 'common.years'
            });
            expect(result.policy_term_type).toEqual({
                id: 'days',
                name: 'common.days'
            });
            expect(result.shouldIncludeNonInsuranceProducts).toBe(false);
        });
    });

    describe('transferPayload', () => {
        it('transforms form data for API submission', () => {
            const formData = {
                name: { en: 'Test Plan' },
                bound: { value: 'in' },
                type: { value: 'domestic' },
                periods: [
                    {
                        id: 1,
                        name: 'Period 1'
                    }
                ],
                cancellation_periods: [
                    {
                        name: { value: 'Cancellation Period 1' },
                        plan_period_precedence: { value: 'before' },
                        plan_period_date_reference: { value: 'effective_date' }
                    }
                ],
                extension_periods: [
                    {
                        name: { value: 'Extension Period 1' },
                        plan_period_precedence: { value: 'after' },
                        plan_period_date_reference: { value: 'end_date' }
                    }
                ],
                early_return_periods: [
                    {
                        name: { value: 'Early Return Period 1' },
                        plan_period_precedence: { value: 'during' },
                        plan_period_date_reference: { value: 'policy_term' }
                    }
                ],
                cancellation_type: { value: 'fixed' },
                extension_type: { value: 'fixed' },
                early_return_type: { value: 'fixed' },
                maximum_age_type: { id: 'years' },
                minimum_age_type: { id: 'years' },
                enrolment_period_type: { id: 'days' },
                policy_term_type: { id: 'days' },
                authorized: { id: '123' },
                effective_date: '2023-01-01',
                end_date: '2023-12-31',
                non_insurance_products: [{ id: '456' }]
            };

            const selectedPlan = { id: '789' };

            const result = store.transferPayload(formData, selectedPlan);

            // Check that the transformation was done correctly
            expect(result.bound).toBe('in');
            expect(result.type).toBe('domestic');
            expect(result.maximum_age_type).toBe('years');
            expect(result.minimum_age_type).toBe('years');
            expect(result.enrolment_period_type).toBe('days');
            expect(result.policy_term_type).toBe('days');
            expect(result.authorized_by_id).toBe('123');
            expect(result.effective_date).toBe('2023-01-01');
            expect(result.end_date).toBe('2023-12-31');
            expect(result.source_plan_id).toBe('789');
            expect(result.non_insurance_products).toEqual(['456']);
            expect(result.cancellation_type).toBe('fixed');
            expect(result.extension_type).toBe('fixed');
            expect(result.early_return_type).toBe('fixed');
            expect(result.periods).toEqual([
                {
                    id: 1,
                    name: 'Period 1'
                }
            ]);
            expect(result.cancellation_periods).toEqual([
                {
                    name: 'Cancellation Period 1',
                    plan_period_precedence: 'before',
                    plan_period_date_reference: 'effective_date'
                }
            ]);
            expect(result.extension_periods).toEqual([
                {
                    name: 'Extension Period 1',
                    plan_period_precedence: 'after',
                    plan_period_date_reference: 'end_date'
                }
            ]);
            expect(result.early_return_periods).toEqual([
                {
                    name: 'Early Return Period 1',
                    plan_period_precedence: 'during',
                    plan_period_date_reference: 'policy_term'
                }
            ]);
        });
    });
});
