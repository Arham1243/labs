<script setup>
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useGenderStore } from '@/modules/administration/stores';
import { useGlobalStore } from '@/stores';
import { useHelpers } from '@/composables';
import { PaginationOptions, SortFilterOptions } from '@/config';
import AuditTable from '@/components/common/AuditTable.vue';

const genderStore = useGenderStore();
const globalStore = useGlobalStore();
const { t } = useI18n();
const helpers = useHelpers();
const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();

const menu = ref();
const selectedItem = ref(null);
const loading = ref(false);
const items = ref([]);
const isEditMode = ref(false);
const isDialogVisible = ref(false);
const busy = ref(false);
const totalRecords = ref();
const statusUpdateDialog = ref(false);
const statusAuditTableDialog = ref(false);
const deleteDialog = ref(false);
const searchText = ref('');
const formData = ref({
    name: '',
    status: true
});

onBeforeMount(async () => {
    await getItems();
});

const deleteConfirmContent = computed(() => {
    return selectedItem.value
        ? t('common.are_you_sure_delete', {
              name: selectedItem.value?.name
          })
        : '';
});

const statusDialogHeader = computed(() => {
    return isItemActive.value
        ? t('common.make_item_inactive', {
              item: t('genders.gender')
          })
        : t('common.make_item_active', {
              item: t('genders.gender')
          });
});

const statusDialogContent = computed(() => {
    return isItemActive.value
        ? t('common.are_you_sure_inactive', {
              item: selectedItem.value?.name
          })
        : t('common.are_you_sure_active', {
              item: selectedItem.value?.name
          });
});
const statusDialogButtonClass = computed(() => {
    return isItemActive.value ? 'p-button-danger' : 'p-button-success';
});

const dialogHeader = computed(() =>
    isEditMode.value
        ? t('common.edit_item_popup_header', {
              item: t('genders.gender')
          })
        : t('common.new_item_popup_header', {
              item: t('genders.gender')
          })
);

const menuItems = computed(() => {
    if (!selectedItem.value) return [];

    const allMenuItems = [
        {
            label: t('buttons.edit'),
            icon: 'pi pi-pencil',
            command: () => editItem(selectedItem.value)
        },
        {
            label: isItemActive.value
                ? t('common.make_inactive')
                : t('common.make_active'),
            icon: isItemActive.value ? 'pi pi-times' : 'pi pi-check',
            command: () => showStatusUpdateDialog()
        },
        {
            label: t('buttons.delete'),
            icon: 'pi pi-trash',
            command: () => showDeleteDialog(),
            disabled: isItemActive.value
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

const showDeleteDialog = () => {
    deleteDialog.value = true;
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
    formData.value.name = '';
    formData.value.status = true;
    globalStore.clearErrors();
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

const editItem = () => {
    resetForm();
    formData.value.name = selectedItem.value.name;
    formData.value.status = selectedItem.value.status === 'active';
    openDialog('edit');
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
        const res = await genderStore.search(payload, params);
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
        await genderStore.updateStatus(selectedItem.value.id, payload);
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
            await genderStore.update(selectedItem.value.id, modifiedFormData);
            closeDialog();
            await getItems();
        } else {
            await genderStore.create(modifiedFormData);
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
        await genderStore.deleteItem(selectedItem.value.id);
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
            <div class="flex justify-between items-center mb-2">
                <div class="custom-search">
                    <Search
                        v-model="searchText"
                        @search="search"
                        :style="{ width: '30vw' }"
                        data-testId="search-input"
                    />
                </div>
                <div>
                    <Button
                        :label="$t('genders.create_btn_label')"
                        icon="pi pi-plus"
                        @click="openDialog('add')"
                        data-testId="create-new-button"
                    />
                </div>
            </div>
        </template>
        <template #empty>
            <span :data-testid="'empty-data-table'">
                {{
                    $t('common.datatable_not_found', {
                        item: $t('genders.title').toLowerCase()
                    })
                }}
            </span>
        </template>

        <template #loading>{{
            $t('common.datatable_loading', {
                item: $t('genders.title').toLowerCase()
            })
        }}</template>
        <Column :sortable="true" field="name">
            <template #header>
                <span data-testid="table-header-name">
                    {{ $t('common.name') }}
                </span>
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'name-data-table-' + index">
                    {{ data.name }}
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

        <Column>
            <template #body="{ data, index }">
                <div class="edit-cancel-button">
                    <Button
                        :label="t('common.actions')"
                        icon="pi pi-chevron-down"
                        iconPos="right"
                        variant="outlined"
                        class="!flex ml-auto"
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
                </div>
            </template>
        </Column>
    </BaseTable>

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
    />

    <Confirmation
        v-model="deleteDialog"
        show-alert-icon
        :header="
            t('common.delete_item_header', {
                item: t('genders.gender')
            })
        "
        :content="deleteConfirmContent"
        confirm-button-class="p-button-danger"
        @confirm="deleteItem"
        dialog-testid="delete-dialog"
        close-button-testid="delete-close-button"
        cancel-button-testid="delete-cancel-button"
        confirm-button-testid="delete-confirm-button"
        header-testid="delete-title"
        content-testid="delete-content"
    />

    <Dialog
        v-model:visible="isDialogVisible"
        :header="dialogHeader"
        @update:visible="onShow"
        :style="{ width: '32vw' }"
        modal
        data-testid="dialog"
        :closable="false"
    >
        <template #header>
            <div
                class="flex items-center justify-between w-full edit-cancel-button"
            >
                <div class="p-dialog-title" data-testid="dialog-title">
                    {{ dialogHeader }}
                </div>
                <Button
                    icon="pi pi-times"
                    data-testid="dialog-close-button"
                    @click="closeDialog"
                    aria-label="Close"
                    rounded
                    text
                />
            </div>
        </template>
        <div class="grid grid-cols-12">
            <div class="field col-span-12 mb-6">
                <label
                    data-testid="gender-label"
                    class="block required mb-2"
                    for="name"
                    >{{ $t('genders.gender_name') }}</label
                >
                <InputField
                    data-testid="gender-input"
                    id="name"
                    type="text"
                    variant="text"
                    v-model="formData.name"
                    class="w-full"
                />
            </div>

            <div class="col-span-12">
                <label
                    data-testid="status-label"
                    class="block mb-2"
                    for="status"
                    >{{ $t('common.status') }}</label
                >
                <div class="flex items-center gap-4">
                    <InputField
                        variant="switch"
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
            <div class="edit-cancel-button">
                <Button
                    text
                    :label="$t('buttons.cancel')"
                    @click="closeDialog"
                    data-testid="cancel-button"
                    class="mr-2"
                />
                <Button
                    :label="
                        isEditMode ? $t('buttons.update') : $t('buttons.save')
                    "
                    @click="save"
                    icon="pi pi-check"
                    :loading="busy"
                    data-testid="save-button"
                />
            </div>
        </template>
    </Dialog>

    <Dialog
        data-testid="audit-log-dialog"
        :closable="false"
        v-model:visible="statusAuditTableDialog"
        :style="{ width: '80vw' }"
        modal
    >
        <template #header>
            <div
                class="flex items-center justify-between w-full edit-cancel-button"
            >
                <div
                    class="p-dialog-title"
                    data-testid="audit-log-dialog-title"
                >
                    {{ $t('common.audit_logs') }}
                </div>
                <Button
                    icon="pi pi-times"
                    data-testid="audit-log-dialog-close-button"
                    @click="statusAuditTableDialog = false"
                    aria-label="Close"
                    rounded
                    text
                />
            </div>
        </template>
        <template #default>
            <AuditTable entity="gender" :entity_id="selectedItem?.id" />
        </template>
    </Dialog>
</template>
