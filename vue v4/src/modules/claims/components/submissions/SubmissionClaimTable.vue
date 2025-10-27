<script setup>
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { computed, ref, watch } from 'vue';
import { useHelpers } from '@/composables';
import { useSubmissionStore } from '@/modules/claims/stores/Submission.js';
import { useExpenseStore } from '@/modules/claims/stores/Expense.js';
import { useClaimStore } from '@/modules/claims/stores/Claim';
import {
    createExpenseCols,
    createExpenseTotalsCols
} from '@/modules/claims/config/expenses.js';
import ClaimStatusTag from '@/modules/claims/components/shared/ClaimStatusTag.vue';
import ClaimBaseTable from '@/modules/claims/components/shared/ClaimBaseTable.vue';

let { params } = useRoute();

// Define props
const props = defineProps({
    claimId: { type: [String, Number] },
    isFromClaimHistory: { type: Boolean },
    expandAllTables: { type: Boolean } // Prop from parent
});

const menu = ref();
const { t } = useI18n();
const router = useRouter();
const helpers = useHelpers();
const expenseColumns = createExpenseCols(t);
const expenseColumnsTotal = createExpenseTotalsCols(t);
const emits = defineEmits(['scrollToClaimsTab']);
const { searchSubmissions } = useSubmissionStore();
const { searchExpenses } = useExpenseStore();
const { storedSelectedSubmissions, searchClaims_ } = useClaimStore();

const {
    mutate: searchClaimSubmissionsMutation,
    data: submissions,
    status: loadSubmissionStatus,
    onSearch
} = searchSubmissions();

const getColumns = (type) => {
    return expenseColumns[type]?.() || [];
};

const getColumnsTotal = (submission) => {
    const valueMap = {
        amount_claimed: submission?.amount_claimed,
        amount_approved: submission?.amount_approved,
        diagnosis: ''
    };

    return expenseColumnsTotal.map((col) => ({
        ...col,
        ...(valueMap[col.label] !== undefined && { field: valueMap[col.label] })
    }));
};

// Bulk action dropdown menus
const menuItems = computed(() => {
    return [
        {
            label: t('submissions.move'),
            icon: 'pi pi-arrow-up',
            command: () => {
                emits('scrollToClaimsTab');
            }
        },
        {
            label: t('submissions.merge'),
            icon: 'pi pi-window-minimize'
        }
    ];
});

let searchText = ref();
let searchLoading = ref(false);

// Pagination
const rows = ref(5);
const first = ref(0);

// Show/Hide Actions
let showTable = ref({});

watch(
    () => props.claimId,
    (newClaimId) => {
        if (newClaimId) {
            searchClaimSubmissionsMutation([
                { field: 'claim_id', value: newClaimId }
            ]);
        } else {
            searchClaimSubmissionsMutation([
                { field: 'claim_id', value: params.claimId }
            ]);
        }
    },
    { immediate: true }
);

watch(
    () => loadSubmissionStatus,
    () => {
        if (loadSubmissionStatus.value === 'success') {
            showTable.value = submissions.value.reduce((sub, item) => {
                sub[item.id] = false;
                return sub;
            }, {});
        }
    },
    { immediate: true, deep: true }
);

// Control show/hide of all tables
const showAllTables = (action) => {
    showTable.value = submissions.value.reduce((sub, item) => {
        sub[item.id] = action;
        return sub;
    }, {});
};
defineExpose({ showAllTables });

// Watch for submission selected
const selectedItems = ref([]);
const isAnySelected = computed(() => selectedItems.value.length > 0);

/**
 * Show bulk action menu
 * @param event
 */
const showMenu = (event) => {
    menu.value.toggle(event);
};

/**
 * Watch for changes in `selectedItems`
 */
watch(
    () => selectedItems,
    (newValue) => {
        storedSelectedSubmissions.value = newValue.value;
    },
    { deep: true }
);
</script>

<template>
    <!-- Bulk Actions + Search Bar -->
    <div
        class="flex align-items-center justify-between bg-gray-50 p-3 my-3"
        v-if="!props.isFromClaimHistory"
    >
        <div class="flex gap-3">
            <Button
                :label="$t('claims.bulk_actions')"
                icon="pi pi-chevron-down"
                icon-pos="right"
                size="small"
                outlined
                :disabled="!isAnySelected"
                @click="showMenu"
                data-testid="btn-bulk-actions"
            />
            <Menu
                ref="menu"
                id="overlay_menu"
                :model="menuItems"
                :popup="true"
                class="w-10rem"
                data-testid="menu-bulk-actions"
            />
            <Button
                label="Filter"
                icon="pi pi-filter"
                size="small"
                outlined
                data-testid="btn-filter-action"
            />
        </div>

        <Search
            v-model="searchText"
            @search="onSearch(searchText)"
            :icon-after="
                searchLoading
                    ? 'pi pi-spin pi-spinner'
                    : searchText
                      ? 'pi pi-times'
                      : ''
            "
            :style="{ width: '15vw' }"
        />
    </div>

    <!-- If no submissions -->
    <div
        v-if="!submissions || submissions.length === 0"
        class="p-3 text-left text-gray-500"
    >
        {{ $t('submissions.no_submission_found') }}
    </div>

    <div
        v-else
        v-for="submission in submissions.slice(first, rows + rows * first)"
        :key="submission.id"
        class="mt-2"
    >
        <div class="flex justify-between bg-gray-100 p-3">
            <div class="flex items-center gap-2">
                <checkbox
                    v-model="selectedItems"
                    v-if="!props.isFromClaimHistory"
                    data-testid="checkbox-submissions"
                    :value="submission.id"
                />
                <a
                    class="cursor-pointer pi"
                    :class="
                        showTable[submission.id]
                            ? 'pi-chevron-down'
                            : 'pi-chevron-right'
                    "
                    @click="
                        showTable[submission.id] = !showTable[submission.id]
                    "
                />
                <div>
                    <div class="flex items-center gap-2">
                        <h6
                            class="text-lg"
                            data-testid="text-submissions-title"
                        >
                            {{ $t('submissions.submission_id') }}
                            <RouterLink
                                :to="`/claims/submissions/${submission.id}/client/${params.clientId}`"
                            >
                                {{ submission.submission_ref_number }}
                            </RouterLink>
                        </h6>
                        <ClaimStatusTag :status="submission.status" />
                    </div>

                    <div
                        class="text-sm font-normal"
                        data-testid="text-submissions-examiner"
                    >
                        {{ $t('submissions.examiner') }}:
                        {{ submission.assigned_to_user_name }}
                    </div>
                </div>
            </div>
            <div class="text-sm text-right line-height-3">
                <a
                    class="underline font-bold"
                    data-testid="text-submissions-beneficiary"
                >
                    <!-- Placeholder for beneficiary name -->
                    Beneficiary name goes here
                </a>
                <div
                    class="font-normal"
                    data-testid="text-submissions-claim-amt"
                >
                    {{ $t('claims.total') }}:
                    {{ helpers.moneyFormat(submission.amount_claimed) }}
                    &nbsp;•&nbsp; {{ $t('benefits.approved') }}:
                    {{ helpers.moneyFormat(submission.amount_approved) }}
                </div>
            </div>
        </div>

        <ClaimBaseTable
            :module="t('expenses.title')"
            v-if="showTable[submission.id]"
            class="mb-3"
            :hideFilterBar="true"
            :hidePagination="true"
            :columns="getColumns('regularExpense')"
            :columnsTotal="getColumnsTotal(submission)"
            :storeAction="searchExpenses"
            :payload="[
                { field: 'submission_id', value: submission.id },
                { field: 'perPage', value: 200 }
            ]"
            :onRowSelectAction="
                (event) => {
                    router.push(
                        `/claims/submissions/${submission.id}/expenses/${event.data.id}/client/${params.clientId}`
                    );
                }
            "
        />
    </div>

    <!-- Paginator only if submissions -->
    <Paginator
        class="claim-paginator"
        v-if="!props.isFromClaimHistory && submissions?.length"
        v-model:rows="rows"
        v-model:first="first"
        :totalRecords="submissions?.length"
        :rowsPerPageOptions="[1, 5, 10]"
        template=" FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
        data-testid="paginator-actions"
    />
</template>
<style>
.claim-paginator .p-paginator-current {
  padding-right: 5px !important;
}
</style>

