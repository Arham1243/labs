<script setup>
import lodash from 'lodash';
import { useHelpers } from '@/composables';
import { ref, onMounted } from 'vue';
import { PaginationOptions, SortFilterOptions } from '@/config';
import { useBenefitStore } from '@/modules/plans/stores/Benefit';
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
    },
    isIncluded: {
        type: Boolean,
        default: false
    }
});

const emits = defineEmits([
    'setCountIncludes',
    'setCountExcludes',
    'updateCounts'
]);

const helpers = useHelpers();
const benefitStore = useBenefitStore();
const { emit } = useEventsBus();
const { generateRuleString } = useCoverageRestrictionBus();
const { t, locale } = useI18n();

const isSelectedIncludedExcludeDialog = ref(false);
const loading = ref(true);
const isLimitDialog = ref(false);
const isCoverageDialog = ref(false);
const isIncludeExcludeDialog = ref(false);
const selectedTableItems = ref([]);
const originalItems = ref([]);
const editingRows = ref([]);
const items = ref([]);
const menu = ref();
const selectedItem = ref(null);
const totalRecords = ref(0);
const searchText = ref('');
const menuItems = ref(
    props.isIncluded
        ? [
              {
                  label: t('common.apply_coverage_limits'),
                  command: () => showLimitDialog()
              },
              {
                  label: props.isIncluded
                      ? t('common.exclude') + ' ' + t('common.codes')
                      : t('common.include') + ' ' + t('common.codes'),
                  command: () => showIncludeExcludeItemsDialog()
              },
              {
                  label: t('common.clear_selection'),
                  command: () => (selectedTableItems.value = [])
              }
          ]
        : [
              {
                  label: props.isIncluded
                      ? t('common.exclude') + ' ' + t('common.codes')
                      : t('common.include') + ' ' + t('common.codes'),
                  command: () => showIncludeExcludeItemsDialog()
              },
              {
                  label: t('common.clear_selection'),
                  command: () => (selectedTableItems.value = [])
              }
          ]
);

const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();

onMounted(async () => {
    await getItems();
    if (props.isIncluded) {
        emits('setCountIncludes', totalRecords.value);
    } else {
        emits('setCountExcludes', totalRecords.value);
    }
});

const getItems = async () => {
    try {
        loading.value = true;
        const params = pagination.getPageParams();
        const payload = sortFilters.getSortFilters();
        const res = props.isIncluded
            ? await benefitStore.searchBenefitEntityServiceCodes(
                  'groups',
                  props.id,
                  payload,
                  params
              )
            : await benefitStore.searchBenefitServiceCodeGroupExcluded(
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

const showLimitDialog = () => {
    isLimitDialog.value = true;
};

const showIncludeExcludeItemsDialog = () => {
    isSelectedIncludedExcludeDialog.value = true;
};

const showCoverageDialog = (item) => {
    selectedItem.value = item;
    isCoverageDialog.value = true;
};

const showExcludeItemDialog = (item) => {
    selectedItem.value = item;
    isIncludeExcludeDialog.value = true;
};

const showActions = (event, item) => {
    selectedItem.value = item;
    menu.value.toggle(event);
};

const includeExcludeItem = async () => {
    isIncludeExcludeDialog.value = false;
    try {
        props.isIncluded
            ? await benefitStore.excludeBenefitServiceCodeGroups(props.id, {
                  resources: [selectedItem.value.id]
              })
            : await benefitStore.includeBenefitServiceCodeGroups(props.id, {
                  resources: [selectedItem.value.id]
              });

        if (pagination.page === 1 && items.value.length === 1) {
            emit('reloadCodeServices');
        } else {
            getItems();
        }

        emits('updateCounts', props.isIncluded);
        emit('reloadBenefit');
    } finally {
        //
    }
};

const removeIncludesExcludesItem = async () => {
    isSelectedIncludedExcludeDialog.value = false;
    try {
        props.isIncluded
            ? await benefitStore.excludeBenefitServiceCodeGroups(props.id, {
                  resources: selectedTableItems.value.map((item) => item.id)
              })
            : await benefitStore.includeBenefitServiceCodeGroups(props.id, {
                  resources: selectedTableItems.value.map((item) => item.id)
              });
        if (props.isIncluded && pagination.page === 1) {
            selectedTableItems.value = [];
            emit('reloadCodeServices');
        } else {
            getItems();
        }

        emits(
            'updateCounts',
            props.isIncluded,
            selectedTableItems.value.length
        );
        emit('reloadBenefit');
    } finally {
        //
    }
};

const updateItem = async ({ newData, index }) => {
    try {
        await benefitStore.updateBenefitServiceCodeGroupBulk(props.id, {
            resources: [newData.id],
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
        await benefitStore.updateBenefitServiceCodeGroupBulk(props.id, {
            resources: [selectedItem.value.pivot.service_code_id],
            pivot: {
                rules: payload
            }
        });
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
                <template v-if="isEditable">
                    <Button
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
                </template>

                <Search v-model="searchText" @search="search" />
            </div>
        </template>
        <template #empty>
            <Label testId="empty-state-message"> No services found. </Label>
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
                {{ data.pivot?.coverage ? data.pivot.coverage + ' %' : '-' }}
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
                    data.pivot?.max_amount
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
                <span v-if="data.pivot?.rules" class="text-primary font-bold">
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
                    <Button
                        v-if="isIncluded && isEditable"
                        label="Add"
                        :disabled="selectedTableItems.length > 0 || !isIncluded"
                        class="p-button-outlined w-full"
                        @click="showCoverageDialog(data)"
                    />
                    <span v-else> - </span>
                </template>
            </template>
        </Column>
        <Column field="exclude">
            <template #header>
                <div class="text-center">
                    {{
                        isIncluded ? $t('common.exclude') : $t('common.include')
                    }}
                </div>
            </template>
            <template #body="{ data }">
                <div class="text-center" v-if="isEditable">
                    <Button
                        :disabled="selectedTableItems.length > 0"
                        @click="showExcludeItemDialog(data)"
                        :icon="`${
                            isIncluded
                                ? 'pi pi-minus-circle'
                                : 'pi pi-plus-circle'
                        }`"
                        size="large"
                        text
                    />
                </div>
            </template>
        </Column>
        <Column :rowEditor="isIncluded && isEditable"></Column>
    </BaseTable>
    <LimitDialog
        v-model="isLimitDialog"
        is-bulk
        :id="props.id"
        :resources="selectedTableItems"
        :header="
            $t('benefits.apply_coverage_limits_to_services', {
                item: selectedTableItems.length
            })
        "
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
        v-model="isIncludeExcludeDialog"
        :header="
            $t('benefits.include_exclude_services_header', {
                item: isIncluded ? $t('common.exclude') : $t('common.include')
            })
        "
        :content="
            $t('benefits.include_exclude_service_content', {
                type: isIncluded ? $t('common.exclude') : $t('common.include'),
                item: selectedItem?.code
            })
        "
        :confirm-button-text="`${
            isIncluded ? $t('common.exclude') : $t('common.include')
        }`"
        confirm-button-class="p-button-primary"
        @confirm="includeExcludeItem"
    />
    <Confirmation
        v-model="isSelectedIncludedExcludeDialog"
        :header="
            $t('benefits.include_exclude_services_header', {
                item: isIncluded ? $t('common.exclude') : $t('common.include')
            })
        "
        :content="
            $t('benefits.include_exclude_services_content', {
                type: isIncluded ? $t('common.exclude') : $t('common.include'),
                item: selectedTableItems.length
            })
        "
        :confirm-button-text="
            isIncluded ? $t('common.exclude') : $t('common.include')
        "
        confirm-button-class="p-button-primary"
        @confirm="removeIncludesExcludesItem"
    />
</template>
