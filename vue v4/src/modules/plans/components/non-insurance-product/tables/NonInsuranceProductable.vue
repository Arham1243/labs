<script setup>
import lodash from 'lodash';
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHelpers } from '@/composables';
import { PaginationOptions, SortFilterOptions } from '@/config';
import Label from '@/components/common/Label.vue';
import { useNonInsuranceProductStore } from '@/modules/plans/stores/NonInsuranceProduct';
import { useRouter } from 'vue-router';

const i18n = useI18n();
const { t } = useI18n();
const router = useRouter();
const helpers = useHelpers();
const nonInsuranceProductStore = useNonInsuranceProductStore();

const menu = ref();
const items = ref([]);
const searchText = ref('');
const loading = ref(false);
const totalRecords = ref(0);
const selectedItem = ref(null);
const statusUpdateDialog = ref(false);
const deleteDialog = ref(false);

const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();

const menuItems = computed(() => {
    return [
        {
            label: t('common.view'),
            icon: 'pi pi-eye',
            command: () => viewNonInsuranceProduct({ data: selectedItem.value })
        },
        {
            label: isItemActive.value
                ? t('common.make_inactive')
                : t('common.make_active'),
            icon: isItemActive.value ? 'pi pi-times' : 'pi pi-check',
            command: () => showStatusUpdateDialog()
        },
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            command: () => showDeleteDialog()
        }
    ];
});

const statusDialogHeader = computed(() => {
    return isItemActive.value
        ? t('non_insurance_products.make_non_insurance_product_inactive')
        : t('non_insurance_products.make_non_insurance_product_active');
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

onBeforeMount(() => {
    getItems();
});

const showActions = (event, item) => {
    console.log(item);
    selectedItem.value = item;
    menu.value.toggle(event);
};

const showDeleteDialog = () => {
    deleteDialog.value = true;
};

const showStatusUpdateDialog = () => {
    statusUpdateDialog.value = true;
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

const viewNonInsuranceProduct = ({ data }) => {
    router.push({
        name: 'Non-Insurance Product Details',
        params: { id: data.id }
    });
};

const search = async () => {
    pagination.resetPageParams();
    sortFilters.updateSearch(searchText.value);
    await getItems();
};

const getItems = async () => {
    try {
        loading.value = true;
        const params = pagination.getPageParams();
        const payload = sortFilters.getSortFilters();
        const res = await nonInsuranceProductStore.searchNonInsuranceProduct(
            payload,
            params
        );
        items.value = res.data;
        totalRecords.value = res.meta.total;
    } finally {
        loading.value = false;
    }
};

const deleteItem = async () => {
    try {
        loading.value = true;
        await nonInsuranceProductStore.deleteNonInsuranceProduct(
            selectedItem.value.id
        );
        await getItems();
    } finally {
        loading.value = false;
    }
};

const isItemActive = computed(() => {
    return selectedItem.value && selectedItem.value.status === 'active';
});

const updateStatus = async () => {
    try {
        loading.value = true;
        const payload = {
            ...selectedItem.value,
            status: isItemActive.value ? 'inactive' : 'active'
        };
        await nonInsuranceProductStore.updateNonInsuranceProductStatus(
            selectedItem.value.id,
            payload
        );
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
            @row-click="viewNonInsuranceProduct"
        >
            <template #header>
                <div class="custom-search-small">
                    <Search
                        v-model="searchText"
                        @search="search"
                        data-testid="search-input"
                    />
                </div>
            </template>
            <template #empty>{{
                $t('common.datatable_not_found', {
                    item: $t('non_insurance_products.title').toLowerCase()
                })
            }}</template>
            <template #loading>{{
                $t('common.datatable_loading', {
                    item: $t('non_insurance_products.title').toLowerCase()
                })
            }}</template>
            <Column
                sortable
                :field="`name->${i18n.locale.value}`"
                class="p-break-word"
            >
                <template #header>
                    <Label test-id="table-header-name">{{
                        $t('common.name')
                    }}</Label>
                </template>
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

            <Column field="type" class="p-break-word">
                <template #header>
                    <Label test-id="table-header-type">{{
                        $t('non_insurance_products.type')
                    }}</Label>
                </template>
                <template #body="{ data, index }">
                    <span :data-testid="'type-data-table-' + index">
                        {{ data.type ?? $t('non_insurance_products.na') }}
                    </span>
                </template>
            </Column>

            <Column field="plan_enabled" class="p-break-word">
                <template #header>
                    <Label test-id="table-header-name">{{
                        $t('non_insurance_products.plan_enabled')
                    }}</Label>
                </template>
                <template #body="{ data, index }">
                    <span :data-testid="'plan-enabled-data-table-' + index">
                        {{
                            data.plan_enabled
                                ? $t('common.yes')
                                : $t('common.no')
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
                       <Button
                            :label="t('common.actions')"
                            icon="pi pi-chevron-down"
                            iconPos="right"
                            variant="outlined"
                            @click="showActions($event, data)"
                            :data-testid="'actions-button-' + index"
                        />
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
            :header="`Delete Non Insurance Product`"
            :content="`Are you sure you want to delete ${helpers.getLocaleValue(
                selectedItem?.name
            )}?`"
            confirm-button-class="p-button-danger"
            @confirm="deleteItem"
        />
    </div>
</template>
