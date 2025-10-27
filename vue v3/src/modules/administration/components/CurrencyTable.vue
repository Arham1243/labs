<script setup>
import { computed, onBeforeMount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCurrencyStore } from '@/modules/administration/stores';
import { useGlobalStore } from '@/stores';
import { useHelpers } from '@/composables';
import { PaginationOptions, SortFilterOptions } from '@/config';
import AuditTable from '@/components/common/AuditTable.vue';

const currencyStore = useCurrencyStore();
const globalStore = useGlobalStore();
const { t } = useI18n();
const helpers = useHelpers();

const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();
const statusUpdateDialog = ref(false);
const statusAuditTableDialog = ref(false);
const searchText = ref('');
const menu = ref();
const selectedItem = ref(null);
const loading = ref(false);
const items = ref([]);
const isEditMode = ref(false);
const isDialogVisible = ref(false);
const busy = ref(false);
const totalRecords = ref();
const deleteDialog = ref(false);
const formData = ref({
    id: '',
    name: '',
    symbol: '',
    status: true
});

onBeforeMount(async () => {
    await getItems();
});

watch(
    () => formData.value.id,
    (newVal) => {
        if (newVal) {
            formData.value.id = newVal.toUpperCase();
        }
    }
);

const deleteConfirmContent = computed(() => {
    return selectedItem.value
        ? t('common.are_you_sure_delete', {
              name: selectedItem.value?.id
          })
        : '';
});

const statusDialogHeader = computed(() => {
    return isItemActive.value
        ? t('common.make_item_inactive', {
              item: t('common.currency')
          })
        : t('common.make_item_active', {
              item: t('common.currency')
          });
});

const statusDialogContent = computed(() => {
    return isItemActive.value
        ? t('common.are_you_sure_inactive', {
              item: selectedItem.value?.id
          })
        : t('common.are_you_sure_active', {
              item: selectedItem.value?.id
          });
});
const statusDialogButtonClass = computed(() => {
    return isItemActive.value ? 'p-button-danger' : 'p-button-success';
});

const dialogHeader = computed(() =>
    isEditMode.value
        ? t('common.edit_item_popup_header', {
              item: t('common.currency')
          })
        : t('common.new_item_popup_header', {
              item: t('common.currency')
          })
);

const menuItems = computed(() => {
    if (!selectedItem.value) return [];

    const allMenuItems = [
        {
            label: t('buttons.edit'),
            icon: 'pi pi-pencil',
            command: () => editItem(selectedItem.value),
            permission: 'update currencies'
        },
        {
            label: isItemActive.value
                ? t('common.make_inactive')
                : t('common.make_active'),
            icon: isItemActive.value ? 'pi pi-times' : 'pi pi-check',
            command: () => showStatusUpdateDialog(),
            permission: 'update currencies'
        },
        {
            label: t('buttons.delete'),
            icon: 'pi pi-trash',
            command: () => showDeleteDialog(),
            disabled: isItemActive.value,
            permission: 'delete currencies'
        },
        {
            label: t('common.audit_log'),
            icon: 'pi pi-history',
            command: () => showAuditTableDialog()
        }
    ];

    return helpers.filterByPermission(allMenuItems);
});

const isItemActive = computed(() => {
    return selectedItem.value && selectedItem.value.status === 'active';
});

const statusDialogButtonText = computed(() => {
    return isItemActive.value
        ? t('common.make_inactive')
        : t('common.make_active');
});

const openDialog = (mode = 'add') => {
    isEditMode.value = mode === 'edit';
    isDialogVisible.value = true;
};

const closeDialog = () => {
    isDialogVisible.value = false;
    resetForm();
};
const resetForm = () => {
    formData.value.id = '';
    formData.value.name = '';
    formData.value.symbol = '';
    globalStore.clearErrors();
};

const showDeleteDialog = () => {
    deleteDialog.value = true;
};

const editItem = () => {
    resetForm();
    formData.value.id = selectedItem.value.id;
    formData.value.name = selectedItem.value.name;
    formData.value.symbol = selectedItem.value.symbol;
    formData.value.status =
        selectedItem.value.status === 'active' ? true : false;
    openDialog('edit');
};

const showStatusUpdateDialog = () => {
    statusUpdateDialog.value = true;
};

const showAuditTableDialog = () => {
    statusAuditTableDialog.value = true;
};

const showActions = (event, item) => {
    selectedItem.value = item;
    menu.value.toggle(event);
};

const onSortChange = (event) => {
    pagination.resetPageParams();
    sortFilters.updateSortFilters(event);
    getItems();
};

const onPageChange = (event) => {
    pagination.updatePageParams(event);
    getItems();
};

const onShow = () => {
    resetForm();
};

const search = async () => {
    pagination.resetPageParams();
    sortFilters.updateSearch(searchText.value);
    getItems();
};

const getItems = async () => {
    try {
        loading.value = true;
        const params = { ...pagination.getPageParams() };
        const payload = sortFilters.getSortFilters(searchText.value);
        const res = await currencyStore.search(payload, params);
        items.value = res.data;
        totalRecords.value = res.meta.total;
    } finally {
        loading.value = false;
    }
};

const updateStatus = async () => {
    try {
        loading.value = true;
        const payload = {
            status:
                selectedItem.value.status === 'active' ? 'inactive' : 'active'
        };
        await currencyStore.updateStatus(selectedItem.value.id, payload);
        await getItems();
    } finally {
        loading.value = false;
    }
};

const save = async () => {
    const modifiedFormData = {
        ...formData.value,
        status: formData.value.status === true ? 'active' : 'inactive'
    };
    try {
        busy.value = true;
        if (isEditMode.value) {
            await currencyStore.update(selectedItem.value.id, modifiedFormData);
            closeDialog();
            await getItems();
        } else {
            await currencyStore.create(modifiedFormData);
            closeDialog();
            await getItems();
        }
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
            await currencyStore.deleteItem(selectedItem.value.id);
        }
        await getItems();
    } finally {
        loading.value = false;
    }
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
                    data-testid="search-input"
                    v-model="searchText"
                    @search="search"
                    :style="{ width: '25vw' }"
                />
                <Button
                    data-testid="add-new-currency-button"
                    :label="
                        $t('common.create_item_btn_label', {
                            item: $t('common.currency')
                        })
                    "
                    icon="pi pi-plus"
                    @click="openDialog('add')"
                    v-if="$ability.can('create currencies')"
                />
            </div>
        </template>
        <template #empty>
            <span :data-testid="'empty-data-table'">
                {{
                    $t('common.datatable_not_found', {
                        item: $t('common.currencies').toLowerCase()
                    })
                }}
            </span>
        </template>

        <template #loading
            >{{
                $t('common.datatable_loading', {
                    item: $t('common.currencies').toLowerCase()
                })
            }}
        </template>

        <Column :sortable="true" field="id">
            <template #header>
                <span data-testid="table-header-code">
                    {{ $t('common.code') }}
                </span>
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'code-data-table-' + index">
                    {{ data.id }}
                </span>
            </template>
        </Column>
        <Column :sortable="true" field="name" :class="'p-break-all w-4'">
            <template #header>
                <span data-testid="table-header-description">
                    {{ $t('common.description') }}
                </span>
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'name-data-table-' + index">
                    {{ data.name }}
                </span>
            </template>
        </Column>
        <Column field="symbol">
            <template #header>
                <span data-testid="table-header-symbol">
                    {{ $t('currency.symbol') }}
                </span>
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'symbol-data-table-' + index">
                    {{ data.symbol }}
                </span>
            </template>
        </Column>

        <Column :sortable="true" field="status">
            <template #header>
                <span data-testid="table-header-status">
                    {{ $t('common.status') }}
                </span>
            </template>
            <template #body="{ data, index }">
                <StatusTag
                    :status="data.status"
                    :data-testid="'status-tag-' + index"
                />
            </template>
        </Column>

        <Column :sortable="true" field="updated_at">
            <template #header>
                <span data-testid="table-header-last-updated">
                    {{ $t('common.last_updated') }}
                </span>
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'last-updated-data-table-' + index">
                    {{ helpers.formatDate(data.updated_at) }}
                </span>
            </template>
        </Column>

        <Column
            v-if="
                $ability.can('update currencies') ||
                $ability.can('delete currencies')
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
        data-testid="dialog"
        v-model:visible="isDialogVisible"
        :header="dialogHeader"
        @update:visible="onShow"
        :style="{ width: '32vw' }"
        modal
        :closable="false"
        v-if="
            $ability.can('create currencies') ||
            $ability.can('update currencies')
        "
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
                    data-testid="code-label"
                    class="block required mb-2"
                    for="id"
                    >{{ $t('common.code') }}</label
                >
                <InputField
                    data-testid="code-input"
                    :placeholder="$t('common.code')"
                    id="id"
                    type="text"
                    variant="text"
                    v-model="formData.id"
                    :disabled="isEditMode"
                    maxlength="3"
                />
            </div>
            <div class="field col-12 mb-4">
                <label
                    data-testid="name-label"
                    class="block required mb-2"
                    for="name"
                    >{{ $t('common.description') }}</label
                >
                <InputField
                    data-testid="name-input"
                    :placeholder="$t('common.description')"
                    id="name"
                    type="text"
                    variant="text"
                    v-model="formData.name"
                />
            </div>
            <div class="field col-12 mb-4">
                <label
                    data-testid="symbol-label"
                    class="block required mb-2"
                    for="symbol"
                    >{{ $t('currency.symbol') }}</label
                >
                <InputField
                    data-testid="symbol-input"
                    :placeholder="$t('currency.symbol')"
                    id="symbol"
                    type="text"
                    variant="text"
                    v-model="formData.symbol"
                    maxlength="5"
                />
            </div>
        </div>
        <template #footer>
            <Button
                data-testid="cancel-button"
                text
                :label="$t('buttons.cancel')"
                @click="closeDialog"
            />
            <Button
                data-testid="save-button"
                :label="isEditMode ? $t('buttons.update') : $t('buttons.save')"
                @click="save"
                icon="pi pi-check"
                :loading="busy"
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
        v-if="$ability.can('update currencies')"
    />

    <Confirmation
        v-model="deleteDialog"
        show-alert-icon
        :header="t('common.delete_item_header', { item: t('common.currency') })"
        :content="deleteConfirmContent"
        confirm-button-class="p-button-danger"
        @confirm="deleteItem"
        dialog-testid="delete-dialog"
        close-button-testid="delete-close-button"
        cancel-button-testid="delete-cancel-button"
        confirm-button-testid="delete-confirm-button"
        header-testid="delete-title"
        content-testid="delete-content"
        v-if="$ability.can('delete currencies')"
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
            <AuditTable
                data-testid="audit-table"
                entity="currency"
                :entity_id="selectedItem?.id"
            />
        </template>
    </Dialog>
</template>
