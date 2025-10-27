<script setup>
import { computed, onBeforeMount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUnderwriterStore } from '@/modules/administration/stores';
import { useGlobalStore } from '@/stores';
import { useHelpers } from '@/composables';
import { PaginationOptions, SortFilterOptions } from '@/config';
import AuditTable from '@/components/common/AuditTable.vue';

const underwriterStore = useUnderwriterStore();
const globalStore = useGlobalStore();

const { t } = useI18n();
const helpers = useHelpers();

const menu = ref();
const selectedItem = ref(null);
const loading = ref(false);
const underwriters = ref([]);
const isEditMode = ref(false);
const isDialogVisible = ref(false);
const busy = ref(false);
const totalRecords = ref();
const formData = ref({
    code: '',
    name: '',
    status: true
});
const getItems = async () => {
    try {
        loading.value = true;
        const params = { ...pagination.getPageParams() };
        const payload = sortFilters.getSortFilters(searchText.value);
        const res = await underwriterStore.searchUnderwriters(payload, params);
        underwriters.value = res.data;
        totalRecords.value = res.meta.total;
    } finally {
        loading.value = false;
    }
};
onBeforeMount(async () => {
    await getItems();
});

const statusDialogHeader = computed(() => {
    return isItemActive.value
        ? t('underwriters.make_underwriter_inactive')
        : t('underwriters.make_underwriter_active');
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
        ? t('underwriters.edit_popup_header')
        : t('underwriters.create_popup_header')
);

const openDialog = (mode = 'add') => {
    isEditMode.value = mode === 'edit';
    isDialogVisible.value = true;
};

const closeDialog = () => {
    isDialogVisible.value = false;
    resetForm();
};

const resetForm = () => {
    formData.value.code = '';
    formData.value.name = '';
    formData.value.status = true;
    globalStore.clearErrors();
};

const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();

const statusUpdateDialog = ref(false);
const statusAuditTableDialog = ref(false);

const menuItems = computed(() => {
    if (!selectedItem.value) return [];

    const allMenuItems = [
        {
            label: t('buttons.edit'),
            icon: 'pi pi-pencil',
            command: () => editItem(selectedItem.value),
            permission: 'update underwriters'
        },
        {
            label: isItemActive.value
                ? t('common.make_inactive')
                : t('common.make_active'),
            icon: isItemActive.value ? 'pi pi-times' : 'pi pi-check',
            command: () => showStatusUpdateDialog(),
            permission: 'update underwriters'
        },
        {
            label: t('common.audit_log'),
            icon: 'pi pi-history',
            command: () => showAuditTableDialog(),
            permission: 'view underwriters'
        }
    ];
    return helpers.filterByPermission(allMenuItems);
});

const editItem = () => {
    formData.value.code = selectedItem.value.code;
    formData.value.name = selectedItem.value.name;
    formData.value.status = selectedItem.value.status === 'active';
    openDialog('edit');
};

const isItemActive = computed(() => {
    return selectedItem.value && selectedItem.value.status === 'active';
});

const showActions = (event, item) => {
    selectedItem.value = item;
    menu.value.toggle(event);
};
const statusDialogButtonText = computed(() => {
    return isItemActive.value
        ? t('common.make_inactive')
        : t('common.make_active');
});

const showStatusUpdateDialog = () => {
    statusUpdateDialog.value = true;
};

const showAuditTableDialog = () => {
    statusAuditTableDialog.value = true;
};

const searchText = ref('');

const onSortChange = (event) => {
    pagination.resetPageParams();
    sortFilters.updateSortFilters(event);
    getItems();
};

const onPageChange = (event) => {
    pagination.updatePageParams(event);
    getItems();
};

const search = async () => {
    pagination.resetPageParams();
    sortFilters.updateSearch(searchText.value);
    getItems();
};

const updateStatus = async () => {
    try {
        loading.value = true;
        const payload = {
            status:
                selectedItem.value.status === 'active' ? 'inactive' : 'active'
        };
        await underwriterStore.updateUnderwriterStatus(
            selectedItem.value.id,
            payload
        );
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
            await underwriterStore.updateUnderwriter(
                selectedItem.value.id,
                modifiedFormData
            );
            closeDialog();
            getItems();
        } else {
            await underwriterStore.createUnderwriter(modifiedFormData);
            closeDialog();
            getItems();
        }
    } catch (error) {
        console.error('Error saving data:', error);
    } finally {
        busy.value = false;
    }
};

const onShow = () => {
    resetForm();
};

watch(
    () => formData.value.code,
    (newVal) => {
        if (newVal) {
            formData.value.code = newVal.toUpperCase();
        }
    }
);
</script>

<template>
    <BaseTable
        :value="underwriters"
        :page="pagination.page"
        :rows="pagination.limit"
        :total-records="totalRecords"
        :loading="loading"
        @sort="onSortChange"
        @page="onPageChange"
    >
        <template #header>
            <div class="flex justify-between mb-2">
                <div>
                    <Search
                        data-testid="search-input"
                        v-model="searchText"
                        @search="search"
                        class="!w-[25vw]"
                    />
                </div>
                <div>
                    <Button
                        :label="$t('underwriters.create_btn_label')"
                        data-testid="create-new-button"
                        icon="pi pi-plus"
                        @click="openDialog('add')"
                        v-if="$ability.can('create underwriters')"
                    />
                </div>
            </div>
        </template>
        <template #empty>
            <span :data-testid="'empty-data-table'">
                {{
                    $t('common.datatable_not_found', {
                        item: $t('common.underwriters').toLowerCase()
                    })
                }}
            </span>
        </template>
        <template #loading
            >{{
                $t('common.datatable_loading', {
                    item: $t('common.underwriters').toLowerCase()
                })
            }}
        </template>

        <Column :sortable="true" field="name" class="w-[41%]">
            <template #header>
                <span data-testid="table-header-name">{{
                    $t('common.name')
                }}</span>
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'name-data-table-' + index">
                    {{ data.name }}
                </span>
            </template>
        </Column>

        <Column :sortable="true" field="code">
            <template #header>
                <span data-testid="table-header-code">{{
                    $t('common.code')
                }}</span>
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'code-data-table-' + index">
                    {{ data.code }}
                </span>
            </template>
        </Column>
        <Column field="benefits_count">
            <template #header>
                <span data-testid="table-header-benefits-count">{{
                    $t('common.benefit_groups')
                }}</span>
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'benefits-count-data-table-' + index">
                    {{ data.benefits_count }}
                </span>
            </template>
        </Column>

        <Column :sortable="true" field="status">
            <template #header>
                <span data-testid="table-header-status">{{
                    $t('common.status')
                }}</span>
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
                <span data-testid="table-header-last-updated">{{
                    $t('common.last_updated')
                }}</span>
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'last-updated-data-table-' + index">
                    {{ helpers.formatDate(data.updated_at) }}
                </span>
            </template>
        </Column>

        <Column v-if="$ability.can('update underwriters')">
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
        v-if="
            $ability.can('create underwriters') ||
            $ability.can('update underwriters')
        "
    />

    <Dialog
        data-testid="dialog"
        v-model:visible="isDialogVisible"
        @update:visible="onShow"
        :header="dialogHeader"
        :style="{ width: '32vw' }"
        modal
        :closable="false"
        v-if="
            $ability.can('update underwriters') ||
            $ability.can('create underwriters')
        "
    >
        <template #header>
            <div class="flex items-center justify-between w-full edit-cancel-button">
                <div class="p-dialog-title" data-testid="dialog-title">
                    {{ dialogHeader }}
                </div>
                <Button
                    icon="pi pi-times"
                    data-testid="dialog-close-button"
                    text
                    rounded
                    @click="closeDialog"
                    aria-label="Close"
                />
            </div>
        </template>

        <div class="grid grid-cols-12 gap-2">
            <div class="col-span-12 mb-2" data-testid="name-field">
                <label
                    data-testid="name-label"
                    class="block required mb-2"
                    for="name"
                    >{{ $t('common.name') }}</label
                >
                <InputField
                    data-testid="name-input"
                    :placeholder="$t('common.name')"
                    id="name"
                    type="text"
                    variant="text"
                    v-model="formData.name"
                    class="w-full"
                />
            </div>
            <div class="col-span-12 mb-2" data-testid="code-field">
                <label
                    data-testid="code-label"
                    class="block required mb-2"
                    for="code"
                    >{{ $t('common.code') }}</label
                >
                <InputField
                    data-testid="code-input"
                    :placeholder="$t('common.code')"
                    id="code"
                    type="text"
                    variant="text"
                    v-model="formData.code"
                    maxlength="3"
                    class="w-full"
                />
            </div>
            <div class="col-span-12" data-testid="status-field">
                <label
                    data-testid="status-label"
                    class="block mb-2"
                    for="status"
                    >{{ $t('common.status') }}</label
                >
                <div class="flex items-center gap-2">
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
                    data-testid="cancel-button"
                    text
                    :label="$t('buttons.cancel')"
                    class="no-underline mr-2"
                    @click="closeDialog"
                />
                <Button
                    data-testid="save-button"
                    icon="pi pi-check"
                    :label="isEditMode ? $t('buttons.update') : $t('buttons.save')"
                    @click="save"
                    :loading="busy"
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
            <div class="flex items-center justify-between w-full edit-cancel-button">
                <div
                    class="p-dialog-title"
                    data-testid="audit-log-dialog-title"
                >
                    {{ $t('common.audit_logs') }}
                </div>
                <Button
                    icon="pi pi-times"
                    text
rounded
                    data-testid="audit-log-dialog-close-button"
                    @click="statusAuditTableDialog = false"
                    aria-label="Close"
                />
            </div>
        </template>
        <template #default>
            <AuditTable entity="underwriter" :entity_id="selectedItem?.id" />
        </template>
    </Dialog>
</template>
