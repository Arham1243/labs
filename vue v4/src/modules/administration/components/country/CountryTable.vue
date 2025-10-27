<script setup>
import { computed, onBeforeMount, ref, watch } from 'vue';
import { useCountryStore } from '@/modules/administration/stores';
import { useGlobalStore, useCommonStore } from '@/stores';
import { PaginationOptions, SortFilterOptions } from '@/config';
import { useI18n } from 'vue-i18n';
import Label from '@/components/common/Label.vue';
import { useHelpers } from '@/composables';
import AuditTable from '@/components/common/AuditTable.vue';

const countryStore = useCountryStore();
const commonStore = useCommonStore();
const globalStore = useGlobalStore();

const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();
const { t } = useI18n();
const helpers = useHelpers();

const loading = ref(false);
const busy = ref(false);
const loadingCurrencies = ref(false);
const loadingRegions = ref(false);
const regions = ref([]);
const menu = ref();
const items = ref([]);
const searchText = ref('');
const totalRecords = ref();
const isEditMode = ref(false);
const isDialogVisible = ref(false);

const statusUpdateDialog = ref(false);
const statusAuditTableDialog = ref(false);

const selectedItem = ref(null);
const currencies = ref([]);
const riskLevels = [{ name: 'Low' }, { name: 'Medium' }, { name: 'High' }];
const formData = ref({
    name: '',
    id: '',
    currency_id: '',
    region_id: '',
    risk_level: null,
    phone_code: '',
    status: true
});

onBeforeMount(async () => {
    await getItems();
    await getCurrencies('');
    await getRegions('');
});

const menuItems = computed(() => {
    if (!selectedItem.value) return [];

    const allMenuItems = [
        {
            label: t('buttons.edit'),
            icon: 'pi pi-pencil',
            command: () => editItem(selectedItem.value),
            permission: 'update countries'
        },
        {
            label: isItemActive.value
                ? t('common.make_inactive')
                : t('common.make_active'),
            icon: isItemActive.value ? 'pi pi-times' : 'pi pi-check',
            command: () => showStatusUpdateDialog(),
            permission: 'update countries'
        },
        {
            label: t('common.audit_log'),
            icon: 'pi pi-history',
            command: () => showAuditTableDialog(),
            permission: 'view countries'
        }
    ];

    return helpers.filterByPermission(allMenuItems);
});

const statusDialogHeader = computed(() => {
    return isItemActive.value
        ? t('common.make_item_inactive', {
              item: t('common.country')
          })
        : t('common.make_item_active', {
              item: t('common.country')
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

const isItemActive = computed(() => {
    return selectedItem.value && selectedItem.value.status === 'active';
});

const dialogHeader = computed(() =>
    isEditMode.value
        ? t('common.edit_item_popup_header', {
              item: t('common.country')
          })
        : t('common.new_item_popup_header', {
              item: t('common.country')
          })
);

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

const editItem = () => {
    resetForm();
    formData.value.name = selectedItem.value.name;
    formData.value.id = selectedItem.value.id;
    formData.value.currency_id = selectedItem.value.currency?.id;
    formData.value.region_id = selectedItem.value.region?.id;
    const riskLevelMap = riskLevels.find(
        (level) =>
            level.name.toLowerCase() ===
            selectedItem.value.risk_level.toLowerCase()
    );
    formData.value.risk_level = riskLevelMap ? riskLevelMap.name : null;
    formData.value.phone_code = selectedItem.value.phone_code;
    formData.value.status = selectedItem.value.status === 'active';
    openDialog('edit');
};

const resetForm = () => {
    getCurrencies('');
    getRegions('');
    formData.value.name = '';
    formData.value.id = '';
    formData.value.currency_id = '';
    formData.value.region_id = '';
    formData.value.risk_level = null;
    formData.value.phone_code = '';
    formData.value.status = true;
    globalStore.clearErrors();
};

const onShow = () => {
    resetForm();
};

const getCurrencies = async (search) => {
    try {
        loadingCurrencies.value = true;

        const payload = {
            search: search ? { value: search } : undefined
        };
        const res = await commonStore.searchCurrencies(payload);
        currencies.value = res.data;
    } finally {
        loadingCurrencies.value = false;
    }
};

const getRegions = async (search) => {
    try {
        loadingRegions.value = true;
        const payload = {
            search: search ? { value: search } : undefined
        };
        const res = await commonStore.searchRegions(payload);
        regions.value = res.data;
    } finally {
        loadingRegions.value = false;
    }
};

const getItems = async () => {
    try {
        loading.value = true;
        const params = {
            ...pagination.getPageParams()
        };

        const payload = {
            ...sortFilters.getSortFilters(searchText.value),
            includes: [{ relation: 'region' }, { relation: 'currency' }]
        };
        const res = await countryStore.searchItems(payload, params);
        items.value = res.data;
        totalRecords.value = res.meta ? res.meta.total : 0;
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
        await countryStore.updateStatus(selectedItem.value.id, payload);
        await getItems();
    } finally {
        loading.value = false;
    }
};

const save = async () => {
    const modifiedFormData = Object.fromEntries(
        Object.entries({
            ...formData.value,
            status: formData.value.status ? 'active' : 'inactive',
            risk_level: formData.value.risk_level?.toLowerCase() || null
        }).filter(
            ([k, v]) =>
                !['currency_id', 'region_id'].includes(k) ||
                (v !== '' && v !== null)
        )
    );
    try {
        busy.value = true;
        if (isEditMode.value) {
            await countryStore.update(selectedItem.value.id, modifiedFormData);
            closeDialog();
            await getItems();
        } else {
            await countryStore.create(modifiedFormData);
            closeDialog();
            await getItems();
        }
    } catch (error) {
        console.error('Error saving data:', error);
    } finally {
        busy.value = false;
    }
};

watch(
    () => formData.value.id,
    (newVal) => {
        if (newVal) {
            formData.value.id = newVal.toUpperCase();
        }
    }
);
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
            <div class="flex justify-between mb-2">
                <div>
                    <Search
                        data-testId="search-input"
                        v-model="searchText"
                        @search="search"
                        class="!w-[25vw]"
                    />
                </div>
                <div>
                    <Button
                        data-testId="add-new-country-button"
                        :label="
                        $t('common.create_item_btn_label', {
                            item: $t('common.country')
                        })
                    "
                        icon="pi pi-plus"
                        @click="openDialog('add')"
                        v-if="$ability.can('create countries')"
                    />
                </div>
            </div>
        </template>
        <template #empty>
            <span :data-testid="'empty-data-table'">
                {{
                    $t('common.datatable_not_found', {
                        item: $t('common.countries').toLowerCase()
                    })
                }}
            </span>
        </template>

        <template #loading>{{
            $t('common.datatable_loading', {
                item: $t('common.countries').toLowerCase()
            })
        }}</template>

        <Column :sortable="true" field="name">
            <template #header>
                <Label testId="table-header-name">{{
                    $t('common.country_name')
                }}</Label>
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'name-data-table-' + index">
                    {{ data.name }}
                </span>
            </template>
        </Column>

        <Column :sortable="true" field="id">
            <template #header>
                <Label testId="table-header-code">{{
                    $t('common.code')
                }}</Label>
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'code-data-table-' + index">
                    {{ data.id }}
                </span>
            </template>
        </Column>

        <Column :sortable="true" field="currency.id">
            <template #header>
                <Label testId="table-header-currency">{{
                    $t('common.currency')
                }}</Label>
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'currency-data-table-' + index">
                    {{ data.currency.id }}
                </span>
            </template>
        </Column>

        <Column :sortable="true" field="region.name">
            <template #header>
                <Label testId="table-header-region">{{
                    $t('common.region')
                }}</Label>
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'region-data-table-' + index">
                    {{ data.region.name }}
                </span>
            </template>
        </Column>

        <Column :sortable="true" field="phone_code">
            <template #header>
                <Label testId="table-header-calling-code">{{
                    $t('common.calling_code')
                }}</Label>
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'calling-code-data-table-' + index">
                    {{ data.phone_code }}
                </span>
            </template>
        </Column>

        <Column :sortable="true" field="risk_level" class="capitalize">
            <template #header>
                <Label testId="table-header-risk-level">{{
                    $t('common.risk_level')
                }}</Label>
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'risk-level-data-table-' + index">
                    {{ data.risk_level }}
                </span>
            </template>
        </Column>

        <Column :sortable="true" field="status">
            <template #header>
                <Label testId="table-header-status">{{
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

        <Column v-if="$ability.can('update countries')">
            <template #body="{ data, index }">
                <div class="edit-cancel-button">
                    <Button
                        :label="$t('common.actions')"
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
        dialog-testid="status-update-dialog"
        close-button-testid="status-update-close-button"
        cancel-button-testid="status-update-cancel-button"
        confirm-button-testid="status-update-confirm-button"
        header-testid="status-update-title"
        content-testid="status-update-content"
        v-if="$ability.can('update countries')"
    />

    <Dialog
        data-testId="dialog"
        v-model:visible="isDialogVisible"
        :header="dialogHeader"
        @update:visible="onShow"
        :style="{ width: '32vw' }"
        modal
        :closable="false"
        v-if="
            $ability.can('create countries') || $ability.can('update countries')
        "
    >
        <template #header>
            <div class="flex items-center justify-between w-full edit-cancel-button">
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
                <label class="block required mb-2" for="name">
                    <Label test-id="name-label">
                        {{ $t('common.country_name') }}
                    </Label>
                </label>
                <InputField
                    data-testId="name-input"
                    :placeholder="$t('common.country_name')"
                    id="name"
                    type="text"
                    variant="text"
                    v-model="formData.name"
                    class="w-full"
                />
            </div>
            <div class="col-span-6 mb-4 mr-4">
                <label class="block required mb-2" for="id">
                    <Label test-id="code-label">
                        {{ $t('common.code') }}
                    </Label>
                </label>
                <InputField
                    data-testId="code-input"
                    :placeholder="$t('common.code')"
                    :disabled="isEditMode"
                    id="id"
                    type="text"
                    variant="text"
                    v-model="formData.id"
                    maxlength="2"
                    class="w-full"
                />
            </div>
            <div class="col-span-6 mb-4">
                <label class="block required mb-2" for="currency_id">
                    <Label test-id="currency-label">
                        {{ $t('common.currency') }}
                    </Label>
                </label>
                <ApiDropdown
                    data-testId="currency-input"
                    id="currency_id"
                    option-value="id"
                    option-label="id"
                    v-model="formData.currency_id"
                    @search="getCurrencies"
                    :loading="loadingCurrencies"
                    :items="currencies"
                    class="w-full"
                />
            </div>
            <div class="col-span-6 mb-4 mr-4">
                <label class="block required mb-2" for="region_id">
                    <Label test-id="region-label">
                        {{ $t('common.region') }}
                    </Label>
                </label>
                <ApiDropdown
                    data-testId="region-input"
                    id="region_id"
                    option-value="id"
                    option-label="name"
                    v-model="formData.region_id"
                    @search="getRegions"
                    :loading="loadingRegions"
                    :items="regions"
                    class="w-full"
                />
            </div>
            <div class="col-span-6 mb-4">
                <label class="block required mb-2" for="phone_code">
                    <Label test-id="calling-code-label">
                        {{ $t('common.calling_code') }}
                    </Label>
                </label>
                <InputField
                    data-testId="calling-code-input"
                    :placeholder="$t('common.calling_code')"
                    id="phone_code"
                    type="text"
                    variant="text"
                    v-model="formData.phone_code"
                    maxlength="4"
                    class="w-full"
                />
            </div>
            <div class="col-span-12 mb-4">
                <label class="block required mb-2" for="risk_level">
                    <Label test-id="risk-level-label">
                        {{ $t('common.risk_level') }}
                    </Label>
                </label>
                <InputField
                    data-testId="risk-level-input"
                    v-model="formData.risk_level"
                    :options="riskLevels"
                    optionValue="name"
                    :placeholder="$t('common.risk_level')"
                    optionLabel="name"
                    class="w-full capitalize"
                    id="risk_level"
                    variant="select"
                />
            </div>
            <div class="col-span-12">
                <label class="block mb-2" for="status">
                    <Label test-id="status-label">
                        {{ $t('common.status') }}
                    </Label>
                </label>
                <div class="flex items-center gap-4">
                    <InputField
                        variant="switch"
                        data-testId="status-input"
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
                    data-testId="cancel-button"
                    text
                    :label="$t('buttons.cancel')"
                    @click="closeDialog"
                    class="mr-2"
                />
                <Button
                    data-testId="save-button"
                    :label="isEditMode ? $t('buttons.update') : $t('common.create')"
                    @click="save"
                    :loading="busy"
                />
            </div>
        </template>
    </Dialog>

    <Dialog
        data-testid="audit-log-dialog"
        :closable="false"
        v-model:visible="statusAuditTableDialog"
        :style="{ width: '80vw' }"
        modal
    >
        <template #header>
            <div class="flex items-center justify-between w-full edit-cancel-button">
                <div
                    class="p-dialog-title"
                    data-testid="audit-log-dialog-title"
                >
                    {{ $t('common.audit_logs') }}
                </div>
                <Button
                    icon="pi pi-times"
                    text
rounded
                    data-testid="audit-log-dialog-close-button"
                    @click="statusAuditTableDialog = false"
                    aria-label="Close"
                />
            </div>
        </template>
        <template #default>
            <AuditTable entity="country" :entity_id="selectedItem?.id" />
        </template>
    </Dialog>
</template>
