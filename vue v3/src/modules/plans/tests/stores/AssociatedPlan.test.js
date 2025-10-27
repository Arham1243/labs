// filepath: /Users/yassirawad/Projects/horus/horus-platform-app/src/modules/plans/stores/tests/AssociatedPlan.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAssociatedPlanStore } from '../../stores/AssociatedPlan';
import * as AssociatedPlanService from '../../services/AssociatedPlan.service';
import { useGlobalStore } from '@/stores';

// Mock the AssociatedPlanService
vi.mock('../../services/AssociatedPlan.service', () => ({
    getAssociatedPlan: vi.fn(),
    getAssociatedPlans: vi.fn(),
    createAssociatedPlan: vi.fn(),
    updateAssociatedPlan: vi.fn(),
    updateAssociatedPlanDependantsSettings: vi.fn(),
    updateAssociatedPlanStatus: vi.fn(),
    deleteAssociatedPlan: vi.fn(),
    copyBenefitsFromParent: vi.fn(),
    searchBenefits: vi.fn(),
    searchBenefitGroups: vi.fn(),
    attachBenefitGroups: vi.fn(),
    attachBenefits: vi.fn(),
    getBenefitGroups: vi.fn(),
    getDuplicatedBenefits: vi.fn(),
    deleteBenefitGroups: vi.fn(),
    purgeBenefits: vi.fn(),
    purgeIndividualBenefits: vi.fn(),
    acceptAgreement: vi.fn(),
    getPlanBenefits: vi.fn(),
    deleteBenefits: vi.fn(),
    updateIndividualBenefit: vi.fn(),
    searchBenefitGroupsBenefits: vi.fn(),
    searchBenefitGroupsBenefitsExcluded: vi.fn(),
    excludeBenefitGroupBenefits: vi.fn(),
    includeBenefitGroupBenefits: vi.fn(),
    updateBenefitGroupBenefit: vi.fn(),
    searchPlanPrices: vi.fn(),
    detachPlanWithPrices: vi.fn(),
    planPricesDelete: vi.fn(),
    planPricesUpdate: vi.fn(),
    planPricesStore: vi.fn(),
    updateBenefitGroups: vi.fn(),
    overlapping: vi.fn(),
    copyPricingFromParent: vi.fn(),
    deletePlan: vi.fn(),
    updatePlanStatus: vi.fn(),
    updateAssociatedPlanSettings: vi.fn(),
    syncPrices: vi.fn()
}));

// Mock the GlobalStore
vi.mock('@/stores', () => {
    const showSuccessMock = vi.fn();
    return {
        useGlobalStore: vi.fn(() => ({
            actionWrapper: vi.fn(async (fn) => {
                const result = await fn();
                return result;
            }),
            showSuccess: showSuccessMock
        }))
    };
});

// Mock the vue-i18n
vi.mock('vue-i18n', () => ({
    useI18n: vi.fn(() => ({
        t: vi.fn((key) => key)
    }))
}));

vi.mock('@/composables', () => ({
    useHelpers: vi.fn()
}));

describe('AssociatedPlan Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    describe('state', () => {
        it('should have default state', () => {
            // Arrange & Act
            const store = useAssociatedPlanStore();

            // Assert
            expect(store.currentPlan).toBeUndefined();
            expect(store.parentPlan).toBeUndefined();
        });
    });

    describe('setCurrentPlan', () => {
        it('should set currentPlan', () => {
            // Arrange
            const store = useAssociatedPlanStore();
            const plan = { id: 123, name: 'Test Plan' };

            // Act
            store.setCurrentPlan(plan);

            // Assert
            expect(store.currentPlan).toEqual(plan);
        });
    });

    describe('setParentPlan', () => {
        it('should set parentPlan', () => {
            // Arrange
            const store = useAssociatedPlanStore();
            const plan = { id: 123, name: 'Parent Plan' };

            // Act
            store.setParentPlan(plan);

            // Assert
            expect(store.parentPlan).toEqual(plan);
        });
    });

    describe('getPlan', () => {
        it('should call AssociatedPlanService.getAssociatedPlan and return data', async () => {
            // Arrange
            const store = useAssociatedPlanStore();
            const id = 123;
            const associatedPlanId = 456;
            const params = { include: 'benefits' };
            const mockResponse = { data: { id: 456, name: 'Test Plan' } };
            AssociatedPlanService.getAssociatedPlan.mockResolvedValue(
                mockResponse
            );

            // Act
            const result = await store.getPlan(id, associatedPlanId, params);

            // Assert
            expect(
                AssociatedPlanService.getAssociatedPlan
            ).toHaveBeenCalledWith(id, associatedPlanId, params);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('createAssociatedPlan', () => {
        it('should call AssociatedPlanService.createAssociatedPlan, show success message, and return data', async () => {
            // Arrange
            const store = useAssociatedPlanStore();
            const globalStore = useGlobalStore();
            const id = 123;
            const payload = { name: 'New Plan' };
            const mockResponse = { data: { id: 456, name: 'New Plan' } };
            AssociatedPlanService.createAssociatedPlan.mockResolvedValue(
                mockResponse
            );

            // Act
            const result = await store.createAssociatedPlan(id, payload);

            // Assert
            expect(
                AssociatedPlanService.createAssociatedPlan
            ).toHaveBeenCalledWith(id, payload);
            expect(globalStore.showSuccess).toHaveBeenCalledWith(
                'notifications.associated_plan_created',
                'notifications.associated_plan_created_detail'
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('updateAssociatedPlan', () => {
        it('should call AssociatedPlanService.updateAssociatedPlan, show success message, and return data', async () => {
            // Arrange
            const store = useAssociatedPlanStore();
            const globalStore = useGlobalStore();
            const id = 123;
            const associatedPlanId = 456;
            const payload = { name: 'Updated Plan' };
            const mockResponse = { data: { id: 456, name: 'Updated Plan' } };
            AssociatedPlanService.updateAssociatedPlan.mockResolvedValue(
                mockResponse
            );

            // Act
            const result = await store.updateAssociatedPlan(
                id,
                associatedPlanId,
                payload
            );

            // Assert
            expect(
                AssociatedPlanService.updateAssociatedPlan
            ).toHaveBeenCalledWith(id, associatedPlanId, payload);
            expect(globalStore.showSuccess).toHaveBeenCalledWith(
                'notifications.associated_plan_updated',
                'notifications.associated_plan_updated_detail'
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('updateAssociatedPlanSettings', () => {
        it('should call AssociatedPlanService.updateAssociatedPlanSettings, show success message, and return data', async () => {
            // Arrange
            const store = useAssociatedPlanStore();
            const globalStore = useGlobalStore();
            const id = 456;
            const payload = { settings: { enabled: true } };
            const mockResponse = {
                data: { id: 456, settings: { enabled: true } }
            };
            AssociatedPlanService.updateAssociatedPlanSettings.mockResolvedValue(
                mockResponse
            );

            // Act
            const result = await store.updateAssociatedPlanSettings(
                id,
                payload
            );

            // Assert
            expect(
                AssociatedPlanService.updateAssociatedPlanSettings
            ).toHaveBeenCalledWith(id, payload);
            expect(globalStore.showSuccess).toHaveBeenCalledWith(
                'notifications.associated_plan_dependant_settings_created',
                'notifications.associated_plan_dependant_settings_created_detail'
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('deleteAssociatedPlan', () => {
        it('should call AssociatedPlanService.deleteAssociatedPlan, show success message, and return data', async () => {
            // Arrange
            const store = useAssociatedPlanStore();
            const globalStore = useGlobalStore();
            const id = 123;
            const associatedPlanId = 456;
            const mockResponse = { data: { success: true } };
            AssociatedPlanService.deleteAssociatedPlan.mockResolvedValue(
                mockResponse
            );

            // Act
            const result = await store.deleteAssociatedPlan(
                id,
                associatedPlanId
            );

            // Assert
            expect(
                AssociatedPlanService.deleteAssociatedPlan
            ).toHaveBeenCalledWith(id, associatedPlanId);
            expect(globalStore.showSuccess).toHaveBeenCalledWith(
                'notifications.associated_plan_deleted',
                'notifications.associated_plan_deleted_detail'
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('transferObject', () => {
        it('should transform form data correctly', () => {
            // Arrange
            const store = useAssociatedPlanStore();
            const formData = {
                category: 'individual',
                early_arrivals_periods: [
                    {
                        days: 30,
                        plan_period: 'period1',
                        plan_period_date_reference: 'start_date',
                        plan_period_precedence: 'before'
                    }
                ],
                gap_periods: [
                    {
                        days: 15,
                        plan_period: 'period2',
                        plan_period_date_reference: 'end_date',
                        plan_period_precedence: 'after'
                    }
                ],
                non_insurance_products: [{ id: 1 }, { id: 2 }]
            };

            // Act
            const result = store.transferObject(formData);

            // Assert
            expect(result.category).toEqual({
                name: 'common.individual',
                code: 'individual'
            });
            expect(
                result.early_arrivals_periods[0].plan_period_date_reference
            ).toEqual({
                name: 'common.start_date',
                value: 'start_date'
            });
            expect(result.gap_periods[0].plan_period_precedence).toEqual({
                name: 'common.precedence_after',
                value: 'after'
            });
            expect(result.shouldIncludeNonInsuranceProducts).toBe(true);
        });

        it('should handle empty arrays', () => {
            // Arrange
            const store = useAssociatedPlanStore();
            const formData = {
                category: 'individual',
                early_arrivals_periods: [],
                gap_periods: [],
                non_insurance_products: []
            };

            // Act
            const result = store.transferObject(formData);

            // Assert
            expect(result.early_arrivals_periods).toEqual([]);
            expect(result.gap_periods).toEqual([]);
            expect(result.shouldIncludeNonInsuranceProducts).toBe(false);
        });
    });

    describe('transferPayload', () => {
        it('should transform form data for API submission', () => {
            // Arrange
            const store = useAssociatedPlanStore();
            const formData = {
                authorized: { id: 789 },
                category: { code: 'individual' },
                effective_date: '2023-01-01',
                end_date: '2023-12-31',
                early_arrivals_periods: [
                    {
                        days: 30,
                        plan_period_id: { id: 'period1' },
                        plan_period_date_reference: { value: 'start_date' },
                        plan_period_precedence: { value: 'before' }
                    }
                ],
                gap_periods: [
                    {
                        days: 15,
                        plan_period_id: { id: 'period2' },
                        plan_period_date_reference: { value: 'end_date' },
                        plan_period_precedence: { value: 'after' }
                    }
                ],
                non_insurance_products: [{ id: 1 }, { id: 2 }]
            };

            // Act
            const result = store.transferPayload(formData);

            // Assert
            expect(result.authorized_by_id).toBe(789);
            expect(result.category).toBe('individual');
            expect(result.effective_date).toBe('2023-01-01');
            expect(result.end_date).toBe('2023-12-31');
            expect(result.early_arrivals_periods[0].plan_period_id).toBe(
                'period1'
            );
            expect(result.gap_periods[0].plan_period_date_reference).toBe(
                'end_date'
            );
            expect(result.non_insurance_products).toEqual([1, 2]);
        });

        it('should handle invalid dates', () => {
            // Arrange
            const store = useAssociatedPlanStore();
            const formData = {
                effective_date: 'Invalid date',
                end_date: 'Invalid date',
                non_insurance_products: []
            };

            // Act
            const result = store.transferPayload(formData);

            // Assert
            expect(result.effective_date).toBeNull();
            expect(result.end_date).toBeNull();
            expect(result.non_insurance_products).toEqual([]);
        });
    });
});
