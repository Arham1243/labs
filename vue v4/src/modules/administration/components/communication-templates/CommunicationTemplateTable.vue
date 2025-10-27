<script setup>
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCommunicationTemplateStore } from '@/modules/administration/stores';
import { useGlobalStore } from '@/stores';
import { useHelpers } from '@/composables';
import { useRouter } from 'vue-router';
import { PaginationOptions, SortFilterOptions } from '@/config';
import { communicationTemplateTypes } from '@/config/enums';

const { t } = useI18n();
const communicationTemplateStore = useCommunicationTemplateStore();
const globalStore = useGlobalStore();
const helpers = useHelpers();
const router = useRouter();

const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();

const searchText = ref('');
const menu = ref();
const menuMultipleAction = ref();
const selectedItem = ref(null);
const selectedItems = ref([]);
const loading = ref(false);
const items = ref([]);
const totalRecords = ref();
const statusUpdateDialog = ref(false);
const selectedModule = ref(null);
const selectedEvent = ref(null);
const selectedType = ref(null);
const applyingFilters = ref(false);
const modules = ref([]);
const eventOptions = ref([]);

onBeforeMount(async () => {
    await getConfigs();
    await getItems();
});

const isItemActive = computed(() => {
    return selectedItem.value && selectedItem.value.status === 'active';
});

const bulkActionStatus = computed(() => {
    if (!selectedItems.value || selectedItems.value.length === 0) return null;
    const allActive = selectedItems.value.every((i) => i.status === 'active');
    const allInactive = selectedItems.value.every(
        (i) => i.status === 'inactive'
    );
    if (allActive) return 'inactive';
    if (allInactive) return 'active';
    return null;
});

const canDoBulk = computed(() => {
    return (
        selectedItems.value &&
        selectedItems.value.length > 0 &&
        !!bulkActionStatus.value
    );
});

const getOptionValue = (opt) =>
    opt && typeof opt === 'object' && 'value' in opt ? opt.value : opt;

const isShowTemplatesEnabled = computed(() => {
    return (
        getOptionValue(selectedModule.value) !== null &&
        getOptionValue(selectedEvent.value) !== null &&
        getOptionValue(selectedType.value) !== null
    );
});

const menuItems = computed(() => {
    if (!selectedItem.value) return [];
    const allMenuItems = [
        {
            label: t('common.view'),
            icon: 'pi pi-eye',
            command: () => {},
            permission: 'view communication templates'
        },
        {
            label: t('buttons.edit'),
            icon: 'pi pi-pencil',
            command: () =>
                pushRoute('Edit Communication Template', {
                    id: selectedItem.value.id
                }),
            permission: 'update communication templates'
        },
        {
            label: isItemActive.value
                ? t('common.make_inactive')
                : t('common.make_active'),
            icon: isItemActive.value ? 'pi pi-times' : 'pi pi-check',
            command: () => showStatusUpdateDialog(),
            permission: 'update communication templates'
        }
    ];
    return helpers.filterByPermission(allMenuItems);
});

const menuMultipleActionItems = computed(() => {
    if (!bulkActionStatus.value) return [];
    const actions = [];
    if (bulkActionStatus.value === 'active') {
        actions.push({
            label: t('common.make_active'),
            command: () => showStatusUpdateDialog()
        });
    } else if (bulkActionStatus.value === 'inactive') {
        actions.push({
            label: t('common.make_inactive'),
            command: () => showStatusUpdateDialog()
        });
    }
    return actions;
});

const statusDialogHeader = computed(() => {
    if (selectedItems.value.length > 0) {
        return bulkActionStatus.value === 'active'
            ? t('common.make_item_active', {
                  item:
                      selectedItems.value.length > 1
                          ? t('communication_templates.title')
                          : t('communication_templates.communication_template')
              })
            : t('common.make_item_inactive', {
                  item:
                      selectedItems.value.length > 1
                          ? t('communication_templates.title')
                          : t('communication_templates.communication_template')
              });
    }
    return isItemActive.value
        ? t('common.make_item_inactive', {
              item: t('communication_templates.communication_template')
          })
        : t('common.make_item_active', {
              item: t('communication_templates.communication_template')
          });
});

const statusDialogContent = computed(() => {
    if (selectedItems.value.length > 0) {
        const itemLabel =
            selectedItems.value.length > 1
                ? t('communication_templates.title').toLowerCase()
                : t(
                      'communication_templates.communication_template'
                  ).toLowerCase();
        return bulkActionStatus.value === 'active'
            ? t('bulk_actions.are_you_sure_active_multiple', {
                  count: selectedItems.value.length,
                  item: itemLabel
              })
            : t('bulk_actions.are_you_sure_inactive_multiple', {
                  count: selectedItems.value.length,
                  item: itemLabel
              });
    }
    return isItemActive.value
        ? t(
              'communication_templates.are_you_sure_active_this_communication_template'
          )
        : t(
              'communication_templates.are_you_sure_inactive_this_communication_template'
          );
});

const statusDialogButtonText = computed(() => {
    if (selectedItems.value.length > 0) {
        return bulkActionStatus.value === 'active'
            ? t('common.make_active')
            : t('common.make_inactive');
    }
    return isItemActive.value
        ? t('common.make_inactive')
        : t('common.make_active');
});

const statusDialogButtonClass = computed(() => {
    if (selectedItems.value.length > 0) {
        return bulkActionStatus.value === 'active'
            ? 'p-button-success'
            : 'p-button-danger';
    }
    return isItemActive.value ? 'p-button-danger' : 'p-button-success';
});

const showStatusUpdateDialog = () => {
    statusUpdateDialog.value = true;
};

const showActions = (event, item) => {
    selectedItem.value = item;
    menu.value.toggle(event);
};

const showMenu = (event) => {
    selectedItem.value = {};
    menuMultipleAction.value.toggle(event);
};

const formatArray = (langs) => {
    if (!Array.isArray(langs) || langs.length === 0) return '';
    return langs.map((l) => l.toUpperCase()).join(', ');
};

const pushRoute = (name, params = {}) => {
    globalStore.clearErrors();
    router.push({ name, params });
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

const applyFilters = async () => {
    try {
        applyingFilters.value = true;
        pagination.resetPageParams();

        const moduleValue = getOptionValue(selectedModule.value);
        const eventValue = getOptionValue(selectedEvent.value);
        const typeValue = getOptionValue(selectedType.value);

        sortFilters.filters = sortFilters.filters.filter(
            (f) => !['module', 'event', 'type'].includes(f.field)
        );

        if (moduleValue != null) {
            sortFilters.updateFilters('module', moduleValue);
        }
        if (eventValue != null) {
            sortFilters.updateFilters('event', eventValue);
        }
        if (typeValue != null) {
            sortFilters.updateFilters('type', typeValue);
        }

        await getItems();
    } finally {
        applyingFilters.value = false;
    }
};

const getItems = async () => {
    try {
        loading.value = true;
        const params = { ...pagination.getPageParams() };
        const payload = sortFilters.getSortFilters(searchText.value);
        const res = await communicationTemplateStore.search(payload, params);
        items.value = res.data;
        totalRecords.value = res.meta.total;
    } finally {
        loading.value = false;
    }
};

const formatTemplateConfigs = (events = []) => {
    const modulesMap = {};

    events.forEach((event) => {
        const { module_key, module_name, key, name, placeholders } = event;

        if (!modulesMap[module_key]) {
            modulesMap[module_key] = {
                label: module_name,
                value: module_key,
                events: []
            };
        }

        modulesMap[module_key].events.push({
            label: name,
            value: key,
            placeholders
        });
    });

    return Object.values(modulesMap);
};

const getConfigs = async () => {
    try {
        const res = await communicationTemplateStore.getConfigs();
        const events = res?.data?.events || [];
        modules.value = formatTemplateConfigs(events);
    } catch (err) {
        console.error(err);
    }
};

const onModuleFilterChange = () => {
    const modelVal = selectedModule.value;
    // Handle clear (All)
    if (!modelVal) {
        eventOptions.value = [];
        selectedEvent.value = null;
        return;
    }
    const selectedValue = getOptionValue(modelVal);
    const selected = modules.value.find((m) => m.value === selectedValue);
    if (!selected || !selected.events) {
        eventOptions.value = [];
        selectedEvent.value = null;
        return;
    }
    eventOptions.value = selected.events;
    selectedEvent.value = null;
};

const updateStatus = async () => {
    if (selectedItems.value.length > 0) return;
    try {
        loading.value = true;
        // const ids =
        //     selectedItems.value && selectedItems.value.length > 0
        //         ? selectedItems.value.map((i) => i.id)
        //         : [selectedItem.value.id];
        // const payload = {
        //     resources: ids,
        //     status:
        //         selectedItems.value && selectedItems.value.length > 0
        //             ? bulkActionStatus.value === 'active'
        //                 ? 'active'
        //                 : 'inactive'
        //             : selectedItem.value.status === 'active'
        //               ? 'inactive'
        //               : 'active'
        // };
        const payload = {
            status:
                selectedItem.value.status === 'active' ? 'inactive' : 'active'
        };
        await communicationTemplateStore.updateStatus(
            selectedItem.value.id,
            payload
        );
        selectedItem.value = {};
        selectedItems.value = [];
        await getItems();
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="overflow-x-auto">
        <BaseTable
            v-model:selection="selectedItems"
            :value="items"
            :page="pagination.page"
            :rows="pagination.limit"
            :total-records="totalRecords"
            :loading="loading"
            @sort="onSortChange"
            @page="onPageChange"
        >
            <template #header>
                <div class="flex flex-column gap-3 justify-between">
                    <!-- Search and Bulk Actions Row -->
                    <div class="flex align-items-center gap-2">
                        <Button
                            v-if="
                                $ability.can('update communication templates')
                            "
                            :disabled="!canDoBulk"
                            :label="t('buttons.bulk_actions')"
                            icon="pi pi-chevron-down"
                            iconPos="right"
                            class="p-button-outlined white-space-nowrap self-center"
                            @click="showMenu"
                            data-testid="bulk-actions-button"
                        />
                        <Menu
                            v-if="
                                $ability.can('update communication templates')
                            "
                            ref="menuMultipleAction"
                            id="overlay_menu"
                            :model="menuMultipleActionItems"
                            :popup="true"
                            data-testid="bulk-actions-menu"
                        />
                        <Search
                            v-model="searchText"
                            @search="search"
                            class="filter-input !mb-0"
                            :style="{
                                width: '350px',
                                'padding-bottom': '0.7rem',
                                'padding-top': '0.7rem'
                            }"
                            data-testId="search-input"
                        />
                    </div>

                    <div
                        class="flex items-center justify-end gap-2"
                        data-testid="filters-wrapper"
                    >
                        <Select 
                            filter
                            showClear
                            class="template-filter-dropdown"
                            data-testid="module-filter-dropdown"
                            :options="modules"
                            v-model="selectedModule"
                            optionLabel="label"
                            @change="onModuleFilterChange"
                        >
                            <template #value="{ value }">
                                <span class="font-bold"
                                    >{{
                                        $t('communication_templates.module')
                                    }}:</span
                                >
                                {{ value?.label ?? $t('common.all') }}
                            </template>
                        </Select>
                        <Select 
                            filter
                            showClear
                            class="template-filter-dropdown"
                            data-testid="event-filter-dropdown"
                            :options="eventOptions"
                            v-model="selectedEvent"
                            optionLabel="label"
                            :disabled="!selectedModule"
                        >
                            <template #value="{ value }">
                                <span class="font-bold"
                                    >{{
                                        $t('communication_templates.event')
                                    }}:</span
                                >
                                {{ value?.label ?? $t('common.all') }}
                            </template>
                        </Select>
                        <Select 
                            showClear
                            class="template-filter-dropdown"
                            data-testid="type-filter-dropdown"
                            :options="communicationTemplateTypes"
                            optionLabel="label"
                            v-model="selectedType"
                        >
                            <template #value="{ value }">
                                <span class="font-bold"
                                    >{{ $t('common.type') }}:</span
                                >
                                {{ value?.label ?? $t('common.all') }}
                            </template>
                        </Select>
                        <Button
                            class="white-space-nowrap"
                            data-testid="show-templates-button"
                            :loading="applyingFilters"
                            :disabled="applyingFilters"
                            :label="t('communication_templates.show_templates')"
                            @click="applyFilters"
                        />
                    </div>
                </div>
            </template>

            <template #empty>
                <span data-testid="empty-data-table">
                    {{
                        $t('common.datatable_not_found', {
                            item: $t(
                                'communication_templates.title'
                            ).toLowerCase()
                        })
                    }}
                </span>
            </template>

            <template #loading>
                {{
                    $t('common.datatable_loading', {
                        item: $t('communication_templates.title').toLowerCase()
                    })
                }}
            </template>

            <Column selectionMode="multiple" headerStyle="width: 2rem" />

            <Column field="type" :sortable="true">
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

            <Column field="subject">
                <template #header>
                    <span data-testid="table-header-subject">{{
                        $t('communication_templates.subject')
                    }}</span>
                </template>
                <template #body="{ data, index }">
                    <span :data-testid="'subject-data-table-' + index">{{
                        helpers.getLocaleValue(data.subject)
                    }}</span>
                </template>
            </Column>

            <Column field="module" :sortable="true">
                <template #header>
                    <span data-testid="table-header-module">{{
                        $t('communication_templates.module')
                    }}</span>
                </template>
                <template #body="{ data, index }">
                    <span :data-testid="'module-data-table-' + index">{{
                        helpers.capitalizeWords(data.module)
                    }}</span>
                </template>
            </Column>

            <Column field="event" :sortable="true">
                <template #header>
                    <span data-testid="table-header-event">{{
                        $t('communication_templates.event')
                    }}</span>
                </template>
                <template #body="{ data, index }">
                    <span :data-testid="'event-data-table-' + index">{{
                        data.event
                    }}</span>
                </template>
            </Column>

            <Column field="languages" :sortable="true">
                <template #header>
                    <span data-testid="table-header-languages">{{
                        $t('communication_templates.languages')
                    }}</span>
                </template>
                <template #body="{ data, index }">
                    <span :data-testid="'languages-data-table-' + index">{{
                        formatArray(data.languages)
                    }}</span>
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

            <Column
                v-if="
                    $ability.can('view communication templates') ||
                    $ability.can('update communication templates')
                "
            >
                <template #body="{ data, index }">
                    <Button
                        :disabled="selectedItems.length > 0"
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
                </template>
            </Column>
        </BaseTable>
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
        v-if="$ability.can('update communication templates')"
    />
</template>
<style scoped>
::v-deep(.template-filter-dropdown .p-dropdown-label) {
    padding-bottom: 0.7rem;
    padding-top: 0.7rem;
}
</style>
