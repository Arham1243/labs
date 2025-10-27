<script setup>
import { ref, computed, onBeforeMount, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTeamRoleStore } from '@/modules/administration/stores';
import { useHelpers } from '@/composables';
import { useRouter } from 'vue-router';
import { PaginationOptions, SortFilterOptions } from '@/config';
import Label from '@/components/common/Label.vue';

const props = defineProps({
    action: {
        type: String,
        required: true
    },
    entity_id: {
        type: String,
        required: true
    }
});

const emit = defineEmits(['reloadRoles']);
const { t } = useI18n();
const teamRoleStore = useTeamRoleStore();
const router = useRouter();
const helpers = useHelpers();

const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();

const items = ref([]);
const selectedItems = ref([]);
const selectedItem = ref(null);
const totalRecords = ref(0);
const loading = ref(false);
const searchText = ref('');
const menuMultipleAction = ref();
const selectAll = ref(false);

const confirmationVisible = ref(false);
const confirmationAction = ref('');
const confirmationMode = ref('');

watch(selectedItems, (val) => {
    if (val.length === totalRecords.value && totalRecords.value > 0) {
        selectAll.value = true;
    } else if (val.length !== items.value.length) {
        selectAll.value = false;
    }
});

onBeforeMount(async () => {
    await getItems();
});

const menuMultipleActionItems = computed(() => {
    const items = [];

    if (props.action === 'excluded') {
        items.push({
            label: t('scopes.include'),
            icon: 'pi pi-check',
            command: () => showConfirm('bulk')
        });
    }

    if (props.action === 'included') {
        items.push({
            label: t('scopes.exclude'),
            icon: 'pi pi-times',
            command: () => showConfirm('bulk')
        });
    }

    return items;
});

const confirmHeader = computed(() => {
    const isInclude = confirmationAction.value === 'attach';
    const key = isInclude
        ? 'scopes.include_item_header'
        : 'scopes.exclude_item_header';

    const count = selectedItems.value.length;
    const isBulkMode = confirmationMode.value === 'bulk' && count !== 1;

    const item = isBulkMode ? t('common.roles') : t('common.role');

    return t(key, { item });
});

const confirmContent = computed(() => {
    const isBulk = confirmationMode.value === 'bulk';
    const isInclude = confirmationAction.value === 'attach';
    const count = selectedItems.value.length;

    if (isBulk) {
        if (count === 1) {
            const name = selectedItems.value[0]?.name || '';
            return isInclude
                ? t('scopes.are_you_sure_include_item', { item: name })
                : t('scopes.are_you_sure_exclude_item', { item: name });
        }
        const item =
            count > 1
                ? t('common.roles').toLowerCase()
                : t('common.role').toLowerCase();
        return isInclude
            ? t('scopes.are_you_sure_include_multiple', { count, item })
            : t('scopes.are_you_sure_exclude_multiple', { count, item });
    }

    return isInclude
        ? t('scopes.are_you_sure_include_item', {
              item: selectedItem.value?.name
          })
        : t('scopes.are_you_sure_exclude_item', {
              item: selectedItem.value?.name
          });
});

const confirmButtonText = computed(() =>
    confirmationAction.value === 'attach'
        ? t('scopes.include')
        : t('scopes.exclude')
);

const confirmButtonClass = computed(() =>
    confirmationAction.value === 'attach'
        ? 'p-button-success'
        : 'p-button-danger'
);

const showConfirm = (mode, item = null) => {
    confirmationMode.value = mode;
    confirmationAction.value =
        props.action === 'included' ? 'detach' : 'attach';
    selectedItem.value = item;
    confirmationVisible.value = true;
};

const toggleSelectAll = () => {
    selectAll.value = !selectAll.value;
    if (selectAll.value) {
        selectedItems.value = [...items.value];
    } else {
        selectedItems.value = [];
    }
};

const rowClicked = ({ originalEvent, data }) => {
    if (originalEvent.target.tagName === 'svg') {
        return;
    }
    router.push({
        name: 'RolePermissions',
        params: { id: data.id }
    });
};

const formatType = (type) => {
    return type
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const showMenu = (event) => {
    menuMultipleAction.value.toggle(event);
};

const onSortChange = (event) => {
    pagination.resetPageParams();
    sortFilters.updateSortFilters(event);
    selectAll.value = false;
    getItems();
};

const onPageChange = (event) => {
    pagination.updatePageParams(event);
    selectAll.value = false;
    getItems();
};

const search = () => {
    pagination.resetPageParams();
    sortFilters.updateSearch(searchText.value);
    selectAll.value = false;
    getItems();
};

const getItems = async () => {
    try {
        loading.value = true;
        const params = { ...pagination.getPageParams() };
        const payload = {
            ...sortFilters.getSortFilters(searchText.value)
        };
        const res = await teamRoleStore.searchRoles(
            props.entity_id,
            props.action,
            payload,
            params
        );
        items.value = res.data;
        if (props.action === 'included') {
            totalRecords.value = res.meta.total;
        } else {
            totalRecords.value = res.excluded_count;
        }
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
};

const sync = async () => {
    try {
        loading.value = true;

        let ids = [];
        if (confirmationMode.value === 'bulk' && !selectAll.value) {
            ids = selectedItems.value.map((item) => item.id);
        } else if (confirmationMode.value === 'single' && selectedItem.value) {
            ids = [selectedItem.value.id];
        }

        const payload = {
            resources: ids,
            select_all: selectAll.value
        };

        await teamRoleStore.syncRoles(
            props.entity_id,
            confirmationAction.value,
            payload
        );

        emit('reloadRoles');
    } catch (error) {
        console.error(error);
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
        v-model:selection="selectedItems"
        @sort="onSortChange"
        @page="onPageChange"
        @row-click="rowClicked"
    >
        <template #header>
            <div class="flex justify-content-between align-items-center my-2">
                <div class="flex align-items-center">
                    <Button
                        v-if="$ability.can('update teams')"
                        @click="toggleSelectAll"
                        class="p-button-outlined mr-3 flex gap-2"
                        data-testid="select-all-button"
                        style="padding: 0.65rem 1rem"
                        :disabled="items.length === 0"
                    >
                        <InputField
                            class="pointer-events-none"
                            inputId="select-all"
                            v-model="selectAll"
                            data-testid="select-all-input"
                            size="small"
                            variant="checkbox"
                            binary
                            style="scale: 0.8"
                        />
                        <span class="pointer-events-none">{{
                            t('scopes.select_all')
                        }}</span>
                    </Button>

                    <Button
                        v-if="$ability.can('update teams')"
                        :disabled="selectedItems.length === 0"
                        :label="t('buttons.bulk_actions')"
                        icon="pi pi-chevron-down"
                        iconPos="right"
                        class="p-button-outlined"
                        style="padding: 0.85rem 1rem"
                        @click="showMenu"
                        data-testid="bulk-actions-button"
                    />

                    <Menu
                        ref="menuMultipleAction"
                        id="overlay_menu"
                        :model="menuMultipleActionItems"
                        :popup="true"
                        data-testid="bulk-actions-menu"
                    />
                </div>

                <Search
                    data-testid="search-input"
                    v-model="searchText"
                    @search="search"
                    :style="{
                        width: '25vw',
                        padding: '0.75rem 1rem 0.75rem 2.45rem'
                    }"
                />
            </div>
        </template>

        <template #empty>
            <span data-testid="empty-data-table">
                {{
                    $t('common.datatable_not_found', {
                        item: $t('common.roles').toLowerCase()
                    })
                }}
            </span>
        </template>

        <template #loading>
            {{
                $t('common.datatable_loading', {
                    item: $t('common.roles').toLowerCase()
                })
            }}
        </template>

        <Column selectionMode="multiple" headerStyle="width: 2rem" />

        <Column field="name" :sortable="true">
            <template #header>
                <Label test-id="table-header-name">{{
                    t('common.role_name')
                }}</Label>
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'name-data-table-' + index">
                    {{ data.name }}
                </span>
            </template>
        </Column>

        <Column field="updated_at" :sortable="true">
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

        <Column v-if="$ability.can('update teams')">
            <template #body="{ data, index }">
                <Button
                    v-if="props.action === 'excluded'"
                    icon="pi pi-plus"
                    class="action-button p-button-rounded p-button-outlined ml-auto flex"
                    style="padding: 1.3rem"
                    size="medium"
                    :disabled="selectedItems.length > 0"
                    @click="showConfirm('single', data)"
                    :data-testid="'include-button-' + index"
                />
                <Button
                    v-if="props.action === 'included'"
                    icon="pi pi-times"
                    class="action-button p-button-rounded p-button-outlined ml-auto flex"
                    style="padding: 1.3rem"
                    size="medium"
                    :disabled="selectedItems.length > 0"
                    @click="showConfirm('single', data)"
                    :data-testid="'exclude-button-' + index"
                />
            </template>
        </Column>
    </BaseTable>

    <Confirmation
        v-if="$ability.can('update teams')"
        v-model="confirmationVisible"
        :header="confirmHeader"
        :content="confirmContent"
        :confirm-button-text="confirmButtonText"
        :confirm-button-class="confirmButtonClass"
        @confirm="sync"
        :dialog-testid="`confirmation-${confirmationMode}-${confirmationAction}-dialog`"
        :close-button-testid="`confirmation-${confirmationMode}-${confirmationAction}-close`"
        :cancel-button-testid="`confirmation-${confirmationMode}-${confirmationAction}-cancel`"
        :confirm-button-testid="`confirmation-${confirmationMode}-${confirmationAction}-confirm`"
        :header-testid="`confirmation-${confirmationMode}-${confirmationAction}-header`"
        :content-testid="`confirmation-${confirmationMode}-${confirmationAction}-content`"
    />
</template>
