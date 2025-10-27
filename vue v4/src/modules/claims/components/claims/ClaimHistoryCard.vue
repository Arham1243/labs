<script setup>
import { watch, ref, inject, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHelpers } from '@/composables';
import { useRoute, useRouter } from 'vue-router';
import { useClaimStore } from '@/modules/claims/stores/Claim';
import { useSubmissionStore } from '@/modules/claims/stores/Submission';
import { useClaimInsuredStore } from '@/modules/claims/stores/Insured';
import { exportOptions } from '@/config';
import ClaimStatusTag from '@/modules/claims/components/shared/ClaimStatusTag.vue';
import SubmissionClaimTable from '@/modules/claims/components/submissions/SubmissionClaimTable.vue';
import ClaimMeterReservedAmount from '@/modules/claims/components/claims/ClaimMeterReservedAmount.vue';
import SearchableFieldDialog from '@/modules/claims/components/shared/SearchableFieldDialog.vue';
import { MODULE_TYPES } from '@/config/filter.js';
import FilterDialog from '@/components/common/FilterDialog.vue';
import { claimComponents } from '@/modules/claims/config/filter.js';
import {
    formatClaimFilterForApi,
    formatColumnForTableFilter,
    formatFilterLabelForTableFilter
} from '@/modules/claims/utils/filter.js';

const props = defineProps({
    currentClaimId: {
        type: [String, Number]
    },
    isFromClaim: {
        type: Boolean
    }
});

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const helpers = useHelpers();
const currentUser = inject('currentUser');

const filters = ref([]);
const showFilterDialog = ref(false);
const searchText = ref('');
const policyClaims = ref([]);
const activeClaim = ref(null);
const moveSelectedSubmissions = ref(false);
const selectedSubmissions = ref([]);
const showingTables = ref(null);
const showingPolicy = ref([]);
const showSearchableDialog = ref(false);

const {
    getClaims,
    searchClaims,
    moveSubmissionsToClaim,
    storedSelectedSubmissions
} = useClaimStore();
const {
    loading: moveSubmissionsLoading,
    mutate: moveSubmissionsToClaimMutation,
    status: moveSubmissionsStatus
} = moveSubmissionsToClaim();
const { currentInsured } = useClaimInsuredStore();
const { currentSubmission, moveSubmissionToClaim } = useSubmissionStore();
const {
    loading: moveSubmissionLoading,
    mutate: moveSubmissionToClaimMutation,
    status: moveSubmissionStatus
} = moveSubmissionToClaim();

/**
 * Open claim view in a new window
 */
const openNewWindow = () => {
    const routeData = router.resolve({
        name: 'Claim Details',
        params: {
            claimId: activeClaim.value.id,
            clientId: route.params.clientId
        }
    });

    window.open(routeData.href, '_blank');
};

/**
 * Watch for changes in `storedSelectedSubmissions`
 */
watch(
    () => storedSelectedSubmissions,
    (newValue) => {
        selectedSubmissions.value = newValue.value;
    },
    { deep: true }
);

/**
 * Set move selected submission confirmation content
 * @type {ComputedRef<string>}
 */
const moveSelectedSubmissionsContent = computed(() => {
    return t('claims.attach_submissions_to_claim_content', {
        claimRef: activeClaim.value.ref_number
    });
});

/**
 * Move submissions to claim
 */
const moveSubmissions = () => {
    if (props.isFromClaim) {
        moveSubmissionsToClaimMutation({
            client_id: route.params.clientId,
            claim_id: props.currentClaimId,
            user_id: currentUser.value.id,
            target_claim_id: activeClaim.value.id,
            submission_ids: selectedSubmissions.value.length
                ? selectedSubmissions.value
                : [currentSubmission.value.id]
        });
    } else {
        moveSubmissionToClaimMutation({
            client_id: route.params.clientId,
            claim_id: activeClaim.value.id,
            user_id: currentUser.value.id,
            submission_id: currentSubmission.value.id
        });
    }
};

/**
 * Open policy container
 * @param policy_id
 * @returns {Promise<void>}
 */
const openPolicyContainer = async (policy_id) => {
    // Open policy container
    showingPolicy.value[policy_id] = !showingPolicy.value[policy_id];

    if (showingPolicy.value[policy_id]) {
        // Check if search test is not empty
        if (searchText.value) {
            policyClaims.value[policy_id] = await searchClaims({
                search: { type: 'claim', value: searchText.value },
                filters: [
                    { field: 'policy_id', value: policy_id, type: 'and' },
                    {
                        field: 'insured_id',
                        value: currentInsured.value.id,
                        type: 'and'
                    }
                ].concat(formatClaimFilterForApi(filters.value))
            });
        } else {
            // Get claims for the policy
            policyClaims.value[policy_id] = await getClaims({
                filters: [
                    { field: 'policy_id', value: policy_id, type: 'and' }
                ].concat(formatClaimFilterForApi(filters.value))
            });
        }
    } else {
        // Clear active claim
        activeClaim.value = null;
    }
};

/**
 * Search claims
 * @returns {Promise<void>}
 */
const search = () => {
    // Close all policy containers
    showingPolicy.value = [];
};

/**
 * Apply filters
 * @param appliedFilters
 */
const applyFilters = (appliedFilters) => {
    filters.value = appliedFilters;
};

// Watch for changes in submission loading states
watch(
    [() => moveSubmissionsLoading?.value, () => moveSubmissionLoading?.value],
    () => {
        if (
            (!moveSubmissionsLoading.value &&
                moveSubmissionsStatus.value === 'success') ||
            (!moveSubmissionLoading.value &&
                moveSubmissionStatus.value === 'success')
        ) {
            openNewWindow();
        }
    },
    { deep: true }
);
</script>

<template>
    <div>
        <div
            class="flex align-center justify-between filter-bg pt-3 pl-3 pr-3 mb-3"
        >
            <div
                class="flex align-center justify-between gap-2 pb-3"
            >
                <Search
                    v-model="searchText"
                    @search="search"
                    :style="{ width: '15vw' }"
                    data-testid="search-input"
                />
                <span
                    class="cursor-pointer pt-3"
                    @click="showSearchableDialog = true"
                >
                    <i
                        data-testid="searchable-icon"
                        class="pi pi-info-circle"
                    ></i>
                </span>

                <SearchableFieldDialog
                    v-model:visible="showSearchableDialog"
                    :searchableType="'claims'"
                />

                <span class="flex">
                    <Button
                        outlined
                        icon="pi pi-filter"
                        :label="$t('claims.filter')"
                        data-testid="btn-claim-history-filter"
                        class="ml-3"
                        @click="showFilterDialog = true"
                    />
                    <FilterDialog
                        v-model="showFilterDialog"
                        :components="claimComponents"
                        @applyFilters="applyFilters"
                        :module="MODULE_TYPES.CLAIMS.value"
                        :title="$t('filters.filter') + ' ' + $t('claims.title')"
                    />
                </span>
            </div>
        </div>

        <div
            class="mt-4 mb-2"
            data-testid="filters-container"
            v-if="filters.length"
        >
            <Chips
                class="filters-chips"
                variant="chips"
                v-model="filters"
                @remove="
                    () => {
                        filters = [];
                        showingPolicy.value = [];
                    }
                "
            >
                <template #chip="slotProps">
                    <span>
                        <strong>
                            {{
                                formatColumnForTableFilter(
                                    slotProps.value.field
                                )
                            }}:
                        </strong>
                        <span>
                            {{
                                formatFilterLabelForTableFilter(
                                    slotProps.value,
                                    helpers,
                                    t
                                )
                            }}
                        </span>
                    </span>
                </template>
            </Chips>
            <Button
                v-if="filters && filters.length > 0"
                class="p-0 mb-2 ml-2 no-underline shadow-none"
                data-testid="clear-filters-button"
                link
                :label="$t('policies.smart_filter.clear_filters')"
                @click="
                    () => {
                        filters = [];
                        showingPolicy.value = [];
                    }
                "
            />
        </div>

        <div class="grid grid-cols-4 mt-2">
            <div>
                <div
                    v-for="policy in currentInsured?.policies"
                    :key="policy.id"
                >
                    <div
                        class="policy-container rounded-md border p-5"
                    >
                        <a
                            class="cursor-pointer pi"
                            :class="
                                showingPolicy[policy.id]
                                    ? 'pi-chevron-down'
                                    : 'pi-chevron-right'
                            "
                            @click="openPolicyContainer(policy.id)"
                        />
                        <span class="ml-2 font-bold policy-container-title">
                            {{ $t('policies.policy') }}#
                            {{ policy.policy_number }}
                        </span>
                    </div>
                    <div v-if="showingPolicy[policy.id]">
                        <div
                            v-for="claim in policyClaims[policy.id]?.data"
                            :key="claim.id"
                            @click="activeClaim = claim"
                            :class="[
                                activeClaim?.id === claim.id
                                    ? 'border-solid rounded-lg border-2 border-primary-200 p-6 cursor-pointer mt-4 claim-history-card-bg shadow'
                                    : 'border-solid rounded-lg border border-gray-200 p-6 cursor-pointer mt-4'
                            ]"
                            :data-testid="'claim-history-card-' + claim.id"
                        >
                            <div
                                class="flex justify-between items-center"
                            >
                                <span
                                    :data-testid="
                                        'text-claim-created-at-' + claim.id
                                    "
                                >
                                    {{ helpers.formatDate(claim.created_at) }}
                                </span>
                                <ClaimStatusTag
                                    :data-testid="
                                        'tag-claim-status-' + claim.id
                                    "
                                    :status="claim.status"
                                />
                            </div>
                            <h5
                                :data-testid="'text-claim-number-' + claim.id"
                                class="mb-3"
                            >
                                {{ $t('claims.claim_id') }}
                                {{ claim.claim_ref_number }}
                            </h5>
                            <ClaimMeterReservedAmount
                                :claim="{
                                    id: claim.id,
                                    reserved_amount: claim.reserved_amount,
                                    expense_total: 0,
                                    running_total: claim.running_total,
                                    declined_total: 0
                                }"
                                :minimal="true"
                            />
                            <div
                                class="flex justify-content-between align-items-center mt-3"
                            >
                                <span
                                    :data-testid="
                                        'label-claim-reserved-amt-' + claim.id
                                    "
                                >
                                    {{ $t('claims.reserved_amt') }}
                                </span>
                                <span
                                    :data-testid="
                                        'label-claim-running-total-' + claim.id
                                    "
                                >
                                    {{ $t('expenses.running_total') }}
                                </span>
                            </div>
                            <div
                                class="flex justify-between items-center mt-1"
                            >
                                <span
                                    :data-testid="
                                        'text-claim-reserved-amt-' + claim.id
                                    "
                                >
                                    {{
                                        helpers.moneyFormat(
                                            claim.reserved_amount
                                        )
                                    }}
                                    CAD
                                </span>
                                <span
                                    :data-testid="
                                        'text-claim-running-total-' + claim.id
                                    "
                                >
                                    {{
                                        helpers.moneyFormat(claim.running_total)
                                    }}
                                    CAD
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-span-3">
                <div
                    v-if="activeClaim === null"
                    class="grid place-content-center h-60 gap-3"
                >
                    <h5
                        data-testid="label-choose-claim-hint"
                        class="font-normal text-gray-500 items-center"
                    >
                        <span>
                            <i
                                class="pi pi-search-plus text-gray-500"
                                style="font-size: 2rem"
                                data-testid="icon-claim-history"
                            />
                        </span>
                        {{ $t('claims.view_claim_hint') }}
                    </h5>
                </div>
                <div v-else>
                    <div
                        class="flex justify-between items-center pl-3"
                    >
                        <div>
                            <Button
                                :disabled="
                                    !selectedSubmissions.length &&
                                    props.isFromClaim
                                "
                                icon="pi pi-arrow-right"
                                :label="
                                    props.isFromClaim
                                        ? $t('claims.attach_submissions_to_claim')
                                        : $t('claims.attach_submission_to_claim')
                                "
                                data-testid="btn-attach-submission-to-claim"
                                @click="moveSelectedSubmissions = true"
                            />
                            <Confirmation
                                v-if="moveSelectedSubmissions"
                                v-model="moveSelectedSubmissions"
                                :header="$t('claims.attach_submissions_to_claim_title')"
                                :content="moveSelectedSubmissionsContent"
                                @confirm="moveSubmissions"
                                :confirmButtonText="
                                    $t('claims.attach_submissions')
                                "
                                data-testid="dialog-move-submission-confirmation"
                            />
                            <Button
                                text
                                class="ml-3"
                                icon="pi pi-external-link"
                                :label="$t('claims.view_claim_in_new_window')"
                                data-testid="btn-view-claim-in-new-window"
                                @click="openNewWindow"
                            />
                        </div>
                        <div>
                            <Button
                                text
                                icon="pi pi-plus"
                                :label="$t('claims.expand_all')"
                                data-testid="btn-expand-all"
                                @click="showingTables.showAllTables(true)"
                            />
                            <Button
                                text
                                class="ml-3"
                                icon="pi pi-minus"
                                :label="$t('claims.collapse_all')"
                                data-testid="btn-collapse-all"
                                @click="showingTables.showAllTables(false)"
                            />
                        </div>
                    </div>

                    <div class="pt-3 pl-3">
                        <SubmissionClaimTable
                            v-if="activeClaim"
                            :claimId="activeClaim.id"
                            :isFromClaimHistory="true"
                            ref="showingTables"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
