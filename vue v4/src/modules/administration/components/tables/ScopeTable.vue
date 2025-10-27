<script setup>
import lodash from 'lodash';
import { computed, ref, onBeforeMount, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useScopeStore } from '@/modules/administration/stores';
import { useRouter } from 'vue-router';
import { PaginationOptions, SortFilterOptions } from '@/config';

const props = defineProps({
    action: {
        type: String,
        required: true
    },
    entity: {
        type: String,
        required: true
    },
    entity_id: {
        type: String,
        required: true
    }
});

const emit = defineEmits(['reloadScopes']);

const { t } = useI18n();
const router = useRouter();
const scopeStore = useScopeStore();
const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();

const selectedNode = ref({});
const selectedNodes = ref({});
const scopes = ref([]);
const allScopesRaw = ref([]);
const menuMultipleAction = ref();
const totalRecords = ref();
const searchText = ref('');
const first = ref(0);
const treeTableRef = ref(null);
const loading = ref(false);
const includeDialog = ref(false);
const excludeDialog = ref(false);
const selectAll = ref(false);
const rows = ref(pagination.limit);

onBeforeMount(async () => {
    await getItems();
});

watch(
    selectedNodes,
    () => {
        const all = allSelectableKeys.value.every(
            (key) => selectedNodes.value[key]?.checked
        );
        selectAll.value = all;

        allScopesRaw.value.forEach((client) => {
            const clientId = client.id;
            const buIds = client.business_units?.map((bu) => bu.id) || [];

            const hasAnyBUSelected = buIds.some(
                (id) => selectedNodes.value[id]?.checked
            );

            if (!hasAnyBUSelected && selectedNodes.value[clientId]) {
                delete selectedNodes.value[clientId];
            }
        });
    },
    { deep: true }
);

const allSelectableKeys = computed(() => {
    const keys = [];
    allScopesRaw.value.forEach((client) => {
        keys.push(client.id);
        client.business_units?.forEach((bu) => {
            keys.push(bu.id);
        });
    });
    return keys;
});

const hasAnySelection = computed(() =>
    Object.values(selectedNodes.value).some((node) => node.checked)
);

const menuMultipleActionItems = computed(() => {
    const items = [];

    if (props.action === 'excluded') {
        items.push({
            label: t('scopes.include'),
            icon: 'pi pi-check',
            command: () => handleIncludeScope()
        });
    }

    if (props.action === 'included') {
        items.push({
            label: t('scopes.exclude'),
            icon: 'pi pi-times',
            command: () => handleExcludeScope()
        });
    }

    return items;
});

const includeHeader = computed(() => {
    const count = Object.keys(selectedNodes.value).length;

    return count > 1
        ? t('scopes.include_item_header', { item: t('scopes.scopes') })
        : t('scopes.include_item_header', { item: t('scopes.scope') });
});

const includeConfirmContent = computed(() => {
    const count = Object.keys(selectedNodes.value).length;
    if (count > 0) {
        const item =
            count > 1
                ? t('scopes.scopes').toLowerCase()
                : t('scopes.scope').toLowerCase();
        return t('scopes.are_you_sure_include_multiple', {
            item: item
        });
    }
    return t('scopes.are_you_sure_include_item', {
        item: selectedNode.value?.data?.name
    });
});

const excludeHeader = computed(() => {
    const count = Object.keys(selectedNodes.value).length;

    return count > 1
        ? t('scopes.exclude_item_header', { item: t('scopes.scopes') })
        : t('scopes.exclude_item_header', { item: t('scopes.scope') });
});

const excludeConfirmContent = computed(() => {
    const count = Object.keys(selectedNodes.value).length;
    if (count > 0) {
        const item =
            count > 1
                ? t('scopes.scopes').toLowerCase()
                : t('scopes.scope').toLowerCase();
        return t('scopes.are_you_sure_exclude_multiple', {
            item: item
        });
    }
    return t('scopes.are_you_sure_exclude_item', {
        item: selectedNode.value?.data?.name
    });
});

const paginatedScopes = computed(() => {
    const start = first.value;
    const end = start + rows.value;
    return scopes.value.slice(start, end);
});

const isPageSelected = computed(() => {
    return paginatedScopes.value.every((client) => {
        if (!selectedNodes.value[client.key]?.checked) return false;
        return client.children?.every(
            (bu) => selectedNodes.value[bu.key]?.checked
        );
    });
});

const handleIncludeScope = (node = null) => {
    selectedNode.value = node || null;
    showIncludeDialog();
};

const showIncludeDialog = () => {
    includeDialog.value = true;
};

const handleExcludeScope = (node = null) => {
    selectedNode.value = node || null;
    showExcludeDialog();
};

const showExcludeDialog = () => {
    excludeDialog.value = true;
};

const showMenu = (event) => {
    menuMultipleAction.value.toggle(event);
};

const goToDetail = (node) => {
    const isParent = node.type === 'client';
    const clientId = !isParent ? node.client_id : null;
    const id = node.id;

    const route = isParent
        ? { name: 'Client Details', params: { id: id } }
        : {
              name: 'Business Unit Details',
              params: { clientId: clientId, id: id }
          };

    router.push(route);
};

const handleRowClick = (node) => {
    if (!node) return;
    goToDetail(node);
};

const toTreeNodes = (data) => {
    let globalIndex = 0;
    return data.map((item) => ({
        id: item.id,
        key: item.id,
        type: 'client',
        testIndex: globalIndex++,
        data: {
            name: item.name,
            status: item.status
        },
        children:
            Array.isArray(item.business_units) && item.business_units.length
                ? item.business_units.map((bu) => ({
                      id: bu.id,
                      client_id: item.id,
                      key: bu.id,
                      type: 'bu',
                      testIndex: globalIndex++,
                      data: {
                          name: bu.name,
                          status: bu.status
                      }
                  }))
                : []
    }));
};

const togglePageSelect = (val) => {
    paginatedScopes.value.forEach((client) => {
        if (val) {
            selectedNodes.value[client.key] = {
                checked: true,
                partialChecked: false
            };
            client.children?.forEach((bu) => {
                selectedNodes.value[bu.key] = {
                    checked: true,
                    partialChecked: false
                };
            });
        } else {
            delete selectedNodes.value[client.key];
            client.children?.forEach((bu) => {
                delete selectedNodes.value[bu.key];
            });
        }
    });
};

const toggleSelectAll = () => {
    const allSelected = Object.keys(selectedNodes.value).length > 0;

    if (allSelected) {
        selectedNodes.value = {};
    } else {
        const newSelection = {};

        scopes.value.forEach((client) => {
            newSelection[client.key] = {
                checked: true,
                partialChecked: false
            };

            client.children?.forEach((bu) => {
                newSelection[bu.key] = {
                    checked: true,
                    partialChecked: false
                };
            });
        });

        selectedNodes.value = newSelection;
    }
};

const searchInScopes = (data, searchText) => {
    const search = searchText?.toLowerCase?.().trim() || '';

    return data.filter((client) => {
        const clientMatch = client.name.toLowerCase().includes(search);
        const buMatch = client.business_units.some((bu) =>
            bu.name.toLowerCase().includes(search)
        );

        return clientMatch || buMatch;
    });
};

const sortScopes = (data, sort) => {
    if (!sort?.field) return data;

    return [...data].sort((a, b) => {
        const fieldA = a[sort.field]?.toString().toLowerCase() || '';
        const fieldB = b[sort.field]?.toString().toLowerCase() || '';

        if (fieldA < fieldB) return sort.direction === 'asc' ? -1 : 1;
        if (fieldA > fieldB) return sort.direction === 'asc' ? 1 : -1;
        return 0;
    });
};

const onSortChange = (event) => {
    sortFilters.updateSortFilters(event);
    getItems();
};

const onPageChange = (event) => {
    loading.value = true;
    first.value = event.first;
    rows.value = event.rows;
    setTimeout(() => {
        loading.value = false;
    }, 300);
};

const search = async () => {
    sortFilters.updateSearch(searchText.value);
    getItems();
};

const getItems = async () => {
    try {
        loading.value = true;
        const payload = {
            ...sortFilters.getSortFilters(searchText.value)
        };
        const res = await scopeStore.search(
            props.entity,
            props.entity_id,
            props.action
        );
        allScopesRaw.value = res.data;
        const searched = await searchInScopes(res.data, payload.search?.value);
        const sorted = await sortScopes(searched, payload.sort[0]);
        scopes.value = toTreeNodes(sorted);
    } finally {
        loading.value = false;
    }
};

const sync = async (mode) => {
    try {
        loading.value = true;
        let idsArray = [];

        if (!selectAll.value) {
            const hasBulkSelection =
                Object.keys(selectedNodes.value).length > 0;

            if (hasBulkSelection) {
                scopes.value.forEach((client) => {
                    client.children?.forEach((bu) => {
                        if (selectedNodes.value[bu.key]?.checked) {
                            idsArray.push(bu.key);
                        }
                    });
                });
            } else if (selectedNode.value) {
                const node = selectedNode.value;
                const isClient = node.type === 'client';
                const hasChildren = node.children?.length > 0;

                if (isClient && hasChildren) {
                    idsArray = node.children.map((child) => child.key);
                } else {
                    idsArray = [node.key];
                }
            }
        }

        const payload = {
            resources: idsArray,
            select_all: selectAll.value
        };

        await scopeStore.sync(props.entity, props.entity_id, mode, payload);
        selectedNode.value = {};
        selectedNodes.value = {};
        selectAll.value = false;
        emit('reloadScopes');
        await getItems();
    } catch (error) {
        console.log(error);
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <TreeTable
        class="scopes-treetable"
        removableSort
        ref="treeTableRef"
        :first="first"
        :value="scopes"
        selectionMode="checkbox"
        v-model:selectionKeys="selectedNodes"
        :loading="loading"
        @sort="onSortChange"
        :paginator="true"
        :rows="pagination.limit"
        @page="onPageChange"
        :totalRecords="totalRecords"
        :rowsPerPageOptions="[10, 15, 30, 50]"
        paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
    >
        <template #header>
            <div class="flex justify-between items-center">
                <div class="flex items-center">
                    <Button
                        @click="toggleSelectAll"
                        class="p-button-outlined mr-6 flex gap-2"
                        data-testid="select-all-button"
                        style="padding: 0.65rem 1rem"
                        :disabled="scopes.length === 0"
                    >
                        <InputField
                            class="pointer-events-none"
                            inputId="select-all"
                            v-model="selectAll"
                            data-testid="select-all-input"
                            size="small"
                            variant="checkbox"
                            binary
                        />

                        <span class="pointer-events-none">{{
                            t('scopes.select_all')
                        }}</span>
                    </Button>

                    <Button
                        :disabled="!hasAnySelection"
                        :label="t('buttons.bulk_actions')"
                        icon="pi pi-chevron-down"
                        iconPos="right"
                        style="padding: 0.7rem 1rem"
                        class="p-button-outlined"
                        @click="showMenu"
                        data-testid="bulk-actions-button"
                    />
                </div>

                <Menu
                    ref="menuMultipleAction"
                    id="overlay_menu"
                    :model="menuMultipleActionItems"
                    :popup="true"
                    data-testid="bulk-actions-menu"
                />
                <div class="flex items-center gap-12 custom-search">
                    <Search
                        data-testid="search-input"
                        v-model="searchText"
                        @search="search"
                        :style="{
                            width: '25vw',
                            margin: '0'
                        }"
                    />
                </div>
            </div>
        </template>
        <template #empty>
            <span :data-testid="'empty-data-table'">
                {{
                    $t('common.datatable_not_found', {
                        item: $t('scopes.title').toLowerCase()
                    })
                }}
            </span>
        </template>
        <template #loadingicon>{{
            $t('common.datatable_loading', {
                item: $t('scopes.title').toLowerCase()
            })
        }}</template>
        <Column
            :sortable="true"
            field="name"
            expander
            style="width: 500px"
            class="flex items-center"
        >
            <template #header>
                <div class="flex items-center gap-8">
                    <InputField
                        class="bulk-checkbox"
                        style="scale: 1.03"
                        binary
                        variant="checkbox"
                        :model-value="
                            paginatedScopes.length === 0
                                ? false
                                : isPageSelected
                        "
                        :disabled="paginatedScopes.length === 0"
                        @update:model-value="togglePageSelect"
                        @click.stop
                    />
                    <span data-testid="table-header-name">
                        {{ $t('scopes.client_name') }}
                    </span>
                </div>
            </template>
            <template #body="{ node }">
                <span
                    @click.stop="handleRowClick(node)"
                    class="entity-name cursor-pointer ml-2"
                    :data-testid="'name-tree-table-' + node.testIndex"
                    v-tooltip.top="
                        node.data.name.length > 50 ? node.data.name : null
                    "
                >
                    {{ lodash.truncate(node.data.name, { length: 50 }) }}
                </span>
            </template>
        </Column>

        <Column :sortable="true" field="status">
            <template #header>
                <span data-testid="table-header-status">
                    {{ $t('common.status') }}
                </span>
            </template>
            <template #body="{ node }">
                <StatusTag
                    class="status-tag"
                    :status="node.data.status"
                    :data-testid="'status-tag-' + node.testIndex"
                />
            </template>
        </Column>
        <Column class="py-0">
            <template #body="{ node }">
                <Button
                    v-if="props.action === 'excluded'"
                    @click="handleIncludeScope(node)"
                    icon="pi pi-plus"
                    :disabled="hasAnySelection"
                    size="medium"
                    style="padding: 1.2rem"
                    class="action-button p-button-rounded p-button-outlined ml-auto flex"
                    :data-testid="'include-button-' + node.testIndex"
                />
                <Button
                    v-if="props.action === 'included'"
                    @click="handleExcludeScope(node)"
                    icon="pi pi-times"
                    :disabled="hasAnySelection"
                    size="medium"
                    style="padding: 1.2rem"
                    class="action-button p-button-rounded p-button-outlined ml-auto flex"
                    :data-testid="'exclude-button-' + node.testIndex"
                />
            </template>
        </Column>
    </TreeTable>

    <Confirmation
        v-model="includeDialog"
        :header="includeHeader"
        :content="includeConfirmContent"
        :confirm-button-text="$t('scopes.include')"
        confirm-button-class="p-button-success"
        @confirm="sync('attach')"
        dialog-testid="include-dialog"
        close-button-testid="include-close-button"
        cancel-button-testid="include-cancel-button"
        confirm-button-testid="include-confirm-button"
        header-testid="include-title"
        content-testid="include-content"
    />
    <Confirmation
        v-model="excludeDialog"
        :header="excludeHeader"
        :content="excludeConfirmContent"
        :confirm-button-text="$t('scopes.exclude')"
        confirm-button-class="p-button-danger"
        @confirm="sync('detach')"
        dialog-testid="exclude-dialog"
        close-button-testid="exclude-close-button"
        cancel-button-testid="exclude-cancel-button"
        confirm-button-testid="exclude-confirm-button"
        header-testid="exclude-title"
        content-testid="exclude-content"
    />
</template>

<style>
.scopes-treetable tr {
    position: relative;
}
.scopes-treetable .full-row-click::before {
    content: '';
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
    cursor: pointer;
    z-index: 0;
}
.scopes-treetable
    :is(
        .p-treetable-toggler,
        .p-checkbox,
        .entity-name,
        .status-tag,
        .action-button
    ) {
    position: relative;
    z-index: 1;
}
.scopes-treetable .p-treetable-tbody > tr > td {
    border: none;
}
.scopes-treetable .p-treetable-tbody > tr:hover {
    background: var(--primary-50);
}
.scopes-treetable .p-treetable-toggler {
    margin-right: 0.5rem;
}
</style>
