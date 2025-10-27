<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useInvoicesStore } from '@/modules/accounting/stores/Invoices';
import { useClientStore } from '@/modules/clients/stores/Client';
import { getFormattedFilter } from '@/config/filter';
import { CONDITION_TYPES, DATE_OPTIONS } from '@/config/filter';
import { accountingComponents } from '../../config/filter';
import { useHelpers } from '@/composables';
import lodash from 'lodash';

const { t } = useI18n();
const toast = useToast();
const invoicesStore = useInvoicesStore();
const clientStore = useClientStore();
const helpers = useHelpers();

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    title: { type: String, default: '' }
});
const emit = defineEmits(['update:modelValue']);

const MAX_FILTERS = 4;
const MAX_SELECTIONS = 20;
const busy = ref(false);

const FIELDS = ['invoice_date', 'status', 'clients', 'business_units']
    .map((f) => accountingComponents.find((c) => c.field === f))
    .filter(Boolean);

const INVOICE_DATE_PRESETS = computed(() => [
    { id: 'LAST_7_DAYS', name: t('invoice.filter.date_options.last_7_days') },
    { id: 'LAST_30_DAYS', name: t('invoice.filter.date_options.last_30_days') },
    { id: 'LAST_60_DAYS', name: t('invoice.filter.date_options.last_60_days') },
    {
        id: 'LAST_12_MONTHS',
        name: t('invoice.filter.date_options.last_12_months')
    },
    { id: 'CUSTOM_RANGE', name: t('invoice.filter.date_options.custom_range') }
]);
const isCustom = (op) => op === 'DATE_BETWEEN';

const availableFields = computed(() => {
    return (filterIndex) => {
        const selectedFields = filters.value
            .filter((_, idx) => idx !== filterIndex)
            .map((f) => f.field)
            .filter(Boolean);

        return FIELDS.filter((field) => !selectedFields.includes(field.field));
    };
});

/* ---------- state ---------- */
const dialogVisible = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v)
});

const filters = ref([]);

function makeFilter() {
    return {
        field: null, // 'invoice_date' | 'status' | 'clients' | 'business_units'
        type: null, // 'date' | 'select' | 'multi_select'
        operator: null, // auto-assigned (see rules)
        value: null, // arrays for selects, null for presets, [start,end] for custom range
        options: [], // items for dropdowns (id,name)
        boolean: CONDITION_TYPES.AND.value,
        loading: false,
        // only for invoice_date custom range:
        customDateRange: [null, null]
    };
}

/* ---------- auto operator rules ---------- */
function autoOperatorFor(field) {
    if (field === 'clients' || field === 'business_units' || field === 'status')
        return 'in';
    return null;
}

/* ---------- data fetching (assumes {id,name}) ---------- */
async function loadOptions(i, search = '') {
    const f = filters.value[i];
    if (!f?.field) return;

    f.loading = true;
    try {
        const cfg = FIELDS.find((x) => x.field === f.field);
        f.type = cfg?.type ?? null;

        if (f.field === 'invoice_date') {
            f.options = INVOICE_DATE_PRESETS.value;
            f.customDateRange = [null, null];
        } else if (f.field === 'clients') {
            const res = await clientStore.searchClients(
                {
                    search: { value: search },
                    includes: [
                        {
                            relation: 'billingDetail'
                        }
                    ]
                },
                { limit: 100 }
            );
            f.options = res?.data ?? [];
            f.operator = autoOperatorFor(f.field);
        } else if (f.field === 'business_units') {
            const res = await clientStore.searchBusinessUnits(
                {
                    search: { value: search },
                    includes: [
                        {
                            relation: 'billingDetail'
                        }
                    ]
                },
                { limit: 100 }
            );
            f.options = res?.data ?? [];
            f.operator = autoOperatorFor(f.field);
        } else if (f.field === 'status') {
            f.operator = autoOperatorFor(f.field); // status → 'in'
            await new Promise((resolve) => setTimeout(resolve, 10));
            if (cfg && cfg.selection_options) {
                f.options = JSON.parse(JSON.stringify(cfg.selection_options));
            }
        } else {
            f.options = [];
            f.operator = autoOperatorFor(f.field);
        }
    } finally {
        f.loading = false;
    }
}

function clearFilterSelection(filter) {
    filter.value = null;
    filter.operator = null;
    filter.options = [];
    filter.customDateRange = [null, null];
}

async function onFieldChange(i) {
    const f = filters.value[i];
    if (!f) return;

    clearFilterSelection(f);

    await loadOptions(i);
}

function onInvoicePresetChange(i) {
    const f = filters.value[i];

    f.operator = f.value || null;
    if (f.value === 'CUSTOM_RANGE') {
        f.operator = 'DATE_BETWEEN';
    }

    if (!isCustom(f.operator)) {
        f.customDateRange = [null, null];
    }
}

function onMultiSelect(i, val) {
    const arr = val || [];
    if (arr.length > MAX_SELECTIONS) {
        filters.value[i].value = arr.slice(0, MAX_SELECTIONS);
        toast.add({
            severity: 'warn',
            summary: t('invoice.export.max_selections_title'),
            detail: t('invoice.export.max_selections_message'),
            life: 3000
        });
    } else {
        filters.value[i].value = arr;
    }
}

function addFilter() {
    if (filters.value.length >= MAX_FILTERS) return;
    filters.value.push({ ...makeFilter(), boolean: CONDITION_TYPES.AND.value });
}

function removeFilter(i) {
    filters.value.splice(i, 1);
}

function closeDialog() {
    onDialogClose();
    dialogVisible.value = false;
}

const disableExport = computed(() => {
    if (filters.value.length === 0) return false;

    return filters.value.some((f, idx) => {
        if (idx === 0 && f.boolean !== CONDITION_TYPES.AND.value) return true;

        if (!f.field) return true;

        // invoice_date: operator is the preset id; value only for custom
        if (f.field === 'invoice_date') {
            if (!f.operator) return true; // must pick a preset
            if (isCustom(f.operator)) {
                const [a, b] = f.customDateRange || [];
                if (!a || !b) return true;
            }
            return false;
        }

        // selects/multiselects with auto operator 'in'
        if (!f.operator) return true; // should be 'in' for status/clients/BUs
        if (!f.value || (Array.isArray(f.value) && f.value.length === 0))
            return true;

        return false;
    });
});

/* ---------- apply ---------- */
async function applyFilters() {
    try {
        busy.value = true;

        const normalized = filters.value.map((filter) => {
            if (filter.field === 'invoice_date') {
                if (isCustom(filter.operator)) {
                    const formattedDates = [...filter.customDateRange].map(
                        (date) => {
                            const d = new Date(date);
                            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                        }
                    );
                    const { customDateRange, ...rest } = filter;
                    const out = { ...rest, value: formattedDates };
                    return out;
                } else {
                    const { customDateRange, ...rest } = filter;
                    const out = { ...rest, value: '' };
                    return out;
                }

                return { ...filter, value: filter.customDateRange };
            }

            if (filter.type === 'multi_select') {
                return { ...filter, value: filter.value.map((v) => v.id) };
            }

            return filter;
        });

        // const payload = getFormattedFilter(normalized);
        await invoicesStore.exportInvoices({ filters: normalized });
        closeDialog();
    } finally {
        busy.value = false;
    }
}

function onDialogClose() {
    filters.value = [];
}
</script>

<style scoped>
.h-full {
    height: 100% !important;
}
</style>

<template>
    <Dialog
        v-model:visible="dialogVisible"
        modal
        :draggable="false"
        :closable="false"
        :style="{ width: '50vw' }"
        data-testid="export-file-dialog"
        @close="onDialogClose()"
    >
        <template #header>
            <div class="flex align-items-center justify-content-between w-full">
                <div class="p-dialog-title" data-testid="export-dialog-title">
                    {{ title || $t('invoice.export.title') }}
                </div>
                <Button
                    icon="pi pi-times"
                    class="p-dialog-header-close border-none p-button-outlined p-2 border-circle"
                    data-testid="export-dialog-close"
                    @click="closeDialog"
                    aria-label="Close"
                />
            </div>
        </template>

        <div class="mt-4">
            <template v-for="(f, i) in filters" :key="i">
                <div class="flex align-items-start">
                    <div class="col-1">
                        <Badge
                            :value="i + 1"
                            :style="{
                                width: '1.85rem',
                                height: '1.85rem',
                                fontSize: '1.03rem'
                            }"
                            :data-testid="`count-badge-${i}`"
                            class="flex align-items-center justify-content-center font-bold"
                        />
                    </div>
                    <!-- Field -->
                    <div class="col-3">
                        <InputField
                            class="w-full"
                            variant="dropdown"
                            v-model="f.field"
                            :options="availableFields(i)"
                            optionLabel="label"
                            optionValue="field"
                            :placeholder="$t('filter.dialog.select_column')"
                            :data-testid="`column-name-input-${i}`"
                            @update:modelValue="() => onFieldChange(i)"
                        />
                    </div>

                    <!-- Value (auto-operator) -->
                    <div class="col-4">
                        <!-- Invoice date presets -->
                        <div v-if="f.field === 'invoice_date'">
                            <ApiDropdown
                                class="w-full"
                                v-model="f.value"
                                :items="INVOICE_DATE_PRESETS"
                                option-label="name"
                                option-value="id"
                                :placeholder="
                                    $t('filter.dialog.select_variables')
                                "
                                :data-testid="`field-value-input-${i}`"
                                @update:modelValue="
                                    () => onInvoicePresetChange(i)
                                "
                            />
                        </div>
                        <div v-if="isCustom(f.operator)" class="grid mt-2">
                            <div class="col">
                                <div class="mb-2">
                                    <label>
                                        {{ $t('filter.dialog.start_date') }}
                                    </label>
                                </div>
                                <Calendar
                                    class="w-full"
                                    selection-mode="single"
                                    dateFormat="dd-M-yy"
                                    v-model="f.customDateRange[0]"
                                    :placeholder="
                                        $t('filter.dialog.start_date')
                                    "
                                    :data-testid="`field-value-input-${i}-start`"
                                />
                            </div>
                            <div class="col">
                                <div class="mb-2">
                                    <label>
                                        {{ $t('filter.dialog.end_date') }}
                                    </label>
                                </div>
                                <Calendar
                                    class="w-full"
                                    selection-mode="single"
                                    dateFormat="dd-M-yy"
                                    v-model="f.customDateRange[1]"
                                    :placeholder="$t('filter.dialog.end_date')"
                                    :data-testid="`field-value-input-${i}-end`"
                                />
                            </div>
                        </div>

                        <!-- Multi-select (clients, business units) -->
                        <ApiMultiselect
                            v-else-if="f.type === 'multi_select'"
                            v-model="f.value"
                            :id="f.field"
                            :key="`${i}-${f.field}`"
                            :items="f.options"
                            localed
                            option-label="name"
                            :shouldSetSelectedItemsOnMounted="true"
                            :loading="f.loading"
                            :disabled="f.loading"
                            :data-testid="`field-value-input-${i}`"
                            @search="(s) => loadOptions(i, s)"
                            @update:modelValue="(val) => onMultiSelect(i, val)"
                        >
                            <template #option="slotProps">
                                <div
                                    class="flex align-items-center justify-content-between w-full"
                                >
                                    <div
                                        v-tooltip.top="
                                            helpers.getLocaleValue(
                                                slotProps.option.name
                                            )
                                        "
                                    >
                                        {{
                                            lodash.truncate(
                                                helpers.getLocaleValue(
                                                    slotProps.option.name
                                                ),
                                                { length: 20 }
                                            )
                                        }}
                                    </div>
                                    <div
                                        v-if="
                                            slotProps.option.billing_detail &&
                                            slotProps.option.billing_detail
                                                .payment_type === 'later'
                                        "
                                    >
                                        <Tag
                                            value="PAY LATER"
                                            severity="secondary"
                                            class="bg-gray-200 text-gray-900"
                                        />
                                    </div>
                                </div>
                            </template>
                        </ApiMultiselect>
                    </div>

                    <!-- Remove -->
                    <div class="col-1 text-right">
                        <Button
                            icon="pi pi-trash"
                            class="p-button-rounded p-button-outlined"
                            style="color: red"
                            :disabled="busy"
                            :data-testid="`filter-remove-button-${i}`"
                            @click="removeFilter(i)"
                        />
                    </div>

                    <!-- AND/OR line -->
                    <div class="col-3" v-if="i < filters.length - 1">
                        <InputField
                            variant="selectButton"
                            :modelValue="filters[i + 1].boolean"
                            @update:modelValue="
                                (v) =>
                                    (filters[i + 1].boolean =
                                        v ?? filters[i + 1].boolean)
                            "
                            :options="Object.values(CONDITION_TYPES)"
                            optionLabel="label"
                            optionValue="value"
                            data-testid="`filter-condition-type-${i}`"
                        />
                    </div>
                </div>
            </template>

            <Button
                v-if="filters.length < MAX_FILTERS"
                text
                icon="pi pi-plus"
                :label="$t('invoice.export.add_condition')"
                class="mt-3"
                data-testid="add-filter-button"
                @click="addFilter"
            />
        </div>

        <template #footer>
            <div class="flex align-items-center justify-content-end w-full">
                <Button
                    text
                    :label="$t('buttons.cancel')"
                    :data-testid="'export-dialog-cancel'"
                    @click="closeDialog"
                />
                <Button
                    :label="$t('invoice.export.export_button')"
                    :loading="busy"
                    :disabled="disableExport"
                    :data-testid="'export-dialog-export'"
                    @click="applyFilters"
                />
            </div>
        </template>
    </Dialog>
</template>
