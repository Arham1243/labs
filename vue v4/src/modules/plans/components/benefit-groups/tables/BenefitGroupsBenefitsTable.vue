<script setup>
import lodash from 'lodash';
import { useBenefitStore } from '@/modules/plans/stores/Benefit';
import BenefitDetailsDialog from '@/modules/plans/components/benefits/BenefitDetailsDialog.vue';
import { useHelpers } from '@/composables';
import { useDateFormatter } from '@/composables/useDateFormatter.js';
import { computed, onMounted, ref, watch } from 'vue';
import { PaginationOptions, SortFilterOptions } from '@/config';
import useEventsBus from '@/composables/event-bus';
import { useI18n } from 'vue-i18n';
import Label from '@/components/common/Label.vue';
import MaxAmountWarningIcon from '@/modules/plans/components/shared/AttachBenefit/partials/MaxAmountWarningIcon.vue';
import BenefitNotesDialog from '@/modules/plans/components/benefits/dialogs/BenefitNotesDialog.vue';

const props = defineProps({
    id: {
        type: String,
        required: true
    },
    isEditable: {
        type: Boolean,
        default: false
    }
});

const { formatValue, formatEndDateDisplayTables, initialize } =
    useDateFormatter();
const emits = defineEmits(['setTotalBenefitIncluded']);

const i18n = useI18n();
const benefitStore = useBenefitStore();
const helpers = useHelpers();
const { bus, emit } = useEventsBus();
const editingRows = ref([]);
const originalItems = ref([]);

const selectedItem = ref(null);
const deleteDialog = ref(false);
const loading = ref(false);
const totalRecords = ref(0);
const searchText = ref('');
const items = ref([]);

const benefitDetailsDialog = ref(false);
const shouldShowBenefitNotesDialog = ref(false);
const selectedBenefitNote = ref(null);

const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions('', [], []);

const currentBenefitGroupMaxAmount = computed(() => {
    return benefitStore.currentBenefitGroup?.max_amount;
});

onMounted(async () => {
    const groupResponse = await benefitStore.getBenefitGroup(props.id);
    benefitStore.setCurrentBenefitGroup(groupResponse.data);
    await getItems();
    emits('setTotalBenefitIncluded', totalRecords.value);
});

watch(
    () => bus.value.get('reloadBenefits'),
    async () => {
        await getItems();
        emits('setTotalBenefitIncluded', totalRecords.value);
    }
);

const getItems = async () => {
    try {
        loading.value = true;
        const params = { ...pagination.getPageParams(), include: 'category' };
        const payload = sortFilters.getSortFilters();

        const res = await benefitStore.searchBenefitGroupBenefits(
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

const showDeleteDialog = () => {
    deleteDialog.value = true;
};

const shouldShowMaxAmountWarning = (pivotMaxAmount) => {
    if (!pivotMaxAmount || !currentBenefitGroupMaxAmount.value) {
        return false;
    }
    return Number(pivotMaxAmount) > Number(currentBenefitGroupMaxAmount.value);
};

const updateItem = async ({ newData, index }) => {
    try {
        await benefitStore.updateBenefitGroupBenefitPivot(
            props.id,
            newData.id,
            {
                pivot: {
                    ...newData.pivot,
                    coverage: newData.pivot.coverage,
                    max_amount: newData.pivot.max_amount
                }
            }
        );

        await getItems();
    } catch (err) {
        items.value[index] = lodash.merge({}, originalItems.value[index], {});
    }
};

const cancelItem = (event) => {
    items.value[event.index] = lodash.merge(
        {},
        originalItems.value[event.index],
        {}
    );
};

const deleteItem = async () => {
    try {
        loading.value = true;
        await benefitStore.detachBenefitGroupWithBenefits(props.id, {
            resources: [selectedItem.value.id]
        });

        await getItems();
        emits('setTotalBenefitIncluded', totalRecords.value);
        emit('openSyncPricesDialog');
    } finally {
        loading.value = false;
    }
};

const showBenefitDetailsDialog = (item) => {
    selectedItem.value = item;
    benefitDetailsDialog.value = true;
};

const showBenefitNotesDialog = (index) => {
    selectedBenefitNote.value = items.value[index];
    shouldShowBenefitNotesDialog.value = true;
};
</script>
<template>
    <BaseTable
        :value="items"
        :loading="loading"
        :page="pagination.page"
        :rows="pagination.limit"
        :total-records="totalRecords"
        v-model:editingRows="editingRows"
        editMode="row"
        @row-edit-save="updateItem"
        @row-edit-cancel="cancelItem"
        @page="onPageChange"
        @sort="onSortChange"
    >
        <template #header>
            <div class="custom-search-small">
                <Search
                    data-testid="input-search"
                    v-model="searchText"
                    @search="search"
                />
            </div>
        </template>
        <template #empty
            >{{
                $t('common.datatable_no_found', {
                    item: $t('common.benefits').toLowerCase()
                })
            }}
        </template>
        <template #loading
            >{{
                $t('common.datatable_loading', {
                    item: $t('common.benefits').toLowerCase()
                })
            }}
        </template>
        <Column sortable :field="`name->${i18n.locale.value}`">
            <template #header
                ><Label test-id="label-name">{{
                    $t('common.name')
                }}</Label></template
            >
            <template #body="{ data }">
                <div
                    class="cursor-pointer text-blue-700"
                    @click="showBenefitDetailsDialog(data)"
                >
                    {{
                        lodash.truncate(helpers.getLocaleValue(data.name), {
                            length: 45
                        })
                    }}
                </div>
            </template>
        </Column>
        <Column sortable :field="`category.name->${i18n.locale.value}`">
            <template #header
                ><Label test-id="label-category">{{
                    $t('common.category')
                }}</Label></template
            >
            <template #body="{ data }">
                {{
                    lodash.truncate(
                        helpers.getLocaleValue(data.benefit_category?.name),
                        {
                            length: 45
                        }
                    )
                }}
            </template>
        </Column>
        <Column sortable field="coverage">
            <template #header
                ><Label test-id="label-coverage">{{
                    $t('common.coverage')
                }}</Label></template
            >
            <template #body="{ data }">
                {{ data.pivot.coverage ? data.pivot.coverage + ' %' : '-' }}
            </template>
            <template #editor="{ data }">
                <div class="custom-number-input">
                    <InputField
                        v-model="data.pivot.coverage"
                        addon-after="pi pi-percentage"
                        variant="number"
                    />
                </div>
            </template>
        </Column>
        <Column sortable field="max_amount">
            <template #header
                ><Label test-id="label-max-amount">{{
                    $t('common.to_a_maximum_of')
                }}</Label></template
            >
            <template #body="{ data }">
                <div class="flex items-center gap-2">
                    {{
                        data.pivot.max_amount
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
                <div class="flex items-center gap-2">
                    <div class="custom-number-input">
                        <InputField
                            v-model="data.pivot.max_amount"
                            addon-before="pi pi-dollar"
                            variant="number"
                        />
                    </div>
                    <MaxAmountWarningIcon
                        :show="
                            shouldShowMaxAmountWarning(data.pivot.max_amount)
                        "
                        tooltipText="common.max_amount_warning"
                    />
                </div>
            </template>
        </Column>
        <Column sortable field="effective_date">
            <template #header
                ><Label test-id="label-effective-date">{{
                    $t('common.effective_date')
                }}</Label></template
            >
            <template #body="{ data }">
                {{
                    formatValue(data.effective_date, {
                        type: 'date',
                        format: 'short'
                    })
                }}
            </template>
        </Column>
        <Column sortable field="end_date">
            <template #header
                ><Label test-id="label-end-date">{{
                    $t('common.end_date')
                }}</Label></template
            >
            <template #body="{ data }">
                {{ formatEndDateDisplayTables(data.end_date) }}
            </template>
        </Column>
        <Column header="Note">
            <template #body="{ data, index }">
                <div class="edit-cancel-button">
                    <Button
                        :icon="data.pivot.note ? 'pi pi-file' : 'pi pi-plus'"
                        @click="showBenefitNotesDialog(index)"
                        text
                        :data-testid="`show-benefit-notes-dialog-${index}`"
                    />
                </div>
            </template>
        </Column>
        <Column>
            <template #body="{ data }">
                <div class="text-center" v-if="isEditable">
                    <div class="edit-cancel-button">
                        <Button
                            @click="
                                () => {
                                    selectedItem = data;
                                    showDeleteDialog();
                                }
                            "
                            v-if="isEditable"
                            data-testid="button-delete"
                            icon="pi pi-minus-circle"
                            size="large"
                            text
                            class="p-button-danger"
                        />
                    </div>
                </div>
            </template>
        </Column>
        <Column :rowEditor="isEditable"></Column>
    </BaseTable>

    <Confirmation
        v-model="deleteDialog"
        show-alert-icon
        :header="$t('benefit_groups.delete_benefit_group_benefit_header')"
        :content="`Are you sure you want to remove the ${helpers.getLocaleValue(
            selectedItem?.name
        )} benefit?`"
        confirm-button-class="p-button-danger"
        @confirm="deleteItem"
    />

    <BenefitDetailsDialog
        v-if="benefitDetailsDialog"
        v-model="benefitDetailsDialog"
        :id="selectedItem.id"
    />

    <BenefitNotesDialog
        v-if="shouldShowBenefitNotesDialog"
        v-model:should-dialog-be-visible="shouldShowBenefitNotesDialog"
        v-model:form-data="selectedBenefitNote"
        :benefit-group-id="id"
    />
</template>
