<script setup>
import lodash from 'lodash';
import { useHelpers } from '@/composables';
import { ref, computed, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { useBenefitStore } from '@/modules/plans/stores/Benefit';
import { useDateFormatter } from '@/composables/useDateFormatter.js';
import { useI18n } from 'vue-i18n';
import { PaginationOptions, SortFilterOptions } from '@/config';
import Label from '@/components/common/Label.vue';

const { formatValue, formatEndDateDisplayTables, initialize } =
    useDateFormatter();
const i18n = useI18n();
const { t } = useI18n();
const router = useRouter();
const helpers = useHelpers();
const benefitStore = useBenefitStore();

const menu = ref();
const items = ref([]);
const searchText = ref('');
const loading = ref(false);
const totalRecords = ref(0);
const selectedItem = ref(null);
const statusUpdateDialog = ref(false);
const deleteDialog = ref(false);
const duplicateDialog = ref(false);
const menuItems = ref([]);

const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();

onBeforeMount(() => {
    initialize();
    getItems();
});

const isItemActive = computed(() => {
    return selectedItem.value && selectedItem.value.status == 'active';
});

const statusDialogHeader = computed(() => {
    return isItemActive.value
        ? t('benefits.make_benefit_inactive')
        : t('benefits.make_benefit_active');
});

const statusDialogContent = computed(() => {
    return isItemActive.value
        ? t('common.are_you_sure_inactive', {
              item: helpers.getLocaleValue(selectedItem.value?.name)
          })
        : t('common.are_you_sure_active', {
              item: helpers.getLocaleValue(selectedItem.value?.name)
          });
});

const statusDialogButtonClass = computed(() => {
    return isItemActive.value ? 'p-button-danger' : 'p-button-success';
});

const statusDialogButtonText = computed(() => {
    return isItemActive.value
        ? t('common.make_inactive')
        : t('common.make_active');
});

const showActions = (event, item) => {
    selectedItem.value = item;

    const allItems = [
        {
            label: 'View',
            icon: 'pi pi-eye',
            command: () => goToView(),
            permission: 'view benefits'
        },
        {
            label: 'Duplicate',
            icon: 'pi pi-copy',
            command: () => showDuplicateDialog(),
            permission: 'create benefits'
        },
        {
            label: isItemActive.value
                ? t('common.make_inactive')
                : t('common.make_active'),
            icon: isItemActive.value ? 'pi pi-times' : 'pi pi-check',
            command: () => showStatusUpdateDialog(),
            permission: 'update benefits'
        },
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            command: () => showDeleteDialog(),
            permission: 'delete benefits'
        }
    ];

    menuItems.value = helpers.filterByPermission(allItems);

    menu.value.toggle(event);
};

const goToView = () => {
    router.push({
        name: 'Benefit Details',
        params: { id: selectedItem.value.id }
    });
};

const rowClicked = ({ data }) => {
    router.push({
        name: 'Benefit Details',
        params: { id: data.id }
    });
};

const showStatusUpdateDialog = () => {
    statusUpdateDialog.value = true;
};

const showDeleteDialog = () => {
    deleteDialog.value = true;
};

const showDuplicateDialog = () => {
    duplicateDialog.value = true;
};

const onPageChange = (event) => {
    pagination.updatePageParams(event);
    getItems();
};

const onSortChange = (event) => {
    pagination.resetPageParams();
    sortFilters.updateSortFilters(event);
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
        const params = { ...pagination.getPageParams(), include: 'category' };
        const payload = sortFilters.getSortFilters();
        const res = await benefitStore.searchBenefits(payload, params);
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
                selectedItem.value.status == 'active' ? 'inactive' : 'active'
        };
        await benefitStore.changeBenefitStatus(selectedItem.value.id, payload);
        await getItems();
    } finally {
        loading.value = false;
    }
};

const deleteItem = async () => {
    try {
        loading.value = true;
        await benefitStore.deleteBenefit(selectedItem.value.id);
        await getItems();
    } finally {
        loading.value = false;
    }
};

const duplicateItem = async () => {
    try {
        loading.value = true;
        const res = await benefitStore.duplicateBenefit(selectedItem.value.id);

        const routeData = router.resolve({
            name: 'Benefit Details',
            params: { id: res.data.id }
        });

        window.open(routeData.href, '_blank');

        await getItems();
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div>
        <BaseTable
            :value="items"
            :loading="loading"
            :page="pagination.page"
            :rows="pagination.limit"
            :total-records="totalRecords"
            @row-click="rowClicked"
            @page="onPageChange"
            @sort="onSortChange"
        >
            <template #header>
                <div class="custom-search-small">
                    <Search
                        v-model="searchText"
                        @search="search"
                        data-testid="input-search"
                    />
                </div>
            </template>
            <template #empty>
                <Label test-id="empty-state-message">
                    No Benefits found.
                </Label>
            </template>
            <template #loading> Loading services. Please wait. </template>
            <Column
                sortable
                :field="`name->${i18n.locale.value}`"
                header="Name"
                class="p-break-word"
            >
                <template #body="{ data, index }">
                    <span
                        :data-testid="'name-data-table-' + index"
                        v-tooltip.top="helpers.getLocaleValue(data.name)"
                        class="cursor-pointer"
                    >
                        {{
                            lodash.truncate(helpers.getLocaleValue(data.name), {
                                length: 45
                            })
                        }}
                    </span>
                </template>
            </Column>
            <Column
                :field="`benefit_category->${i18n.locale.value}`"
                header="Category"
            >
                <template #body="{ data, index }">
                    <span
                        :data-testid="'category-data-table-' + index"
                        v-tooltip.top="helpers.getLocaleValue(data.name)"
                        class="cursor-pointer"
                    >
                        {{
                            lodash.truncate(
                                helpers.getLocaleValue(
                                    data.benefit_category?.name
                                ),
                                { length: 45 }
                            )
                        }}
                    </span>
                </template>
            </Column>
            <Column sortable field="effective_date" header="Effective Date">
                <template #body="{ data, index }">
                    <span :data-testid="'effective-date-data-table-' + index">
                        {{
                            formatValue(data.effective_date, {
                                type: 'date',
                                format: 'short'
                            })
                        }}
                    </span>
                </template>
            </Column>
            <Column sortable field="end_date" header="End Date">
                <template #body="{ data, index }">
                    <span :data-testid="'end-date-data-table-' + index">
                        {{ formatEndDateDisplayTables(data.end_date) }}
                    </span>
                </template>
            </Column>
            <Column sortable field="status" header="Status">
                <template #body="{ data, index }">
                    <StatusTag
                        :status="data.status"
                        :data-testid="'status-tag-' + index"
                    />
                </template>
            </Column>
            <Column>
                <template #body="{ data, index }">
                    <div class="edit-cancel-button">
                        <Button
                            label="Actions"
                            icon="pi pi-chevron-down"
                            iconPos="right"
                            size="small"
                            class="p-button-outlined"
                            @click="showActions($event, data)"
                            :data-testid="'actions-button-' + index"
                        />
                    </div>
                    <Menu
                        ref="menu"
                        id="overlay_menu"
                        :model="menuItems"
                        :popup="true"
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
        />
        <Confirmation
            v-model="deleteDialog"
            show-alert-icon
            :header="`Delete Benefit`"
            :content="`Are you sure you want to delete ${helpers.getLocaleValue(
                selectedItem?.name
            )}?`"
            confirm-button-class="p-button-danger"
            @confirm="deleteItem"
        />
        <Confirmation
            v-model="duplicateDialog"
            :header="`Duplicate Benefit`"
            :content="`Are you sure you want to duplicate ${helpers.getLocaleValue(
                selectedItem?.name
            )}?`"
            @confirm="duplicateItem"
        />
    </div>
</template>
