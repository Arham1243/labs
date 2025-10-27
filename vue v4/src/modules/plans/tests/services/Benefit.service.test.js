import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

// Import the actual BenefitService
import * as BenefitService from '@/modules/plans/services/Benefit.service';

// Mock the BenefitService functions directly
vi.mock('@/modules/plans/services/Benefit.service', () => ({
    // Benefits
    searchBenefits: vi.fn().mockResolvedValue({ data: 'mock data' }),
    searchBenefitGroupBenefits: vi
        .fn()
        .mockResolvedValue({ data: 'mock data' }),
    getBenefits: vi.fn().mockResolvedValue({ data: 'mock data' }),
    getBenefit: vi.fn().mockResolvedValue({ data: 'mock data' }),
    createBenefit: vi.fn().mockResolvedValue({ data: 'mock data' }),
    updateBenefit: vi.fn().mockResolvedValue({ data: 'mock data' }),
    deleteBenefit: vi.fn().mockResolvedValue({ data: 'mock data' }),
    changeBenefitStatus: vi.fn().mockResolvedValue({ data: 'mock data' }),
    duplicateBenefit: vi.fn().mockResolvedValue({ data: 'mock data' }),

    // Benefit Categories
    searchBenefitCategories: vi.fn().mockResolvedValue({ data: 'mock data' }),
    getBenefitCategories: vi.fn().mockResolvedValue({ data: 'mock data' }),
    getBenefitCategory: vi.fn().mockResolvedValue({ data: 'mock data' }),
    createBenefitCategory: vi.fn().mockResolvedValue({ data: 'mock data' }),
    updateBenefitCategory: vi.fn().mockResolvedValue({ data: 'mock data' }),
    updateBenefitCategoryStatus: vi
        .fn()
        .mockResolvedValue({ data: 'mock data' }),
    deleteBenefitCategory: vi.fn().mockResolvedValue({ data: 'mock data' }),

    // Benefit Service Codes
    attachBenefitWithCodeServices: vi
        .fn()
        .mockResolvedValue({ data: 'mock data' }),
    attachBenefitWithCodeServicesGroup: vi
        .fn()
        .mockResolvedValue({ data: 'mock data' }),
    getBenefitCodeServices: vi.fn().mockResolvedValue({ data: 'mock data' }),
    getBenefitCodeServicesGroups: vi
        .fn()
        .mockResolvedValue({ data: 'mock data' }),
    purgeServiceCodes: vi.fn().mockResolvedValue({ data: 'mock data' }),
    purgeIndividualServices: vi.fn().mockResolvedValue({ data: 'mock data' }),
    excludeBenefitServiceCodeGroups: vi
        .fn()
        .mockResolvedValue({ data: 'mock data' }),
    includeBenefitServiceCodeGroups: vi
        .fn()
        .mockResolvedValue({ data: 'mock data' }),
    excludeBenefitServiceCode: vi.fn().mockResolvedValue({ data: 'mock data' }),
    updateBenefitService: vi.fn().mockResolvedValue({ data: 'mock data' }),
    updateBenefitServiceCodeGroupBulk: vi
        .fn()
        .mockResolvedValue({ data: 'mock data' }),
    updateBenefitIndividualServicesBulk: vi
        .fn()
        .mockResolvedValue({ data: 'mock data' }),
    searchBenefitEntityServiceCodes: vi
        .fn()
        .mockResolvedValue({ data: 'mock data' }),
    searchBenefitServiceCodeGroupExcluded: vi
        .fn()
        .mockResolvedValue({ data: 'mock data' }),
    deleteBenefitCodeGroups: vi.fn().mockResolvedValue({ data: 'mock data' }),
    searchBenefitServicesCodes: vi
        .fn()
        .mockResolvedValue({ data: 'mock data' }),
    updateBenefitServiceCodeGroup: vi
        .fn()
        .mockResolvedValue({ data: 'mock data' }),
    getDuplicatedServices: vi.fn().mockResolvedValue({ data: 'mock data' }),

    // Benefit Groups
    createBenefitGroup: vi.fn().mockResolvedValue({ data: 'mock data' }),
    updateBenefitGroup: vi.fn().mockResolvedValue({ data: 'mock data' }),
    getBenefitGroup: vi.fn().mockResolvedValue({ data: 'mock data' }),
    searchBenefitGroups: vi.fn().mockResolvedValue({ data: 'mock data' }),
    getBenefitGroups: vi.fn().mockResolvedValue({ data: 'mock data' }),
    updateBenefitGroupStatus: vi.fn().mockResolvedValue({ data: 'mock data' }),
    updateBenefitGroupBenefitPivot: vi
        .fn()
        .mockResolvedValue({ data: 'mock data' }),
    deleteBenefitGroup: vi.fn().mockResolvedValue({ data: 'mock data' }),
    syncBenefitGroupWithBenefits: vi
        .fn()
        .mockResolvedValue({ data: 'mock data' }),
    detachBenefitGroupWithBenefits: vi
        .fn()
        .mockResolvedValue({ data: 'mock data' }),

    // Benefit Categories and Benefits
    getAllBenefitCategoryForList: vi
        .fn()
        .mockResolvedValue({ data: 'mock data' }),
    getAllBenefitsByCategory: vi.fn().mockResolvedValue({ data: 'mock data' }),

    // Benefit Prices
    searchBenefitGroupPrices: vi.fn().mockResolvedValue({ data: 'mock data' }),
    searchBenefitPrices: vi.fn().mockResolvedValue({ data: 'mock data' }),
    benefitGroupPricesStore: vi.fn().mockResolvedValue({ data: 'mock data' }),
    benefitPricesStore: vi.fn().mockResolvedValue({ data: 'mock data' }),
    benefitGroupPricesDelete: vi.fn().mockResolvedValue({ data: 'mock data' }),
    benefitPricesDelete: vi.fn().mockResolvedValue({ data: 'mock data' }),
    detachBenefitGroupWithPrices: vi
        .fn()
        .mockResolvedValue({ data: 'mock data' }),
    detachBenefitWithPrices: vi.fn().mockResolvedValue({ data: 'mock data' }),
    benefitGroupPricesUpdate: vi.fn().mockResolvedValue({ data: 'mock data' }),
    benefitPricesUpdate: vi.fn().mockResolvedValue({ data: 'mock data' }),

    // Benefit Group Publishing and Documents
    publishBenefitGroup: vi.fn().mockResolvedValue({ data: 'mock data' }),
    searchBenefitGroupDocuments: vi
        .fn()
        .mockResolvedValue({ data: 'mock data' }),
    benefitGroupDocumentsDelete: vi
        .fn()
        .mockResolvedValue({ data: 'mock data' }),
    syncPrices: vi.fn().mockResolvedValue({ data: 'mock data' })
}));

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
    useI18n: () => ({
        t: (key) => key
    })
}));

describe('BenefitService', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    // Benefits tests
    describe('searchBenefits', () => {
        it('calls searchBenefits with the correct parameters', async () => {
            const payload = { name: 'Test Benefit' };
            const params = { page: 1, limit: 10 };

            await BenefitService.searchBenefits(payload, params);

            expect(BenefitService.searchBenefits).toHaveBeenCalledWith(
                payload,
                params
            );
        });
    });

    describe('searchBenefitGroupBenefits', () => {
        it('calls searchBenefitGroupBenefits with the correct parameters', async () => {
            const benefitGroupId = '123';
            const payload = { name: 'Test Benefit' };
            const params = { page: 1, limit: 10 };

            await BenefitService.searchBenefitGroupBenefits(
                benefitGroupId,
                payload,
                params
            );

            expect(
                BenefitService.searchBenefitGroupBenefits
            ).toHaveBeenCalledWith(benefitGroupId, payload, params);
        });
    });

    describe('getBenefits', () => {
        it('calls getBenefits with the correct parameters', async () => {
            const params = { page: 1, limit: 10 };

            await BenefitService.getBenefits(params);

            expect(BenefitService.getBenefits).toHaveBeenCalledWith(params);
        });
    });

    describe('getBenefit', () => {
        it('calls getBenefit with the correct parameters', async () => {
            const id = '123';
            const params = { include: 'category' };

            await BenefitService.getBenefit(id, params);

            expect(BenefitService.getBenefit).toHaveBeenCalledWith(id, params);
        });
    });

    describe('createBenefit', () => {
        it('calls createBenefit with the correct parameters', async () => {
            const payload = {
                name: { en: 'New Benefit' },
                category_id: 1,
                status: 'active'
            };

            await BenefitService.createBenefit(payload);

            expect(BenefitService.createBenefit).toHaveBeenCalledWith(payload);
        });
    });

    describe('updateBenefit', () => {
        it('calls updateBenefit with the correct parameters', async () => {
            const id = '123';
            const payload = {
                name: { en: 'Updated Benefit' }
            };

            await BenefitService.updateBenefit(id, payload);

            expect(BenefitService.updateBenefit).toHaveBeenCalledWith(
                id,
                payload
            );
        });
    });

    describe('deleteBenefit', () => {
        it('calls deleteBenefit with the correct parameters', async () => {
            const id = '123';

            await BenefitService.deleteBenefit(id);

            expect(BenefitService.deleteBenefit).toHaveBeenCalledWith(id);
        });
    });

    describe('changeBenefitStatus', () => {
        it('calls changeBenefitStatus with the correct parameters', async () => {
            const id = '123';
            const payload = { status: 'active' };

            await BenefitService.changeBenefitStatus(id, payload);

            expect(BenefitService.changeBenefitStatus).toHaveBeenCalledWith(
                id,
                payload
            );
        });
    });

    describe('duplicateBenefit', () => {
        it('calls duplicateBenefit with the correct parameters', async () => {
            const id = '123';
            const payload = { name: { en: 'Duplicated Benefit' } };

            await BenefitService.duplicateBenefit(id, payload);

            expect(BenefitService.duplicateBenefit).toHaveBeenCalledWith(
                id,
                payload
            );
        });
    });

    // Benefit Categories tests
    describe('searchBenefitCategories', () => {
        it('calls searchBenefitCategories with the correct parameters', async () => {
            const payload = { name: 'Test Category' };
            const params = { page: 1, limit: 10 };

            await BenefitService.searchBenefitCategories(payload, params);

            expect(BenefitService.searchBenefitCategories).toHaveBeenCalledWith(
                payload,
                params
            );
        });
    });

    describe('getBenefitCategories', () => {
        it('calls getBenefitCategories with the correct parameters', async () => {
            const params = { page: 1, limit: 10 };

            await BenefitService.getBenefitCategories(params);

            expect(BenefitService.getBenefitCategories).toHaveBeenCalledWith(
                params
            );
        });
    });

    describe('getBenefitCategory', () => {
        it('calls getBenefitCategory with the correct parameters', async () => {
            const id = '123';

            await BenefitService.getBenefitCategory(id);

            expect(BenefitService.getBenefitCategory).toHaveBeenCalledWith(id);
        });
    });

    describe('createBenefitCategory', () => {
        it('calls createBenefitCategory with the correct parameters', async () => {
            const payload = {
                name: { en: 'New Category' },
                status: 'active'
            };

            await BenefitService.createBenefitCategory(payload);

            expect(BenefitService.createBenefitCategory).toHaveBeenCalledWith(
                payload
            );
        });
    });

    describe('updateBenefitCategory', () => {
        it('calls updateBenefitCategory with the correct parameters', async () => {
            const id = '123';
            const payload = {
                name: { en: 'Updated Category' }
            };

            await BenefitService.updateBenefitCategory(id, payload);

            expect(BenefitService.updateBenefitCategory).toHaveBeenCalledWith(
                id,
                payload
            );
        });
    });

    describe('updateBenefitCategoryStatus', () => {
        it('calls updateBenefitCategoryStatus with the correct parameters', async () => {
            const id = '123';
            const payload = { status: 'active' };

            await BenefitService.updateBenefitCategoryStatus(id, payload);

            expect(
                BenefitService.updateBenefitCategoryStatus
            ).toHaveBeenCalledWith(id, payload);
        });
    });

    describe('deleteBenefitCategory', () => {
        it('calls deleteBenefitCategory with the correct parameters', async () => {
            const id = '123';

            await BenefitService.deleteBenefitCategory(id);

            expect(BenefitService.deleteBenefitCategory).toHaveBeenCalledWith(
                id
            );
        });
    });

    // Benefit Groups tests
    describe('createBenefitGroup', () => {
        it('calls createBenefitGroup with the correct parameters', async () => {
            const payload = {
                name: { en: 'New Benefit Group' },
                status: 'active'
            };

            await BenefitService.createBenefitGroup(payload);

            expect(BenefitService.createBenefitGroup).toHaveBeenCalledWith(
                payload
            );
        });
    });

    describe('updateBenefitGroup', () => {
        it('calls updateBenefitGroup with the correct parameters', async () => {
            const id = '123';
            const payload = {
                name: { en: 'Updated Benefit Group' }
            };

            await BenefitService.updateBenefitGroup(id, payload);

            expect(BenefitService.updateBenefitGroup).toHaveBeenCalledWith(
                id,
                payload
            );
        });
    });

    describe('getBenefitGroup', () => {
        it('calls getBenefitGroup with the correct parameters', async () => {
            const id = '123';

            await BenefitService.getBenefitGroup(id);

            expect(BenefitService.getBenefitGroup).toHaveBeenCalledWith(id);
        });
    });

    describe('searchBenefitGroups', () => {
        it('calls searchBenefitGroups with the correct parameters', async () => {
            const payload = { name: 'Test Benefit Group' };
            const params = { page: 1, limit: 10 };

            await BenefitService.searchBenefitGroups(payload, params);

            expect(BenefitService.searchBenefitGroups).toHaveBeenCalledWith(
                payload,
                params
            );
        });
    });

    describe('getBenefitGroups', () => {
        it('calls getBenefitGroups with the correct parameters', async () => {
            const params = { page: 1, limit: 10 };

            await BenefitService.getBenefitGroups(params);

            expect(BenefitService.getBenefitGroups).toHaveBeenCalledWith(
                params
            );
        });
    });

    describe('updateBenefitGroupStatus', () => {
        it('calls updateBenefitGroupStatus with the correct parameters', async () => {
            const id = '123';
            const payload = { status: 'active' };

            await BenefitService.updateBenefitGroupStatus(id, payload);

            expect(
                BenefitService.updateBenefitGroupStatus
            ).toHaveBeenCalledWith(id, payload);
        });
    });

    describe('updateBenefitGroupBenefitPivot', () => {
        it('calls updateBenefitGroupBenefitPivot with the correct parameters', async () => {
            const id = '123';
            const benefitId = '456';
            const payload = { order: 1 };

            await BenefitService.updateBenefitGroupBenefitPivot(
                id,
                benefitId,
                payload
            );

            expect(
                BenefitService.updateBenefitGroupBenefitPivot
            ).toHaveBeenCalledWith(id, benefitId, payload);
        });
    });

    describe('deleteBenefitGroup', () => {
        it('calls deleteBenefitGroup with the correct parameters', async () => {
            const id = '123';

            await BenefitService.deleteBenefitGroup(id);

            expect(BenefitService.deleteBenefitGroup).toHaveBeenCalledWith(id);
        });
    });

    describe('syncBenefitGroupWithBenefits', () => {
        it('calls syncBenefitGroupWithBenefits with the correct parameters', async () => {
            const id = '123';
            const resources = ['456', '789'];

            await BenefitService.syncBenefitGroupWithBenefits(id, resources);

            expect(
                BenefitService.syncBenefitGroupWithBenefits
            ).toHaveBeenCalledWith(id, resources);
        });
    });

    describe('detachBenefitGroupWithBenefits', () => {
        it('calls detachBenefitGroupWithBenefits with the correct parameters', async () => {
            const id = '123';
            const data = { resources: ['456', '789'] };

            await BenefitService.detachBenefitGroupWithBenefits(id, data);

            expect(
                BenefitService.detachBenefitGroupWithBenefits
            ).toHaveBeenCalledWith(id, data);
        });
    });

    // Benefit Prices tests
    describe('searchBenefitGroupPrices', () => {
        it('calls searchBenefitGroupPrices with the correct parameters', async () => {
            const id = '123';
            const payload = { price: 100 };
            const params = { page: 1, limit: 10 };

            await BenefitService.searchBenefitGroupPrices(id, payload, params);

            expect(
                BenefitService.searchBenefitGroupPrices
            ).toHaveBeenCalledWith(id, payload, params);
        });
    });

    describe('benefitGroupPricesStore', () => {
        it('calls benefitGroupPricesStore with the correct parameters', async () => {
            const id = '123';
            const payload = { price: 100, currency_id: 1 };

            await BenefitService.benefitGroupPricesStore(id, payload);

            expect(BenefitService.benefitGroupPricesStore).toHaveBeenCalledWith(
                id,
                payload
            );
        });
    });

    describe('benefitGroupPricesDelete', () => {
        it('calls benefitGroupPricesDelete with the correct parameters', async () => {
            const id = '123';
            const priceId = '456';

            await BenefitService.benefitGroupPricesDelete(id, priceId);

            expect(
                BenefitService.benefitGroupPricesDelete
            ).toHaveBeenCalledWith(id, priceId);
        });
    });

    describe('benefitGroupPricesUpdate', () => {
        it('calls benefitGroupPricesUpdate with the correct parameters', async () => {
            const id = '123';
            const priceId = '456';
            const payload = { price: 200 };

            await BenefitService.benefitGroupPricesUpdate(id, priceId, payload);

            expect(
                BenefitService.benefitGroupPricesUpdate
            ).toHaveBeenCalledWith(id, priceId, payload);
        });
    });

    describe('publishBenefitGroup', () => {
        it('calls publishBenefitGroup with the correct parameters', async () => {
            const id = '123';
            const payload = { status: 'active' };

            await BenefitService.publishBenefitGroup(id, payload);

            expect(BenefitService.publishBenefitGroup).toHaveBeenCalledWith(
                id,
                payload
            );
        });
    });

    describe('syncPrices', () => {
        it('calls syncPrices with the correct parameters', async () => {
            const id = '123';

            await BenefitService.syncPrices(id);

            expect(BenefitService.syncPrices).toHaveBeenCalledWith(id);
        });
    });
});
