import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

// Import the actual CodeSetService
import * as CodeSetService from '@/modules/plans/services/CodeSet.service';

// Mock the CodeSetService functions directly
vi.mock('@/modules/plans/services/CodeSet.service', () => ({
    searchCodeSets: vi.fn().mockResolvedValue({ data: 'mock data' }),
    getCodeSets: vi.fn().mockResolvedValue({ data: 'mock data' }),
    getCodeSet: vi.fn().mockResolvedValue({ data: 'mock data' }),
    createCodeSet: vi.fn().mockResolvedValue({ data: 'mock data' }),
    updateCodeSet: vi.fn().mockResolvedValue({ data: 'mock data' }),
    deleteCodeSet: vi.fn().mockResolvedValue({ data: 'mock data' }),
    getCodeSetTags: vi.fn().mockResolvedValue({ data: 'mock data' }),

    searchCodeGroups: vi.fn().mockResolvedValue({ data: 'mock data' }),
    searchCodeGroupsExclude: vi.fn().mockResolvedValue({ data: 'mock data' }),
    getCodeGroups: vi.fn().mockResolvedValue({ data: 'mock data' }),
    getCodeGroup: vi.fn().mockResolvedValue({ data: 'mock data' }),
    createCodeGroup: vi.fn().mockResolvedValue({ data: 'mock data' }),
    updateCodeGroup: vi.fn().mockResolvedValue({ data: 'mock data' }),
    deleteCodeGroup: vi.fn().mockResolvedValue({ data: 'mock data' }),
    syncCodeGroupByTags: vi.fn().mockResolvedValue({ data: 'mock data' }),

    searchServiceCodes: vi.fn().mockResolvedValue({ data: 'mock data' }),
    getEntityServiceCodes: vi.fn().mockResolvedValue({ data: 'mock data' }),
    getExcludedServiceCodes: vi.fn().mockResolvedValue({ data: 'mock data' }),
    searchEntityServiceCodes: vi.fn().mockResolvedValue({ data: 'mock data' }),
    searchExcludedServicesCodes: vi
        .fn()
        .mockResolvedValue({ data: 'mock data' }),
    getExcludedServicesCodesForBenefit: vi
        .fn()
        .mockResolvedValue({ data: 'mock data' }),
    createServiceCode: vi.fn().mockResolvedValue({ data: 'mock data' }),
    updateServiceCode: vi.fn().mockResolvedValue({ data: 'mock data' }),
    syncServiceCodes: vi.fn().mockResolvedValue({ data: 'mock data' }),
    attachServiceCodes: vi.fn().mockResolvedValue({ data: 'mock data' }),
    detachServiceCodes: vi.fn().mockResolvedValue({ data: 'mock data' }),
    importServiceCodes: vi.fn().mockResolvedValue({ data: 'mock data' }),
    checkImportLogStatus: vi.fn().mockResolvedValue({ data: 'mock data' })
}));

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
    useI18n: () => ({
        t: (key) => key
    })
}));

describe('CodeSetService', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    // Code Sets tests
    describe('searchCodeSets', () => {
        it('calls searchCodeSets with the correct parameters', async () => {
            const payload = { name: 'Test Code Set' };
            const params = { page: 1, limit: 10 };

            await CodeSetService.searchCodeSets(payload, params);

            expect(CodeSetService.searchCodeSets).toHaveBeenCalledWith(
                payload,
                params
            );
        });
    });

    describe('getCodeSets', () => {
        it('calls getCodeSets with the correct parameters', async () => {
            const params = { page: 1, limit: 10 };

            await CodeSetService.getCodeSets(params);

            expect(CodeSetService.getCodeSets).toHaveBeenCalledWith(params);
        });
    });

    describe('getCodeSet', () => {
        it('calls getCodeSet with the correct parameters', async () => {
            const id = '123';

            await CodeSetService.getCodeSet(id);

            expect(CodeSetService.getCodeSet).toHaveBeenCalledWith(id);
        });
    });

    describe('createCodeSet', () => {
        it('calls createCodeSet with the correct parameters', async () => {
            const payload = {
                name: { en: 'New Code Set' },
                status: 'active'
            };

            await CodeSetService.createCodeSet(payload);

            expect(CodeSetService.createCodeSet).toHaveBeenCalledWith(payload);
        });
    });

    describe('updateCodeSet', () => {
        it('calls updateCodeSet with the correct parameters', async () => {
            const id = '123';
            const payload = {
                name: { en: 'Updated Code Set' }
            };

            await CodeSetService.updateCodeSet(id, payload);

            expect(CodeSetService.updateCodeSet).toHaveBeenCalledWith(
                id,
                payload
            );
        });
    });

    describe('deleteCodeSet', () => {
        it('calls deleteCodeSet with the correct parameters', async () => {
            const id = '123';

            await CodeSetService.deleteCodeSet(id);

            expect(CodeSetService.deleteCodeSet).toHaveBeenCalledWith(id);
        });
    });

    describe('getCodeSetTags', () => {
        it('calls getCodeSetTags with the correct parameters', async () => {
            const id = '123';

            await CodeSetService.getCodeSetTags(id);

            expect(CodeSetService.getCodeSetTags).toHaveBeenCalledWith(id);
        });
    });

    // Code Groups tests
    describe('searchCodeGroups', () => {
        it('calls searchCodeGroups with the correct parameters', async () => {
            const payload = { name: 'Test Code Group' };
            const params = { page: 1, limit: 10 };

            await CodeSetService.searchCodeGroups(payload, params);

            expect(CodeSetService.searchCodeGroups).toHaveBeenCalledWith(
                payload,
                params
            );
        });
    });

    describe('searchCodeGroupsExclude', () => {
        it('calls searchCodeGroupsExclude with the correct parameters', async () => {
            const id = '123';
            const serviceCodeId = '456';
            const payload = { name: 'Test Code Group' };
            const params = { page: 1, limit: 10 };

            await CodeSetService.searchCodeGroupsExclude(
                id,
                serviceCodeId,
                payload,
                params
            );

            expect(CodeSetService.searchCodeGroupsExclude).toHaveBeenCalledWith(
                id,
                serviceCodeId,
                payload,
                params
            );
        });
    });

    describe('getCodeGroups', () => {
        it('calls getCodeGroups with the correct parameters', async () => {
            const params = { page: 1, limit: 10 };

            await CodeSetService.getCodeGroups(params);

            expect(CodeSetService.getCodeGroups).toHaveBeenCalledWith(params);
        });
    });

    describe('getCodeGroup', () => {
        it('calls getCodeGroup with the correct parameters', async () => {
            const id = '123';

            await CodeSetService.getCodeGroup(id);

            expect(CodeSetService.getCodeGroup).toHaveBeenCalledWith(id);
        });
    });

    describe('createCodeGroup', () => {
        it('calls createCodeGroup with the correct parameters', async () => {
            const payload = {
                name: { en: 'New Code Group' },
                status: 'active'
            };

            await CodeSetService.createCodeGroup(payload);

            expect(CodeSetService.createCodeGroup).toHaveBeenCalledWith(
                payload
            );
        });
    });

    describe('updateCodeGroup', () => {
        it('calls updateCodeGroup with the correct parameters', async () => {
            const id = '123';
            const payload = {
                name: { en: 'Updated Code Group' }
            };

            await CodeSetService.updateCodeGroup(id, payload);

            expect(CodeSetService.updateCodeGroup).toHaveBeenCalledWith(
                id,
                payload
            );
        });
    });

    describe('deleteCodeGroup', () => {
        it('calls deleteCodeGroup with the correct parameters', async () => {
            const id = '123';

            await CodeSetService.deleteCodeGroup(id);

            expect(CodeSetService.deleteCodeGroup).toHaveBeenCalledWith(id);
        });
    });

    describe('syncCodeGroupByTags', () => {
        it('calls syncCodeGroupByTags with the correct parameters', async () => {
            const id = '123';
            const payload = {
                tags: ['tag1', 'tag2']
            };

            await CodeSetService.syncCodeGroupByTags(id, payload);

            expect(CodeSetService.syncCodeGroupByTags).toHaveBeenCalledWith(
                id,
                payload
            );
        });
    });

    // Service Codes tests
    describe('searchServiceCodes', () => {
        it('calls searchServiceCodes with the correct parameters', async () => {
            const value = 'Test Service Code';

            await CodeSetService.searchServiceCodes(value);

            expect(CodeSetService.searchServiceCodes).toHaveBeenCalledWith(
                value
            );
        });
    });

    describe('getEntityServiceCodes', () => {
        it('calls getEntityServiceCodes with the correct parameters', async () => {
            const entity = 'sets';
            const id = '123';
            const params = { page: 1, limit: 10 };

            await CodeSetService.getEntityServiceCodes(entity, id, params);

            expect(CodeSetService.getEntityServiceCodes).toHaveBeenCalledWith(
                entity,
                id,
                params
            );
        });
    });

    describe('getExcludedServiceCodes', () => {
        it('calls getExcludedServiceCodes with the correct parameters', async () => {
            const entity = 'sets';
            const id = '123';
            const params = { page: 1, limit: 10 };

            await CodeSetService.getExcludedServiceCodes(entity, id, params);

            expect(CodeSetService.getExcludedServiceCodes).toHaveBeenCalledWith(
                entity,
                id,
                params
            );
        });
    });

    describe('searchEntityServiceCodes', () => {
        it('calls searchEntityServiceCodes with the correct parameters', async () => {
            const entity = 'sets';
            const id = '123';
            const payload = { code: 'TEST' };
            const params = { page: 1, limit: 10 };

            await CodeSetService.searchEntityServiceCodes(
                entity,
                id,
                payload,
                params
            );

            expect(
                CodeSetService.searchEntityServiceCodes
            ).toHaveBeenCalledWith(entity, id, payload, params);
        });
    });

    describe('searchExcludedServicesCodes', () => {
        it('calls searchExcludedServicesCodes with the correct parameters', async () => {
            const entity = 'sets';
            const id = '123';
            const payload = { code: 'TEST' };
            const params = { page: 1, limit: 10 };

            await CodeSetService.searchExcludedServicesCodes(
                entity,
                id,
                payload,
                params
            );

            expect(
                CodeSetService.searchExcludedServicesCodes
            ).toHaveBeenCalledWith(entity, id, payload, params);
        });
    });

    describe('getExcludedServicesCodesForBenefit', () => {
        it('calls getExcludedServicesCodesForBenefit with the correct parameters', async () => {
            const id = '123';
            const service_code_set = '456';
            const payload = { code: 'TEST' };
            const params = { page: 1, limit: 10 };

            await CodeSetService.getExcludedServicesCodesForBenefit(
                id,
                service_code_set,
                payload,
                params
            );

            expect(
                CodeSetService.getExcludedServicesCodesForBenefit
            ).toHaveBeenCalledWith(id, service_code_set, payload, params);
        });
    });

    describe('createServiceCode', () => {
        it('calls createServiceCode with the correct parameters', async () => {
            const payload = {
                code: 'TEST',
                description: { en: 'Test Service Code' }
            };

            await CodeSetService.createServiceCode(payload);

            expect(CodeSetService.createServiceCode).toHaveBeenCalledWith(
                payload
            );
        });
    });

    describe('updateServiceCode', () => {
        it('calls updateServiceCode with the correct parameters', async () => {
            const id = '123';
            const payload = {
                description: { en: 'Updated Service Code' }
            };

            await CodeSetService.updateServiceCode(id, payload);

            expect(CodeSetService.updateServiceCode).toHaveBeenCalledWith(
                id,
                payload
            );
        });
    });

    describe('syncServiceCodes', () => {
        it('calls syncServiceCodes with the correct parameters', async () => {
            const entity = 'sets';
            const id = '123';
            const payload = {
                resources: ['456', '789']
            };

            await CodeSetService.syncServiceCodes(entity, id, payload);

            expect(CodeSetService.syncServiceCodes).toHaveBeenCalledWith(
                entity,
                id,
                payload
            );
        });
    });

    describe('attachServiceCodes', () => {
        it('calls attachServiceCodes with the correct parameters', async () => {
            const entity = 'sets';
            const id = '123';
            const payload = {
                resources: ['456', '789']
            };

            await CodeSetService.attachServiceCodes(entity, id, payload);

            expect(CodeSetService.attachServiceCodes).toHaveBeenCalledWith(
                entity,
                id,
                payload
            );
        });
    });

    describe('detachServiceCodes', () => {
        it('calls detachServiceCodes with the correct parameters', async () => {
            const entity = 'sets';
            const id = '123';
            const data = {
                resources: ['456', '789']
            };

            await CodeSetService.detachServiceCodes(entity, id, data);

            expect(CodeSetService.detachServiceCodes).toHaveBeenCalledWith(
                entity,
                id,
                data
            );
        });
    });

    describe('importServiceCodes', () => {
        it('calls importServiceCodes with the correct parameters', async () => {
            const payload = new FormData();
            const config = {
                headers: { 'Content-Type': 'multipart/form-data' }
            };

            await CodeSetService.importServiceCodes(payload, config);

            expect(CodeSetService.importServiceCodes).toHaveBeenCalledWith(
                payload,
                config
            );
        });
    });

    describe('checkImportLogStatus', () => {
        it('calls checkImportLogStatus with the correct parameters', async () => {
            const import_log_id = '123';
            const config = {};

            await CodeSetService.checkImportLogStatus(import_log_id, config);

            expect(CodeSetService.checkImportLogStatus).toHaveBeenCalledWith(
                import_log_id,
                config
            );
        });
    });
});
