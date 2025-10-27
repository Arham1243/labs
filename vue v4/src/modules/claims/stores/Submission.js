import { ref } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import { useGlobalStore } from '@/stores';
import { useClaimStore } from '@/modules/claims/stores/Claim';
import { useExpenseStore } from '@/modules/claims/stores/Expense';
import { useMutation, useResource, storePayload } from '@/modules/claims/utils';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useHelpers } from '@/composables';
import { formatLabel } from '@/modules/claims/utils/helper';
import { PaginationOptions, SortFilterOptions } from '@/config';
import * as ClaimsService from '@/modules/claims/services/Claim.service';
import * as SubmissionService from '../services/Submission.service';
import * as ExpenseService from '@/modules/claims/services/Expense.service';

// Starting Submission Data
const newSubmissionData = {
    policy_id: '',
    insured_id: '',
    provider_id: 173150959834000,
    currency_id: 'CAD',
    currency: { id: 'CAD', name: 'CAD - Canadian dollar, $', symbol: '$' },
    source: 'mobile_app',
    expenses: [
        {
            service_date: '',
            description: '',
            amount: '',
            diagnosis: 'this is a test diagnosis',
            benefit_id: '', //
            beneficiary_id: 173150959834000,
            service_code_id: 173150959834000,
            payment_method_id: 173150959834000,
            is_payee_self: true,
            attachments: [] // eg: { "path": "s3/test", "type": "claim_form" }
        }
    ],
    attachments: [], // eg: { "path": "s3/test", "type": "claim_form" },
    // notes: [ { content: "" } ],
    secondary_insurance: {
        provider: '',
        policy_number: '',
        group_number: '',
        details: ''
    },
    payee: {
        payee: '',
        payment_method: '',
        document: '',
        other_info: {}
    },
    formData: {} // will be removed before submission
};

/**
 * get new submission data (also check local storage) and set in store as newSubmission
 * @returns data - either starting data or from local storage
 */
const getNewSubmission = () => {
    let data = { ...newSubmissionData };
    const { query } = useRoute();

    if (localStorage.getItem('newSubmission')) {
        let localData = JSON.parse(localStorage.getItem('newSubmission'));

        if (localData.policy_id === query.policy_id) {
            data = localData;
            // check for date in formData and update as date format
            if (data.formData.details?.expenses?.[0]?.service_date) {
                data.formData.details.expenses =
                    data.formData.details.expenses.map((expense) => ({
                        ...expense,
                        service_date: new Date(expense.service_date)
                    }));
            }
        }
    }
    return data;
};

export const submissionStore = defineStore('SubmissionStore', () => {
    const globalStore = useGlobalStore();
    const { t } = useI18n();
    const claimStore = useClaimStore();
    const expenseStore = useExpenseStore();
    const helpers = useHelpers();

    const currentSubmission = ref();
    const currentSubmissions = ref([]);
    const submissionSources = ref([]);

    // Creating a new Submission
    const newSubmission = ref(getNewSubmission());

    // This states the validated level to enable Btn (because btn is a parent level)
    const newSubmissionBtn = ref(-1);

    /**
     * Reset submission data
     * @void
     */
    const resetSubmissionData = () => {
        newSubmission.value = {
            ...JSON.parse(JSON.stringify({ ...newSubmissionData }))
        };
    };

    /**
     * Update expense data in newSubmissions
     * @void
     */
    const setSubmissionExpenseData = (formData, index) => {
        if (!newSubmission.value.expenses[index])
            newSubmission.value.expenses[index] = {};

        newSubmission.value.expenses[index].amount = formData.visit_cost ?? '';
        newSubmission.value.expenses[index].benefit_id =
            formData.medical_service_type?.id ?? '';
        newSubmission.value.expenses[index].service_code_id =
            formData.service_code?.id ?? '';
        newSubmission.value.expenses[index].service_date = formData.service_date
            ? helpers.parseDate(formData.service_date)
            : '';
        newSubmission.value.currency_id = formData.receipt_currency?.id ?? '$';
        // newSubmission.value.currency = formData.receipt_currency ?? { id: "CAD", name: "CAD - Canadian dollar, $", symbol: "$" };
        newSubmission.value.expenses[index].description =
            formData.additional_details ?? '';
        newSubmission.value.expenses[index].attachments = formData
            .expense_attachments?.length
            ? formData.expense_attachments
            : [];

        // Test Data
        newSubmission.value.expenses[index].diagnosis =
            'this is a test diagnosis';
        newSubmission.value.expenses[index].beneficiary_id = 173150959834000;
        newSubmission.value.expenses[index].payment_method_id = 173150959834000;
        newSubmission.value.expenses[index].is_payee_self = true;
    };

    /**
     * Set current submission
     * @param submission
     */
    const setCurrentSubmission = (submission) => {
        currentSubmission.value = submission;
    };

    /**
     * Get submissions
     * @param payload
     * @param refresh
     * @returns Resource elements - { }data, loading, error, status }
     */
    const getSubmissions = (payload, refresh = true) => {
        return useResource(
            globalStore.actionWrapper(async () => {
                const res = await SubmissionService.getSubmissions(payload);

                return res.data;
            }),
            currentSubmissions,
            refresh
        );
    };

    /**
     * Search submissions (with pagination and sort filters)
     * @params ()
     * @returns Mutation elements - {loading, data, meta, error, status, mutate}
     */
    const searchSubmissions = () => {
        const pagination = new PaginationOptions();
        const sortFilters = new SortFilterOptions();
        const { setPayload, getPayload } = storePayload();

        return useMutation(
            async (payload) => {
                setPayload(payload);
                let params = pagination.getPageParams();

                // Build sortFilters.filters
                const storePayload = getPayload();

                // // Build filters dynamically from all payload keys
                // sortFilters.filters = Object.keys(storePayload).map((key) => ({
                //     field: key,
                //     value: storePayload[key],
                //     type: 'and'
                // }));

                // Build filters dynamically from all payload keys
                sortFilters.filters = Object.keys(storePayload).map((key) => ({
                    field: storePayload[key]['field'],
                    value: storePayload[key]['value'],
                    type: storePayload[key]['type'] ?? 'and',
                    operator: storePayload[key]['operator'] ?? '='
                }));

                sortFilters.sort = sortFilters.sort.map((s) => {
                    if (s.field === 'amount_approved') {
                        return { ...s, field: 'total_approved' };
                    }
                    if (s.field === 'amount_claimed') {
                        return { ...s, field: 'total_claimed' };
                    }
                    return s;
                });

                sortFilters.sort = [
                    ...sortFilters.sort,
                    { field: 'updated_at', direction: 'desc' }
                ];

                const mergedPayload = {
                    ...getPayload(),
                    ...sortFilters.getSortFilters()
                };

                const res = await SubmissionService.searchSubmissions(
                    mergedPayload,
                    {
                        ...params,
                        per_page: params.limit
                    }
                );
                return res.data;
            },
            null,
            pagination,
            sortFilters
        );
    };

    /**
     * Get submission by ID
     * @param tenantId
     * @param submissionId
     * @param refresh
     * @returns Resource elements - { data, loading, error, status }
     */
    const getSubmissionById = (tenantId, submissionId, refresh = false) => {
        return useResource(
            globalStore.actionWrapper(async () => {
                const res = await SubmissionService.getSubmissionById(
                    tenantId,
                    submissionId
                );

                // Get claim details
                if (res.data.data.claim_id) {
                    const claim = await ClaimsService.getClaimById(
                        tenantId,
                        res.data.data.claim_id
                    );
                    res.data.data.claim = claim.data.data;
                    claimStore.setCurrentClaim(claim.data.data);
                }

                // Set current expenses
                const expenses = await ExpenseService.searchExpenses(
                    {
                        filters: [
                            { field: 'submission_id', value: res.data.data.id }
                        ]
                    },
                    { per_page: 1000 }
                );
                expenseStore.setCurrentExpenses(expenses.data.data);

                return res.data;
            }),
            currentSubmission,
            refresh
        );
    };

    /**
     * Move submission to another claim
     * @payload { client_id, submission_id, claim_id, user_id }
     * @returns Mutation elements - {loading, mutate, status}
     */
    const moveSubmissionToClaim = () => {
        return useMutation(async (payload) => {
            return await globalStore.actionWrapper(async () => {
                const { client_id, submission_id, claim_id, user_id } = payload;
                const res = await SubmissionService.moveSubmissionToClaim(
                    client_id,
                    submission_id,
                    {
                        claim_id: claim_id,
                        user_id: user_id
                    }
                );

                globalStore.showSuccess(
                    t('notifications.move_submissions'),
                    t('notifications.submissions_moved')
                );

                return res.data;
            });
        });
    };

    /**
     * Create submission
     * @params (clientId, userId)
     * @returns {Promise<*|undefined>}
     */
    const createSubmission = (clientId, userId) => {
        return useMutation(async () => {
            return globalStore.actionWrapper(async () => {
                // Add submittable data
                newSubmission.value.submittable_id = userId;
                newSubmission.value.submittable_type = 'user';

                const res = await SubmissionService.createSubmission(
                    clientId,
                    newSubmission.value
                );

                // Show success notification
                globalStore.showSuccess(
                    t('notifications.create_submission'),
                    t('notifications.submission_created')
                );

                // Assign submission to examiner
                if (res.data.data.id) {
                    const examiner =
                        await SubmissionService.assignSubmissionToExaminer(
                            clientId,
                            res.data.data.id,
                            { user_id: userId }
                        );
                    resetSubmissionData();
                }

                return res.data;
            });
        });
    };

    /**
     * Assign submission to examiner
     * @payload { client_id, submission_id, user_id }
     * @returns Mutation elements - {loading, mutate, status}
     */
    const assignSubmissionToExaminer = () => {
        return useMutation(async (payload) => {
            return globalStore.actionWrapper(async () => {
                const { client_id, submission_id, user_id } = payload;
                const res = await SubmissionService.assignSubmissionToExaminer(
                    client_id,
                    submission_id,
                    { user_id: user_id }
                );
                return res.data;
            });
        });
    };

    /**
     * Get submission source
     * @returns Resource elements - { }data, loading, error, status }
     */
    const getSubmissionSources = () => {
        return useResource(
            globalStore.actionWrapper(async () => {
                const res = await SubmissionService.getSubmissionSources();
                const arraySources = ref({ data: [] });

                // Build submission sources array
                arraySources.value.data = res.data.data.map((source) => ({
                    id: source,
                    name: formatLabel(source)
                }));

                return arraySources.value;
            }),
            submissionSources,
            true
        );
    };

    /**
     * Change audit submission status
     * @params ()
     * @return Mutation elements - {loading, mutate, status}
     */
    const changeQueueSubmissionStatus = () => {
        return useMutation(async (payload) => {
            return globalStore.actionWrapper(async () => {
                const { client_id, submission_id, audit_status } = payload;
                const res = await SubmissionService.changeQueueSubmissionStatus(
                    client_id,
                    submission_id,
                    payload
                );

                if (audit_status === 'audited_declined') {
                    globalStore.showError(
                        t('notifications.assessment_declined'),
                        t('notifications.assessment_declined_message')
                    );
                } else if (audit_status === 'audited_completed') {
                    globalStore.showSuccess(
                        t('notifications.assessment_approved'),
                        t('notifications.assessment_approved_message')
                    );
                }

                return res.data;
            });
        });
    };

    /**
     * Export submissions
     * @param payload
     * @returns {Promise<*|undefined>}
     */
    const exportSubmissions = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await SubmissionService.exportSubmissions(payload);

            globalStore.showSuccess(
                t('notifications.export_success'),
                t('notifications.export_success_message')
            );
            return res.data.export_log_id;
        });
    };

    return {
        newSubmission,
        newSubmissionBtn,
        currentSubmission,
        currentSubmissions,
        submissionSources,

        setCurrentSubmission,
        getSubmissions,
        getSubmissionById,
        searchSubmissions,
        createSubmission,
        resetSubmissionData,
        setSubmissionExpenseData,
        moveSubmissionToClaim,
        assignSubmissionToExaminer,
        getSubmissionSources,
        changeQueueSubmissionStatus,
        exportSubmissions
    };
});

export const useSubmissionStore = () => {
    let store = submissionStore();
    let state = storeToRefs(store);
    return { ...store, ...state };
};
