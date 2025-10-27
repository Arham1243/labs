import { defineStore, storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useGlobalStore } from '@/stores';
import { useClaimNoteStore } from '@/modules/claims/stores/ClaimNote';
import * as ExpenseService from '@/modules/claims/services/Expense.service';
import { storePayload, useMutation, useResource } from '@/modules/claims/utils';
import helpers from '@/utils/helpers';
import { useSubmissionStore } from '@/modules/claims/stores/Submission';
import { PaginationOptions, SortFilterOptions } from '@/config/index.js';

export const expenseStore = defineStore('ExpenseStore', () => {
    const globalStore = useGlobalStore();
    const { t } = useI18n();
    const submissionStore = useSubmissionStore();
    const { createClaimNote } = useClaimNoteStore();
    const { mutate: createClaimNoteMutation } = createClaimNote();

    const runningTotal = ref(0);
    const progressBarPercentage = ref(0);
    const reservedAmt = ref(11000);

    const currentExpenses = ref([]);
    const currentExpense = ref();
    const historyExpenses = ref([]);
    const currentBenefit = ref();

    /**
     * Set current expenses under submission
     * @param expenses
     */
    const setCurrentExpenses = (expenses) => {
        currentExpenses.value = expenses;
    };

    /**
     * Set current expense
     * @param expense
     */
    const setCurrentExpense = (expense) => {
        currentExpense.value = expense;
    };

    /**
     * Get expenses
     * @param payload
     * @param refresh
     * @returns Resource elements - { } data, loading, error, status }
     */
    const getExpenses = (payload, refresh = false) => {
        return useResource(
            globalStore.actionWrapper(async () => {
                const res = await ExpenseService.getExpenses(payload);
                return res.data;
            }),
            historyExpenses,
            refresh
        );
    };

    /**
     * Search expenses (with pagination and sort filters)
     * @params ()
     * @returns Mutation elements - {loading, data, meta, error, status, mutate}
     */
    const searchExpenses = () => {
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
                sortFilters.filters = Object.keys(storePayload)
                    .filter((key) => storePayload[key]['field'] !== 'perPage')
                    .filter((key) => storePayload[key]['field'] !== 'clientId')
                    .map((key) => ({
                        field: storePayload[key]['field'],
                        value: storePayload[key]['value'],
                        type: storePayload[key]['type'] ?? 'and',
                        operator: storePayload[key]['operator'] ?? '='
                    }));

                if (storePayload.clientId) {
                    sortFilters.sort = sortFilters.sort.map((s) => {
                        if (s.field === 'approved') {
                            return { ...s, field: 'total_approved' };
                        }
                        if (s.field === 'declined') {
                            return { ...s, field: 'total_declined' };
                        }
                        if (s.field === 'amount_claimed') {
                            return { ...s, field: 'total_amount_sum' };
                        }
                        if (s.field === 'amount_approved') {
                            return { ...s, field: 'total_approved_amount_sum' };
                        }
                        return s;
                    });
                }

                // Get client id from storePayload if exists
                const clientId = storePayload.find(
                    (item) => item.field === 'clientId'
                )?.value;

                const res = await ExpenseService.searchExpenses(
                    sortFilters.getSortFilters(),
                    {
                        ...params,
                        per_page: storePayload.perPage
                            ? storePayload.perPage
                            : params.limit
                    },
                    clientId
                );
                return res.data;
            },
            null,
            pagination,
            sortFilters
        );
    };

    /**
     * Get expense by ID
     * @param tenantId
     * @param expenseId
     * @param refresh
     * @returns Resource elements - { }data, loading, error, status }
     */
    const getExpenseById = (tenantId, expenseId, refresh = false) => {
        return useResource(
            globalStore.actionWrapper(async () => {
                const res = await ExpenseService.getExpenseById(
                    tenantId,
                    expenseId
                );
                await searchExpenseBenefit(tenantId, res.data.data.benefit.id);
                return res.data;
            }),
            currentExpense,
            refresh
        );
    };

    /**
     * Create expense
     * @param tenantId
     * @param payload
     * @returns {Promise<*|undefined>}
     */
    const createExpense = (tenantId, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await ExpenseService.createExpense(tenantId, payload);

            // Show success notification
            globalStore.showSuccess(
                t('notifications.new_expense'),
                t('notifications.expense_added')
            );

            // Update the current expenses list
            currentExpenses.value.push(res.data.data);

            // Update the current expense
            setCurrentExpense(res.data.data);

            // Update the running total
            submissionStore.currentSubmission.expense_total +=
                res.data.data.amount_claimed;

            return res.data;
        });
    };

    /**
     * Update expense
     * @payload { tenantId, claimId, amount }
     * @returns Mutation elements - {loading, mutate, status}
     */
    const updateExpense = () => {
        return useMutation(async (payload) => {
            return globalStore.actionWrapper(async () => {
                const { tenantId, expenseId, formData } = payload;
                const res = await ExpenseService.updateExpense(
                    tenantId,
                    expenseId,
                    formData
                );

                // // Show success notification
                // globalStore.showSuccess(
                //     t('notifications.diagnosis_changed'),
                //     t('notifications.diagnosis_updated')
                // );

                // Update the current expense
                setCurrentExpense(res.data.data);

                // Update the current expense on the current expenses list
                currentExpenses.value.splice(
                    currentExpenses.value.findIndex(
                        (expense) => expense.id === expenseId
                    ),
                    1,
                    res.data.data
                );

                // Update current expense
                setCurrentExpense(res.data.data);

                return res.data;
            });
        });
    };

    /**
     * Change expense status
     * @payload { tenantId, claimId, amount }
     * @returns Mutation elements - {loading, mutate, status}
     */
    const changeExpenseStatus = () => {
        return useMutation(async (payload) => {
            const { tenantId, expenseId, formData } = payload;
            return globalStore.actionWrapper(async () => {
                const res = await ExpenseService.changeExpenseStatus(
                    tenantId,
                    expenseId,
                    formData
                );

                // Update the current expense
                setCurrentExpense(res.data.data);

                // Update the current expense on the current expenses list
                currentExpenses.value.splice(
                    currentExpenses.value.findIndex(
                        (expense) => expense.id === expenseId
                    ),
                    1,
                    res.data.data
                );

                if (formData.status === 'approved') {
                    //Refresh Expense
                    await searchExpenseBenefit(
                        tenantId,
                        currentExpense.value.benefit.id
                    );

                    // Show success notification
                    globalStore.showSuccess(
                        t('notifications.expense_approved'),
                        t('notifications.expense_total_amount_approved', {
                            amount:
                                helpers.moneyFormat(
                                    formData.amount_approved -
                                        formData.amount_co_pay
                                ) + 'CAD'
                        })
                    );

                    // Update the running total
                    submissionStore.currentSubmission.running_total +=
                        formData.amount_approved;
                } else if (formData.status === 'declined') {
                    // Create claim notes for declined expense with the decline reason
                    const notes = {
                        user_id: formData.user_id,
                        content: formData.decline_reason
                    };

                    await createClaimNoteMutation({
                        clientId: tenantId,
                        objectId: expenseId,
                        notes: notes,
                        noteType: 'expense'
                    });

                    // Show success notification
                    globalStore.showSuccess(
                        t('notifications.expense_status_updated'),
                        t('notifications.expense_declined')
                    );
                }

                return res.data;
            });
        });
    };

    /**
     * Calculate expenses amount
     * @param expenses
     * @returns {{runningTotal: Ref<UnwrapRef<number>, UnwrapRef<number> | number>, expenseTotal: Ref<UnwrapRef<number>, UnwrapRef<number> | number>}}
     */
    const calculateExpensesAmount = (expenses) => {
        const runningTotal = ref(0);
        const expenseTotal = ref(0);

        // Calculate running total and expense total
        expenses.forEach(function (item) {
            runningTotal.value += parseInt(item.amount_approved);
            expenseTotal.value += parseInt(item.amount_claimed);
        });

        return {
            runningTotal,
            expenseTotal
        };
    };

    const searchExpenseBenefit = async (clientId, benefitId) => {
        let payload = {
            filters: [
                {
                    field: 'benefit_id',
                    value: benefitId
                }
            ]
        };
        const benefit = await ExpenseService.searchExpenses(
            payload,
            null,
            clientId
        );
        currentBenefit.value = benefit.data.data[0];
    };

    return {
        currentExpenses,
        currentExpense,
        historyExpenses,
        runningTotal,
        reservedAmt,
        progressBarPercentage,
        currentBenefit,

        setCurrentExpenses,
        setCurrentExpense,
        getExpenses,
        searchExpenses,
        getExpenseById,
        createExpense,
        updateExpense,
        changeExpenseStatus,
        calculateExpensesAmount,
        searchExpenseBenefit
    };
});

export const useExpenseStore = () => {
    let store = expenseStore();
    let state = storeToRefs(store);
    return { ...store, ...state };
};
