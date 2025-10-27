import { reactive, ref } from 'vue';
import moment from 'moment-timezone';
import { defineStore, storeToRefs } from 'pinia';
import * as ClaimsService from '../services/Claim.service';
import { useGlobalStore } from '@/stores';
import { useI18n } from 'vue-i18n';
import * as SubmissionService from '@/modules/claims/services/Submission.service';
import { getSubmissionById } from '@/modules/claims/services/Submission.service';
import { storePayload, useMutation, useResource } from '@/modules/claims/utils';
import { PaginationOptions, SortFilterOptions } from '@/config/index.js';
import Claim from '@/modules/claims/views/claim.vue';

export const useClaimsStore = defineStore('ClaimsStore', () => {
    const logFunction = () => {
        ClaimsService.test();
    };

    return { logFunction };
});

export const useMsgStore = defineStore('ClaimsMsgStore', () => {
    let response = reactive({
        success: false,
        error: false,
        message: ''
    });

    const setMsg = (status, message) => {
        response.success = status === 'success';
        response.error = status === 'error';
        response.message = message;
    };

    return { setMsg, response };
});

export const noteStore = defineStore('NoteStore', () => {
    const isLoading = ref(false);
    const isError = ref(false);
    const isSuccess = ref(false);
    const error = ref(null);

    const { setMsg } = useMsgStore();

    const setLoading = (status = true) => {
        if (status) {
            isLoading.value = true;
            isSuccess.value = false;
            isError.value = false;
            error.value = null;
        } else {
            isLoading.value = false;
        }
    };

    const notes = ref([]);

    const getNotes = () => {
        notes.value = [];
        // notes.value = mock_data('notes');
    };
    getNotes();

    const createNote = async (payload) => {
        setLoading();

        payload = {
            id: notes.value.length + 1,
            name: 'David Smith',
            ...payload,
            date: moment().format('YYYY-MM-DD HH:mm:ss')
        };

        try {
            await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulated API call

            // PreValid8
            if (payload.type && payload.note) {
                notes.value.push(payload);
            } else {
                throw new Error('A field is empty');
            }
            isSuccess.value = true;
            setMsg('success', 'Note Successfully Added');
        } catch (e) {
            error.value = { field: {}, payload };
            if (!payload.type)
                error.value.field.type = 'Please select Note type.';
            if (!payload.note) error.value.field.note = 'Note is required.';
            // error.value = e;
            isError.value = true;
            setMsg('error', 'Some errors occurred while adding note');
            console.error('Error fetching data:', e);
        } finally {
            isLoading.value = false; // Directly reset the loading state
        }
    };

    return {
        notes,
        getNotes,
        createNote,
        isLoading,
        isSuccess,
        isError,
        error
    };
});

export const useNoteStore = () => {
    let store = noteStore();
    let state = storeToRefs(store);
    return { ...store, ...state };
};

export const taskStore = defineStore('taskStore', () => {
    const isLoading = ref(false);
    const isError = ref(false);
    const isSuccess = ref(false);
    const error = ref(null);

    const { setMsg } = useMsgStore();

    const setLoading = (status = true) => {
        if (status) {
            isLoading.value = true;
            isSuccess.value = false;
            isError.value = false;
            error.value = null;
        } else {
            isLoading.value = false;
        }
    };

    const tasks = ref([]);

    const getTasks = () => {
        tasks.value = [];
        // tasks.value = mock_data('tasks');
    };
    getTasks();

    const createTask = async (payload) => {
        setLoading();

        payload = {
            id: tasks.value.length + 1,
            ...payload,
            assign: payload.assign?.name,
            date: moment().format('YYYY-MM-DD HH:mm:ss'),
            due_date: payload.due_date
                ? moment(payload.due_date).format('YYYY-MM-DD HH:mm:ss')
                : ''
        };

        try {
            await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulated API call

            // PreValid8
            if (
                payload.title &&
                payload.description &&
                payload.assign &&
                payload.due_date
            ) {
                tasks.value.push(payload);
            } else {
                throw new Error('A field is empty');
            }
            isSuccess.value = true;
            setMsg('success', 'Task Successfully Added');
        } catch (e) {
            error.value = { field: {}, payload };
            if (!payload.title) error.value.field.title = 'Title is required.';
            if (!payload.description)
                error.value.field.description = 'Description is required.';
            if (!payload.assign)
                error.value.field.assign = 'Select who you are assigning to.';
            if (!payload.due_date)
                error.value.field.due_date = 'Select Due date.';
            // error.value = e;
            isError.value = true;
            setMsg('error', 'Some errors occurred while adding task');
            console.error('Error fetching data:', e);
        } finally {
            isLoading.value = false; // Directly reset the loading state
        }
    };

    return {
        tasks,
        getTasks,
        createTask,
        isLoading,
        isSuccess,
        isError,
        error
    };
});

export const useTaskStore = () => {
    let store = taskStore();
    let state = storeToRefs(store);
    return { ...store, ...state };
};

export const claimStore = defineStore('ClaimStore', () => {
    const globalStore = useGlobalStore();
    const { t, locale } = useI18n();

    const currentClaim = ref();
    const storedSelectedSubmissions = ref([]);

    /**
     * Set current claim
     * @param claim
     */
    const setCurrentClaim = (claim) => {
        currentClaim.value = claim;
    };

    /**
     * Get claims
     * @param payload
     * @returns {Promise<*|undefined>}
     */
    const getClaims = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await ClaimsService.getClaims(payload);
            return res.data;
        });
    };

    /**
     * Search claims
     * @param payload
     * @returns {Promise<*|undefined>}
     */
    const searchClaims = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await ClaimsService.searchClaims(payload);
            return res.data;
        });
    };

    const searchClaims_ = () => {
        const pagination = new PaginationOptions();
        const sortFilters = new SortFilterOptions();
        const { setPayload, getPayload } = storePayload();

        return useMutation(
            async (payload) => {
                setPayload(payload);
                let params = pagination.getPageParams();

                // Build sortFilters.filters
                const storePayload = getPayload();

                // Build filters dynamically from all payload keys
                sortFilters.filters = Object.keys(storePayload).map((key) => ({
                    field: storePayload[key]['field'],
                    value: storePayload[key]['value'],
                    type: storePayload[key]['type'] ?? 'and',
                    operator: storePayload[key]['operator'] ?? '='
                }));

                const mergedPayload = {
                    ...getPayload(),
                    ...sortFilters.getSortFilters()
                };

                const res = await ClaimsService.searchClaims(mergedPayload, {
                    ...params,
                    per_page: params.limit
                });
                return res.data;
            },
            null,
            pagination,
            sortFilters
        );
    };

    /**
     * Get claim by ID
     * @param tenantId
     * @param claimId
     * @param refresh
     * @returns Resource elements - { }data, loading, error, status }
     */
    const getClaimById = (tenantId, claimId, refresh = false) => {
        return useResource(
            globalStore.actionWrapper(async () => {
                const res = await ClaimsService.getClaimById(tenantId, claimId);
                return res.data;
            }),
            currentClaim,
            refresh
        );
    };

    /**
     * Create claim
     * @returns Mutation elements - {loading, mutate, status}
     */
    const createClaim = () => {
        return useMutation(async (payload) => {
            return globalStore.actionWrapper(async () => {
                const {
                    clientId,
                    user_id,
                    policy_id,
                    insured_id,
                    reserved_amount,
                    submission_ids
                } = payload;
                const res = await ClaimsService.createClaim(clientId, {
                    user_id,
                    policy_id,
                    insured_id,
                    reserved_amount,
                    submission_ids
                });

                globalStore.showSuccess(
                    t('notifications.create_claim'),
                    t('notifications.claim_created')
                );

                return res.data;
            });
        });
    };

    /**
     * Update claim
     * @param tenantId
     * @param claimId
     * @param payload
     * @returns {Promise<*|undefined>}
     */
    const updateClaim = (tenantId, claimId, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await ClaimsService.updateClaim(
                tenantId,
                claimId,
                payload
            );
            return res.data;
        });
    };

    /**
     * Update claim reserved amount
     * @payload { tenantId, claimId, amount }
     * @returns Mutation elements - {loading, mutate, status}
     */
    const updateReservedAmount = () => {
        return useMutation(async (payload) => {
            const { clientId, claimId, reserved_amount, user_id, reason } =
                payload;
            const res = await ClaimsService.updateReservedAmount(
                clientId,
                claimId,
                { user_id, reserved_amount, reason }
            );

            globalStore.showSuccess(
                t('notifications.update_reserved_amount'),
                t('notifications.reserved_amount_update')
            );

            return res.data;
        }, currentClaim);
    };

    /**
     * Move submissions to claim
     * @payload { client_id, claim_id, user_id, target_claim_id, submission_ids }
     * @returns Mutation elements - {loading, mutate, status}
     */
    const moveSubmissionsToClaim = () => {
        return useMutation(async (payload) => {
            return await globalStore.actionWrapper(async () => {
                const {
                    client_id,
                    claim_id,
                    user_id,
                    target_claim_id,
                    submission_ids
                } = payload;
                const res = await ClaimsService.moveSubmissionsToClaim(
                    client_id,
                    claim_id,
                    { user_id, target_claim_id, submission_ids }
                );

                globalStore.showSuccess(
                    t('notifications.move_submissions'),
                    t('notifications.submissions_moved')
                );

                getClaimById(client_id, target_claim_id, true);
                return res.data;
            });
        });
    };

    /**
     * Search within claim
     * @payload { clientId, claimId, search_value }
     * @returns Mutation elements - {loading, mutate, status}
     */
    const searchWithinClaims = () => {
        return useMutation(async ({ clientId, claimId, search_value }) => {
            return globalStore.actionWrapper(async () => {
                const res = await ClaimsService.searchWithinClaims(
                    clientId,
                    claimId,
                    { search: { value: search_value } }
                );
                // console.log('CSearch', res.data?.data);
                if (res.data?.data) setCurrentClaim(res.data?.data);
                return res.data;
            });
        });
    };

    /**
     * Export claims
     * @param payload
     * @returns {Promise<*|undefined>}
     */
    const exportClaims = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await ClaimsService.exportClaims(payload);

            globalStore.showSuccess(
                t('notifications.export_success'),
                t('notifications.export_success_message')
            );
            return res.data.export_log_id;
        });
    };

    return {
        currentClaim,
        storedSelectedSubmissions,

        setCurrentClaim,
        getClaims,
        searchClaims,
        searchClaims_,
        getClaimById,
        searchWithinClaims,
        createClaim,
        updateClaim,
        updateReservedAmount,
        moveSubmissionsToClaim,
        exportClaims
    };
});

export const useClaimStore = () => {
    let store = claimStore();
    let state = storeToRefs(store);
    return { ...store, ...state };
};
