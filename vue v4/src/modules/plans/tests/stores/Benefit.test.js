import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useBenefitStore } from '@/modules/plans/stores/Benefit';
import * as BenefitService from '@/modules/plans/services/Benefit.service';

// Mock the BenefitService
vi.mock('@/modules/plans/services/Benefit.service', () => ({
    // Benefits
    searchBenefits: vi.fn(),
    searchBenefitGroupBenefits: vi.fn(),
    getBenefits: vi.fn(),
    getBenefit: vi.fn(),
    createBenefit: vi.fn(),
    updateBenefit: vi.fn(),
    deleteBenefit: vi.fn(),
    changeBenefitStatus: vi.fn(),
    duplicateBenefit: vi.fn(),

    // Benefit Categories
    searchBenefitCategories: vi.fn(),
    getBenefitCategories: vi.fn(),
    getBenefitCategory: vi.fn(),
    createBenefitCategory: vi.fn(),
    updateBenefitCategory: vi.fn(),
    updateBenefitCategoryStatus: vi.fn(),
    deleteBenefitCategory: vi.fn(),

    // Benefit Service Codes
    attachBenefitWithCodeServices: vi.fn(),
    attachBenefitWithCodeServicesGroup: vi.fn(),
    getBenefitCodeServices: vi.fn(),
    getBenefitCodeServicesGroups: vi.fn(),
    purgeServiceCodes: vi.fn(),
    purgeIndividualServices: vi.fn(),
    excludeBenefitServiceCodeGroups: vi.fn(),
    includeBenefitServiceCodeGroups: vi.fn(),
    excludeBenefitServiceCode: vi.fn(),
    updateBenefitService: vi.fn(),
    updateBenefitServiceCodeGroupBulk: vi.fn(),
    updateBenefitIndividualServicesBulk: vi.fn(),
    searchBenefitEntityServiceCodes: vi.fn(),
    searchBenefitServiceCodeGroupExcluded: vi.fn(),
    deleteBenefitCodeGroups: vi.fn(),
    searchBenefitServicesCodes: vi.fn(),
    updateBenefitServiceCodeGroup: vi.fn(),
    getDuplicatedServices: vi.fn(),

    // Benefit Groups
    createBenefitGroup: vi.fn(),
    updateBenefitGroup: vi.fn(),
    getBenefitGroup: vi.fn(),
    searchBenefitGroups: vi.fn(),
    getBenefitGroups: vi.fn(),
    updateBenefitGroupStatus: vi.fn(),
    updateBenefitGroupBenefitPivot: vi.fn(),
    deleteBenefitGroup: vi.fn(),
    syncBenefitGroupWithBenefits: vi.fn(),
    detachBenefitGroupWithBenefits: vi.fn(),

    // Benefit Categories and Benefits
    getAllBenefitCategoryForList: vi.fn(),
    getAllBenefitsByCategory: vi.fn(),

    // Benefit Prices
    searchBenefitGroupPrices: vi.fn(),
    searchBenefitPrices: vi.fn(),
    benefitGroupPricesStore: vi.fn(),
    benefitPricesStore: vi.fn(),
    benefitGroupPricesDelete: vi.fn(),
    benefitPricesDelete: vi.fn(),
    detachBenefitGroupWithPrices: vi.fn(),
    detachBenefitWithPrices: vi.fn(),
    benefitGroupPricesUpdate: vi.fn(),
    benefitPricesUpdate: vi.fn(),

    // Benefit Group Publishing and Documents
    publishBenefitGroup: vi.fn(),
    searchBenefitGroupDocuments: vi.fn(),
    benefitGroupDocumentsDelete: vi.fn(),
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
        t: (key, params) => {
            if (params) {
                return `${key} ${JSON.stringify(params)}`;
            }
            return key;
        },
        locale: { value: 'en' }
    })
}));

describe('BenefitStore', () => {
    let store;

    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
        store = useBenefitStore();
    });

    describe('state management', () => {
        it('sets and gets currentBenefit', () => {
            const benefit = { id: 1, name: { en: 'Test Benefit' } };
            store.setCurrentBenefit(benefit);
            expect(store.currentBenefit).toEqual(benefit);
        });

        it('sets and gets currentBenefitGroup', () => {
            const benefitGroup = { id: 1, name: { en: 'Test Benefit Group' } };
            store.setCurrentBenefitGroup(benefitGroup);
            expect(store.currentBenefitGroup).toEqual(benefitGroup);
        });
    });

    // Benefits tests
    describe('searchBenefits', () => {
        it('calls BenefitService.searchBenefits and returns the data', async () => {
            const payload = { name: 'Test Benefit' };
            const params = { page: 1, per_page: 10 };
            const mockResponse = {
                data: {
                    data: [
                        {
                            id: 1,
                            name: { en: 'Test Benefit' },
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

            BenefitService.searchBenefits.mockResolvedValue(mockResponse);

            const result = await store.searchBenefits(payload, params);

            expect(BenefitService.searchBenefits).toHaveBeenCalledWith(
                payload,
                params
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('getBenefit', () => {
        it('calls BenefitService.getBenefit and returns the data', async () => {
            const id = 1;
            const params = { include: 'category' };
            const mockResponse = {
                data: {
                    data: {
                        id: 1,
                        name: { en: 'Test Benefit' },
                        status: 'active'
                    }
                }
            };

            BenefitService.getBenefit.mockResolvedValue(mockResponse);

            const result = await store.getBenefit(id, params);

            expect(BenefitService.getBenefit).toHaveBeenCalledWith(id, params);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('createBenefit', () => {
        it('calls BenefitService.createBenefit, shows success message, and returns the data', async () => {
            const payload = {
                name: { en: 'New Benefit' },
                category_id: 1,
                status: 'active'
            };
            const mockResponse = {
                data: {
                    data: {
                        id: 1,
                        name: { en: 'New Benefit' },
                        category_id: 1,
                        status: 'active'
                    }
                }
            };

            BenefitService.createBenefit.mockResolvedValue(mockResponse);

            const result = await store.createBenefit(payload);

            expect(BenefitService.createBenefit).toHaveBeenCalledWith(payload);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('updateBenefit', () => {
        it('calls BenefitService.updateBenefit, shows success message, and returns the data', async () => {
            const id = 1;
            const payload = {
                name: { en: 'Updated Benefit' }
            };
            const mockResponse = {
                data: {
                    data: {
                        id: 1,
                        name: { en: 'Updated Benefit' },
                        status: 'active'
                    }
                }
            };

            BenefitService.updateBenefit.mockResolvedValue(mockResponse);

            const result = await store.updateBenefit(id, payload);

            expect(BenefitService.updateBenefit).toHaveBeenCalledWith(
                id,
                payload
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('publishBenefit', () => {
        it('calls BenefitService.changeBenefitStatus with active status, shows success message, and returns the data', async () => {
            const id = 1;
            const mockResponse = {
                data: {
                    data: {
                        id: 1,
                        name: { en: 'Test Benefit' },
                        status: 'active'
                    }
                }
            };

            BenefitService.changeBenefitStatus.mockResolvedValue(mockResponse);

            const result = await store.publishBenefit(id);

            expect(BenefitService.changeBenefitStatus).toHaveBeenCalledWith(
                id,
                { status: 'active' }
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('deleteBenefit', () => {
        it('calls BenefitService.deleteBenefit, shows success message, and returns the data', async () => {
            const id = 1;
            const mockResponse = {
                data: {
                    data: {
                        id: 1,
                        name: { en: 'Test Benefit' },
                        status: 'deleted'
                    }
                }
            };

            BenefitService.deleteBenefit.mockResolvedValue(mockResponse);

            const result = await store.deleteBenefit(id);

            expect(BenefitService.deleteBenefit).toHaveBeenCalledWith(id);
            expect(result).toEqual(mockResponse.data);
        });
    });

    // Benefit Categories tests
    describe('createBenefitCategory', () => {
        it('calls BenefitService.createBenefitCategory, shows success message, and returns the data', async () => {
            const payload = {
                name: { en: 'New Category' },
                status: 'active'
            };
            const mockResponse = {
                data: {
                    data: {
                        id: 1,
                        name: { en: 'New Category' },
                        status: 'active'
                    }
                }
            };

            BenefitService.createBenefitCategory.mockResolvedValue(
                mockResponse
            );

            const result = await store.createBenefitCategory(payload);

            expect(BenefitService.createBenefitCategory).toHaveBeenCalledWith(
                payload
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('updateBenefitCategory', () => {
        it('calls BenefitService.updateBenefitCategory and returns the data', async () => {
            const id = 1;
            const payload = {
                name: { en: 'Updated Category' }
            };
            const mockResponse = {
                data: {
                    data: {
                        id: 1,
                        name: { en: 'Updated Category' },
                        status: 'active'
                    }
                }
            };

            BenefitService.updateBenefitCategory.mockResolvedValue(
                mockResponse
            );

            const result = await store.updateBenefitCategory(id, payload);

            expect(BenefitService.updateBenefitCategory).toHaveBeenCalledWith(
                id,
                payload
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    // Benefit Groups tests
    describe('createBenefitGroup', () => {
        it('calls BenefitService.createBenefitGroup, shows success message, and returns the data', async () => {
            const payload = {
                name: { en: 'New Benefit Group' },
                status: 'active'
            };
            const mockResponse = {
                data: {
                    data: {
                        id: 1,
                        name: { en: 'New Benefit Group' },
                        status: 'active'
                    }
                }
            };

            BenefitService.createBenefitGroup.mockResolvedValue(mockResponse);

            const result = await store.createBenefitGroup(payload);

            expect(BenefitService.createBenefitGroup).toHaveBeenCalledWith(
                payload
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('updateBenefitGroup', () => {
        it('calls BenefitService.updateBenefitGroup, shows success message, and returns the data', async () => {
            const id = 1;
            const payload = {
                name: { en: 'Updated Benefit Group' }
            };
            const mockResponse = {
                data: {
                    data: {
                        id: 1,
                        name: { en: 'Updated Benefit Group' },
                        status: 'active'
                    }
                }
            };

            BenefitService.updateBenefitGroup.mockResolvedValue(mockResponse);

            const result = await store.updateBenefitGroup(id, payload);

            expect(BenefitService.updateBenefitGroup).toHaveBeenCalledWith(
                id,
                payload
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('getBenefitGroup', () => {
        it('calls BenefitService.getBenefitGroup and returns the data', async () => {
            const id = 1;
            const mockResponse = {
                data: {
                    data: {
                        id: 1,
                        name: { en: 'Test Benefit Group' },
                        status: 'active'
                    }
                }
            };

            BenefitService.getBenefitGroup.mockResolvedValue(mockResponse);

            const result = await store.getBenefitGroup(id);

            expect(BenefitService.getBenefitGroup).toHaveBeenCalledWith(id);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('reloadBenefitGroup', () => {
        it('calls getBenefitGroup and updates currentBenefitGroup', async () => {
            const mockBenefitGroup = {
                id: 1,
                name: { en: 'Test Benefit Group' },
                status: 'active'
            };

            store.currentBenefitGroup = mockBenefitGroup;

            const mockResponse = {
                data: {
                    data: {
                        id: 1,
                        name: { en: 'Updated Benefit Group' },
                        status: 'active'
                    }
                }
            };

            BenefitService.getBenefitGroup.mockResolvedValue(mockResponse);

            await store.reloadBenefitGroup();

            expect(BenefitService.getBenefitGroup).toHaveBeenCalledWith(
                mockBenefitGroup.id
            );
            expect(store.currentBenefitGroup).toEqual(mockResponse.data.data);
        });
    });

    describe('updateBenefitGroupBenefitPivot', () => {
        it('calls BenefitService.updateBenefitGroupBenefitPivot, shows success message, and returns the data', async () => {
            const id = 1;
            const benefitId = 2;
            const payload = { order: 1 };
            const mockResponse = {
                data: {
                    data: {
                        id: 1,
                        benefit_id: 2,
                        order: 1
                    }
                }
            };

            BenefitService.updateBenefitGroupBenefitPivot.mockResolvedValue(
                mockResponse
            );

            const result = await store.updateBenefitGroupBenefitPivot(
                id,
                benefitId,
                payload
            );

            expect(
                BenefitService.updateBenefitGroupBenefitPivot
            ).toHaveBeenCalledWith(id, benefitId, payload);
            expect(result).toEqual(mockResponse.data);
        });

        it('does not show success message when shouldShowSuccessNotification is false', async () => {
            const id = 1;
            const benefitId = 2;
            const payload = { order: 1 };
            const shouldShowSuccessNotification = false;
            const mockResponse = {
                data: {
                    data: {
                        id: 1,
                        benefit_id: 2,
                        order: 1
                    }
                }
            };

            BenefitService.updateBenefitGroupBenefitPivot.mockResolvedValue(
                mockResponse
            );

            const result = await store.updateBenefitGroupBenefitPivot(
                id,
                benefitId,
                payload,
                shouldShowSuccessNotification
            );

            expect(
                BenefitService.updateBenefitGroupBenefitPivot
            ).toHaveBeenCalledWith(id, benefitId, payload);
            expect(result).toEqual(mockResponse.data);
        });
    });

    // Benefit Prices tests
    describe('benefitGroupPricesStore', () => {
        it('calls BenefitService.benefitGroupPricesStore, shows success message, and returns the data', async () => {
            const id = 1;
            const payload = { price: 100, currency_id: 1 };
            const mockResponse = {
                data: {
                    data: {
                        id: 1,
                        price: 100,
                        currency_id: 1
                    }
                }
            };

            BenefitService.benefitGroupPricesStore.mockResolvedValue(
                mockResponse
            );

            const result = await store.benefitGroupPricesStore(id, payload);

            expect(BenefitService.benefitGroupPricesStore).toHaveBeenCalledWith(
                id,
                payload
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('publishBenefitGroup', () => {
        it('calls BenefitService.publishBenefitGroup, shows success message, and returns the data', async () => {
            const id = 1;
            const payload = { status: 'active' };
            const item = { name: { en: 'Test Benefit Group' } };
            const mockResponse = {
                data: {
                    data: {
                        id: 1,
                        name: { en: 'Test Benefit Group' },
                        status: 'active'
                    }
                }
            };

            BenefitService.publishBenefitGroup.mockResolvedValue(mockResponse);

            const result = await store.publishBenefitGroup(id, payload, item);

            expect(BenefitService.publishBenefitGroup).toHaveBeenCalledWith(
                id,
                payload
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('syncPrices', () => {
        it('calls BenefitService.syncPrices, shows success message, and returns the data', async () => {
            const id = 1;
            const mockResponse = {
                data: {
                    data: {
                        id: 1,
                        success: true
                    }
                }
            };

            BenefitService.syncPrices.mockResolvedValue(mockResponse);

            const result = await store.syncPrices(id);

            expect(BenefitService.syncPrices).toHaveBeenCalledWith(id);
            expect(result).toEqual(mockResponse.data);
        });
    });

    // Helper methods tests
    describe('processPayload', () => {
        it('processes the payload correctly', () => {
            const formData = {
                name: { en: 'Test Benefit' },
                end_date: '2023-12-31',
                bound: { value: 'inbound' },
                type: { value: 'standard' }
            };

            const result = store.processPayload(formData);

            expect(result).toEqual({
                name: { en: 'Test Benefit' },
                end_date: '2023-12-31',
                bound: 'inbound',
                type: 'standard'
            });
        });

        it('sets end_date to null when it is Invalid date', () => {
            const formData = {
                name: { en: 'Test Benefit' },
                end_date: 'Invalid date',
                bound: { value: 'inbound' },
                type: { value: 'standard' }
            };

            const result = store.processPayload(formData);

            expect(result).toEqual({
                name: { en: 'Test Benefit' },
                end_date: null,
                bound: 'inbound',
                type: 'standard'
            });
        });
    });

    describe('processResponse', () => {
        it('processes the response correctly', () => {
            const response = {
                id: 1,
                name: { en: 'Test Benefit' },
                bound: 'inbound',
                type: 'standard'
            };

            const result = store.processResponse(response);

            expect(result).toEqual({
                id: 1,
                name: { en: 'Test Benefit' },
                bound: {
                    name: 'plans.inbound',
                    value: 'inbound'
                },
                type: {
                    name: 'plans.standard',
                    value: 'standard'
                }
            });
        });

        it('handles response with bound and type as objects', () => {
            const response = {
                id: 1,
                name: { en: 'Test Benefit' },
                bound: { value: 'inbound' },
                type: { value: 'standard' }
            };

            const result = store.processResponse(response);

            expect(result).toEqual({
                id: 1,
                name: { en: 'Test Benefit' },
                bound: {
                    name: 'plans.inbound',
                    value: 'inbound'
                },
                type: {
                    name: 'plans.standard',
                    value: 'standard'
                }
            });
        });
    });
});
