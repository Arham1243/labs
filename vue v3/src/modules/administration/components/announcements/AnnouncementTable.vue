<script setup>
import lodash from 'lodash';
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAnnouncementStore } from '@/modules/administration/stores';
import { useGlobalStore } from '@/stores';
import { useHelpers } from '@/composables';
import { useRouter } from 'vue-router';
import { PaginationOptions, SortFilterOptions } from '@/config';

const { t } = useI18n();
const announcementStore = useAnnouncementStore();
const globalStore = useGlobalStore();
const helpers = useHelpers();
const router = useRouter();

const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();
const statusUpdateDialog = ref(false);
const searchText = ref('');
const menu = ref();
const selectedItem = ref(null);
const loading = ref(false);
const items = ref([]);
const totalRecords = ref();
const deleteDialog = ref(false);

onBeforeMount(async () => {
    await getItems();
});

const statusDialogHeader = computed(() => {
    return isItemActive.value
        ? t('common.make_item_inactive', {
              item: t('announcements.announcement')
          })
        : t('common.make_item_active', {
              item: t('announcements.announcement')
          });
});

const statusDialogContent = computed(() => {
    return isItemActive.value
        ? t('announcements.are_you_sure_inactive_this_announcement')
        : t('announcements.are_you_sure_active_this_announcement');
});

const statusDialogButtonText = computed(() => {
    return isItemActive.value
        ? t('common.make_inactive')
        : t('common.make_active');
});

const statusDialogButtonClass = computed(() => {
    return isItemActive.value ? 'p-button-danger' : 'p-button-success';
});

const menuItems = computed(() => {
    if (!selectedItem.value) return [];

    const allMenuItems = [
        {
            label: t('buttons.edit'),
            icon: 'pi pi-pencil',
            command: () => editItem(),
            disabled: isEditDisabled.value,
            permission: 'update announcements'
        },
        {
            label: isItemActive.value
                ? t('common.make_inactive')
                : t('common.make_active'),
            icon: isItemActive.value ? 'pi pi-times' : 'pi pi-check',
            command: () => showStatusUpdateDialog(),
            disabled: isStatusChangeDisabled.value,
            permission: 'update announcements'
        },
        {
            label: t('buttons.delete'),
            icon: 'pi pi-trash',
            command: () => showDeleteDialog(),
            disabled: isDeleteDisabled.value,
            permission: 'delete announcements'
        }
    ];

    return helpers.filterByPermission(allMenuItems);
});

const isItemActive = computed(() => {
    return selectedItem.value && selectedItem.value.status === 'active';
});

const isEditDisabled = computed(() => {
    const item = selectedItem.value;
    return item && item.status === 'active' && !item.is_expired;
});

const isStatusChangeDisabled = computed(() => {
    const item = selectedItem.value;
    if (!item) return true;

    const isActive = item.status === 'active' && !item.is_expired;
    const isDraftOrInactive = ['inactive', 'draft'].includes(item.status);

    if (isActive) return false;
    if (isDraftOrInactive) return false;
    return true;
});

const isDeleteDisabled = computed(() => {
    const item = selectedItem.value;
    return item && item.status === 'active' && !item.is_expired;
});

const showStatusUpdateDialog = () => {
    statusUpdateDialog.value = true;
};

const showDeleteDialog = () => {
    deleteDialog.value = true;
};

const showActions = (event, item) => {
    selectedItem.value = item;
    menu.value.toggle(event);
};

const editItem = () => {
    router.push({
        name: 'Edit Announcement',
        params: { id: selectedItem.value.id }
    });
};

const pushRoute = (name) => {
    globalStore.clearErrors();
    router.push({ name });
};

const humanizeList = (arr) => {
    return arr
        .map((s) =>
            s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        )
        .join(', ');
};

const chunkedPortals = (arr, size = 2) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
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
        const res = await announcementStore.search(payload, params);
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
        await announcementStore.updateStatus(selectedItem.value.id, payload);
        await getItems();
    } finally {
        loading.value = false;
    }
};

const deleteItem = async () => {
    try {
        loading.value = true;
        if (selectedItem.value) {
            await announcementStore.deleteItem(selectedItem.value.id);
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
        clase="announcement-table"
    >
        <template #header>
            <div class="flex justify-content-between mb-2">
                <Search
                    v-model="searchText"
                    @search="search"
                    :style="{ width: '25vw' }"
                    data-testId="search-input"
                />
                <Button
                    :label="
                        $t('common.create_item_btn_label', {
                            item: $t('announcements.announcement')
                        })
                    "
                    icon="pi pi-plus"
                    @click="pushRoute('New Announcement')"
                    data-testId="add-new-announcement-button"
                    v-if="$ability.can('create announcements')"
                />
            </div>
        </template>
        <template #empty>
            <span :data-testid="'empty-data-table'">
                {{
                    $t('common.datatable_not_found', {
                        item: $t('announcements.announcement').toLowerCase()
                    })
                }}
            </span>
        </template>
        <template #loading>{{
            $t('common.datatable_loading', {
                item: $t('announcements.announcement').toLowerCase()
            })
        }}</template>

        <Column :sortable="true" field="start_at">
            <template #header>
                <span
                    data-testid="table-header-start-date-time"
                    class="ellipsis-text"
                    >{{ $t('announcements.start_date_time') }}</span
                >
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'start-date-time-' + index">{{
                    helpers.formatDate(data.start_at, 'DD-MMM-YYYY hh:mm:ss A')
                }}</span>
            </template>
        </Column>

        <Column :sortable="true" field="end_at">
            <template #header>
                <span
                    data-testid="table-header-end-date-time"
                    class="ellipsis-text"
                    >{{ $t('announcements.end_date_time') }}</span
                >
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'end-date-time-' + index">
                    {{
                        helpers.formatDate(
                            data.end_at,
                            'DD-MMM-YYYY hh:mm:ss A'
                        )
                    }}
                </span>
            </template>
        </Column>

        <Column :sortable="true" field="portals">
            <template #header>
                <span data-testid="table-header-portal">{{
                    $t('announcements.portal')
                }}</span>
            </template>
            <template #body="{ data, index }">
                <span
                    :data-testid="`portal-${index}`"
                    style="line-height: 1.55"
                >
                    <div
                        v-for="(group, i) in chunkedPortals(data.portals)"
                        :key="i"
                        :data-testid="`portal-group-${index}-${i}`"
                    >
                        {{ humanizeList(group) }}
                    </div>
                </span>
            </template>
        </Column>

        <Column :sortable="false" field="message" class="w-2">
            <template #header>
                <span data-testid="table-header-message">{{
                    $t('announcements.message')
                }}</span>
            </template>
            <template #body="{ data, index }">
                <div
                    :data-testid="'message-' + index"
                    v-html="lodash.truncate(data.message, { length: 40 })"
                />
            </template>
        </Column>

        <Column :sortable="true" field="type">
            <template #header>
                <span data-testid="table-header-type">{{
                    $t('common.type')
                }}</span>
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'type-' + index">{{
                    helpers.capitalizeWords(data.type)
                }}</span>
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
                    :status="data.is_expired ? 'expired' : data.status"
                    :style="
                        data.is_expired ? 'background: var(--primary-500)' : ''
                    "
                    :data-testid="'status-tag-' + index"
                />
            </template>
        </Column>

        <Column
            v-if="
                $ability.can('update announcements') ||
                $ability.can('delete announcements')
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
        v-if="$ability.can('update announcements')"
    />

    <Confirmation
        v-model="deleteDialog"
        show-alert-icon
        :header="
            t('common.delete_item_header', {
                item: t('announcements.announcement')
            })
        "
        :content="t('announcements.are_you_sure_delete_this_announcement')"
        confirm-button-class="p-button-danger"
        @confirm="deleteItem"
        dialog-testid="delete-dialog"
        close-button-testid="delete-close-button"
        cancel-button-testid="delete-cancel-button"
        confirm-button-testid="delete-confirm-button"
        header-testid="delete-title"
        content-testid="delete-content"
        v-if="$ability.can('delete announcements')"
    />
</template>

<style>
.announcement-table .ellipsis-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    max-width: 100%;
}
</style>
