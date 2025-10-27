<script setup>
import { computed, onBeforeMount, reactive, ref, toRaw, watch } from 'vue';
import { useSmartFilterStore } from '@/modules/policies/stores';
import { useClientStore } from '@/modules/clients/stores/Client';
import { usePlanStore } from '@/modules/plans/stores/Plan';
import useEventsBus from '@/composables/event-bus';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { smartFilterEntityTypes } from '@/config';
import { isPlainObject } from 'lodash';
import { useHelpers } from '@/composables';

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
        default: 'policy'
    },
    searchFieldMapping: {
        type: Object,
        default: () => null
    },
    filterableBy: {
        type: Array,
        default: () => [
            smartFilterEntityTypes.CLIENT,
            smartFilterEntityTypes.BUSINESS_UNIT,
            smartFilterEntityTypes.PLAN,
            smartFilterEntityTypes.START_DATE
        ]
    },
    extraFields: {
        type: Object,
        default: () => ({})
    }
});

const emits = defineEmits(['update:modelValue', 'reloadList']);
const { emit } = useEventsBus();

const clientStore = useClientStore();
const smartFilterStore = useSmartFilterStore();
const { operatorTypes, fieldDataTypeEnum } = smartFilterStore;
const planStore = usePlanStore();
const { t } = useI18n();
const toast = useToast();

const helpers = useHelpers();
const MAX_FILTER_COUNT = 25;
const MAX_SAVED_FILTER_COUNT = 75;

const showSaveFilterDialog = ref(false);
const loadingSavedFilters = ref(false);
const loadingColumnValue = ref(false);
const saveFilterTitle = ref(null);
const savingFilter = ref(false);
const busy = ref(false);
const selectedSavedFilter = ref(null);
const savedFilters = reactive([]);

const getNewFilter = () => {
    return {
        id: null,
        field: null,
        operator: null,
        value: null,
        type: null
    };
};
const filters = reactive([getNewFilter()]);

const localStorageKey = 'smart-filter';
const conditionTypes = {
    AND: { label: t('policies.smart_filter.and'), value: 'and' },
    OR: { label: t('policies.smart_filter.or'), value: 'or' }
};

const fields = {
    client_id: {
        id: 'client_id',
        name: t('policies.smart_filter.clients'),
        operatorTypes: [operatorTypes.ANY_OF, operatorTypes.NONE_OF]
    },
    business_unit_id: {
        id: 'business_unit_id',
        name: t('policies.smart_filter.business_units'),
        operatorTypes: [operatorTypes.ANY_OF, operatorTypes.NONE_OF]
    },
    holding_id: {
        id: 'holding_id',
        name: t('policies.smart_filter.holdings'),
        operatorTypes: [
            operatorTypes.ANY_OF,
            operatorTypes.NONE_OF,
            operatorTypes.IS_EMPTY,
            operatorTypes.IS_NOT_EMPTY
        ]
    },
    plan_id: {
        id: 'plan_id',
        name: t('policies.smart_filter.plans'),
        operatorTypes: [operatorTypes.ANY_OF, operatorTypes.NONE_OF]
    },
    start_date: {
        id: 'start_date',
        name: t('policies.smart_filter.start_date'),
        dataType: fieldDataTypeEnum.DATE,
        operatorTypes: [
            operatorTypes.LAST_7_DAYS,
            operatorTypes.LAST_30_DAYS,
            operatorTypes.LAST_QUARTER,
            operatorTypes.LAST_YEAR,
            operatorTypes.ON,
            operatorTypes.BETWEEN,
            operatorTypes.BEFORE,
            operatorTypes.AFTER
        ]
    },
    ...props.extraFields
};

const filterColumns = Object.values(fields).filter((field) =>
    props.filterableBy.includes(field.id)
);

const filterDialog = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emits('update:modelValue', value);
    }
});

const closeFilterDialog = () => {
    filterDialog.value = false;
    resetFilters();
};

const addFilter = () => {
    filters.push({ ...getNewFilter(), type: conditionTypes.AND.value });
};

const removeFilter = (index) => {
    filters.splice(index, 1);
};

const resetFilters = () => {
    filters.length = 0;
    filters.push(getNewFilter());
};

const openSaveFilterDialog = () => {
    showSaveFilterDialog.value = true;
};

const closeSaveFilterDialog = () => {
    saveFilterTitle.value = '';
    showSaveFilterDialog.value = false;
};

const onShow = () => {
    resetFilters();
};

const loadSavedFilters = () => {
    try {
        loadingSavedFilters.value = true;

        saveFilterTitle.value = selectedSavedFilter.value.name;
        filters.length = 0;
        if (selectedSavedFilter?.value?.filters) {
            filters.push(...selectedSavedFilter.value.filters);

            const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
            filters.forEach((filter) => {
                if (regex.test(filter.value)) {
                    filter.value = new Date(filter.value);
                }
            });
        }

        toast.add({
            severity: 'success',
            summary: t('policies.smart_filter.smart_filter'),
            detail: t('policies.smart_filter.load_success', {
                value: 'test'
            }),
            life: 2000
        });
    } finally {
        loadingSavedFilters.value = false;
    }
};

const removeSavedFilters = () => {
    try {
        loadingSavedFilters.value = true;

        savedFilters.forEach((filter, index) => {
            if (filter.name === selectedSavedFilter.value?.name) {
                savedFilters.splice(index, 1);
            }
        });

        saveFiltersToLocalStorage();
        loadFiltersFromLocalStorage();

        toast.add({
            severity: 'success',
            summary: t('policies.smart_filter.smart_filter'),
            detail: t('policies.smart_filter.delete_success', {
                value: 'test'
            }),
            life: 2000
        });

        selectedSavedFilter.value = null;
    } finally {
        loadingSavedFilters.value = false;
    }
};

const setSelectedSavedFilterToStore = () => {
    let _filter;
    if (selectedSavedFilter.value?.name) {
        _filter = selectedSavedFilter.value;
    } else {
        _filter = { name: 'Unsaved Filter' };
    }

    smartFilterStore.setSelectedSavedFilter(_filter);
};

const applyFilter = async () => {
    try {
        busy.value = true;

        const validFilters = filters.filter((filter) => {
            return filter.field && filter.operator && filter.value;
        });

        smartFilterStore.rawFilters = [...validFilters];
        smartFilterStore.selectedFilters = validFilters.map((filter) => {
            const _filter = { ...filter };
            delete _filter.filterColumnValues;
            delete _filter.fieldName;

            if (!filter.type) {
                delete _filter.type;
            }

            if (
                props.searchFieldMapping &&
                props.searchFieldMapping[_filter.field]
            ) {
                _filter.field = props.searchFieldMapping[_filter.field];
            }

            return _filter;
        });

        closeFilterDialog();

        emit('reloadList');
        emits('reloadList');
    } catch (e) {
    } finally {
        busy.value = false;
    }
};

const saveFilter = () => {
    if (savedFilters.length >= MAX_SAVED_FILTER_COUNT) {
        toast.add({
            severity: 'error',
            summary: t('policies.smart_filter.saved_filter_max_exceed'),
            detail: t('policies.smart_filter.saved_filter_max_exceed_message', {
                value: 'test'
            }),
            life: 2000
        });

        return;
    }

    if (!saveFilterTitle.value.trim()) {
        return;
    }

    try {
        savingFilter.value = true;

        const found = savedFilters.find(
            (f) => f.name === saveFilterTitle.value
        );
        if (found) {
            found.name = saveFilterTitle.value;
            found.filters = filters;

            selectedSavedFilter.value = found;
        } else {
            selectedSavedFilter.value = {
                id: null,
                name: saveFilterTitle.value.trim(),
                filters
            };

            savedFilters.push(toRaw(selectedSavedFilter.value));
        }

        saveFiltersToLocalStorage();
        loadFiltersFromLocalStorage();

        toast.add({
            severity: 'success',
            summary: t('policies.smart_filter.smart_filter'),
            detail: t('policies.smart_filter.saved_success', {
                value: 'test'
            }),
            life: 2000
        });

        closeSaveFilterDialog();
    } finally {
        savingFilter.value = false;
    }
};

const loadFiltersFromLocalStorage = () => {
    const rawFilter = localStorage.getItem(localStorageKey);
    if (rawFilter) {
        const allFilters = JSON.parse(rawFilter);
        if (allFilters[props.module]) {
            const _savedFilters = allFilters[props.module] || [];
            const filtered = _savedFilters.filter((filter) => !!filter.name);

            savedFilters.length = 0;
            savedFilters.push(...filtered);

            if (selectedSavedFilter.value?.name) {
                const name = selectedSavedFilter.value.name;
                selectedSavedFilter.value = savedFilters.find(
                    (f) => f.name === name
                );
            }
        }
    }
};

const saveFiltersToLocalStorage = () => {
    const rawFilter = localStorage.getItem(localStorageKey);
    let allFilters = {};
    if (rawFilter) {
        allFilters = JSON.parse(rawFilter);
    }

    allFilters[props.module] = toRaw(savedFilters);
    localStorage.setItem(localStorageKey, JSON.stringify(allFilters));
};

const getFieldValues = (field) => {
    const func = getFieldFunction(field);

    switch (field) {
        case fields.client_id.id:
            return getClients;
        case fields.business_unit_id.id:
            return getBusinessUnits;
        case fields.holding_id.id:
            return getHoldings;
        case fields.plan_id.id:
            return getPlans;
        default:
            if (func) {
                return func;
            } else {
                return null;
            }
    }
};

const getClients = async (search) => {
    try {
        loadingColumnValue.value = true;
        const res = await clientStore.searchClients(
            {
                search: {
                    value: search
                }
            },
            { limit: 100 }
        );
        return res.data;
    } finally {
        loadingColumnValue.value = false;
    }
};

const getPlans = async (search) => {
    try {
        loadingColumnValue.value = true;
        const res = await planStore.searchPlans(
            {
                search: {
                    value: search
                }
            },
            { limit: 100 }
        );

        return res.data;
    } finally {
        loadingColumnValue.value = false;
    }
};

const getBusinessUnits = async (search) => {
    try {
        loadingColumnValue.value = true;
        const res = await clientStore.searchBusinessUnits(
            {
                search: {
                    value: search
                }
            },
            { limit: 100 }
        );
        return res.data;
    } finally {
        loadingColumnValue.value = false;
    }
};

const getHoldings = async (search) => {
    try {
        loadingColumnValue.value = true;
        const res = await clientStore.searchHoldings(
            {
                search: {
                    value: search
                }
            },
            { limit: 100 }
        );
        return res.data;
    } finally {
        loadingColumnValue.value = false;
    }
};

const getFieldFunction = (field) => {
    if (fields[field]?.getData) {
        return fields[field].getData;
    } else {
        return null;
    }
};

const getFieldDataType = (field) => {
    if (fields[field]?.dataType) {
        return fields[field].dataType;
    } else {
        return null;
    }
};

const getFieldOperatorOptions = (field) => {
    if (fields[field]?.operatorTypes) {
        return fields[field].operatorTypes;
    } else {
        return [];
    }
};

watch(
    () => filters.map((item) => item.field),
    async (newValues, oldValues) => {
        for (let i = 0; i < newValues.length; i++) {
            if (newValues[i] !== oldValues[i]) {
                const searchFunction = getFieldValues(newValues[i]);
                if (searchFunction) {
                    filters[i].filterColumnValues = await searchFunction('');
                } else {
                    filters[i].filterColumnValues = [];
                }
            }
        }
    },
    { deep: true }
);

watch(
    () => filters.map((filter, index) => ({ index, type: filter.type })),
    (newValues, oldValues) => {
        if (oldValues) {
            newValues.forEach((newVal, i) => {
                const oldVal = oldValues[i];
                if (
                    newVal.index > 0 &&
                    (newVal.type === null || newVal.type === undefined) &&
                    oldVal &&
                    oldVal.type
                ) {
                    filters[newVal.index].type = oldVal.type;
                }
            });
        }
    },
    { deep: true }
);

onBeforeMount(() => {
    if (smartFilterStore.rawFilters?.length > 0) {
        filters.length = 0;
        filters.push(...smartFilterStore.rawFilters);
    }

    selectedSavedFilter.value = null;
    if (smartFilterStore.selectedSavedFilter) {
        selectedSavedFilter.value = smartFilterStore.selectedSavedFilter;
    }

    loadFiltersFromLocalStorage();
});
</script>

<template>
    <Dialog
        data-testid="filters-dialog"
        v-model:visible="filterDialog"
        @update:visible="onShow"
        :draggable="false"
        :closable="false"
        modal
        class="w-full max-w-[65vw] p-3"
    >
        <template #header>
            <div class="flex items-center justify-between w-full edit-cancel-button">
                <div class="flex items-center gap-2 font-bold text-lg"
                     data-testid="filters-dialog-title">
                    <h5>{{ props.title }}</h5>
                    <i
                        v-tooltip="props.title"
                        class="pi pi-info-circle text-xl"
                    ></i>
                </div>
                <Button
                    icon="pi pi-times"
                    class="h-8 w-8"
                    data-testid="filters-dialog-close"
                    @click="closeFilterDialog"
                    aria-label="Close"
                    rounded
                    text
                />
            </div>
        </template>

        <div class="mt-4">
            <div class="grid grid-cols-12 gap-x-4 items-end mb-4">
            <div class="col-span-12 md:col-span-7">
                <label
                    class="block mb-2 font-bold"
                    for="saved_filters"
                    data-testid="load-saved-filters-label">
                        {{ $t('policies.smart_filter.load_saved_filters') }}
                    </label>
                    <div class="grid grid-cols-12 gap-2">
                        <div class="col-span-12 sm:col-span-8">
                            <InputField
                                data-testid="load-saved-filters-input"
                                v-model="selectedSavedFilter"
                                :options="savedFilters"
                                optionLabel="name"
                                :placeholder="
                                    $t('policies.smart_filter.select_filter')
                                "
                                class="w-full"
                                id="saved_filters"
                                variant="select"
                            />
                        </div>
                        <div class="col-span-12 sm:col-span-4 flex items-center gap-2">
                            <Button
                                class="w-full sm:w-auto"
                                :disabled="!selectedSavedFilter"
                                data-testid="load-saved-filter-button"
                                :label="$t('policies.smart_filter.load')"
                                @click="loadSavedFilters"
                                :loading="loadingSavedFilters"
                            />
                            <Button
                                severity="danger"
                                icon="pi pi-trash"
                                outlined
                                rounded
                                @click="removeSavedFilters"
                                :disabled="!selectedSavedFilter"
                                :data-testid="`remove-saved-filter-button`"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <hr />

            <div class="mt-5">
                <div class="space-y-4">
                    <template v-for="(item, i) in filters" :key="i">
                        <div class="grid grid-cols-12 gap-x-2 items-center">

                            <div
                                class="col-span-12 md:col-span-4 flex items-center gap-2"
                            >
                                <Badge
                                    :value="i + 1"
                                    size="large"
                                    class="flex-shrink-0"
                                    :data-testid="`count-badge-${i}`"
                                />
                                <InputField
                                    :data-testid="`column-name-input-${i}`"
                                    v-model="item.field"
                                    :options="filterColumns"
                                    optionLabel="name"
                                    optionValue="id"
                                    :placeholder="$t('policies.smart_filter.select_column')"
                                    class="w-full"
                                    :id="`column-name-input-${i}`"
                                    variant="select"
                                    @change="(e) => { item['fieldName'] = fields[e.value]['name']; item.value = null; item.operator = null; }"
                                />
                            </div>

                            <div class="col-span-12 md:col-span-3">
                                <InputField
                                    :data-testid="`operator-input-${i}`"
                                    :id="`operator-input-${i}`"
                                    :options="getFieldOperatorOptions(item.field)"
                                    :placeholder="$t('policies.smart_filter.select_clause')"
                                    optionLabel="label"
                                    optionValue="value"
                                    class="w-full"
                                    variant="select"
                                    v-model="item.operator"
                                    @change="() => (item.value = null)"
                                />
                            </div>

                            <div class="col-span-12 md:col-span-3">
                                <span
                                    v-if="getFieldDataType(item.field) === fieldDataTypeEnum.DATE"
                                    class="p-input-icon-left w-full">
                                    <InputField
                                        variant="date"
                                        showButtonBar
                                        class="w-full"
                                        dateFormat="dd-M-yy"
                                        :placeholder="$t('policies.smart_filter.select_variables')"
                                        :id="`filter-value-input-${i}`"
                                        :data-testid="`filter-value-input-${i}`"
                                        :selection-mode="item.operator === operatorTypes.BETWEEN.value ? 'range' : 'single'"
                                        v-model="item.value"
                                    />
                                </span>
                                <InputField
                                    v-else-if="getFieldDataType(item.field) === fieldDataTypeEnum.NUMBER"
                                    :id="`filter-value-input-${i}`"
                                    :data-testid="`filter-value-input-${i}`"
                                    v-model="item.value"
                                    :placeholder="$t('policies.smart_filter.select_variables')"
                                    class="w-full"
                                    variant="number"
                                />
                                <MultiSelect
                                    v-else
                                    filter
                                    v-model="item.value"
                                    :placeholder="$t('policies.smart_filter.select_variables')"
                                    :option-label="(option) => isPlainObject(option.name) ? helpers.getLocaleValue(option.name) : option.name"
                                    optionValue="id"
                                    :options="item.filterColumnValues || []"
                                    :loading="loadingColumnValue"
                                    @filter="getFieldValues(item.field)"
                                    class="w-full"
                                />
                            </div>

                            <div class="col-span-6 md:col-span-1 flex justify-center">
                                <Button
                                    :disabled="busy"
                                    icon="pi pi-trash"
                                    severity="danger"
                                    outlined
                                    rounded
                                    @click="removeFilter(i)"
                                    :data-testid="`filter-remove-button-${i}`"
                                />
                            </div>

                            <div class="col-span-6 md:col-span-1 custom-select-button" :data-testid="`filter-row-${i + 1}-start`">
                                <InputField
                                    v-if="i < filters.length - 1"
                                    :data-testid="`filter-condition-type-${i}`"
                                    variant="selectButton"
                                    id="and_or_condition"
                                    v-model="filters[i + 1].type"
                                    :options="Object.values(conditionTypes)"
                                    optionLabel="label"
                                    optionValue="value"
                                    aria-labelledby="basic"
                                />
                            </div>
                        </div>
                    </template>

                </div>
                <div class="edit-cancel-button">
                    <Button
                        v-if="filters.length < MAX_FILTER_COUNT"
                        icon="pi pi-plus"
                        :label="$t('policies.smart_filter.add_filter')"
                        text
                        @click="addFilter"
                        class="mt-4"
                        data-testid="add-filter-button"
                    />
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex w-full items-center justify-between edit-cancel-button gap-x-2">
                <Button
                    data-testid="filters-dialog-cancel"
                    text
                    :label="$t('buttons.cancel')"
                    @click="closeFilterDialog"
                />
                <div class="flex items-center gap-2">
                    <Button
                        data-testid="filters-dialog-save"
                        outlined
                        :label="$t('policies.smart_filter.save_filter')"
                        @click="openSaveFilterDialog"
                    />
                    <Button
                        data-testid="filters-dialog-save"
                        :label="$t('policies.smart_filter.apply_filters')"
                        @click="
                            () => {
                                applyFilter();
                                setSelectedSavedFilterToStore();
                            }
                        "
                        :disabled="
                            filters.length === 0 ||
                            !filters[0]?.field ||
                            !filters[0]?.operator ||
                            !filters[0]?.value ||
                            (Array.isArray(filters[0]?.value)
                                ? !filters[0]?.value?.length
                                : !String(filters[0]?.value || '').length)
                        "
                        :loading="busy"
                    />
                </div>
            </div>
        </template>
    </Dialog>

    <Dialog
        data-testid="save-filter-dialog"
        v-model:visible="showSaveFilterDialog"
        @update:visible="onShow"
        class="w-full max-w-md"
        modal
        :closable="false"
    >
        <template #header>
            <div class="flex items-center justify-between w-full">
                <div class="font-bold text-lg" data-testid="save-filter-dialog-title">
                    {{ $t('policies.smart_filter.save_filter_dialog.title') }}
                </div>
                <Button
                    icon="pi pi-times"
                    text
                    rounded
                    class="h-8 w-8"
                    data-testid="save-filter-dialog-close"
                    @click="closeSaveFilterDialog"
                    aria-label="Close"
                />
            </div>
        </template>

        <div class="space-y-4 py-2">
            <label data-testid="save-filter-dialog-description" class="block">
                {{ $t('policies.smart_filter.save_filter_dialog.description') }}
            </label>
            <div>
                <label data-testid="filter-title-label" class="block mb-2 font-semibold" for="filter_title">
                    {{ $t('policies.smart_filter.save_filter_dialog.filter_title') }} *
                </label>
                <InputField
                    data-testid="filter-title-input"
                    id="filter_title"
                    type="text"
                    variant="text"
                    maxlength="50"
                    v-model="saveFilterTitle"
                    class="w-full"
                />
            </div>
        </div>

        <template #footer>
            <Button
                data-testid="save-filter-dialog-cancel"
                text
                :label="$t('buttons.cancel')"
                @click="closeSaveFilterDialog"
            />
            <Button
                data-testid="save-filter-dialog-save"
                :label="$t('buttons.save')"
                @click="saveFilter"
                :loading="savingFilter"
                :disabled="!saveFilterTitle?.trim()"
            />
        </template>
    </Dialog>
</template>
