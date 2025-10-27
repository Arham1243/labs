<script setup>
import { computed, ref, onBeforeMount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoleStore } from '@/modules/administration/stores';
import { useGlobalStore } from '@/stores';
import { useHelpers } from '@/composables';
import { PaginationOptions, SortFilterOptions } from '@/config';
import { useRoute, useRouter } from 'vue-router';
import Label from '@/components/common/Label.vue';

const { t } = useI18n();
const helpers = useHelpers();
const roleStore = useRoleStore();
const globalStore = useGlobalStore();

const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();

const menu = ref();
const selectedItem = ref(null);
const loading = ref(false);
const isDialogVisible = ref(false);
const busy = ref(false);
const isEditMode = ref(false);
const items = ref([]);
const totalRecords = ref();
const router = useRouter();
const route = useRoute();
const deleteDialog = ref(false);
const types = [
    { name: 'company' },
    { name: 'client' },
    { name: 'business_unit' },
    { name: 'service_provider' },
    { name: 'insured' }
];
const selectedType = ref('all');
const searchText = ref('');
const typeOptions = computed(() => [
    { label: t('common.all'), value: 'all' },
    ...types.map((type) => ({
        label: formatType(type.name),
        value: type.name
    }))
]);
const formData = ref({
    type: '',
    name: '',
    description: ''
});
onBeforeMount(async () => {
    await getItems();
});

const formatType = (type) => {
    return type
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const formattedTypes = computed(() => {
    return types.map((type) => ({
        name: formatType(type.name),
        value: type.name
    }));
});

const deleteConfirmContent = computed(() => {
    return selectedItem.value
        ? t('common.are_you_sure_delete', {
              name: selectedItem.value?.name
          })
        : '';
});

const menuItems = computed(() => {
    if (!selectedItem.value) return [];

    const allMenuItems = [
        {
            label: t('common.view'),
            icon: 'pi pi-eye',
            command: () => goToView(),
            permission: 'view roles'
        },
        {
            label: t('buttons.edit'),
            icon: 'pi pi-pencil',
            command: () => editItem(selectedItem.value),
            permission: 'update roles'
        },
        {
            label: t('buttons.delete'),
            icon: 'pi pi-trash',
            command: () => showDeleteDialog(),
            permission: 'delete roles'
        }
    ];

    return helpers.filterByPermission(allMenuItems);
});

const dialogHeader = computed(() =>
    isEditMode.value
        ? t('common.edit_item_popup_header', {
              item: t('common.role')
          })
        : t('common.new_item_popup_header', {
              item: t('common.role')
          })
);

const showActions = (event, item) => {
    selectedItem.value = item;
    menu.value.toggle(event);
};

const showDeleteDialog = () => {
    deleteDialog.value = true;
};

const deleteItem = async () => {
    try {
        loading.value = true;
        if (selectedItem.value) {
            await roleStore.deleteItem(selectedItem.value.id);
        }
        const updatedItems = items.value.filter(
            (item) => item.id !== selectedItem.value.id
        );
        items.value = updatedItems;
    } finally {
        loading.value = false;
    }
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

const getItems = async () => {
    try {
        loading.value = true;
        const params = { ...pagination.getPageParams() };
        const payload = sortFilters.getSortFilters(searchText.value);
        const res = await roleStore.search(payload, params);
        items.value = res.data;
        totalRecords.value = res.meta.total;
    } finally {
        loading.value = false;
    }
};

const rowClicked = ({ data }) => {
    sessionStorage.setItem('previousRoute', route.fullPath);
    if (!data.systemic) {
        router.push({
            name: 'RolePermissions',
            params: { id: data.id }
        });
    }
};

const goToView = () => {
    sessionStorage.setItem('previousRoute', route.fullPath);
    router.push({
        name: 'RolePermissions',
        params: { id: selectedItem.value.id }
    });
};

const openDialog = (mode = 'add') => {
    isEditMode.value = mode === 'edit';
    isDialogVisible.value = true;
};

const closeDialog = () => {
    isDialogVisible.value = false;
    resetForm();
};

const editItem = () => {
    formData.value.type = selectedItem.value.type;
    formData.value.name = selectedItem.value.name;
    formData.value.description = selectedItem.value.description;
    openDialog('edit');
};

const resetForm = () => {
    formData.value.type = '';
    formData.value.name = '';
    formData.value.description = '';
    globalStore.clearErrors();
};

const save = async () => {
    try {
        busy.value = true;
        const payload = {
            ...formData.value,
            type: formData.value.type.replace(/\s+/g, '_').toLowerCase()
        };
        if (isEditMode.value) {
            const res = await roleStore.update(selectedItem.value.id, payload);
            items.value = items.value.map((item) =>
                item.id === selectedItem.value.id ? res.data : item
            );
            closeDialog();
        } else {
            const res = await roleStore.create(payload);
            items.value.unshift(res.data);
            closeDialog();
        }
    } catch (error) {
        console.error(error);
    } finally {
        busy.value = false;
    }
};

const onShow = () => {
    resetForm();
};

const onTypeFilterChange = (event) => {
    let value = event.value.value;
    sortFilters.updateTypeFilter(value);
    pagination.resetPageParams();
    getItems();
};
</script>

<template>
    <BaseTable
        :value="items"
        :page="pagination.page"
        :rows="pagination.limit"
        @row-click="rowClicked"
        :total-records="totalRecords"
        :loading="loading"
        @sort="onSortChange"
        @page="onPageChange"
    >
        <template #header>
            <div class="flex justify-content-between align-items-center mb-2">
                <div class="flex align-items-center gap-4 mb-2">
                    <Search
                        data-testid="search-input"
                        v-model="searchText"
                        @search="search"
                        :style="{ width: '30vw' }"
                    />
                    <Dropdown
                        data-testid="type-filter-dropdown"
                        :options="typeOptions"
                        v-model="selectedType"
                        @change="onTypeFilterChange"
                        optionLabel="label"
                        class="filter-dropdown"
                    >
                        <template #value="{ value }">
                            {{ $t('common.type') }}:
                            {{
                                value.label != null
                                    ? value.label
                                    : $t('common.all')
                            }}
                        </template>
                    </Dropdown>
                </div>
                <Button
                    data-testid="add-new-role-button"
                    :label="
                        $t('common.create_item_btn_label', {
                            item: $t('common.role')
                        })
                    "
                    icon="pi pi-plus"
                    @click="openDialog('add')"
                    v-if="$ability.can('create roles')"
                />
            </div>
        </template>
        <template #empty>
            <span :data-testid="'empty-data-table'">
                {{
                    $t('common.datatable_not_found', {
                        item: $t('common.roles').toLowerCase()
                    })
                }}
            </span>
        </template>

        <template #loading>{{
            $t('common.datatable_loading', {
                item: $t('common.roles').toLowerCase()
            })
        }}</template>

        <Column :sortable="true" field="name" :class="'p-break-all'">
            <template #header>
                <Label test-id="table-header-name">{{
                    t('common.role')
                }}</Label>
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'name-data-table-' + index">
                    {{ data.name }}
                </span>
            </template>
        </Column>

        <Column :sortable="true" field="type">
            <template #header>
                <Label test-id="table-header-type">{{
                    t('common.type')
                }}</Label>
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'type-data-table-' + index">
                    {{ formatType(data.type) }}
                </span>
            </template>
        </Column>

        <Column :sortable="true" field="updated_at">
            <template #header>
                <Label test-id="table-header-last-updated">{{
                    t('common.last_updated')
                }}</Label>
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
            v-if="$ability.can('update roles') || $ability.can('delete roles')"
        >
            <template #body="{ data, index }">
                <Button
                    :disabled="data.systemic"
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

    <Confirmation
        v-model="deleteDialog"
        show-alert-icon
        :header="t('common.delete_item_header', { item: t('common.role') })"
        :content="deleteConfirmContent"
        confirm-button-class="p-button-danger"
        @confirm="deleteItem"
        dialog-testid="delete-dialog"
        close-button-testid="delete-close-button"
        cancel-button-testid="delete-cancel-button"
        confirm-button-testid="delete-confirm-button"
        header-testid="delete-title"
        content-testid="delete-content"
        v-if="$ability.can('delete roles')"
    />

    <Dialog
        data-testid="dialog"
        v-model:visible="isDialogVisible"
        :header="dialogHeader"
        @update:visible="onShow"
        :style="{ width: '30vw' }"
        modal
        :closable="false"
        v-if="$ability.can('create roles') || $ability.can('update roles')"
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
                    class="block required mb-2"
                    for="type"
                    data-testid="type-label"
                    >{{ $t('common.type') }}</label
                >
                <InputField
                    :disabled="isEditMode"
                    data-testid="type-input"
                    v-model="formData.type"
                    :options="formattedTypes"
                    optionValue="value"
                    :placeholder="$t('common.type')"
                    optionLabel="name"
                    class="w-full"
                    id="type"
                    variant="dropdown"
                />
            </div>
            <div class="field col-12 mb-4">
                <label
                    class="block required mb-2"
                    for="name"
                    data-testid="name-label"
                    >{{ $t('common.role_name') }}</label
                >
                <InputField
                    data-testid="name-input"
                    :placeholder="$t('common.role_name')"
                    id="name"
                    type="text"
                    variant="text"
                    v-model="formData.name"
                />
            </div>
            <div class="field col-12 mb-4">
                <label
                    class="block mb-2"
                    for="description"
                    data-testid="description-label"
                    >{{ $t('common.description') }}</label
                >
                <InputField
                    data-testid="description-input"
                    :placeholder="$t('common.description')"
                    id="description"
                    type="text"
                    variant="text"
                    v-model="formData.description"
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
                icon="pi pi-check"
                :label="isEditMode ? $t('buttons.update') : $t('buttons.save')"
                @click="save"
                :loading="busy"
            />
        </template>
    </Dialog>
</template>
