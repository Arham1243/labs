<script setup>
import { computed, onBeforeMount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useProvinceStore } from '@/modules/administration/stores';
import { useGlobalStore, useCommonStore } from '@/stores';
import { ability } from '@/plugins/ability';
import { useHelpers } from '@/composables';
import { PaginationOptions, SortFilterOptions } from '@/config';
import Label from '@/components/common/Label.vue';
import AuditTable from '@/components/common/AuditTable.vue';

const provinceStore = useProvinceStore();
const globalStore = useGlobalStore();
const commonStore = useCommonStore();
const { t } = useI18n();
const helpers = useHelpers();

const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();

const menu = ref();
const loadingCountries = ref(false);
const countries = ref([]);
const loadingTaxTypes = ref(false);
const taxTypes = ref([]);
const selectedItem = ref(null);
const loading = ref(false);
const busy = ref(false);
const items = ref([]);
const isEditMode = ref(false);
const isDialogVisible = ref(false);
const statusUpdateDialog = ref(false);
const deleteDialog = ref(false);
const searchText = ref('');
const totalRecords = ref();
const taxData = ref([{ tax_type_id: null, percentage: null, isNew: true }]);
const formData = ref({
    name: '',
    country_id: [],
    code: '',
    status: true
});

const statusAuditTableDialog = ref(false);

onBeforeMount(async () => {
    await getItems();
    await getCountries('');
    await getTaxTypes();
});

watch(
    () => formData.value.code,
    (newVal) => {
        if (newVal) {
            formData.value.code = newVal.toUpperCase();
        }
    }
);

const menuItems = computed(() => {
    if (!selectedItem.value) return [];

    const allMenuItems = [
        {
            label: t('buttons.edit'),
            icon: 'pi pi-pencil',
            command: () => editItem(selectedItem.value),
            permission: 'update provinces'
        },
        {
            label: isItemActive.value
                ? t('common.make_inactive')
                : t('common.make_active'),
            icon: isItemActive.value ? 'pi pi-times' : 'pi pi-check',
            command: () => showStatusUpdateDialog(),
            permission: 'update provinces'
        },
        {
            label: t('buttons.delete'),
            icon: 'pi pi-trash',
            command: () => showDeleteDialog(),
            disabled: isItemActive.value,
            permission: 'delete provinces'
        },
        {
            label: t('common.audit_log'),
            icon: 'pi pi-history',
            command: () => showAuditTableDialog(),
            permission: 'view provinces'
        }
    ];

    return helpers.filterByPermission(allMenuItems);
});

const isItemActive = computed(() => {
    return selectedItem.value && selectedItem.value.status === 'active';
});

const statusDialogHeader = computed(() => {
    return isItemActive.value
        ? t('common.make_item_inactive', { item: t('common.province') })
        : t('common.make_item_active', { item: t('common.province') });
});

const statusDialogContent = computed(() =>
    isItemActive.value
        ? t('common.are_you_sure_inactive', {
              item: selectedItem.value?.name
          })
        : t('common.are_you_sure_active', {
              item: selectedItem.value?.name
          })
);

const statusDialogButtonClass = computed(() =>
    isItemActive.value ? 'p-button-danger' : 'p-button-success'
);

const statusDialogButtonText = computed(() =>
    isItemActive.value ? t('common.make_inactive') : t('common.make_active')
);

const dialogHeader = computed(() =>
    isEditMode.value
        ? t('common.edit_item_popup_header', {
              item: t('country.province_state')
          })
        : t('common.new_item_popup_header', {
              item: t('country.province_state')
          })
);
const deleteConfirmContent = computed(() => {
    return selectedItem.value
        ? t('common.are_you_sure_delete', {
              name: selectedItem.value?.name
          })
        : '';
});

const addTax = () => {
    taxData.value.push({ tax_type_id: null, percentage: null, isNew: true });
};

const removeTax = (index) => {
    taxData.value.splice(index, 1);
};

const formatTaxes = (taxes) => {
    if (!Array.isArray(taxes) || taxes.length === 0) return '';
    const lines = [];
    for (let i = 0; i < taxes.length; i += 2) {
        const slice = taxes.slice(i, i + 2);
        const line = slice
            .map((t) => `${t.tax_type?.name} (${parseFloat(t.percentage)}%)`)
            .join(', ');
        lines.push(line);
    }
    return lines.join('\n');
};

const showDeleteDialog = () => {
    deleteDialog.value = true;
};

const editItem = () => {
    resetForm();
    formData.value.name = selectedItem.value.name;
    formData.value.code = selectedItem.value.code;
    formData.value.country_id = selectedItem.value.country?.id;
    taxData.value = selectedItem.value.taxes?.length
        ? selectedItem.value.taxes.map((t) => ({
              tax_type_id: t.tax_type_id,
              percentage: parseFloat(t.percentage),
              isNew: false
          }))
        : [{ tax_type_id: null, percentage: null, isNew: true }];
    formData.value.status = selectedItem.value.status === 'active';
    openDialog('edit');
};

const openDialog = (mode = 'add') => {
    isEditMode.value = mode === 'edit';
    isDialogVisible.value = true;
};

const closeDialog = () => {
    isDialogVisible.value = false;
    resetForm();
};
const resetForm = () => {
    getCountries('');
    formData.value.name = '';
    formData.value.code = '';
    formData.value.status = true;
    formData.value.country_id = {};
    taxData.value = [{ tax_type_id: null, percentage: null, isNew: true }];
    globalStore.clearErrors();
};

const onShow = () => {
    resetForm();
};

const showActions = (event, item) => {
    selectedItem.value = item;
    menu.value.toggle(event);
};

const showStatusUpdateDialog = () => {
    statusUpdateDialog.value = true;
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

const getCountries = async (search) => {
    try {
        loadingCountries.value = true;

        const payload = {
            search: search ? { value: search } : undefined
        };
        const res = await commonStore.searchCountries(payload);
        countries.value = res.data;
    } finally {
        loadingCountries.value = false;
    }
};

const getTaxTypes = async () => {
    if (!ability.can('view taxes')) return;
    try {
        loadingTaxTypes.value = true;
        const res = await commonStore.getTaxTypes();
        taxTypes.value = res.data;
    } finally {
        loadingTaxTypes.value = false;
    }
};

const getItems = async () => {
    try {
        loading.value = true;
        const params = { ...pagination.getPageParams() };
        const payload = {
            ...sortFilters.getSortFilters(searchText.value),
            includes: [{ relation: 'country' }]
        };

        if (ability.can('view taxes')) {
            payload.includes.push({ relation: 'taxes' });
        }

        const res = await provinceStore.searchItems(payload, params);
        items.value = res.data;
        totalRecords.value = res.meta.total;
    } finally {
        loading.value = false;
    }
};

const updateStatus = async () => {
    if (!selectedItem.value) return;

    try {
        loading.value = true;
        const newStatus =
            selectedItem.value.status === 'active' ? 'inactive' : 'active';
        const payload = { ...selectedItem.value, status: newStatus };

        await provinceStore.updateStatus(selectedItem.value.id, payload);
        await getItems();
    } finally {
        loading.value = false;
    }
};

const save = async () => {
    const sanitizedTaxes = taxData.value.map(({ isNew, ...rest }) => rest);

    const modifiedFormData = {
        ...formData.value,
        status: formData.value.status === true ? 'active' : 'inactive',
        ...(ability.can('update taxes') ||
        ability.can('create taxes') ||
        ability.can('delete taxes')
            ? {
                  taxes:
                      formData.value.country_id === 'CA' ? sanitizedTaxes : []
              }
            : {})
    };
    try {
        busy.value = true;
        if (isEditMode.value) {
            await provinceStore.update(selectedItem.value.id, modifiedFormData);
        } else {
            await provinceStore.create(modifiedFormData);
        }
        closeDialog();
        await getItems();
    } catch (error) {
        console.error('Error saving data:', error);
    } finally {
        busy.value = false;
    }
};

const deleteItem = async () => {
    try {
        loading.value = true;
        if (selectedItem.value) {
            await provinceStore.deleteItem(selectedItem.value.id);
        }
        await getItems();
    } finally {
        loading.value = false;
    }
};

const showAuditTableDialog = () => {
    statusAuditTableDialog.value = true;
};
</script>

<template>
    <BaseTable
        :value="items"
        :page="pagination.page"
        :rows="pagination.limit"
        :total-records="totalRecords"
        :loading="loading"
        @sort="onSortChange"
        @page="onPageChange"
    >
        <template #header>
            <div class="flex justify-content-between mb-2">
                <Search
                    v-model="searchText"
                    data-testid="search-input"
                    @search="search"
                    :style="{ width: '25vw' }"
                />
                <Button
                    :label="
                        $t('common.create_item_btn_label', {
                            item: $t('country.province_or_state')
                        })
                    "
                    icon="pi pi-plus"
                    @click="openDialog('add')"
                    data-testId="add-new-province-button"
                    v-if="$ability.can('create provinces')"
                />
            </div>
        </template>

        <template #empty>
            <span :data-testid="'empty-data-table'">
                {{
                    $t('common.datatable_not_found', {
                        item: $t('common.provinces').toLowerCase()
                    })
                }}
            </span>
        </template>

        <template #loading
            >{{
                $t('common.datatable_loading', {
                    item: $t('common.provinces').toLowerCase()
                })
            }}
        </template>

        <Column :sortable="true" field="name">
            <template #header>
                <Label testId="table-header-name">{{
                    $t('common.province_state_name')
                }}</Label>
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'name-data-table-' + index">
                    {{ data.name }}
                </span>
            </template>
        </Column>
        <Column :sortable="true" field="country.name">
            <template #header>
                <Label testId="table-header-country">{{
                    $t('common.country')
                }}</Label>
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'country-data-table-' + index">
                    {{ data.country.name }}
                </span>
            </template>
        </Column>
        <Column :sortable="true" field="code">
            <template #header>
                <Label testId="table-header-code">{{
                    $t('common.code')
                }}</Label>
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'code-data-table-' + index">
                    {{ data.code }}
                </span>
            </template>
        </Column>
        <Column
            :sortable="false"
            field="taxes"
            class="tax-type-col"
            v-if="ability.can('view taxes')"
        >
            <template #header>
                <Label testId="table-header-tax-type">{{
                    $t('country.tax_type')
                }}</Label>
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'tax-type-data-table-' + index">
                    <div style="white-space: pre-line; line-height: 1.4">
                        {{ formatTaxes(data.taxes) }}
                    </div>
                </span>
            </template>
        </Column>
        <Column :sortable="true" field="status">
            <template #header>
                <Label testId="table-header-status">{{
                    $t('common.status')
                }}</Label>
            </template>
            <template #body="{ data, index }">
                <StatusTag
                    :status="data.status"
                    :data-testid="'status-tag-' + index"
                />
            </template>
        </Column>

        <Column :sortable="true" field="updated_at" class="w-2">
            <template #header>
                <Label testId="table-header-updated-at">{{
                    $t('common.last_updated')
                }}</Label>
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'last-updated-data-table-' + index">
                    {{ helpers.formatDate(data.updated_at) }}
                </span>
            </template>
        </Column>

        <Column
            v-if="
                $ability.can('update provinces') ||
                $ability.can('delete provinces')
            "
        >
            <template #body="{ data, index }">
                <Button
                    :label="t('common.actions')"
                    icon="pi pi-chevron-down"
                    iconPos="right"
                    size="small"
                    class="p-button-outlined ml-auto flex"
                    @click="showActions($event, data)"
                    :data-testid="'actions-button-' + index"
                />
                <Menu
                    ref="menu"
                    id="overlay_menu"
                    :model="menuItems"
                    :popup="true"
                    :data-testid="'actions-menu-' + index"
                />
            </template>
        </Column>
    </BaseTable>

    <Dialog
        v-model:visible="isDialogVisible"
        :header="dialogHeader"
        @update:visible="onShow"
        :style="{ width: '32vw' }"
        modal
        :closable="false"
        v-if="
            $ability.can('create provinces') || $ability.can('update provinces')
        "
        data-testid="dialog"
    >
        <template #header>
            <div class="flex align-items-center justify-content-between w-full">
                <div class="p-dialog-title" data-testid="dialog-title">
                    {{ dialogHeader }}
                </div>
                <Button
                    icon="pi pi-times"
                    class="p-dialog-header-close border-none p-button-outlined p-2 border-circle"
                    data-testid="dialog-close-button"
                    @click="closeDialog"
                    aria-label="Close"
                />
            </div>
        </template>
        <div class="p-fluid formgrid grid">
            <div class="field col-12 mb-4">
                <label
                    data-testid="province-state-name-label"
                    class="block required mb-2"
                    for="name"
                    >{{ $t('common.province_state_name') }}</label
                >
                <InputField
                    data-testId="province-state-name-input"
                    :placeholder="$t('common.province_state_name')"
                    id="name"
                    type="text"
                    variant="text"
                    v-model="formData.name"
                />
            </div>
            <div class="field col-12 mb-4">
                <label
                    data-testid="code-label"
                    class="block required mb-2"
                    for="code"
                    >{{ $t('common.code') }}</label
                >
                <InputField
                    data-testId="code-input"
                    :placeholder="$t('common.code')"
                    id="code"
                    type="text"
                    variant="text"
                    v-model="formData.code"
                    :disabled="isEditMode"
                    maxlength="2"
                />
            </div>
            <div class="field col-12 mb-4">
                <label
                    data-testid="country-label"
                    class="block required mb-2"
                    for="country_id"
                    >{{ $t('common.country') }}</label
                >
                <ApiDropdown
                    @search-cleared="getCountries"
                    data-testId="country-input"
                    id="country_id"
                    option-value="id"
                    option-label="name"
                    v-model="formData.country_id"
                    @search="getCountries"
                    :loading="loadingCountries"
                    :items="countries"
                />
            </div>
            <div
                class="field col-12 mb-1"
                v-if="formData.country_id == 'CA' && $ability.can('view taxes')"
            >
                <div
                    v-for="(tax, i) in taxData"
                    :key="i"
                    class="formgrid grid mb-2"
                >
                    <div class="field col-6 pr-1">
                        <label
                            class="block required mb-2"
                            :data-testid="`tax-type-label-${i}`"
                            :for="`taxes.${i}.tax_type_id`"
                            >{{ $t('country.tax_type') }}</label
                        >
                        <InputField
                            :id="`taxes.${i}.tax_type_id`"
                            :data-testid="`tax-type-input-${i}`"
                            v-model="tax.tax_type_id"
                            :options="
                                taxTypes.filter(
                                    (tt) =>
                                        !taxData.some(
                                            (t, idx) =>
                                                t.tax_type_id === tt.id &&
                                                idx !== i
                                        )
                                )
                            "
                            :placeholder="$t('common.select')"
                            optionValue="id"
                            optionLabel="name"
                            :disabled="
                                !(
                                    $ability.can('update taxes') ||
                                    (tax.isNew && $ability.can('create taxes'))
                                )
                            "
                            variant="dropdown"
                        />
                    </div>
                    <div class="field col-6">
                        <div
                            class="formgrid grid grid-nogutter align-items-end gap-3 relative"
                        >
                            <div
                                :class="
                                    $ability.can('delete taxes')
                                        ? 'col-9'
                                        : 'col-12'
                                "
                            >
                                <label
                                    :data-testid="`percentage-label-${i}`"
                                    class="block required mb-2"
                                    :for="`taxes.${i}.percentage`"
                                    >{{ $t('country.percentage') }}
                                </label>
                                <InputField
                                    :id="`taxes.${i}.percentage`"
                                    :data-testid="`percentage-input-${i}`"
                                    variant="number"
                                    :min="0"
                                    :maxFractionDigits="3"
                                    addon-after="pi pi-percentage"
                                    v-model="tax.percentage"
                                    :disabled="
                                        !(
                                            $ability.can('update taxes') ||
                                            (tax.isNew &&
                                                $ability.can('create taxes'))
                                        )
                                    "
                                />
                            </div>
                            <div
                                class="col-1"
                                v-if="$ability.can('delete taxes')"
                            >
                                <Button
                                    :data-testid="`remove-button-${i}`"
                                    :disabled="busy"
                                    icon="pi pi-trash"
                                    class="p-button-rounded p-button-outlined absolute"
                                    @click="removeTax(i)"
                                    style="
                                        color: red;
                                        padding: 1.2rem;
                                        top: 1.65rem;
                                        right: -0.25rem;
                                    "
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <Button
                    v-if="$ability.can('create taxes') && taxData.length < 4"
                    :style="{ padding: '0.7rem 0.9rem' }"
                    icon="pi pi-plus"
                    :label="$t('country.add_tax')"
                    text
                    @click="addTax"
                    class="w-max ml-auto flex mt-3"
                />
            </div>
            <div class="field col-12">
                <label
                    data-testid="status-label"
                    class="block mb-2"
                    for="status"
                    >{{ $t('common.status') }}</label
                >
                <div class="flex align-items-center gap-3">
                    <InputSwitch
                        data-testid="status-input"
                        id="status"
                        v-model="formData.status"
                    />
                    <span>{{
                        formData.status
                            ? $t('common.active')
                            : $t('common.inactive')
                    }}</span>
                </div>
            </div>
        </div>
        <template #footer>
            <Button
                text
                :label="$t('buttons.cancel')"
                @click="closeDialog"
                data-testid="cancel-button"
            />
            <Button
                :label="isEditMode ? $t('buttons.save') : $t('common.create')"
                @click="save"
                icon="pi pi-check"
                :loading="busy"
                data-testid="save-button"
            />
        </template>
    </Dialog>

    <Confirmation
        v-model="statusUpdateDialog"
        :header="statusDialogHeader"
        :content="statusDialogContent"
        :confirm-button-class="statusDialogButtonClass"
        :confirm-button-text="statusDialogButtonText"
        @confirm="updateStatus"
        dialog-testid="status-update-dialog"
        close-button-testid="status-update-close-button"
        cancel-button-testid="status-update-cancel-button"
        confirm-button-testid="status-update-confirm-button"
        header-testid="status-update-title"
        content-testid="status-update-content"
        v-if="$ability.can('update provinces')"
    />

    <Confirmation
        v-model="deleteDialog"
        show-alert-icon
        :header="t('common.delete_item_header', { item: t('common.province') })"
        :content="deleteConfirmContent"
        confirm-button-class="p-button-danger"
        @confirm="deleteItem"
        dialog-testid="delete-dialog"
        close-button-testid="delete-close-button"
        cancel-button-testid="delete-cancel-button"
        confirm-button-testid="delete-confirm-button"
        header-testid="delete-title"
        content-testid="delete-content"
        v-if="$ability.can('delete provinces')"
    />

    <Dialog
        data-testid="audit-log-dialog"
        :closable="false"
        v-model:visible="statusAuditTableDialog"
        :style="{ width: '80vw' }"
        modal
    >
        <template #header>
            <div class="flex align-items-center justify-content-between w-full">
                <div
                    class="p-dialog-title"
                    data-testid="audit-log-dialog-title"
                >
                    {{ $t('common.audit_logs') }}
                </div>
                <Button
                    icon="pi pi-times"
                    class="p-dialog-header-close border-none p-button-outlined p-2 border-circle"
                    data-testid="audit-log-dialog-close-button"
                    @click="statusAuditTableDialog = false"
                    aria-label="Close"
                />
            </div>
        </template>
        <template #default>
            <AuditTable entity="province" :entity_id="selectedItem?.id" />
        </template>
    </Dialog>
</template>
<style>
.tax-type-col {
    width: 20%;
}
</style>
