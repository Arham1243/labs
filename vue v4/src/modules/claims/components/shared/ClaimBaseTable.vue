<script setup>
import { MODULE_TYPES } from '@/config/filter.js';
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useHelpers } from '@/composables/index.js';
import {
    formatExaminerName,
    getNestedValue
} from '@/modules/claims/utils/helper.js';
import {
    formatClaimFilterForApi,
    formatColumnForTableFilter,
    formatFilterLabelForTableFilter
} from '@/modules/claims/utils/filter.js';
import ClaimStatusTag from '@/modules/claims/components/shared/ClaimStatusTag.vue';
import SearchableFieldDialog from '@/modules/claims/components/shared/SearchableFieldDialog.vue';
import FilterDialog from '@/components/common/FilterDialog.vue';

// Define props
const props = defineProps({
    module: {
        type: String
    },
    columns: {
        type: Array,
        required: true
    },
    columnsTotal: {
        type: Array
    },
    storeAction: {
        type: Function,
        required: true
    },
    exportAction: {
        type: Function,
        default: null
    },
    payload: {
        type: Array,
        default: () => []
    },
    onRowSelectionMode: {
        type: [String, Boolean],
        default: false
    },
    onRowSelectAction: {
        type: Function,
        default: () => {}
    },
    showExportButton: {
        type: Boolean,
        default: false
    },
    hideFilterBar: {
        type: Boolean,
        default: false
    },
    hidePagination: {
        type: Boolean,
        default: false
    },
    searchableField: {
        type: String
    },
    hasFilterComponents: {
        type: Boolean,
        default: true
    },
    filterComponents: {
        type: Array,
        default: () => []
    }
});

const { t } = useI18n();
const route = useRoute();
const helpers = useHelpers();
const emit = defineEmits(['data-length', 'selected-data']);
const showSearchableDialog = ref(false);
const showFilterDialog = ref(false);
const filters = ref([]);
const searchText = ref('');
const selectedData = ref(null);
const columnSelectionsRef = ref(null);
const visibleColumns = ref([]);
const localColumns = ref([...props.columns]);
defineExpose({ selectedData });

const {
    mutate: loadData,
    data,
    loading,
    meta,
    pagination,
    sortFilters,
    onSearch,
    onPageChange,
    onSortChange
} = props.storeAction();
loadData(props.payload);

const getColumnTotal = (field) => {
    if (!props.columnsTotal) return;

    const col = props.columnsTotal.find((col) => col.label === field);

    if (!col) return;

    if (col.label === 'diagnosis' && col.field === '') {
        return t('expenses.total_expense_column_label', {
            total_expense: meta?.value?.total || 0
        });
    }

    return col.type === 'currency' ? helpers.moneyFormat(col.field) : col.field;
};

const hiddenColumns = computed(() =>
    props.columns
        .filter((col) => col.hidden)
        .map((col) => ({ name: col.label, field: col.field }))
);

const toggleColumnSelections = () => {
    columnSelectionsRef.value.show();
};

const handleExport = async () => {
    if (!props.exportAction) return;

    const exportPayload = {
        ...(Array.isArray(props.payload)
            ? Object.assign({}, ...props.payload)
            : props.payload),
        filters: formatClaimFilterForApi(filters.value),
        ...sortFilters.getSortFilters(),
        columns: localColumns.value
            .filter((col) => !col.hidden)
            .map((col) => col.field)
    };

    await props.exportAction(exportPayload);
};

const applyFilters = (appliedFilters) => {
    filters.value = appliedFilters;
    loadData(props.payload.concat(formatClaimFilterForApi(filters.value)));
};

watch(
    meta,
    (newMeta) => {
        if (newMeta?.total) emit('data-length', newMeta?.total || 0);
    },
    { immediate: true }
);

watch(
    selectedData,
    (newSelectedData) => {
        emit('selected-data', newSelectedData);
    },
    { immediate: true }
);

watch(
    visibleColumns,
    (newVisibleColumns) => {
        localColumns.value = props.columns.map((col) => ({
            ...col,
            hidden:
                hiddenColumns.value.some((hc) => hc.field === col.field) &&
                !newVisibleColumns.includes(col.field)
        }));
    },
    { immediate: true, deep: true }
);

watch(showFilterDialog, (visible) => {
    document.body.style.overflow = visible ? 'hidden' : '';
});
</script>
<template>
  <div v-bind="$attrs">
    <BaseTable
        :paginator="!hidePagination"
        :value="data"
        :loading="loading"
        :page="pagination.page"
        :rows="pagination.limit"
        :total-records="meta?.total"
        @page="onPageChange"
        @sort="onSortChange"
        @rowSelect="onRowSelectAction"
        selectionMode="single"
        v-model:selection="selectedData"
    >
      <template #header v-if="!hideFilterBar">
        <div class="flex justify-between">
          <div class="flex gap-2">
            <Search
                v-model="searchText"
                @search="onSearch(searchText)"
                data-testid="search-input"
            />
            <span
                v-if="searchableField"
                class="cursor-pointer mr-3 pt-3"
                @click="showSearchableDialog = true"
            >
                        <i
                            data-testid="searchable-icon"
                            class="pi pi-info-circle"
                        ></i>
                    </span>
            <Button
                v-if="hasFilterComponents"
                :label="t('claims.filter')"
                icon="pi pi-filter"
                variant="outlined"
                data-testid="filter-button"
                @click="showFilterDialog = true"
            />
          </div>
          <div class="flex gap-2">
            <Button
                v-if="showExportButton"
                class="p-button-sm flex items-center gap-2"
                data-testid="export-button"
                @click="handleExport"
                text
            >
              <i class="pi pi-download"></i>
              <strong>{{ t('claims.export') }}</strong>
              <i class="pi pi-chevron-down ml-2"></i>
            </Button>
            <Button
                @click="toggleColumnSelections()"
                outlined
                data-testid="column-button"
            >
              <i class="pi pi-cog mr-2" />
              <strong>{{ $t('claims.columns_button_label') }}</strong>
              <i class="pi pi-chevron-down ml-2" />
            </Button>
            <MultiSelect
                filter
                ref="columnSelectionsRef"
                class="p-multiselect-label-empty"
                v-model="visibleColumns"
                :options="hiddenColumns"
                optionLabel="name"
                optionValue="field"
                style="width: 1px !important"
            />
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
              @remove="loadData(props.payload)"
          >
            <template #chip="slotProps">
                <span>
                    <strong>
                        {{

                            formatColumnForTableFilter(
                                slotProps.value.field === 'updated_at'
                                    ? 'last_updated'
                                    : slotProps.value.field ===
                                        'created_at'
                                      ? module === 'Submissions'
                                          ? 'received_date'
                                          : 'created_on'
                                      : slotProps.value.field
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
                            loadData(props.payload);
                        }
                    "
          />
        </div>
      </template>

      <template #empty>
        {{
          $t('common.datatable_no_found', {
            item: props.module
          })
        }}
      </template>

      <template #default>
        <Column
            v-if="onRowSelectionMode"
            :selectionMode="onRowSelectionMode"
            headerStyle="width: 3rem"
            data-testid="radio-btn-selection"
        ></Column>

        <Column
            v-for="{
                    label,
                    field,
                    sortable,
                    type,
                    styleClass,
                    hidden
                } in localColumns"
            :key="label"
            :header="label"
            :field="field"
            :sortable="sortable ?? false"
            :sortField="field"
            :hidden="hidden"
            footerStyle="font-weight: bold"
            :footer="getColumnTotal(field)"
        >
          <template #body="{ data, index }">
                    <span
                        v-if="field === 'examiner_name'"
                        :data-testid="'examiner-data-table-' + index"
                        class="border-circle w-6rem h-6rem m-2 font-bold"
                    >
                        <Tag
                            v-if="data?.examiner_name"
                            class="p-tag-secondary"
                            :value="formatExaminerName(data.examiner_name)"
                            rounded
                        ></Tag>
                    </span>
            <ClaimStatusTag
                v-else-if="field === 'status'"
                :status="data?.status"
                :data-testid="'data-table-status-' + index"
                icon=""
            />
            <span
                v-else-if="field === 'insured_name' && type === 'link'"
                class="underline"
            >
                        <router-link
                            :to="{
                                name: 'Details',
                                params: { insuredId: data?.insured_id }
                            }"
                        >
                            <span
                                :data-testid="'policy-data-table-' + index"
                                class="text-primary"
                                v-text="
                                    data.insured_name ? data.insured_name : ''
                                "
                            />
                        </router-link>
                    </span>
            <span
                v-else-if="field === 'policy_number' && type === 'link'"
                class="underline"
            >
                        <router-link
                            :to="{
                                name: 'Policy Details',
                                params: {
                                    policyId: data?.policy_id,
                                    clientId:
                                        data?.client_id ?? route.params.clientId
                                }
                            }"
                        >
                            <span
                                :data-testid="'policy-data-table-' + index"
                                class="text-primary"
                                v-text="
                                    data.policy_number ? data.policy_number : ''
                                "
                            />
                        </router-link>
                    </span>
            <span
                v-else-if="
                            field === 'claim_ref_number' &&
                            type === 'link' &&
                            data?.claim_id
                        "
                class="underline"
            >
                        <router-link
                            :to="{
                                name: 'Claim Details',
                                params: {
                                    claimId: data.claim_id,
                                    clientId: route.params.clientId
                                }
                            }"
                        >
                            <span
                                :data-testid="'claim-id-data-table-' + index"
                                class="text-primary"
                                v-text="
                                    data.claim_ref_number
                                        ? data.claim_ref_number
                                        : ''
                                "
                            />
                        </router-link>
                    </span>
            <span
                v-else-if="
                            field === 'submission_ref_number' && type === 'link'
                        "
                class="underline"
            >
                        <router-link
                            :to="{
                                name: 'Submissions',
                                params: {
                                    submissionId: data?.submission_id,
                                    clientId: route.params.clientId
                                }
                            }"
                        >
                            <span
                                :data-testid="'policy-data-table-' + index"
                                class="text-primary"
                                v-text="
                                    data.submission_ref_number
                                        ? data.submission_ref_number
                                        : ''
                                "
                            />
                        </router-link>
                    </span>
            <span v-else-if="field === 'coverage'">
                        {{ data?.coverage }}% {{ $t('expenses.to_a_max_of') }}
                        {{ helpers.moneyFormat(data?.max_amount) }}
                    </span>
            <span
                v-else-if="type === 'date'"
                v-text="helpers.formatDate(data[field])"
            />
            <div
                v-else-if="type === 'currency'"
                v-text="helpers.moneyFormat(data[field])"
            />
            <div
                v-else
                :data-testid="`data-table-${field}-${index}`"
                v-text="getNestedValue(data, field)"
                :class="styleClass"
            />
          </template>
        </Column>
      </template>
    </BaseTable>

    <SearchableFieldDialog
        v-if="searchableField"
        v-model:visible="showSearchableDialog"
        :searchableType="searchableField"
    />

    <FilterDialog
        v-model="showFilterDialog"
        :components="filterComponents"
        @applyFilters="applyFilters"
        :module="MODULE_TYPES.CLAIMS.value"
        :title="$t('filters.filter') + ' ' + props.module"
    />
  </div>
</template>

<style lang="scss">
.filters-chips ul.p-inputtext.p-chips-multiple-container {
    background: none !important;
    border: none !important;
    padding: 0 !important;
    box-shadow: none !important;
    width: fit-content !important;
}

.p-chips.p-component.p-inputwrapper.p-inputwrapper-filled.filters-chips {
    width: fit-content !important;
}

.filters-chips li.p-chips-input-token {
    display: none !important;
}

.filters-chips .p-chips-token {
    margin: 2px;
}
</style>
