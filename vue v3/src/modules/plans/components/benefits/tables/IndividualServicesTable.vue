<script setup>
import lodash from 'lodash';
import { onMounted, ref, watch } from 'vue';
import { PaginationOptions, SortFilterOptions } from '@/config';
import { useBenefitStore } from '@/modules/plans/stores/Benefit';
import { useHelpers } from '@/composables';
import useEventsBus from '@/composables/event-bus';
import useCoverageRestrictionBus from '@/composables/coverage-restriction';
import { useI18n } from 'vue-i18n';
import Label from '@/components/common/Label.vue';

import LimitDialog from '@/modules/plans/components/benefits/dialogs/LimitDialog.vue';
import CoverageRestrictionDialog from '@/modules/plans/components/benefits/dialogs/CoverageRestrictionDialog.vue';

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

const helpers = useHelpers();
const benefitStore = useBenefitStore();
const { emit, bus } = useEventsBus();
const { locale } = useI18n();
const { generateRuleString } = useCoverageRestrictionBus();

const loading = ref(true);
const isLimitDialog = ref(false);
const isCoverageDialog = ref(false);
const isExcludeDialog = ref(false);
const isSelectedExcludeDialog = ref(false);
const totalRecords = ref(0);
const searchText = ref('');
const originalItems = ref([]);
const selectedTableItems = ref([]);
const selectedItem = ref(null);
const items = ref([]);
const editingRows = ref([]);
const menu = ref();
const menuItems = ref([
    { label: 'Apply Coverage Limits', command: () => showLimitDialog() },
    { label: 'Exclude Codes', command: () => showExcludeItemsDialog() },
    // { label: 'Select All 20 Services', command: () => console.log('clicked') },
    { label: 'Clear Selection', command: () => (selectedTableItems.value = []) }
]);

const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();

onMounted(() => {
    getItems();
});

watch(
    () => bus.value.get('reloadBenefitServices'),
    async () => {
        await getItems();
    }
);

const onPageChange = (event) => {
    pagination.updatePageParams(event);
    getItems();
};

const onSortChange = (event) => {
    pagination.resetPageParams();
    sortFilters.updateSortFilters(event);
    getItems();
};

const search = async () => {
    pagination.resetPageParams();
    sortFilters.updateSearch(searchText.value);
    getItems();
};

const getItems = async () => {
    try {
        loading.value = true;
        const params = pagination.getPageParams();
        const payload = sortFilters.getSortFilters();
        const res = await benefitStore.searchBenefitServicesCodes(
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

const showActions = (event, item) => {
    selectedItem.value = item;
    menu.value.toggle(event);
};

const showLimitDialog = () => {
    isLimitDialog.value = true;
};

const showCoverageDialog = (item) => {
    selectedItem.value = item;
    isCoverageDialog.value = true;
};

const showExcludeItemDialog = (item) => {
    selectedItem.value = item;
    isExcludeDialog.value = true;
};

const excludeItem = async () => {
    isExcludeDialog.value = false;
    try {
        await benefitStore.excludeBenefitServiceCode(props.id, {
            resources: [selectedItem.value.id]
        });

        getItems();
        emit('reloadBenefit');
    } finally {
        //
    }
};

const showExcludeItemsDialog = () => {
    isSelectedExcludeDialog.value = true;
};

const removeExcludesItem = async () => {
    isSelectedExcludeDialog.value = false;
    try {
        await benefitStore.excludeBenefitServiceCode(props.id, {
            resources: selectedTableItems.value.map((item) => item.id)
        });
        selectedTableItems.value = [];
        await getItems();
        emit('reloadBenefit');
    } finally {
        //
    }
};

const updateItem = async ({ newData, index }) => {
    try {
        await benefitStore.updateBenefitService(props.id, newData.id, {
            pivot: {
                coverage: newData.pivot.coverage,
                max_amount: newData.pivot.max_amount
            }
        });
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

const updateCoverageRestriction = async (payload) => {
    try {
        await benefitStore.updateBenefitService(
            props.id,
            selectedItem.value.id,
            {
                resources: [selectedItem.value.id],
                pivot: {
                    rules: payload
                }
            }
        );

        isCoverageDialog.value = false;
        await getItems();
    } catch (err) {
        //
    }
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
        v-model:selection="selectedTableItems"
        v-model:editingRows="editingRows"
        editMode="row"
        @row-edit-save="updateItem"
        @row-edit-cancel="cancelItem"
    >
        <template #header>
            <div class="flex justify-content-between align-items-center">
                <Button
                    v-if="isEditable"
                    :label="`Bulk Action ${
                        selectedTableItems.length
                            ? `(${selectedTableItems.length} Selected)`
                            : ''
                    }`"
                    :disabled="selectedTableItems.length === 0"
                    iconPos="right"
                    icon="pi pi-chevron-down"
                    class="ml-2 p-button-outlined"
                    @click="showActions($event, data)"
                />
                <Menu
                    ref="menu"
                    id="overlay_menu"
                    :model="menuItems"
                    :popup="true"
                />
                <Search v-model="searchText" @search="search" />
            </div>
        </template>
        <template #empty>
            <Label test-id="empty-state-message"> No services found. </Label>
        </template>
        <template #loading> Loading services. Please wait. </template>

        <Column
            v-if="isEditable"
            selectionMode="multiple"
            headerStyle="width: 3rem"
        />
        <Column sortable field="code" :header="$t('common.code')" />
        <Column
            sortable
            :field="`description->${locale}`"
            :header="$t('common.description')"
        >
            <template #body="{ data }">
                {{
                    lodash.truncate(helpers.getLocaleValue(data.description), {
                        length: 30
                    })
                }}
            </template>
        </Column>
        <Column :header="$t('common.coverage')">
            <template #body="{ data }">
                {{ data.pivot.coverage ? data.pivot.coverage + ' %' : '-' }}
            </template>
            <template #editor="{ data }">
                <InputField
                    v-model="data.pivot.coverage"
                    addon-after="pi pi-percentage"
                    variant="number"
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
                />
            </template>
        </Column>
        <Column
            field="coverage_restriction"
            :header="$t('common.coverage_restriction')"
        >
            <template #body="{ data }">
                <span v-if="data.pivot.rules" class="text-primary font-bold">
                    <template v-if="!isEditable">
                        {{ generateRuleString(data.pivot.rules) }}
                    </template>
                    <span
                        v-else
                        class="cursor-pointer"
                        :disabled="selectedTableItems.length > 0 || !isIncluded"
                        @click="showCoverageDialog(data)"
                        >{{ generateRuleString(data.pivot.rules) }}</span
                    >
                </span>
                <template v-else>
                    <span v-if="data.coverage_restriction">
                        {{ data.coverage_restriction || '-' }}
                    </span>
                    <span v-if="!data.coverage_restriction && !isEditable">
                        -
                    </span>
                    <Button
                        v-if="isEditable"
                        :label="$t('buttons.add')"
                        class="p-button-outlined w-full"
                        :disabled="selectedTableItems.length > 0"
                        @click="showCoverageDialog(data)"
                    />
                </template>
            </template>
        </Column>
        <Column field="exclude">
            <template #header>
                <div class="text-center">{{ $t('common.exclude') }}</div>
            </template>
            <template #body="{ data }">
                <div class="text-center" v-if="isEditable">
                    <Button
                        @click="showExcludeItemDialog(data)"
                        :disabled="selectedTableItems.length > 0"
                        icon="pi pi-minus-circle"
                        size="large"
                        text
                    />
                </div>
            </template>
        </Column>
        <Column :rowEditor="isEditable"></Column>
    </BaseTable>
    <LimitDialog
        v-model="isLimitDialog"
        :header="
            $t('benefits.apply_coverage_limits_to_services', {
                item: selectedTableItems.length
            })
        "
        is-bulk
        is-individual
        :id="props.id"
        :resources="selectedTableItems"
        @reload-items="
            () => {
                selectedTableItems = [];
                getItems();
            }
        "
    />
    <CoverageRestrictionDialog
        v-if="isCoverageDialog"
        v-model="isCoverageDialog"
        :content="
            $t('benefits.apply_coverage_restrictions_to', {
                item: selectedItem?.code
            })
        "
        :current-rules="selectedItem.pivot.rules"
        @confirm="updateCoverageRestriction"
    />
    <Confirmation
        v-model="isExcludeDialog"
        :header="$t('benefits.exclude_individual_service_header')"
        :content="
            $t('benefits.exclude_individual_service_content', {
                item: selectedItem?.code
            })
        "
        :confirm-button-text="$t('common.exclude')"
        confirm-button-class="p-button-primary"
        @confirm="excludeItem"
    />
    <Confirmation
        v-model="isSelectedExcludeDialog"
        :header="$t('benefits.exclude_individual_services_header')"
        :content="
            $t('benefits.exclude_individual_services_content', {
                item: selectedTableItems.length
            })
        "
        :confirm-button-text="$t('common.exclude')"
        confirm-button-class="p-button-primary"
        @confirm="removeExcludesItem"
    />
</template>
