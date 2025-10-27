<script setup>
import { computed, ref, onBeforeMount } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePreferredLanguageStore } from '@/modules/administration/stores';
import { useGlobalStore } from '@/stores';
import { useHelpers } from '@/composables';
import { PaginationOptions, SortFilterOptions } from '@/config';
import AuditTable from '@/components/common/AuditTable.vue';

const { t } = useI18n();
const helpers = useHelpers();

const globalStore = useGlobalStore();
const preferredLanguageStore = usePreferredLanguageStore();

const menu = ref();
const selectedItem = ref(null);
const loading = ref(false);
const items = ref([]);
const totalRecords = ref();
const searchText = ref('');
const statusUpdateDialog = ref(false);
const statusAuditTableDialog = ref(false);
const defaultDialog = ref(false);
const deleteDialog = ref(false);
const isDialogVisible = ref(false);
const isEditMode = ref(false);
const busy = ref(false);
const formData = ref({
    name: '',
    code: '',
    status: true,
    default: false
});

const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();

onBeforeMount(async () => {
    await getItems();
});

const isDefaultLang = computed(() => {
    if (!selectedItem.value) return false;
    return selectedItem.value.default;
});
const menuItems = computed(() => {
    if (!selectedItem.value) return [];

    const isDefault = selectedItem.value.default;
    const isSystemic = selectedItem.value.systemic;
    const isActive = isItemActive.value;

    const items = [];

    if (isSystemic) {
        items.push({
            label: t('language.make_default'),
            icon: 'pi pi-star',
            command: () => showDefaultDialog(),
            disabled: isDefault,
            permission: 'update languages'
        });
    } else {
        items.push(
            {
                label: t('buttons.edit'),
                icon: 'pi pi-pencil',
                command: () => editItem(selectedItem.value),
                permission: 'update languages'
            },
            {
                label: t('buttons.delete'),
                icon: 'pi pi-trash',
                command: () => showDeleteDialog(),
                disabled: isActive,
                permission: 'delete languages'
            },
            {
                label: isActive
                    ? t('common.make_inactive')
                    : t('common.make_active'),
                icon: isActive ? 'pi pi-times' : 'pi pi-check',
                command: () => showStatusUpdateDialog(),
                disabled: isSystemic || isDefault,
                permission: 'update languages'
            },
            {
                label: t('language.make_default'),
                icon: 'pi pi-star',
                command: () => showDefaultDialog(),
                disabled: isDefault || !isActive,
                permission: 'update languages'
            },
            {
                label: t('common.audit_log'),
                icon: 'pi pi-history',
                command: () => showAuditTableDialog(),
                permission: 'view languages'
            }
        );
    }
    return helpers.filterByPermission(items);
});

const statusDialogHeader = computed(() => {
    return isItemActive.value
        ? t('common.make_item_inactive', {
              item: t('common.language')
          })
        : t('common.make_item_active', {
              item: t('common.language')
          });
});

const statusDialogButtonText = computed(() => {
    return isItemActive.value
        ? t('common.make_inactive')
        : t('common.make_active');
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
              item: t('common.language')
          })
        : t('common.new_item_popup_header', {
              item: t('common.language')
          })
);
const isItemActive = computed(() => {
    return selectedItem.value && selectedItem.value.status === 'active';
});

const showActions = (event, item) => {
    selectedItem.value = item;
    menu.value.toggle(event);
};

const showStatusUpdateDialog = () => {
    statusUpdateDialog.value = true;
};

const showAuditTableDialog = () => {
    statusAuditTableDialog.value = true;
};

const showDeleteDialog = () => {
    deleteDialog.value = true;
};
const showDefaultDialog = () => {
    defaultDialog.value = true;
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

const search = async () => {
    pagination.resetPageParams();
    sortFilters.updateSearch(searchText.value);
    getItems();
};

const openDialog = (mode = 'add') => {
    isEditMode.value = mode === 'edit';
    isDialogVisible.value = true;
};

const closeDialog = () => {
    isDialogVisible.value = false;
    resetForm();
};

const editItem = (item) => {
    formData.value.name = item.name;
    formData.value.code = item.code;
    formData.value.status = item.status === 'active' ? true : false;
    formData.value.default = item.default;
    selectedItem.value = item;
    openDialog('edit');
};

const resetForm = () => {
    formData.value.name = '';
    formData.value.code = '';
    formData.value.status = true;
    formData.value.default = false;
    selectedItem.value = null;
    globalStore.clearErrors();
};

const onShow = () => {
    resetForm();
};

const deleteItem = async () => {
    try {
        loading.value = true;
        if (selectedItem.value) {
            await preferredLanguageStore.deleteItem(selectedItem.value.id);
            await getItems();
        }
    } finally {
        loading.value = false;
        deleteDialog.value = false;
    }
};

const getItems = async () => {
    try {
        loading.value = true;
        const params = { ...pagination.getPageParams() };
        const payload = sortFilters.getSortFilters(searchText.value);
        const res = await preferredLanguageStore.search(payload, params);
        items.value = res.data;
        items.value = res.data.map((language) => ({
            ...language,
            systemic:
                language.code === 'en' || language.code === 'fr' ? true : false
        }));
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
        await preferredLanguageStore.updateStatus(
            selectedItem.value.id,
            payload
        );
        await getItems();
    } finally {
        loading.value = false;
    }
};
const save = async () => {
    try {
        busy.value = true;
        const payload = {
            ...formData.value,
            status: formData.value.status ? 'active' : 'inactive'
        };

        if (isEditMode.value) {
            await preferredLanguageStore.update(selectedItem.value.id, payload);
            closeDialog();
            await getItems();
        } else {
            await preferredLanguageStore.create(payload);
            closeDialog();
            await getItems();
        }
    } catch (error) {
        console.error(error);
    } finally {
        busy.value = false;
    }
};

const makeDefault = async () => {
    try {
        loading.value = true;

        const payload = {
            name: selectedItem.value.name,
            code: selectedItem.value.code,
            default: true,
            status: selectedItem.value.status ? 'active' : 'inactive'
        };
        await preferredLanguageStore.update(selectedItem.value.id, payload);
        await getItems();
        closeDialog();
    } catch (error) {
        console.error(error);
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
                    data-testid="add-new-language-button"
                    :label="
                        $t('common.create_item_btn_label', {
                            item: $t('common.language')
                        })
                    "
                    icon="pi pi-plus"
                    @click="openDialog('add')"
                    v-if="$ability.can('create languages')"
                />
            </div>
        </template>
        <template #empty>
            <span :data-testid="'empty-data-table'">
                {{
                    $t('common.datatable_not_found', {
                        item: $t('common.languages').toLowerCase()
                    })
                }}
            </span>
        </template>

        <template #loading
            >{{
                $t('common.datatable_loading', {
                    item: $t('common.languages').toLowerCase()
                })
            }}
        </template>

        <Column :sortable="true" field="name" class="w-5">
            <template #header>
                <span data-testid="table-header-language">
                    {{ $t('common.language') }}
                </span>
            </template>
            <template #body="{ data, index }">
                <div
                    class="flex align-items-center gap-3"
                    :data-testid="'language-data-table-' + index"
                >
                    <div class="w-10">
                        {{ data.name }}
                    </div>
                    <Badge
                        v-if="data.default"
                        :value="t('language.default')"
                        class="border-round-md"
                        :data-testid="'default-tag-' + index"
                    />
                </div>
            </template>
        </Column>

        <Column :sortable="true" field="code" class="w-2">
            <template #header>
                <span data-testid="table-header-code">
                    {{ $t('common.code') }}
                </span>
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'code-data-table-' + index">
                    {{ data.code }}
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

        <Column class="w-1 text-right">
            <template #body="{ data, index }">
                <i
                    v-if="data.systemic"
                    :data-testid="'systemic-data-table-' + index"
                    class="pi pi-lock text-2xl font-semibold text-red-500 opacity-90"
                ></i>
            </template>
        </Column>

        <Column
            class="w-1"
            v-if="
                $ability.can('update languages') ||
                $ability.can('delete languages')
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
        modal
        :style="{ width: '32vw' }"
        @update:visible="onShow"
        :closable="false"
        v-if="
            $ability.can('create languages') || $ability.can('update languages')
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
                    data-testid="name-label"
                    class="block required mb-2"
                    for="name"
                    >{{ $t('common.language') }}</label
                >
                <InputField
                    data-testid="name-input"
                    :placeholder="$t('common.language')"
                    id="name"
                    variant="text"
                    v-model="formData.name"
                />
            </div>
            <div class="field col-12 mb4">
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
                    variant="text"
                    v-model="formData.code"
                    maxlength="2"
                    :disabled="isEditMode"
                />
            </div>
            <div class="field col-12 mb-5">
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
            <div class="field col-12">
                <div class="flex align-items-center gap-3">
                    <InputSwitch
                        :disabled="!formData.status || !!isDefaultLang"
                        data-testid="default-input"
                        id="default"
                        v-model="formData.default"
                    />
                    <span
                        :class="
                            !formData.status || isDefaultLang
                                ? 'opacity-60'
                                : ''
                        "
                        >{{ $t('language.set_default') }}</span
                    >
                </div>
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
                icon="pi pi-check"
                :label="isEditMode ? $t('buttons.update') : $t('buttons.save')"
                @click="save"
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
        v-if="$ability.can('update languages')"
    />

    <Confirmation
        v-model="defaultDialog"
        :header="
            t('language.make_item_default', { item: t('common.language') })
        "
        :content="
            t('language.are_you_sure_default', { item: selectedItem?.name })
        "
        confirm-button-class="p-button-success"
        :confirm-button-text="t('language.make_default')"
        @confirm="makeDefault"
        dialog-testid="default-dialog"
        close-button-testid="default-close-button"
        cancel-button-testid="default-cancel-button"
        confirm-button-testid="default-confirm-button"
        header-testid="default-title"
        content-testid="default-content"
        v-if="$ability.can('update languages')"
    />

    <Confirmation
        v-model="deleteDialog"
        :header="t('common.delete_item_header', { item: t('common.language') })"
        :content="t('common.are_you_sure_delete', { name: selectedItem?.name })"
        confirm-button-class="p-button-danger"
        @confirm="deleteItem"
        dialog-testid="delete-dialog"
        close-button-testid="delete-close-button"
        cancel-button-testid="delete-cancel-button"
        confirm-button-testid="delete-confirm-button"
        header-testid="delete-title"
        content-testid="delete-content"
        v-if="$ability.can('delete languages')"
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
            <AuditTable entity="language" :entity_id="selectedItem?.id" />
        </template>
    </Dialog>
</template>
