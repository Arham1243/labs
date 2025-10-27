<script setup>
import {
    computed,
    onMounted,
    onBeforeMount,
    ref,
    watch,
    toRaw,
    reactive
} from 'vue';
import { useClientStore } from '@/modules/clients/stores/Client';
import { useCommonStore } from '@/stores/index.js';
import { useFilterStore } from '@/stores/Filter';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { getDeformattedFilter, getFormattedFilter } from '../../config/filter';
import {
    DATE_OPTIONS,
    CONDITION_TYPES,
    DATE_CLAUSE_OPTIONS,
    NUMBER_CLAUSE_OPTIONS,
    MULTIPLE_CLAUSE_OPTIONS,
    STRING_CLAUSE_OPTIONS,
    SELECTION_CLAUSE_OPTIONS
} from '../../config/filter';

const clientStore = useClientStore();
const commonStore = useCommonStore();
const filterStore = useFilterStore();

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: ''
    },
    module: {
        type: String,
        default: null
    },
    components: {
        type: Object,
        default: () => ({})
    }
});

const emits = defineEmits(['update:modelValue', 'applyFilters']);

const { t } = useI18n();
const toast = useToast();

const MAX_FILTER_COUNT = 25;

const busy = ref(false);
const selectedSavedFilter = ref(null);
const loadedFilter = ref(null);
const savedFilters = ref([]);
const showSaveFilterDialog = ref(false);
const saveFilterTitle = ref('');

//dropdown data
const clients = ref([]);

const getNewFilter = () => {
    return {
        id: null,
        field: null,
        operator: null,
        value: null,
        type: null,
        options: [],
        loading: false,
        boolean: CONDITION_TYPES.AND.value
    };
};

const filters = ref([getNewFilter()]);
const previouslyAppliedFilters = ref([getNewFilter()]);

const filterColumns = ref([]);

watch(
    filters,
    (newFilters) => {
        if (
            newFilters.length > 0 &&
            newFilters[0].boolean !== CONDITION_TYPES.AND.value
        ) {
            newFilters[0].boolean = CONDITION_TYPES.AND.value;
        }
    },
    { deep: true }
);

const filterDialog = computed({
    get() {
        filterColumns.value = Object.values(props.components);
        return props.modelValue;
    },
    set(value) {
        emits('update:modelValue', value);
    }
});

const shouldAllowAction = computed(() => {
    return (
        filters.value.length == 0 ||
        filters.value.some(
            (filter) =>
                !filter.field ||
                !filter.operator ||
                (filter.type === 'date' && !filter.value) ||
                (filter.type === 'number' && !filter.value) ||
                (filter.type === 'multi_select' && !filter.value)
        )
    );
});

const resetUnloadedSavedFilter = () => {
    if (selectedSavedFilter.value?.id !== loadedFilter.value?.id) {
        selectedSavedFilter.value = null;
    }
};

const closeFilterDialog = () => {
    filterDialog.value = false;
    resetFiltersToPreviousState();
    resetUnloadedSavedFilter();
};

onMounted(() => {
    loadFilters();
});

const getFilterOptions = (index) => {
    const item = filters.value[index];
    if (item.type == 'date') {
        return DATE_CLAUSE_OPTIONS;
    }

    if (item.type == 'number') {
        return NUMBER_CLAUSE_OPTIONS;
    }

    if (item.type == 'select') {
        return SELECTION_CLAUSE_OPTIONS;
    }

    if (item.type == 'multi_select') {
        return MULTIPLE_CLAUSE_OPTIONS;
    }

    if (item.type == 'string') {
        return STRING_CLAUSE_OPTIONS;
    }

    return [];
};

const getDateOptions = () => {
    return DATE_OPTIONS.map((option) => ({
        name: option.label,
        id: option.value
    }));
};

const searchItems = (search, i) => {
    getFieldOptions(i, search);
};

const getFieldOptions = async (index, search) => {
    filters.value[index].loading = true;
    let data = [];

    if (filters.value[index].field == 'clients') {
        data = await getClients(search);
    }
    if (filters.value[index].field == 'business_units') {
        data = await getBusinessUnits(search);
    }

    if (filters.value[index].field == 'underwriters') {
        data = await getUnderWriters(search);
    }

    if (filters.value[index].field == 'account_managers') {
        data = await getAccountManagers(search);
    }

    const cmnt = props.components.find(
        (item) => item.field === filters.value[index].field
    );
    filters.value[index].type = cmnt?.type;
    if (cmnt.selection_options) {
        data = cmnt.selection_options;
    }

    filters.value[index].loading = false;
    setTimeout(() => {
        filters.value[index].options = data;
    }, 100);
};

const addFilter = () => {
    filters.value.push({
        ...getNewFilter(),
        boolean: CONDITION_TYPES.OR.value
    });
};

const removeFilter = (index) => {
    filters.value.splice(index, 1);
};

const resetFilters = () => {
    filters.value.length = 0;
    filters.value.push(getNewFilter());
};

const applyFilter = async () => {
    const serializedFilters = JSON.parse(JSON.stringify(toRaw(filters.value)));
    emits('applyFilters', serializedFilters);
    previouslyAppliedFilters.value = serializedFilters;
    closeFilterDialog();
};

const parseFilterDates = (filters) => {
    filters.forEach((filter) => {
        if (filter.type === 'date' && filter.value) {
            const clause = DATE_CLAUSE_OPTIONS.find(
                (option) => option.value === filter.operator
            );

            if (clause?.showCalendar) {
                if (clause.showRange && Array.isArray(filter.value)) {
                    filter.value = filter.value.map((dateStr) =>
                        typeof dateStr === 'string'
                            ? new Date(dateStr)
                            : dateStr
                    );
                } else if (
                    !clause.showRange &&
                    typeof filter.value === 'string'
                ) {
                    filter.value = new Date(filter.value);
                }
            }
        }
    });
    return filters;
};

const resetFiltersToPreviousState = () => {
    const restoredFilters = JSON.parse(
        JSON.stringify(toRaw(previouslyAppliedFilters.value))
    );

    parseFilterDates(restoredFilters);

    filters.value.splice(0, filters.value.length, ...restoredFilters);

    if (filters.value.length === 0) {
        filters.value.push(getNewFilter());
    }
};

const openSaveFilterDialog = () => {
    showSaveFilterDialog.value = true;
};

const closeSaveFilterDialog = () => {
    saveFilterTitle.value = '';
    showSaveFilterDialog.value = false;
};

const saveFilterClicked = () => {
    saveFilterTitle.value = selectedSavedFilter?.value?.name;
    openSaveFilterDialog();
};

const saveFilter = async (shouldApplyFilter) => {
    const formattedFilter = getFormattedFilter(filters.value);
    const payload = {
        name: saveFilterTitle.value,
        type: props.module,
        filters: formattedFilter
    };

    try {
        busy.value = true;
        if (loadedFilter.value) {
            await filterStore.updateFilter(loadedFilter.value.id, payload);
            toast.add({
                severity: 'success',
                summary: 'Filter Updated',
                life: 3000
            });
        } else {
            await filterStore.saveFilter(payload);
            toast.add({
                severity: 'success',
                summary: 'Filter Saved',
                life: 3000
            });
        }
        loadFilters();
        closeSaveFilterDialog();
        if (shouldApplyFilter) {
            applyFilter();
        }
    } catch (error) {
    } finally {
        busy.value = false;
    }
};

const loadFilters = () => {
    if (props.module) {
        filterStore.getFilters(props.module).then((res) => {
            savedFilters.value = res.data;
            if (loadedFilter.value)
                selectedSavedFilter.value = savedFilters.value.find(
                    (filter) => filter.id === loadedFilter.value.id
                );
        });
    }
};

const onMainSelectionChange = (index) => {
    filters.value[index].value = null;
    filters.value[index].operator = null;
    searchItems('', index);
};

const onConditionChange = (newValue, i) => {
    // Prevent null (deselect)
    if (newValue !== null) {
        filters.value[i].boolean = newValue;
    }
};

const loadSelectedFilter = async () => {
    loadedFilter.value = selectedSavedFilter.value;
    const deformattedFilter = getDeformattedFilter(
        JSON.parse(JSON.stringify(toRaw(loadedFilter.value.filters)))
    );

    filters.value.splice(0, filters.value.length, ...toRaw(deformattedFilter));
    for (let index = 0; index < filters.value.length; index++) {
        await getFieldOptions(index, '');
        setTimeout(() => {
            const selectedItems = filters.value[index].options.filter(
                (option) => {
                    return filters.value[index].temp_ids?.includes(option.id);
                }
            );

            if (selectedItems.length)
                filters.value[index].value = selectedItems;
        }, 200);
    }
};

const deleteFilter = async () => {
    try {
        busy.value = true;

        await filterStore.deleteFilter(selectedSavedFilter.value.id);
        toast.add({
            severity: 'success',
            summary: 'Filter Deleted',
            life: 3000
        });
        loadedFilter.value = null;
        filters.value.splice(0, filters.value.length, getNewFilter());
        saveFilterTitle.value = '';
        selectedSavedFilter.value = null;
        loadFilters();
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: e.message,
            life: 3000
        });
    } finally {
        busy.value = false;
    }
};

const onSubSelectionChange = (index) => {
    filters.value[index].value = null;

    if (
        filters.value[index].type == 'number' &&
        NUMBER_CLAUSE_OPTIONS.find(
            (i) => i.value == filters.value[index].operator
        )?.range
    ) {
        filters.value[index].value = [0, 0];
    }

    if (
        filters.value[index].type == 'date' &&
        DATE_CLAUSE_OPTIONS.find(
            (i) => i.value == filters.value[index].operator
        )?.showRange
    ) {
        filters.value[index].value = [null, null];
    }
};
const getClients = async (search) => {
    const res = await clientStore.searchClients(
        {
            search: {
                value: search
            }
        },
        { limit: 100 }
    );
    return res.data;
};

const getBusinessUnits = async (search) => {
    const res = await clientStore.searchBusinessUnits(
        {
            search: {
                value: search
            }
        },
        { limit: 100 }
    );
    return res.data;
};

const getUnderWriters = async (search) => {
    const res = await commonStore.searchUnderwriters(
        {
            search: {
                value: search
            }
        },
        { limit: 100 }
    );
    res.data.map((item) => {
        item.name = { en: item.name };
    });
    return res.data;
};

const getAccountManagers = async (search) => {
    const res = await commonStore.searchCompanyUsers(
        {
            scopes: search
                ? [{ name: 'fullNameLike', parameters: [search] }]
                : []
        },
        { limit: 100 }
    );

    res.data.map((item) => {
        item.name = { en: item.name };
    });
    return res.data;
};
</script>

<template>
    <Dialog
        class="filters-dialog"
        data-testid="filters-dialog"
        v-model:visible="filterDialog"
        :draggable="false"
        :style="{ width: '65vw' }"
        :closable="false"
        modal
    >
        <template #header>
            <div class="flex items-center justify-between w-full">
                <div
                    class="p-dialog-title flex items-center gap-2"
                    data-testid="filters-dialog-title"
                >
                    {{ props.title }}
                </div>
                <Button
                    icon="pi pi-times"
                    variant="outlined"
                    text
                    rounded
                    data-testid="filters-dialog-close"
                    @click="closeFilterDialog"
                    aria-label="Close"
                />
            </div>
        </template>

        <div class="mt-4 mb-2">
            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-7 mb-1">
                    <label
                        class="block mb-2 pb-1 font-bold"
                        for="saved_filters"
                        data-testid="load-saved-filters-label"
                    >
                        {{ $t('filter.dialog.load_saved_filters') }}
                    </label>
                    <div class="grid grid-cols-12 gap-2">
                        <div class="col-span-8">
                            <InputField
                                data-testid="load-saved-filters-input"
                                :disabled="busy"
                                v-model="selectedSavedFilter"
                                :options="savedFilters"
                                optionLabel="name"
                                :placeholder="$t('filter.dialog.select_filter')"
                                class="w-full"
                                :style="{
                                    padding: '0.2rem 0.2rem'
                                }"
                                id="saved_filters"
                                variant="select"
                            />
                        </div>
                        <div class="col-span-3">
                            <Button
                                :disabled="!selectedSavedFilter"
                                data-testid="load-saved-filter-button"
                                :label="$t('filter.dialog.load')"
                                @click="loadSelectedFilter"
                            />

                            <Button
                                rounded
                                outlined
                                severity="danger"
                                class="ml-3"
                                icon="pi pi-trash"
                                :disabled="!selectedSavedFilter"
                                @click="deleteFilter"
                                :data-testid="`remove-saved-filter-button`"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <hr class="mt-8 pb-8" />
            <div>
                <template v-for="(item, i) in filters" :key="i">
                    <div class="mb-4">
                        <div class="grid grid-cols-12 gap-3 items-center">
                            <div class="col-span-3">
                                <div class="flex items-center gap-3">
                                    <Badge
                                        :value="i + 1"
                                        class="flex items-center justify-center font-bold text-base shrink-0"
                                        :data-testid="`count-badge-${i}`"
                                    />
                                    <InputField
                                        :data-testid="`column-name-input-${i}`"
                                        v-model="item.field"
                                        :options="filterColumns"
                                        optionValue="field"
                                        :placeholder="
                                            $t('filter.dialog.select_column')
                                        "
                                        optionLabel="label"
                                        :id="`column-name-input-${i}`"
                                        class="w-full"
                                        variant="select"
                                        @change="onMainSelectionChange(i)"
                                    />
                                </div>
                            </div>

                            <div class="col-span-3">
                                <InputField
                                    :data-testid="`operator-input-${i}`"
                                    v-model="item.operator"
                                    @change="onSubSelectionChange(i)"
                                    :options="getFilterOptions(i)"
                                    :placeholder="
                                        $t('filter.dialog.select_clause')
                                    "
                                    optionLabel="label"
                                    optionValue="value"
                                    class="w-full"
                                    :id="`operator-input-${i}`"
                                    variant="select"
                                />
                            </div>

                            <div class="col-span-3">
                                <InputField
                                    variant="date"
                                    v-if="
                                        item.type === 'date' &&
                                        DATE_CLAUSE_OPTIONS.find(
                                            (i) => i.value == item.operator
                                        )?.showCalendar &&
                                        DATE_CLAUSE_OPTIONS.find(
                                            (i) => i.value == item.operator
                                        )?.showRange == false
                                    "
                                    :placeholder="
                                        $t('filter.dialog.select_variables')
                                    "
                                    :data-testid="`field-value-input-${i}`"
                                    selection-mode="single"
                                    v-model="item.value"
                                    class="w-full"
                                />

                                <div
                                    v-else-if="
                                        item.type === 'date' &&
                                        DATE_CLAUSE_OPTIONS.find(
                                            (i) => i.value == item.operator
                                        )?.showCalendar &&
                                        DATE_CLAUSE_OPTIONS.find(
                                            (i) => i.value == item.operator
                                        )?.showRange == true
                                    "
                                    class="flex gap-2"
                                >
                                    <InputField
                                        variant="date"
                                        :placeholder="
                                            $t('filter.dialog.start_date')
                                        "
                                        :data-testid="`field-value-input-${i}`"
                                        selection-mode="single"
                                        v-model="item.value[0]"
                                        class="w-full"
                                    />
                                    <InputField
                                        variant="date"
                                        :placeholder="
                                            $t('filter.dialog.end_date')
                                        "
                                        :data-testid="`field-value-input-${i}`"
                                        selection-mode="single"
                                        v-model="item.value[1]"
                                        class="w-full"
                                    />
                                </div>

                                <ApiDropdown
                                    v-else-if="item.type === 'date'"
                                    :placeholder="
                                        $t('filter.dialog.select_variables')
                                    "
                                    :data-testid="`field-value-input-${i}`"
                                    v-model="item.value"
                                    option-label="name"
                                    :items="getDateOptions()"
                                    class="w-full"
                                />

                                <ApiMultiselect
                                    v-else-if="item.type === 'select'"
                                    :placeholder="
                                        $t('filter.dialog.select_variables')
                                    "
                                    :data-testid="`field-value-input-${i}`"
                                    :shouldSetSelectedItemsOnMounted="true"
                                    :disabled="item.loading"
                                    id="id"
                                    dataKey="id"
                                    option-label="name"
                                    optionValue="id"
                                    :loading="item.loading"
                                    v-model="item.value"
                                    :items="item.options"
                                    @search="
                                        (searchValue) =>
                                            searchItems(searchValue, i)
                                    "
                                    class="w-full"
                                />

                                <ApiMultiselect
                                    v-else-if="item.type === 'multi_select'"
                                    :tooltipLength="50"
                                    :shouldSetSelectedItemsOnMounted="true"
                                    :disabled="item.loading"
                                    id="id"
                                    dataKey="id"
                                    option-label="name"
                                    localed
                                    :loading="item.loading"
                                    v-model="item.value"
                                    :items="item.options"
                                    @search="
                                        (searchValue) =>
                                            searchItems(searchValue, i)
                                    "
                                    class="w-full"
                                />

                                <InputNumber
                                    v-if="
                                        item.type === 'number' &&
                                        !NUMBER_CLAUSE_OPTIONS.find(
                                            (i) => i.value == item.operator
                                        )?.range
                                    "
                                    v-model="item.value"
                                    inputId="locale-us"
                                    locale="en-US"
                                    :minFractionDigits="2"
                                    :maxFractionDigits="2"
                                    fluid
                                    class="w-full"
                                />

                                <InputText
                                    id="title"
                                    type="text"
                                    v-if="
                                        item.type === 'string' &&
                                        !STRING_CLAUSE_OPTIONS.find(
                                            (i) => i.value == item.operator
                                        )?.range
                                    "
                                    pInputText
                                    v-model="item.value"
                                />

                                <template
                                    v-if="
                                        item.type === 'number' &&
                                        NUMBER_CLAUSE_OPTIONS.find(
                                            (i) => i.value == item.operator
                                        )?.range
                                    "
                                >
                                    <div class="flex h-full">
                                        <div class="flex-1 h-full">
                                            <InputNumber
                                                v-if="
                                                    item.value &&
                                                    item.value.length === 2
                                                "
                                                v-model="item.value[0]"
                                                inputId="locale-us"
                                                locale="en-US"
                                                class="h-full"
                                                :maxFractionDigits="2"
                                                :minFractionDigits="2"
                                                fluid
                                            />
                                        </div>
                                        <div class="flex-1 pl-1">
                                            <InputNumber
                                                v-if="
                                                    item.value &&
                                                    item.value.length === 2
                                                "
                                                v-model="item.value[1]"
                                                inputId="locale-us"
                                                locale="en-US"
                                                class="h-full"
                                                :maxFractionDigits="2"
                                                :minFractionDigits="2"
                                                fluid
                                            />
                                        </div>
                                    </div>
                                </template>
                            </div>
                            <div class="col-1 text-center h-full">
                                <Button
                                    :disabled="busy"
                                    icon="pi pi-trash"
                                    variant="outlined"
                                    severity="danger"
                                    rounded
                                    @click="removeFilter(i)"
                                    :data-testid="`filter-remove-button-${i}`"
                                />
                            </div>
                            <div
                                class="col-2 mb-3 h-full"
                                v-if="i < filters.length - 1"
                                :data-testid="`filter-row-${i + 1}-start`"
                            >
                                <InputField
                                    :data-testid="`filter-condition-type-${i}`"
                                    variant="selectButton"
                                    id="and_or_condition"
                                    :modelValue="filters[i + 1].boolean"
                                    @update:modelValue="
                                        (val) => onConditionChange(val, i + 1)
                                    "
                                    :options="Object.values(CONDITION_TYPES)"
                                    optionLabel="label"
                                    optionValue="value"
                                    aria-labelledby="basic"
                                />
                            </div>
                        </div>
                    </div>
                </template>
            </div>
            <Button
                v-if="filters.length < MAX_FILTER_COUNT"
                :style="{
                    padding: '0.85rem 1.5rem'
                }"
                icon="pi pi-plus"
                :label="$t('filter.dialog.add_filter')"
                text
                @click="addFilter"
                class="w-max mt-4"
                data-testid="add-filter-button"
            />
        </div>

        <template #footer>
            <div class="flex items-center justify-between">
                <Button
                    :style="{
                        padding: '0.85rem 1.5rem'
                    }"
                    data-testid="filters-dialog-cancel"
                    text
                    :label="$t('buttons.cancel')"
                    @click="closeFilterDialog"
                />
                <div class="flex gap-3">
                    <Button
                        :style="{
                            padding: '0.85rem 1.5rem'
                        }"
                        data-testid="filters-dialog-save"
                        outlined
                        :disabled="shouldAllowAction"
                        @click="saveFilterClicked"
                        :label="$t('filter.dialog.save_filter')"
                    />
                    <Button
                        :style="{
                            padding: '0.85rem 1.5rem'
                        }"
                        data-testid="filters-dialog-save"
                        :label="$t('filter.dialog.apply_filters')"
                        @click="applyFilter"
                        :disabled="shouldAllowAction"
                        :loading="busy"
                    />
                </div>
            </div>
        </template>
    </Dialog>

    <Dialog
        data-testid="save-filter-dialog"
        v-model:visible="showSaveFilterDialog"
        :style="{ width: '32vw' }"
        modal
        :closable="false"
    >
        <template #header>
            <div class="flex items-center justify-between w-full">
                <div
                    class="p-dialog-title"
                    data-testid="save-filter-dialog-title"
                >
                    {{ $t('filter.save_dialog.title') }}
                </div>
                <Button
                    icon="pi pi-times"
                    :disabled="busy"
                    outlined
                    rounded
                    text
                    class="border-none p-2"
                    data-testid="save-filter-dialog-close"
                    @click="closeSaveFilterDialog"
                    aria-label="Close"
                />
            </div>
        </template>

        <div class="grid grid-cols-12 gap-4">
            <div class="col-span-12 mb-4">
                <label
                    data-testid="filter-title-label"
                    class="block mb-2"
                    for="filter_title"
                    >{{ $t('filter.save_dialog.name_title') }}</label
                >
                <InputField
                    data-testid="filter-title-input"
                    id="filter_title"
                    :disabled="busy"
                    type="text"
                    variant="text"
                    maxlength="50"
                    class="w-full"
                    v-model="saveFilterTitle"
                />
            </div>
        </div>
        <template #footer>
            <div class="w-full flex justify-between">
                <Button
                    :disabled="busy"
                    data-testid="save-filter-dialog-cancel"
                    text
                    :label="$t('buttons.cancel')"
                    @click="closeSaveFilterDialog"
                />
                <div class="flex gap-4">
                    <Button
                        outlined
                        data-testid="save-filter-dialog-save"
                        :label="$t('buttons.save')"
                        @click="(e) => saveFilter(false)"
                        :loading="busy"
                        :disabled="!saveFilterTitle?.trim()"
                    />
                    <Button
                        data-testid="save-filter-dialog-save"
                        :label="$t('filter.save_dialog.save_and_apply')"
                        @click="(e) => saveFilter(true)"
                        :loading="busy"
                        :disabled="!saveFilterTitle?.trim()"
                    />
                </div>
            </div>
        </template>
    </Dialog>
</template>
<style>
.filters-dialog .p-dialog-footer > div {
    width: 100%;
}
</style>
