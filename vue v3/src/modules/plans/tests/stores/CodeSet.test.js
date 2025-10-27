import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCodeSetStore } from '@/modules/plans/stores/CodeSet';
import * as CodeSetService from '@/modules/plans/services/CodeSet.service';

// Mock the CodeSetService
vi.mock('@/modules/plans/services/CodeSet.service', () => ({
    searchCodeSets: vi.fn(),
    getCodeSets: vi.fn(),
    getCodeSet: vi.fn(),
    createCodeSet: vi.fn(),
    updateCodeSet: vi.fn(),
    deleteCodeSet: vi.fn(),
    getCodeSetTags: vi.fn(),

    searchCodeGroups: vi.fn(),
    searchCodeGroupsExclude: vi.fn(),
    getCodeGroups: vi.fn(),
    getCodeGroup: vi.fn(),
    createCodeGroup: vi.fn(),
    updateCodeGroup: vi.fn(),
    deleteCodeGroup: vi.fn(),
    syncCodeGroupByTags: vi.fn(),

    searchServiceCodes: vi.fn(),
    getEntityServiceCodes: vi.fn(),
    getExcludedServiceCodes: vi.fn(),
    searchEntityServiceCodes: vi.fn(),
    searchExcludedServicesCodes: vi.fn(),
    getExcludedServicesCodesForBenefit: vi.fn(),
    createServiceCode: vi.fn(),
    updateServiceCode: vi.fn(),
    syncServiceCodes: vi.fn(),
    attachServiceCodes: vi.fn(),
    detachServiceCodes: vi.fn(),
    importServiceCodes: vi.fn(),
    checkImportLogStatus: vi.fn()
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

describe('CodeSetStore', () => {
    let store;

    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
        store = useCodeSetStore();
    });

    describe('state management', () => {
        it('sets and gets currentCodeSet', () => {
            const codeSet = { id: 1, name: { en: 'Test Code Set' } };
            store.setCurrentCodeSet(codeSet);
            expect(store.currentCodeSet).toEqual(codeSet);
        });

        it('sets and gets currentCodeGroup', () => {
            const codeGroup = { id: 1, name: { en: 'Test Code Group' } };
            store.setCurrentCodeGroup(codeGroup);
            expect(store.currentCodeGroup).toEqual(codeGroup);
        });
    });

    // Code Sets tests
    describe('searchCodeSets', () => {
        it('calls CodeSetService.searchCodeSets and returns the data', async () => {
            const payload = { name: 'Test Code Set' };
            const params = { page: 1, per_page: 10 };
            const mockResponse = {
                data: {
                    data: [
                        {
                            id: 1,
                            name: { en: 'Test Code Set' },
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

            CodeSetService.searchCodeSets.mockResolvedValue(mockResponse);

            const result = await store.searchCodeSets(payload, params);

            expect(CodeSetService.searchCodeSets).toHaveBeenCalledWith(
                payload,
                params
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('getCodeSets', () => {
        it('calls CodeSetService.getCodeSets and returns the data', async () => {
            const params = { page: 1, per_page: 10 };
            const mockResponse = {
                data: {
                    data: [
                        {
                            id: 1,
                            name: { en: 'Test Code Set' },
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

            CodeSetService.getCodeSets.mockResolvedValue(mockResponse);

            const result = await store.getCodeSets(params);

            expect(CodeSetService.getCodeSets).toHaveBeenCalledWith(params);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('getCodeSet', () => {
        it('calls CodeSetService.getCodeSet and returns the data', async () => {
            const id = 1;
            const mockResponse = {
                data: {
                    data: {
                        id: 1,
                        name: { en: 'Test Code Set' },
                        status: 'active'
                    }
                }
            };

            CodeSetService.getCodeSet.mockResolvedValue(mockResponse);

            const result = await store.getCodeSet(id);

            expect(CodeSetService.getCodeSet).toHaveBeenCalledWith(id);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('createCodeSet', () => {
        it('calls CodeSetService.createCodeSet, shows success message, and returns the data', async () => {
            const payload = {
                name: { en: 'New Code Set' },
                status: 'active'
            };
            const mockResponse = {
                data: {
                    data: {
                        id: 1,
                        name: { en: 'New Code Set' },
                        status: 'active'
                    }
                }
            };

            CodeSetService.createCodeSet.mockResolvedValue(mockResponse);

            const result = await store.createCodeSet(payload);

            expect(CodeSetService.createCodeSet).toHaveBeenCalledWith(payload);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('updateCodeSet', () => {
        it('calls CodeSetService.updateCodeSet, shows success message, updates currentCodeSet, and returns the data', async () => {
            const id = 1;
            const payload = {
                name: { en: 'Updated Code Set' }
            };
            const mockResponse = {
                data: {
                    data: {
                        id: 1,
                        name: { en: 'Updated Code Set' },
                        status: 'active'
                    }
                }
            };

            CodeSetService.updateCodeSet.mockResolvedValue(mockResponse);

            const result = await store.updateCodeSet(id, payload);

            expect(CodeSetService.updateCodeSet).toHaveBeenCalledWith(
                id,
                payload
            );
            expect(store.currentCodeSet).toEqual(mockResponse.data.data);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('publishCodeSet', () => {
        it('calls CodeSetService.updateCodeSet with active status, shows success message, and returns the data', async () => {
            const id = 1;
            const payload = {
                name: { en: 'Test Code Set' }
            };
            const mockResponse = {
                data: {
                    data: {
                        id: 1,
                        name: { en: 'Test Code Set' },
                        status: 'active'
                    }
                }
            };

            store.currentCodeSet = {
                id: 1,
                name: { en: 'Test Code Set' },
                status: 'draft'
            };

            CodeSetService.updateCodeSet.mockResolvedValue(mockResponse);

            const result = await store.publishCodeSet(id, payload);

            expect(CodeSetService.updateCodeSet).toHaveBeenCalledWith(id, {
                ...store.currentCodeSet,
                status: 'active'
            });
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('deleteCodeSet', () => {
        it('calls CodeSetService.deleteCodeSet, shows success message, and returns the data', async () => {
            const id = 1;
            const mockResponse = {
                data: {
                    data: {
                        id: 1,
                        name: { en: 'Test Code Set' },
                        status: 'deleted'
                    }
                }
            };

            CodeSetService.deleteCodeSet.mockResolvedValue(mockResponse);

            const result = await store.deleteCodeSet(id);

            expect(CodeSetService.deleteCodeSet).toHaveBeenCalledWith(id);
            expect(result).toEqual(mockResponse.data);
        });
    });

    // Code Groups tests
    describe('searchCodeGroups', () => {
        it('calls CodeSetService.searchCodeGroups and returns the data', async () => {
            const payload = { name: 'Test Code Group' };
            const params = { page: 1, per_page: 10 };
            const mockResponse = {
                data: {
                    data: [
                        {
                            id: 1,
                            name: { en: 'Test Code Group' },
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

            CodeSetService.searchCodeGroups.mockResolvedValue(mockResponse);

            const result = await store.searchCodeGroups(payload, params);

            expect(CodeSetService.searchCodeGroups).toHaveBeenCalledWith(
                payload,
                params
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('createCodeGroup', () => {
        it('calls CodeSetService.createCodeGroup, shows success message, and returns the data', async () => {
            const payload = {
                name: { en: 'New Code Group' },
                status: 'active'
            };
            const mockResponse = {
                data: {
                    data: {
                        id: 1,
                        name: { en: 'New Code Group' },
                        status: 'active'
                    }
                }
            };

            CodeSetService.createCodeGroup.mockResolvedValue(mockResponse);

            const result = await store.createCodeGroup(payload);

            expect(CodeSetService.createCodeGroup).toHaveBeenCalledWith(
                payload
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('updateCodeGroup', () => {
        it('calls CodeSetService.updateCodeGroup, shows success message, updates currentCodeGroup, and returns the data', async () => {
            const id = 1;
            const payload = {
                name: { en: 'Updated Code Group' }
            };
            const mockResponse = {
                data: {
                    data: {
                        id: 1,
                        name: { en: 'Updated Code Group' },
                        status: 'active'
                    }
                }
            };

            CodeSetService.updateCodeGroup.mockResolvedValue(mockResponse);

            const result = await store.updateCodeGroup(id, payload);

            expect(CodeSetService.updateCodeGroup).toHaveBeenCalledWith(
                id,
                payload
            );
            expect(store.currentCodeGroup).toEqual(mockResponse.data.data);
            expect(result).toEqual(mockResponse.data);
        });
    });

    // Service Codes tests
    describe('searchEntityServiceCodes', () => {
        it('calls CodeSetService.searchEntityServiceCodes and returns the data', async () => {
            const entity = 'sets';
            const id = 1;
            const payload = { code: 'TEST' };
            const params = { page: 1, per_page: 10 };
            const mockResponse = {
                data: {
                    data: [
                        {
                            id: 1,
                            code: 'TEST',
                            description: { en: 'Test Service Code' }
                        }
                    ],
                    meta: {
                        current_page: 1,
                        per_page: 10,
                        total: 1
                    }
                }
            };

            CodeSetService.searchEntityServiceCodes.mockResolvedValue(
                mockResponse
            );

            const result = await store.searchEntityServiceCodes(
                entity,
                id,
                payload,
                params
            );

            expect(
                CodeSetService.searchEntityServiceCodes
            ).toHaveBeenCalledWith(entity, id, payload, params);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('attachServiceCodes', () => {
        it('calls CodeSetService.attachServiceCodes, shows success message, and returns the data', async () => {
            const entity = 'sets';
            const id = 1;
            const payload = {
                resources: ['1', '2']
            };
            const mockResponse = {
                data: {
                    data: {
                        id: 1,
                        name: { en: 'Test Code Set' },
                        status: 'active'
                    }
                }
            };

            CodeSetService.attachServiceCodes.mockResolvedValue(mockResponse);

            const result = await store.attachServiceCodes(entity, id, payload);

            expect(CodeSetService.attachServiceCodes).toHaveBeenCalledWith(
                entity,
                id,
                payload
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('detachServiceCodes', () => {
        it('calls CodeSetService.detachServiceCodes, shows success message, and returns the data', async () => {
            const entity = 'sets';
            const id = 1;
            const payload = {
                resources: ['1', '2']
            };
            const mockResponse = {
                data: {
                    data: {
                        id: 1,
                        name: { en: 'Test Code Set' },
                        status: 'active'
                    }
                }
            };

            CodeSetService.detachServiceCodes.mockResolvedValue(mockResponse);

            const result = await store.detachServiceCodes(entity, id, payload);

            expect(CodeSetService.detachServiceCodes).toHaveBeenCalledWith(
                entity,
                id,
                payload
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('importServiceCodes', () => {
        it('calls CodeSetService.importServiceCodes, shows success message, and returns the data', async () => {
            const payload = new FormData();
            const config = {
                headers: { 'Content-Type': 'multipart/form-data' }
            };
            const mockResponse = {
                data: {
                    data: {
                        id: 1,
                        import_log_id: '123'
                    }
                }
            };

            CodeSetService.importServiceCodes.mockResolvedValue(mockResponse);

            const result = await store.importServiceCodes(payload, config);

            expect(CodeSetService.importServiceCodes).toHaveBeenCalledWith(
                payload,
                config
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('checkImportLogStatus', () => {
        it('calls CodeSetService.checkImportLogStatus and returns the data', async () => {
            const import_log_id = '123';
            const mockResponse = {
                data: {
                    data: {
                        id: '123',
                        imported_at: '2023-01-01',
                        payload: { count: 10 }
                    }
                }
            };

            CodeSetService.checkImportLogStatus.mockResolvedValue(mockResponse);

            const result = await store.checkImportLogStatus(import_log_id);

            expect(CodeSetService.checkImportLogStatus).toHaveBeenCalledWith(
                import_log_id
            );
            expect(result).toEqual(mockResponse.data.data);
        });
    });
});
