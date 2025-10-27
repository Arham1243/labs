<script setup>
import lodash from 'lodash';
import { useHelpers } from '@/composables';
import { useDateFormatter } from '@/composables/useDateFormatter.js';
import { onMounted, ref, watch } from 'vue';
import useEventsBus from '@/composables/event-bus';
import { PaginationOptions, SortFilterOptions } from '@/config';
import { useI18n } from 'vue-i18n';

import BenefitDetailsDialog from '@/modules/plans/components/benefits/BenefitDetailsDialog.vue';

const props = defineProps({
    id: {
        type: String,
        required: true
    },
    isEditable: {
        type: Boolean,
        default: false
    },
    store: {
        type: Object,
        required: true
    }
});

const emits = defineEmits(['hasIndividualBenefits']);
const { formatValue, formatEndDateDisplay, initialize } = useDateFormatter();

const i18n = useI18n();
const helpers = useHelpers();
const { bus, emit } = useEventsBus();

const selectedItem = ref(null);
const deleteDialog = ref(false);
const loading = ref(false);
const benefitDetailsDialog = ref(false);
const totalRecords = ref(0);
const searchText = ref('');
const items = ref([]);
const originalItems = ref([]);
const editingRows = ref([]);

const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();

onMounted(() => {
    getItems();
    initialize();
});

watch(
    () => bus.value.get('reloadPlanBenefits'),
    async () => {
        await getItems();
    }
);

const getItems = async () => {
    try {
        loading.value = true;
        const params = { ...pagination.getPageParams(), include: 'category' };
        const payload = sortFilters.getSortFilters();

        const res = await props.store.getPlanBenefits(
            props.id,
            payload,
            params
        );
        originalItems.value = lodash.cloneDeep(res.data);
        items.value = res.data;
        totalRecords.value = res.meta.total;
        if (!searchText.value) {
            emits('hasIndividualBenefits', totalRecords.value > 0);
        }
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

const deleteItem = async () => {
    try {
        loading.value = true;
        await props.store.deleteBenefits(props.id, {
            resources: [selectedItem.value.id]
        });

        await getItems();
        emit('reloadPlanDetails');
        emit('reloadAssociatedPlanDetails');
        emit('openSyncPricesDialog');
    } finally {
        loading.value = false;
    }
};

const onRowEditSave = async ({ newData, index }) => {
    try {
        await props.store.updateIndividualBenefit(props.id, newData.id, {
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
                {{ data.pivot.coverage ? data.pivot.coverage + ' %' : '-' }}
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
                {{
                    data.pivot.max_amount
                        ? helpers.moneyFormat(data.pivot.max_amount)
                        : '-'
                }}
            </template>
            <template #editor="{ data }">
                <InputField
                    v-model="data.pivot.max_amount"
                    variant="number"
                    addon-before="pi pi-dollar"
                    data-testid="pivot.max_amount"
                />
            </template>
        </Column>
        <Column field="effective_date" :header="$t('common.effective_date')">
            <template #body="{ data }">
                {{
                    formatValue(data.effective_date, {
                        type: 'date',
                        format: 'long'
                    })
                }}
            </template>
        </Column>
        <Column field="end_date" :header="$t('common.end_date')">
            <template #body="{ data }">
                {{ formatEndDateDisplay(data.end_date) }}
            </template>
        </Column>
        <Column>
            <template #body="{ data }">
                <Button
                    v-if="isEditable"
                    class="mt-2"
                    icon="pi pi pi-minus-circle"
                    size="large"
                    text
                    @click="
                        () => {
                            selectedItem = data;
                            showDeleteDialog();
                        }
                    "
                    data-testid="remove-benefit-button"
                ></Button>
            </template>
        </Column>
        <Column :rowEditor="isEditable"></Column>
    </BaseTable>

    <Confirmation
        v-model="deleteDialog"
        show-alert-icon
        :header="$t('plans.remove_individual_benefit_header')"
        :content="
            $t('plans.remove_individual_benefit_content', {
                item: helpers.getLocaleValue(selectedItem?.name)
            })
        "
        confirm-button-class="p-button-danger"
        @confirm="deleteItem"
    />
    <BenefitDetailsDialog
        v-if="benefitDetailsDialog"
        v-model="benefitDetailsDialog"
        :id="selectedItem.id"
    />
</template>
