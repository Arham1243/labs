<script setup>
import { useHelpers } from '@/composables';
import { ref, computed, onBeforeMount, watch } from 'vue';
import { useBenefitStore } from '@/modules/plans/stores/Benefit';
import { useI18n } from 'vue-i18n';
import { PaginationOptions, SortFilterOptions } from '@/config';
import useEventsBus from '@/composables/event-bus';
import Label from '@/components/common/Label.vue';
import CategoryUpdateDialog from '@/modules/plans/components/benefits/dialogs/CategoryUpdateDialog.vue';
import { useToast } from 'primevue/usetoast';
import { useGlobalStore } from '@/stores';
import lodash from 'lodash';

const i18n = useI18n();
const { t } = useI18n();
const helpers = useHelpers();
const benefitStore = useBenefitStore();
const { bus } = useEventsBus();
const toast = useToast();

const menu = ref();
const items = ref([]);
const searchText = ref('');
const totalRecords = ref(0);
const loading = ref(false);
const selectedItem = ref(null);
const statusUpdateDialog = ref(false);
const updateCategoryDialog = ref(false);
const deleteDialog = ref(false);

const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();
const menuItems = ref([]);

onBeforeMount(() => {
    getItems();
});

watch(
    () => bus.value.get('reloadCategories'),
    async () => {
        await getItems();
    }
);

const isItemActive = computed(() => {
    return selectedItem.value && selectedItem.value.status === 'active';
});

const showStatusUpdateDialog = () => {
    statusUpdateDialog.value = true;
};
const statusDialogHeader = computed(() => {
    return isItemActive.value
        ? t('benefits.make_benefit_category_inactive')
        : t('benefits.make_benefit_category_active');
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

const allMenuItems = computed(() => [
    {
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => showUpdateCategoryDialog(),
        permission: 'update benefit categories'
    },
    {
        label: isItemActive.value
            ? t('common.make_inactive')
            : t('common.make_active'),
        icon: isItemActive.value ? 'pi pi-times' : 'pi pi-check',
        command: () => showStatusUpdateDialog(),
        permission: 'update benefit categories'
    },
    {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => showDeleteDialog(),
        permission: 'delete benefit categories'
    }
]);

const showActions = (event, item) => {
    selectedItem.value = item;

    menuItems.value = helpers.filterByPermission(allMenuItems.value);

    menu.value.toggle(event);
};

const hasMenu = () => {
    return helpers.filterByPermission(allMenuItems.value).length > 0;
};

const showUpdateCategoryDialog = () => {
    useGlobalStore().clearErrors();
    updateCategoryDialog.value = true;
};

const onCategoryUpdated = () => {
    getItems();
    toast.add({
        severity: 'success',
        summary: t('notifications.benefit_category_updated'),
        detail: t('notifications.benefit_category_name_updated_detail'),
        life: 3000
    });
};

const showDeleteDialog = () => {
    deleteDialog.value = true;
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
        const params = pagination.getPageParams();
        const payload = sortFilters.getSortFilters();
        const res = await benefitStore.searchBenefitCategories(payload, params);
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
            ...selectedItem.value,
            status: isItemActive.value ? 'inactive' : 'active'
        };
        await benefitStore.updateBenefitCategoryStatus(
            selectedItem.value.id,
            payload
        );
        await getItems();
    } finally {
        loading.value = false;
    }
};

const deleteItem = async () => {
    try {
        loading.value = true;
        await benefitStore.deleteBenefitCategory(selectedItem.value.id);
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
            @page="onPageChange"
            @sort="onSortChange"
        >
            <template #header>
                <Search
                    v-model="searchText"
                    @search="search"
                    data-testid="input-search"
                />
            </template>
            <template #empty>
                <Label test-id="empty-state-message">
                    No services found.
                </Label>
            </template>
            <template #loading> Loading services. Please wait. </template>
            <Column
                sortable
                :field="`name->${i18n.locale.value}`"
                header="Name"
            >
                <template #body="{ data, index }">
                    <span
                        :data-testid="'category-data-table-' + index"
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
            <Column sortable field="status">
                <template #header>
                    <Label test-id="table-header-status">{{
                        $t('common.status')
                    }}</Label>
                </template>
                <template #body="{ data, index }">
                    <StatusTag
                        :status="data.status"
                        :data-testid="'status-tag-' + index"
                    />
                </template>
            </Column>
            <Column>
                <template #body="{ data, index }">
                    <div class="flex justify-content-end">
                        <Button
                            label="Actions"
                            icon="pi pi-chevron-down"
                            iconPos="right"
                            size="small"
                            class="p-button-outlined"
                            v-if="hasMenu()"
                            @click="showActions($event, data)"
                            :data-testid="'actions-button-' + index"
                        />
                        <Menu
                            ref="menu"
                            id="overlay_menu"
                            :model="menuItems"
                            :popup="true"
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
        />
        <Confirmation
            v-if="$ability.can('delete benefit categories')"
            v-model="deleteDialog"
            show-alert-icon
            :header="`Delete Benefit Category`"
            :content="`Are you sure you want to delete ${helpers.getLocaleValue(
                selectedItem?.name
            )}?`"
            confirm-button-class="p-button-danger"
            @confirm="deleteItem"
        />
        <CategoryUpdateDialog
            v-if="
                updateCategoryDialog &&
                $ability.can('update benefit categories')
            "
            v-model="updateCategoryDialog"
            :categoryId="selectedItem?.id"
            :initialCategoryName="selectedItem?.name"
            @updated="onCategoryUpdated"
        />
    </div>
</template>

<style lang="scss" scoped></style>
