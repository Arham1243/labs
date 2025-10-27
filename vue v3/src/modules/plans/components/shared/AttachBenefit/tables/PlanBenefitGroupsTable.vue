<script setup>
import lodash from 'lodash';
import { useHelpers } from '@/composables';
import { onMounted, ref, watch } from 'vue';
import { useDateFormatter } from '@/composables/useDateFormatter.js';
import { PaginationOptions, SortFilterOptions } from '@/config';
import useEventsBus from '@/composables/event-bus';
import { useI18n } from 'vue-i18n';

import BenefitDetailsDialog from '@/modules/plans/components/benefits/BenefitDetailsDialog.vue';
import MaxAmountWarningIcon from '@/modules/plans/components/shared/AttachBenefit/partials/MaxAmountWarningIcon.vue';

const props = defineProps({
    id: {
        type: String,
        required: true
    },
    isEditable: {
        type: Boolean,
        default: false
    },
    isIncluded: {
        type: Boolean,
        default: false
    },
    store: {
        type: Object,
        required: true
    },
    benefitGroup: {
        type: Object,
        default: () => ({})
    }
});

const emits = defineEmits([
    'setCountIncludes',
    'setCountExcludes',
    'updateCounts'
]);

const { formatValue, formatEndDateDisplayTables, initialize } =
    useDateFormatter();

const i18n = useI18n();
const helpers = useHelpers();
const { bus, emit } = useEventsBus();

const selectedItem = ref(null);
const confirmationDialog = ref(false);
const loading = ref(false);
const benefitDetailsDialog = ref(false);
const totalRecords = ref(0);
const searchText = ref('');
const items = ref([]);
const originalItems = ref([]);
const editingRows = ref([]);

const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();

const initializeDateFormatter = async () => {
    try {
        const response = await settingStore.getSettings();
        const formatter = useDateFormatter(
            response?.date_time ? response : null
        );
        formatValue.value = formatter.formatValue;
    } catch (error) {
        globalStore.showError('Error loading date settings:', error);
        const formatter = useDateFormatter(null);
        formatValue.value = formatter.formatValue;
    }
};

onMounted(async () => {
    await getItems();
    if (props.isIncluded) {
        emits('setCountIncludes', totalRecords.value);
    } else {
        emits('setCountExcludes', totalRecords.value);
    }
    await initialize();
});

watch(
    () => bus.value.get('reloadBenefits'),
    () => {
        getItems();
    }
);

const getItems = async () => {
    try {
        loading.value = true;
        const params = { ...pagination.getPageParams(), include: 'category' };
        const payload = sortFilters.getSortFilters();

        const res = props.isIncluded
            ? await props.store.searchBenefitGroupsBenefits(
                  props.id,
                  payload,
                  params
              )
            : await props.store.searchBenefitGroupsBenefitsExcluded(
                  props.id,
                  payload,
                  params
              );
        originalItems.value = lodash.cloneDeep(res.data);
        items.value = res.data;
        totalRecords.value = res.meta.total;
    } finally {
        loading.value = false;
    }
};

const shouldShowMaxAmountWarning = (pivotMaxAmount) => {
    if (!pivotMaxAmount) return false;

    const groupMaxAmount = props.benefitGroup?.pivot?.max_amount;
    if (!groupMaxAmount) return false;

    return Number(pivotMaxAmount) > Number(groupMaxAmount);
};

const onSortChange = (event) => {
    pagination.resetPageParams();
    sortFilters.updateSortFilters(event);
    getItems();
};

const search = () => {
    pagination.resetPageParams();
    sortFilters.updateSearch(searchText.value);
    getItems();
};

const onPageChange = (event) => {
    pagination.updatePageParams(event);
    getItems();
};

const showConfirmationDialog = () => {
    confirmationDialog.value = true;
};

const confirmationAction = async () => {
    if (props.isIncluded) {
        excludeItem();
    } else {
        includeItem();
    }
};

const excludeItem = async () => {
    try {
        await props.store.excludeBenefitGroupBenefits(props.id, {
            resources: [selectedItem.value.id]
        });

        if (pagination.page === 1 && items.value.length === 1) {
            emit('reloadPlanBenefitGroups');
        } else {
            getItems();
        }

        emits('updateCounts', props.isIncluded);
        emit('reloadPlanDetails');
        emit('reloadAssociatedPlanDetails');
    } finally {
        //
    }
};

const includeItem = async () => {
    try {
        await props.store.includeBenefitGroupBenefits(props.id, {
            resources: [selectedItem.value.id]
        });
        getItems();
        emits('updateCounts', props.isIncluded);
        emit('reloadPlanDetails');
        emit('reloadAssociatedPlanDetails');
    } finally {
        //
    }
};

const onRowEditSave = async ({ newData, index }) => {
    try {
        await props.store.updateBenefitGroupBenefit(props.id, newData.id, {
            pivot: {
                coverage: newData.pivot.coverage,
                max_amount: newData.pivot.max_amount
            }
        });
    } catch (err) {
        items.value[index] = lodash.merge({}, originalItems.value[index], {});
    }
};

const onRowEditCancel = ({ index }) => {
    items.value[index] = lodash.merge({}, originalItems.value[index], {});
};

const showBenefitDetailsDialog = (item) => {
    selectedItem.value = item;
    benefitDetailsDialog.value = true;
};
</script>
<template>
    <BaseTable
        :value="items"
        :loading="loading"
        :page="pagination.page"
        :rows="pagination.limit"
        :total-records="totalRecords"
        @page="onPageChange"
        @sort="onSortChange"
        v-model:editingRows="editingRows"
        editMode="row"
        @row-edit-save="onRowEditSave"
        @row-edit-cancel="onRowEditCancel"
    >
        <template #header>
            <Search v-model="searchText" @search="search" />
        </template>
        <template #empty>{{
            $t('common.datatable_no_found', {
                item: $t('common.benefits').toLowerCase()
            })
        }}</template>
        <template #loading>{{
            $t('common.datatable_loading', {
                item: $t('common.benefits').toLowerCase()
            })
        }}</template>
        <Column
            sortable
            :field="`name->${i18n.locale.value}`"
            :header="$t('common.name')"
            class="col-3"
        >
            <template #body="{ data }">
                <div
                    class="cursor-pointer text-blue-700"
                    @click="showBenefitDetailsDialog(data)"
                >
                    {{
                        lodash.truncate(helpers.getLocaleValue(data.name), {
                            length: 30
                        })
                    }}
                </div>
            </template>
        </Column>
        <Column
            sortable
            :field="`category.name->${i18n.locale.value}`"
            :header="$t('common.category')"
            class="col-3"
        >
            <template #body="{ data }">
                {{ helpers.getLocaleValue(data.category?.name) }}
            </template>
        </Column>
        <Column :header="`${$t('common.coverage')} %`">
            <template #body="{ data }">
                {{ data.pivot?.coverage ? data.pivot.coverage + ' %' : '-' }}
            </template>
            <template #editor="{ data }">
                <InputField
                    v-model="data.pivot.coverage"
                    addon-after="pi pi-percentage"
                    variant="number"
                    data-testid="pivot.coverage"
                />
            </template>
        </Column>
        <Column :header="$t('common.to_a_maximum_of')">
            <template #body="{ data }">
                <div class="flex align-items-center gap-2">
                    {{
                        data.pivot?.max_amount
                            ? helpers.moneyFormat(data.pivot.max_amount)
                            : '-'
                    }}
                    <MaxAmountWarningIcon
                        :show="
                            shouldShowMaxAmountWarning(data.pivot.max_amount)
                        "
                        tooltipText="common.max_amount_warning"
                    />
                </div>
            </template>
            <template #editor="{ data }">
                <div class="flex align-items-center gap-2">
                    <InputField
                        v-model="data.pivot.max_amount"
                        variant="number"
                        addon-before="pi pi-dollar"
                        data-testid="pivot.max_amount"
                    />
                    <MaxAmountWarningIcon
                        :show="
                            shouldShowMaxAmountWarning(data.pivot.max_amount)
                        "
                        tooltipText="common.max_amount_warning"
                    />
                </div>
            </template>
        </Column>
        <Column field="effective_date" :header="$t('common.effective_date')">
            <template #body="{ data }">
                {{
                    formatValue(data.effective_date, {
                        type: 'date',
                        format: 'short'
                    })
                }}
            </template>
        </Column>
        <Column field="end_date" :header="$t('common.end_date')">
            <template #body="{ data }">
                {{ formatEndDateDisplayTables(data.end_date) }}
            </template>
        </Column>
        <Column>
            <template #body="{ data }">
                <Button
                    v-if="isEditable"
                    :icon="`${
                        isIncluded ? 'pi pi-minus-circle' : 'pi pi-plus-circle'
                    }`"
                    size="large"
                    text
                    @click="
                        () => {
                            selectedItem = data;
                            showConfirmationDialog();
                        }
                    "
                    data-testid="include-exclude-button"
                ></Button>
            </template>
        </Column>
        <Column :rowEditor="isIncluded && isEditable"></Column>
    </BaseTable>

    <Confirmation
        v-model="confirmationDialog"
        show-alert-icon
        :header="`${isIncluded ? 'Exclude' : 'Include'}`"
        :content="`${
            isIncluded ? 'Exclude' : 'Include'
        } ${helpers.getLocaleValue(selectedItem?.name)}?`"
        :confirm-button-text="`${isIncluded ? 'Exclude' : 'Include'}`"
        :confirm-button-class="`${
            isIncluded ? 'p-button-danger' : 'p-button-success'
        }`"
        @confirm="confirmationAction"
    />
    <BenefitDetailsDialog
        v-if="benefitDetailsDialog"
        v-model="benefitDetailsDialog"
        :id="selectedItem.id"
    />
</template>
