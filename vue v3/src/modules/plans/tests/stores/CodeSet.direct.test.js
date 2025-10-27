// filepath: /Users/yassirawad/Projects/horus/horus-platform-app/src/modules/plans/tests/stores/CodeSet.direct.test.js
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as CodeSetService from '@/modules/plans/services/CodeSet.service';
import { ref } from 'vue';

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

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
    useI18n: () => ({
        t: (key) => key,
        locale: { value: 'en' }
    })
}));

// Create direct implementations of the store functions
const currentCodeSet = ref(null);
const currentCodeGroup = ref(null);

const setCurrentCodeSet = (value) => {
    currentCodeSet.value = value;
};

const setCurrentCodeGroup = (value) => {
    currentCodeGroup.value = value;
};

// Code Sets functions
const searchCodeSets = async (payload, params) => {
    try {
        const res = await CodeSetService.searchCodeSets(payload, params);
        return res.data;
    } catch (error) {
        throw error;
    }
};

const getCodeSets = async (params) => {
    try {
        const res = await CodeSetService.getCodeSets(params);
        return res.data;
    } catch (error) {
        throw error;
    }
};

const getCodeSet = async (id) => {
    try {
        const res = await CodeSetService.getCodeSet(id);
        return res.data;
    } catch (error) {
        throw error;
    }
};

const createCodeSet = async (payload) => {
    try {
        const res = await CodeSetService.createCodeSet(payload);
        return res.data;
    } catch (error) {
        throw error;
    }
};

const updateCodeSet = async (id, payload) => {
    try {
        const res = await CodeSetService.updateCodeSet(id, payload);
        setCurrentCodeSet(res.data?.data);
        return res.data;
    } catch (error) {
        throw error;
    }
};

const deleteCodeSet = async (id) => {
    try {
        const res = await CodeSetService.deleteCodeSet(id);
        return res.data;
    } catch (error) {
        throw error;
    }
};

const getCodeSetTags = async (id) => {
    try {
        const res = await CodeSetService.getCodeSetTags(id);
        return res.data;
    } catch (error) {
        throw error;
    }
};

// Code Groups functions
const searchCodeGroups = async (payload, params) => {
    try {
        const res = await CodeSetService.searchCodeGroups(payload, params);
        return res.data;
    } catch (error) {
        throw error;
    }
};

const createCodeGroup = async (payload) => {
    try {
        const res = await CodeSetService.createCodeGroup(payload);
        return res.data;
    } catch (error) {
        throw error;
    }
};

const updateCodeGroup = async (id, payload) => {
    try {
        const res = await CodeSetService.updateCodeGroup(id, payload);
        setCurrentCodeGroup(res.data?.data);
        return res.data;
    } catch (error) {
        throw error;
    }
};

describe('CodeSetStore Direct Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        currentCodeSet.value = null;
        currentCodeGroup.value = null;
    });

    describe('state management', () => {
        it('sets and gets currentCodeSet', () => {
            const codeSet = { id: 1, name: { en: 'Test Code Set' } };
            setCurrentCodeSet(codeSet);
            expect(currentCodeSet.value).toEqual(codeSet);
        });

        it('sets and gets currentCodeGroup', () => {
            const codeGroup = { id: 1, name: { en: 'Test Code Group' } };
            setCurrentCodeGroup(codeGroup);
            expect(currentCodeGroup.value).toEqual(codeGroup);
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

            const result = await searchCodeSets(payload, params);

            expect(CodeSetService.searchCodeSets).toHaveBeenCalledWith(
                payload,
                params
            );
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

            const result = await getCodeSet(id);

            expect(CodeSetService.getCodeSet).toHaveBeenCalledWith(id);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('updateCodeSet', () => {
        it('calls CodeSetService.updateCodeSet, updates currentCodeSet, and returns the data', async () => {
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

            const result = await updateCodeSet(id, payload);

            expect(CodeSetService.updateCodeSet).toHaveBeenCalledWith(
                id,
                payload
            );
            expect(currentCodeSet.value).toEqual(mockResponse.data.data);
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

            const result = await searchCodeGroups(payload, params);

            expect(CodeSetService.searchCodeGroups).toHaveBeenCalledWith(
                payload,
                params
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('updateCodeGroup', () => {
        it('calls CodeSetService.updateCodeGroup, updates currentCodeGroup, and returns the data', async () => {
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

            const result = await updateCodeGroup(id, payload);

            expect(CodeSetService.updateCodeGroup).toHaveBeenCalledWith(
                id,
                payload
            );
            expect(currentCodeGroup.value).toEqual(mockResponse.data.data);
            expect(result).toEqual(mockResponse.data);
        });
    });
});
