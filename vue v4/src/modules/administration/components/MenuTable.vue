<script setup>
import lodash from 'lodash';
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import {
    useMenuStore,
    usePermissionStore
} from '@/modules/administration/stores';
import { useGlobalStore } from '@/stores';
import { PaginationOptions, SortFilterOptions } from '@/config';
import Reorder from '@/modules/administration/assets/images/reorder.svg';
import useEventsBus from '@/composables/event-bus';
import { useHelpers } from '@/composables';

const menuStore = useMenuStore();
const permissionStore = usePermissionStore();
const globalStore = useGlobalStore();
const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();
const { emit } = useEventsBus();
const { t } = useI18n();
const helpers = useHelpers();

const menu = ref();
const selectedItem = ref(null);
const treeItems = ref([]);
const loading = ref(false);
const dialogMenuItems = ref([]);
const loadingMenuItems = ref(false);
const allItems = ref([]);
const isEditMode = ref(false);
const dialogMode = ref('add');
const isDialogVisible = ref(false);
const busy = ref(false);
const statusUpdateDialog = ref(false);
const totalRecords = ref();
const permissions = ref([]);
const dropDownPermissions = ref([]);
const icons = ref([]);
const deleteDialog = ref(false);
const searchText = ref('');
const filteredIcons = ref([...icons.value]);
const first = ref(0);
const treeTableRef = ref(null);
const draggedNode = ref(null);
const draggedNodeParent = ref(null);
const formData = ref({
    icon: null,
    name: '',
    url: '',
    permission_ids: [],
    parent_id: '',
    status: false,
    system: 0,
    order: null
});

onBeforeMount(async () => {
    await getItems();
    await getMenus();
    await getIcons();
    await getPermissions();
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
              item: isSubmenu.value
                  ? helpers.capitalizeWords(t('menu.sub_menu_item_label'))
                  : t('menu.menu_item')
          })
        : t('common.make_item_active', {
              item: isSubmenu.value
                  ? helpers.capitalizeWords(t('menu.sub_menu_item_label'))
                  : t('menu.menu_item')
          });
});

const deleteDialogHeader = computed(() => {
    return t('common.delete_item_header', {
        item: isSubmenu.value
            ? helpers.capitalizeWords(t('menu.sub_menu_item_label'))
            : t('menu.menu_item')
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

const isSubmenu = computed(() => {
    return selectedItem.value?.parent_id;
});

const dialogHeader = computed(() => {
    switch (dialogMode.value) {
        case 'edit':
            if (selectedItem.value && selectedItem.value.parent_id) {
                return t('common.edit_item_popup_header', {
                    item: t('menu.sub_menu_item')
                });
            }
            return t('common.edit_item_popup_header', {
                item: t('menu.menu_item')
            });
        case 'add-submenu':
            return t('common.new_item_popup_header', {
                item: t('menu.sub_menu_item')
            });
        default:
            return t('common.new_item_popup_header', {
                item: t('menu.menu_item')
            });
    }
});

const showParentMenuField = computed(() => {
    return (
        dialogMode.value === 'add-submenu' ||
        (dialogMode.value === 'edit' && formData.value.parent_id)
    );
});

const shouldDisableFields = computed(() => {
    return (
        dialogMode.value === 'edit' &&
        selectedItem.value &&
        selectedItem.value.system === 1
    );
});

const shouldDisableParentField = computed(() => {
    return (
        (dialogMode.value === 'edit' &&
            selectedItem.value &&
            (selectedItem.value.system === 1 ||
                !!selectedItem.value.parent_id)) ||
        dialogMode.value === 'add-submenu'
    );
});

const menuItems = computed(() => {
    if (!selectedItem.value) return [];

    const allMenuItems = [
        {
            label: t('buttons.edit'),
            icon: 'pi pi-pencil',
            command: () => editItem(selectedItem.value),
            permission: 'update menu items'
        },
        ...(selectedItem.value.parent_id
            ? []
            : [
                  {
                      label: t('menu.add_sub_menu'),
                      icon: 'pi pi-plus',
                      command: () => openAddSubMenuDialog(),
                      permission: 'update menu items'
                  }
              ]),
        {
            label: isItemActive.value
                ? t('common.make_inactive')
                : t('common.make_active'),
            icon: isItemActive.value ? 'pi pi-times' : 'pi pi-check',
            command: () => showStatusUpdateDialog(),
            disabled: isItemSystem.value,
            permission: 'update menu items'
        },
        {
            label: t('buttons.delete'),
            icon: 'pi pi-trash',
            command: () => showDeleteDialog(),
            disabled: isItemActive.value || isItemSystem.value,
            permission: 'delete menu items'
        }
    ];

    return helpers.filterByPermission(allMenuItems);
});

const isItemSystem = computed(() => {
    return selectedItem.value && selectedItem.value.system === 1;
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
    dialogMode.value = mode;
    isEditMode.value = mode === 'edit';
    isDialogVisible.value = true;
    if (!isEditMode.value && mode !== 'add-submenu') {
        selectedItem.value = null;
    }
};

const closeDialog = () => {
    isDialogVisible.value = false;
    resetForm();
};

const resetForm = (isSubmenu = false) => {
    if (isSubmenu) {
        getMenuItems('');
    }
    formData.value.name = '';
    formData.value.url = '';
    formData.value.permission_ids = [];
    formData.value.parent_id = '';
    formData.value.status = isSubmenu ? true : false;
    formData.value.icon = null;
    formData.value.system = 0;
    formData.value.order = null;
    globalStore.clearErrors();
};
const showDeleteDialog = () => {
    deleteDialog.value = true;
};

const editItem = () => {
    const isSubmenuItem = selectedItem.value.parent_id;
    resetForm(isSubmenuItem);

    formData.value.icon = icons.value.find(
        (icon) => icon.icon == selectedItem.value.icon
    );
    formData.value.url = selectedItem.value.url;
    formData.value.name = selectedItem.value.name;
    formData.value.permission_ids = selectedItem.value.permissions?.map(
        (item) => {
            return {
                ...item,
                name: helpers.capitalizeWords(item.name)
            };
        }
    );
    formData.value.parent_id = selectedItem.value.parent_id;
    formData.value.system = selectedItem.value.system;
    formData.value.order = selectedItem.value.order;
    formData.value.status = selectedItem.value.status === 'active';
    openDialog('edit');
};

const openAddSubMenuDialog = () => {
    resetForm(true);
    formData.value.parent_id = selectedItem.value.id;
    openDialog('add-submenu');
};

const onShow = () => {
    resetForm();
};

const showActions = (event, item) => {
    selectedItem.value = item;
    menu.value.toggle(event);
};

const menuItemPermissions = (data) => {
    return (
        data.permissions
            ?.map((permission, index) => {
                if (index === data.permissions.length - 1) {
                    return permission.name;
                } else {
                    return permission.name + ', ';
                }
            })
            .join(' ') ?? ''
    );
};

const toTreeNodes = (data) => {
    let globalIndex = 0;
    return data.map((item) => ({
        id: item.id,
        key: item.id,
        type: 'menu',
        testIndex: globalIndex++,
        data: {
            ...item
        },
        children:
            Array.isArray(item.children) && item.children?.length
                ? item.children.map((child) => ({
                      id: child.id,
                      parent_id: item.id,
                      key: child.id,
                      type: 'submenu',
                      testIndex: globalIndex++,
                      data: {
                          ...child
                      }
                  }))
                : []
    }));
};

const showStatusUpdateDialog = () => {
    statusUpdateDialog.value = true;
};

const onSortChange = (event) => {
    pagination.resetPageParams();
    sortFilters.updateSortFilters(event);
    getItems();
};

const onPageChange = (event) => {
    pagination.updatePageParams(event);
    first.value = event.first;
    getItems();
};

const determineOrder = () => {
    if (isEditMode.value) {
        return selectedItem.value.order;
    }

    return allItems.value.length > 0
        ? Math.max(...allItems.value.map((item) => item.order)) + 1
        : 1;
};

const search = async () => {
    pagination.resetPageParams();
    sortFilters.updateSearch(searchText.value);
    getItems();
};

const onDragStart = (event, node) => {
    draggedNode.value = node;
    draggedNodeParent.value = findNodeParent(treeItems.value, node);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', '');
};

const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
};

const onRowReorder = async (event, dropNode) => {
    event.preventDefault();

    if (!draggedNode.value || draggedNode.value === dropNode) {
        draggedNode.value = null;
        draggedNodeParent.value = null;
        return;
    }

    const dropNodeParent = findNodeParent(treeItems.value, dropNode);

    if (draggedNodeParent.value !== dropNodeParent) {
        draggedNode.value = null;
        draggedNodeParent.value = null;
        return;
    }

    try {
        loading.value = true;

        const siblings = draggedNodeParent.value
            ? draggedNodeParent.value.children
            : treeItems.value;

        const draggedIndex = siblings.findIndex(
            (node) => node === draggedNode.value
        );
        const dropIndex = siblings.findIndex((node) => node === dropNode);

        if (draggedIndex === -1 || dropIndex === -1) {
            return;
        }

        let newOrder;
        if (dropIndex === 0) {
            newOrder = dropNode.data.order - 1;
        } else if (dropIndex === siblings.length - 1) {
            newOrder = dropNode.data.order + 1;
        } else {
            const nextNode =
                siblings[dropIndex + (draggedIndex < dropIndex ? 1 : 0)];
            newOrder = Math.floor(
                (dropNode.data.order + nextNode.data.order) / 2
            );
        }

        const payload = {
            order: newOrder
        };

        await menuStore.updateOrder(draggedNode.value.data.id, payload);

        await getItems();
        emit('reloadMenu');
    } catch (error) {
        console.error('Error reordering menu items:', error);
    } finally {
        loading.value = false;
        draggedNode.value = null;
        draggedNodeParent.value = null;
    }
};

const findNodeParent = (nodes, targetNode) => {
    for (let node of nodes) {
        if (node.children && node.children.includes(targetNode)) {
            return node;
        }
        if (node.children) {
            const parent = findNodeParent(node.children, targetNode);
            if (parent) return parent;
        }
    }
    return null;
};

const searchIcons = (event) => {
    const query = event.query || '';
    if (!query.trim().length) {
        filteredIcons.value = [...icons.value];
    } else {
        filteredIcons.value = icons.value.filter((icon) =>
            icon.icon.toLowerCase().includes(query.toLowerCase())
        );
    }
};

const updateStatus = async () => {
    try {
        loading.value = true;
        const payload = {
            status:
                selectedItem.value.status === 'active' ? 'inactive' : 'active',
            parent_id: selectedItem.value.parent_id
        };
        await menuStore.updateStatus(selectedItem.value.id, payload);
        await getItems();
        emit('reloadMenu');
    } finally {
        loading.value = false;
    }
};

const getMenuItems = async (search) => {
    try {
        loadingMenuItems.value = true;
        const params = {
            limit: 300
        };
        const payload = {
            search: search ? { value: search } : undefined
        };
        const res = await menuStore.search(payload, params);
        dialogMenuItems.value = res.data;
    } finally {
        loadingMenuItems.value = false;
    }
};

const save = async () => {
    const url = formData.value.url || '';
    const modifiedFormData = {
        ...formData.value,
        permission_ids: formData.value.permission_ids?.map((item) => item.id),
        icon: formData.value.icon?.icon ?? null,
        url,
        status: formData.value.status ? 'active' : 'inactive',
        order: isEditMode.value ? formData.value.order : determineOrder()
    };

    try {
        busy.value = true;

        const action = isEditMode.value
            ? menuStore.update(selectedItem.value.id, modifiedFormData)
            : menuStore.create(modifiedFormData);

        await action;
        closeDialog();
        await getItems();
        emit('reloadMenu');
    } catch (err) {
        console.error('Save failed:', err);
    } finally {
        busy.value = false;
    }
};

const deleteItem = async () => {
    try {
        loading.value = true;
        if (selectedItem.value) {
            const isParent = !!selectedItem.value.parent_id;
            await menuStore.deleteItem(selectedItem.value.id, isParent);
        }
        await getItems();
    } finally {
        loading.value = false;
    }
};

const getMenus = async () => {
    const res = await menuStore.getMenus();
    allItems.value = res.data;
};

const getItems = async () => {
    try {
        loading.value = true;
        const params = {
            ...pagination.getPageParams(),
            include: 'children'
        };
        const payload = {
            ...sortFilters.getSortFilters(searchText.value),
            filters: [
                {
                    field: 'parent_id',
                    operator: '=',
                    value: null
                }
            ],
            includes: [
                { relation: 'permissions' },
                { relation: 'children.permissions' }
            ]
        };
        if (payload.sort.length < 1) {
            params.sort = [{ field: 'order', direction: 'asc' }];
        }
        const res = await menuStore.search(payload, params);
        treeItems.value = toTreeNodes(res.data);
        totalRecords.value = res.meta.total;
        await getMenus();
    } finally {
        loading.value = false;
    }
};

const getPermissions = async (search) => {
    const payload = {
        search: {
            value: search
        },
        filters: [
            {
                field: 'type',
                operator: '=',
                value: 'company'
            }
        ]
    };
    const res = await permissionStore.getPermissions(payload);
    permissions.value = res.data;
    dropDownPermissions.value = res.data.map((item) => {
        return {
            ...item,
            name: helpers.capitalizeWords(item.name)
        };
    });
};

const getIcons = async () => {
    const fetchedIcons = await menuStore.getIcons();
    icons.value = fetchedIcons.sort((a, b) => a.icon.localeCompare(b.icon));
};
</script>

<template>
    <div class="treetable-scroll-wrapper">
        <TreeTable
            class="menu-treetable"
            removableSort
            ref="treeTableRef"
            :first="first"
            :value="treeItems"
            :loading="loading"
            @sort="onSortChange"
            :paginator="true"
            :lazy="true"
            :rows="pagination.limit"
            @page="onPageChange"
            :totalRecords="totalRecords"
            :rowsPerPageOptions="[10, 15, 20, 30, 50]"
            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
        >
            <template #header>
                <div class="flex justify-between mb-2">
                    <div>
                        <Search
                            v-model="searchText"
                            @search="search"
                            class="!w-[25vw]"
                            data-testid="search-input"
                        />
                    </div>
                    <div>
                        <Button
                            :label="
                                $t('common.create_item_btn_label', {
                                    item: $t('menu.item')
                                })
                            "
                            icon="pi pi-plus"
                            @click="openDialog('add')"
                            data-testid="add-new-menu-button"
                            v-if="$ability.can('create menu items')"
                        />
                    </div>
                </div>
            </template>
            <template #empty>
                <span :data-testid="'empty-data-table'">
                    {{
                        $t('common.datatable_not_found', {
                            item: $t('menu.menus').toLowerCase()
                        })
                    }}
                </span>
            </template>

            <template #loadingicon>{{
                $t('common.datatable_loading', {
                    item: $t('menu.menus').toLowerCase()
                })
            }}</template>

            <Column class="col-drag text-center">
                <template #body="{ node }">
                    <img
                        v-if="!node.data.parent_id"
                        :src="Reorder"
                        alt="Reorder"
                        class="cursor-move drag-handle"
                        style="width: 17px; height: 19px"
                        draggable="true"
                        @dragstart="(event) => onDragStart(event, node)"
                        @dragover="onDragOver"
                        @drop="(event) => onRowReorder(event, node)"
                        :data-testid="'drag-handle-' + node.testIndex"
                    />
                </template>
            </Column>

            <Column
                :sortable="true"
                field="name"
                expander
                class="col-name flex"
            >
                <template #header>
                    <span data-testid="table-header-name">
                        {{ $t('common.name') }}
                    </span>
                </template>
                <template #body="{ node }">
                    <div class="flex items-center gap-3">
                        <i
                            :class="`${node.data.icon}`"
                            style="font-size: 2rem; color: #2d55a5"
                        >
                        </i>
                        <span
                            class="self-center"
                            :data-testid="'name-tree-table-' + node.testIndex"
                            v-tooltip.top="
                                node.data.name.length > 15
                                    ? node.data.name
                                    : undefined
                            "
                        >
                            {{
                                lodash.truncate(node.data.name, { length: 15 })
                            }}
                        </span>
                    </div>
                </template>
            </Column>

            <Column class="col-url" field="url">
                <template #header>
                    <span data-testid="table-header-url">
                        {{ $t('menu.url') }}
                    </span>
                </template>
                <template #body="{ node }">
                    <span
                        v-tooltip.top="
                            node.data.url.length > 25
                                ? node.data.url
                                : undefined
                        "
                        :data-testid="'url-tree-table-' + node.testIndex"
                    >
                        {{
                            lodash.truncate(node.data.url, {
                                length: 15
                            })
                        }}
                    </span>
                </template>
            </Column>

            <Column field="permission.name" class="capitalize pr-5">
                <template #header>
                    <span data-testid="table-header-permission">
                        {{ $t('common.permission') }}
                    </span>
                </template>
                <template #body="{ node }">
                    <span
                        :data-testid="'permission-tree-table-' + node.testIndex"
                        style="line-height: 1.55"
                        v-tooltip.top="
                            helpers.capitalizeWords(
                                menuItemPermissions(node.data)
                            )
                        "
                    >
                        {{
                            lodash.truncate(menuItemPermissions(node.data), {
                                length: 45
                            })
                        }}
                    </span>
                </template>
            </Column>

            <Column class="col-status" :sortable="true" field="status">
                <template #header>
                    <span data-testid="table-header-status">
                        {{ $t('common.status') }}
                    </span>
                </template>
                <template #body="{ node }">
                    <StatusTag
                        :status="node.data.status"
                        :data-testid="'status-tag-' + node.testIndex"
                    />
                </template>
            </Column>

            <Column class="col-system text-right">
                <template #body="{ node }">
                    <i
                        v-if="node.data.system"
                        :data-testid="'system-tree-table-' + node.testIndex"
                        class="pi pi-lock ml-auto !text-2xl font-semibold text-red-500 opacity-90"
                    ></i>
                </template>
            </Column>

            <Column
                class="col-actions"
                v-if="
                    $ability.can('update menu items') ||
                    $ability.can('delete menu items')
                "
            >
                <template #body="{ node }">
                    <div class="edit-cancel-button">
                        <Button
                            :label="t('common.actions')"
                            icon="pi pi-chevron-down"
                            iconPos="right"
                            variant="outlined"
                            class="!flex ml-auto"
                            @click="showActions($event, node.data)"
                            :data-testid="'actions-button-' + node.testIndex"
                        />
                        <Menu
                            ref="menu"
                            id="overlay_menu"
                            :model="menuItems"
                            :popup="true"
                            :data-testid="'actions-menu-' + node.testIndex"
                        />
                    </div>
                </template>
            </Column>
        </TreeTable>
    </div>

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
        v-if="$ability.can('update menu items')"
    />

    <Dialog
        v-model:visible="isDialogVisible"
        :header="dialogHeader"
        @update:visible="onShow"
        :style="{ width: '32vw' }"
        modal
        data-testid="dialog"
        :closable="false"
        v-if="
            $ability.can('create menu items') ||
            $ability.can('update menu items')
        "
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
            <div class="col-span-12 mb-4">
                <label
                    data-testid="icon-label"
                    class="block required mb-2"
                    for="icon"
                    >{{ $t('menu.icon') }}</label
                >
                 <Select
                    filter
                    class="w-full"
                    data-testid="icon-input"
                    :disabled="shouldDisableFields"
                    id="icon"
                    optionLabel="icon"
                    v-model="formData.icon"
                    :options="icons"
                >
                    <template #value="{ value }">
                        <div v-if="value" class="flex items-center gap-3">
                            <i :class="`text-xl ${value?.icon}`"></i>
                            <span>{{ value?.icon }}</span>
                        </div>
                        <div v-else>
                            {{ $t('common.select') }}
                        </div>
                    </template>
                    <template #option="{ option }">
                        <div style="text-overflow: ellipsis; max-width: 100px">
                            <div class="flex items-center gap-3">
                                <i :class="`text-xl ${option?.icon}`"></i>
                                <div>{{ option?.icon }}</div>
                            </div>
                        </div>
                    </template>
                </Select>
                <small
                    v-for="(error, index) in globalStore.errors?.icon"
                    :key="index"
                    class="p-error block"
                    :class="{
                        'mb-2': index == globalStore.errors.icon.length - 1
                    }"
                    id="text-error"
                    data-testid="validation-error"
                >
                    {{ error }}
                </small>
            </div>

            <div class="col-span-12 mb-4" v-if="showParentMenuField">
                <label
                    class="block required mb-2"
                    for="type"
                    data-testid="menu-item-label"
                    >{{ $t('menu.menu_item') }}</label
                >
                <ApiDropdown
                    class="hide-dropdown-icon w-full"
                    data-testId="menu-item-input"
                    id="parent_id"
                    option-value="id"
                    option-label="name"
                    v-model="formData.parent_id"
                    @search="getMenuItems"
                    :loading="loadingMenuItems"
                    :items="dialogMenuItems"
                    :disabled="shouldDisableParentField"
                />
            </div>

            <div class="col-span-12 mb-4">
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
            <div class="col-span-12 mb-4">
                <label
                    data-testid="url-label"
                    class="block required mb-2"
                    for="url"
                    >{{ $t('menu.url') }}</label
                >
                <div class="p-inputgroup flex-wrap">
                    <InputField
                        data-testid="url-input"
                        id="url"
                        type="text"
                        variant="text"
                        v-model="formData.url"
                        :disabled="shouldDisableFields"
                        class="w-full"
                    />
                </div>
            </div>

            <div class="col-span-12 mb-4">
                <label
                    data-testid="permission-label"
                    class="block required mb-2"
                    for="permission_ids"
                    >{{ $t('common.permission') }}</label
                >
                <InputField
                    data-testid="permission-input"
                    filter
                    id="permission_ids"
                    variant="multiselect"
                    display="chip"
                    :disabled="shouldDisableFields"
                    :options="dropDownPermissions"
                    optionLabel="name"
                    :placeholder="$t('common.select')"
                    v-model="formData.permission_ids"
                    @search="getPermissions"
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
                <div class="flex items-center gap-3">
                    <InputField
                        variant="switch"
                        :disabled="shouldDisableFields"
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

    <Confirmation
        v-model="deleteDialog"
        show-alert-icon
        :header="deleteDialogHeader"
        :content="deleteConfirmContent"
        confirm-button-class="p-button-danger"
        @confirm="deleteItem"
        dialog-testid="delete-dialog"
        close-button-testid="delete-close-button"
        cancel-button-testid="delete-cancel-button"
        confirm-button-testid="delete-confirm-button"
        header-testid="delete-title"
        content-testid="delete-content"
        v-if="$ability.can('delete menu items')"
    />
</template>

<style>
.treetable-scroll-wrapper {
    overflow-x: auto;
}
.menu-treetable {
    table-layout: fixed !important;
    min-width: 970px;
    width: 100%;
}
.menu-treetable .p-treetable-thead > tr > th,
.menu-treetable .p-treetable-tbody > tr > td {
    border: none;
}
.menu-treetable td.col-name {
    padding-left: 0.85rem !important;
}
.menu-treetable .col-drag {
    width: 50px !important;
}
.menu-treetable .col-name {
    width: 220px !important;
}
.menu-treetable .col-url {
    width: 200px !important;
}
.menu-treetable .col-status {
    width: 12% !important;
}
.menu-treetable .col-system {
    width: 9% !important;
}
.menu-treetable .col-actions {
    width: 10% !important;
}
.menu-treetable .p-treetable-tbody > tr:hover {
    background: var(--primary-50);
}
.menu-treetable .p-treetable-node-toggle-button {
    margin-right: 0 !important;
    overflow: hidden !important;
    width: 30px !important;
    height: 30px !important;
}
.hide-dropdown-icon .p-select-dropdown {
    display: none !important;
}
</style>
