<script setup>
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePaymentMethodsStore } from '@/modules/administration/stores';
import { useGlobalStore, useCommonStore } from '@/stores';
import { useHelpers } from '@/composables';
import { PaginationOptions, SortFilterOptions } from '@/config';
import { enrollmentType, paymentTypes } from '@/config';

const { t } = useI18n();
const paymentMethodsStore = usePaymentMethodsStore();
const commonStore = useCommonStore();
const globalStore = useGlobalStore();
const helpers = useHelpers();
const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();
const statusUpdateDialog = ref(false);
const deleteDialog = ref(false);
const menu = ref();
const selectedItem = ref(null);
const loading = ref(false);
const paymentMethods = ref([]);
const paymentProviders = ref([]);
const loadingPaymentProviders = ref(false);
const isEditMode = ref(false);
const isDialogVisible = ref(false);
const busy = ref(false);
const totalRecords = ref();
const searchText = ref('');
const formData = ref({
    payment_provider_id: '',
    payment_type: '',
    enrollment_types: '',
    status: true
});

onBeforeMount(async () => {
    await getItems();
    await getPaymentProviders('');
});

const statusDialogHeader = computed(() => {
    return isItemActive.value
        ? t('common.make_item_inactive', {
              item: t('payment_methods.payment_method')
          })
        : t('common.make_item_active', {
              item: t('payment_methods.payment_method')
          });
});

const statusDialogContent = computed(() => {
    const item = selectedItem.value?.payment_provider_id;
    const formattedItem = item?.charAt(0).toUpperCase() + item?.slice(1);

    return isItemActive.value
        ? t('common.are_you_sure_inactive', { item: formattedItem })
        : t('common.are_you_sure_active', { item: formattedItem });
});

const statusDialogButtonClass = computed(() => {
    return isItemActive.value ? 'p-button-danger' : 'p-button-success';
});

const dialogHeader = computed(() =>
    isEditMode.value
        ? t('common.edit_item_popup_header', {
              item: t('payment_methods.payment_method')
          })
        : t('common.new_item_popup_header', {
              item: t('payment_methods.payment_method')
          })
);

const menuItems = computed(() => {
    if (!selectedItem.value) return [];

    const allMenuItems = [];

    allMenuItems.push(
        {
            label: t('buttons.edit'),
            icon: 'pi pi-pencil',
            command: () => editItem(selectedItem.value),
            permission: 'update payment methods'
        },
        {
            label: isItemActive.value
                ? t('common.make_inactive')
                : t('common.make_active'),
            icon: isItemActive.value ? 'pi pi-times' : 'pi pi-check',
            command: () => showStatusUpdateDialog(),
            permission: 'update payment methods',
            disabled: isItemSystem.value
        },
        {
            label: t('buttons.delete'),
            icon: 'pi pi-trash',
            command: () => showDeleteDialog(),
            disabled: isItemActive.value || isItemSystem.value,
            permission: 'delete payment methods'
        }
    );

    return helpers.filterByPermission(allMenuItems);
});

const isItemActive = computed(() => {
    return selectedItem.value && selectedItem.value.status === 'active';
});

const isItemSystem = computed(() => {
    return selectedItem.value && selectedItem.value.system;
});

const statusDialogButtonText = computed(() => {
    return isItemActive.value
        ? t('common.make_inactive')
        : t('common.make_active');
});

const deleteConfirmContent = computed(() => {
    return selectedItem.value
        ? t('common.are_you_sure_delete', {
              name: selectedItem.value?.payment_provider_id
          })
        : '';
});

const openDialog = (mode = 'add') => {
    isEditMode.value = mode === 'edit';
    isDialogVisible.value = true;
};

const editItem = () => {
    getPaymentProviders('');
    const isValidProvider = paymentProviders.value.some(
        (provider) => provider.id === selectedItem.value.payment_provider_id
    );
    formData.value.payment_provider_id = isValidProvider
        ? selectedItem.value.payment_provider_id
        : '';
    formData.value.payment_type = selectedItem.value.payment_type;
    formData.value.enrollment_types = selectedItem.value.enrollment_types;
    formData.value.status = selectedItem.value.status === 'active';
    openDialog('edit');
};

const closeDialog = () => {
    isDialogVisible.value = false;
    resetForm();
};

const resetForm = () => {
    formData.value.payment_provider_id = '';
    formData.value.payment_type = '';
    formData.value.enrollment_types = '';
    formData.value.status = true;
    selectedItem.value = {};
    globalStore.clearErrors();
};

const showActions = (event, item) => {
    selectedItem.value = item;
    menu.value.toggle(event);
};

const showDeleteDialog = () => {
    deleteDialog.value = true;
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
    getItems();
};

const onShow = () => {
    resetForm();
};

const search = async () => {
    pagination.resetPageParams();
    sortFilters.updateSearch(searchText.value);
    getItems();
};

const getPaymentProviders = async () => {
    try {
        loadingPaymentProviders.value = true;
        const res = await commonStore.getAppsByCategory('payment');
        paymentProviders.value = res.data;
    } finally {
        loadingPaymentProviders.value = false;
    }
};

const getItems = async () => {
    try {
        loading.value = true;
        const params = { ...pagination.getPageParams() };
        const payload = sortFilters.getSortFilters(searchText.value);
        const res = await paymentMethodsStore.search(payload, params);
        paymentMethods.value = res.data;
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
        await paymentMethodsStore.updateStatus(selectedItem.value.id, payload);
        await getItems();
    } finally {
        loading.value = false;
    }
};

const save = async () => {
    const modifiedFormData = {
        ...formData.value,
        status: formData.value.status === true ? 'active' : 'inactive'
    };
    try {
        busy.value = true;
        if (isEditMode.value) {
            await paymentMethodsStore.update(
                selectedItem.value.id,
                modifiedFormData
            );
        } else {
            await paymentMethodsStore.create(modifiedFormData);
        }
        closeDialog();
        await getItems();
    } catch (error) {
        console.error('Error saving data:', error);
    } finally {
        busy.value = false;
    }
};

const deleteItem = async () => {
    try {
        loading.value = true;
        if (selectedItem.value) {
            await paymentMethodsStore.deleteItem(selectedItem.value.id);
        }
        await getItems();
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <BaseTable
        :value="paymentMethods"
        :page="pagination.page"
        :rows="pagination.limit"
        :total-records="totalRecords"
        :loading="loading"
        @sort="onSortChange"
        @page="onPageChange"
        class="payment-methods-table"
    >
        <template #header>
            <div class="flex justify-between mb-2">
                <div>
                    <Search
                        data-testid="search-input"
                        v-model="searchText"
                        @search="search"
                        class="!w-[25vw]"
                    />
                </div>
                <div>
                    <Button
                        :label="
                        $t('common.create_item_btn_label', {
                            item: $t('payment_methods.payment_method')
                        })
                    "
                        data-testid="create-new-button"
                        icon="pi pi-plus"
                        @click="openDialog('add')"
                        v-if="$ability.can('create payment methods')"
                    />
                </div>
            </div>
        </template>
        <template #empty>
            <span :data-testid="'empty-data-table'">
                {{
                    $t('common.datatable_not_found', {
                        item: $t('payment_methods.title').toLowerCase()
                    })
                }}
            </span>
        </template>
        <template #loading
            >{{
                $t('common.datatable_loading', {
                    item: $t('payment_methods.title').toLowerCase()
                })
            }}
        </template>

        <Column
            :sortable="true"
            field="payment_provider_id"
            :class="'capitalize'"
        >
            <template #header>
                <span data-testid="table-header-payment-provider">
                    {{ $t('payment_methods.payment_provider') }}
                </span>
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'payment-provider-data-table-' + index">
                    {{ data.payment_provider_id.replaceAll('_', ' ') }}
                </span>
            </template>
        </Column>

        <Column :sortable="true" field="payment_type" :class="'capitalize'">
            <template #header>
                <span data-testid="table-header-payment-type">
                    {{ $t('payment_methods.payment_type') }}
                </span>
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'payment-type-data-table-' + index">
                    {{
                        data.payment_type === 'cod'
                            ? $t('payment_methods.cod')
                            : data.payment_type === 'later'
                              ? $t('payment_methods.pay_later')
                              : data.payment_type
                    }}
                </span>
            </template>
        </Column>

        <Column :sortable="false" field="enrollment_types">
            <template #header>
                <span data-testid="table-header-enrollment-types">
                    {{ $t('payment_methods.enrollment_types') }}
                </span>
            </template>
            <template #body="{ data, index }">
                <span
                    :data-testid="'payment-enrollment-data-table-' + index"
                    class="capitalize"
                >
                    {{
                        data.enrollment_types
                            ?.map((type) =>
                                type === 'api'
                                    ? $t('payment_methods.api')
                                    : type
                            )
                            .join(', ')
                    }}
                </span>
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
                    :status="data.status"
                    :data-testid="'status-tag-' + index"
                />
            </template>
        </Column>

        <Column :sortable="true" field="updated_at">
            <template #header>
                <span data-testid="table-header-last-updated">
                    {{ $t('common.last_updated') }}
                </span>
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'last-updated-data-table-' + index">
                    {{ helpers.formatDate(data.updated_at) }}
                </span>
            </template>
        </Column>

        <Column class="w-1/12 text-right">
            <template #body="{ data, index }">
                <i
                    v-if="data.system"
                    :data-testid="'system-data-table-' + index"
                    class="pi pi-lock flex justify-end !text-2xl font-semibold text-red-500 opacity-90"
                ></i>
            </template>
        </Column>
        <Column
            class="w-1/12"
            v-if="
                $ability.can('update payment methods') ||
                $ability.can('delete payment methods')
            "
        >
            <template #body="{ data, index }">
                <div class="edit-cancel-button">
                    <Button
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
        v-if="$ability.can('update payment methods')"
    />

    <Confirmation
        v-model="deleteDialog"
        show-alert-icon
        :header="
            t('common.delete_item_header', {
                item: t('payment_methods.payment_method')
            })
        "
        :content="deleteConfirmContent"
        confirm-button-class="p-button-danger"
        @confirm="deleteItem"
        dialog-testid="delete-dialog"
        close-button-testid="delete-close-button"
        cancel-button-testid="delete-cancel-button"
        confirm-button-testid="delete-confirm-button"
        header-testid="delete-title"
        content-testid="delete-content"
        v-if="$ability.can('delete payment methods')"
    />

    <Dialog
        data-testid="dialog"
        v-model:visible="isDialogVisible"
        @update:visible="onShow"
        :header="dialogHeader"
        :style="{ width: '32vw' }"
        modal
        :closable="false"
        v-if="
            $ability.can('create payment methods') ||
            $ability.can('update payment methods')
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

        <div class="grid grid-cols-12 gap-2">
            <div class=" col-span-12 mb-4">
                <label
                    class="block required mb-2"
                    for="type"
                    data-testid="payment-provider-label"
                    >{{ $t('payment_methods.payment_provider') }}</label
                >
                <ApiDropdown
                    data-testId="payment-provider-input"
                    id="payment_provider_id"
                    option-value="id"
                    option-label="name"
                    v-model="formData.payment_provider_id"
                    @search="getPaymentProviders"
                    :loading="loadingPaymentProviders"
                    :items="paymentProviders"
                    :disabled="selectedItem ? selectedItem.system === 1 : false"
                    class="w-full"
                />
            </div>
            <div class="col-span-6 mb-2">
                <label
                    class="block required mb-2"
                    for="payment_type"
                    data-testid="payment-type-label"
                    >{{ $t('payment_methods.payment_type') }}</label
                >
                <InputField
                    data-testid="payment-type-input"
                    v-model="formData.payment_type"
                    :options="paymentTypes"
                    optionValue="code"
                    optionName="name"
                    :placeholder="$t('payment_methods.payment_type')"
                    optionLabel="name"
                    class="w-full"
                    id="payment_type"
                    variant="select"
                    :disabled="selectedItem ? selectedItem.system === 1 : false"
                />
            </div>
            <div class="col-span-6 mb-4">
                <label
                    class="block required mb-2"
                    for="enrollment_types"
                    data-testid="payment-enrollment-label"
                    >{{ $t('payment_methods.enrollment_types') }}</label
                >
                <InputField
                    class="w-full"
                    data-testid="payment-enrollment-input"
                    filter
                    id="enrollment_types"
                    variant="multiselect"
                    display="chip"
                    :options="enrollmentType"
                    optionValue="code"
                    optionLabel="name"
                    :placeholder="$t('payment_methods.enrollment_types')"
                    v-model="formData.enrollment_types"
                />
            </div>
            <div class="col-span-12">
                <label
                    data-testid="status-label"
                    class="block mb-2"
                    for="status"
                    >{{ $t('common.status') }}</label
                >
                <div class="flex items-center gap-4">
                    <InputField
                        variant="switch"
                        :disabled="
                            selectedItem ? selectedItem.system === 1 : false
                        "
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
                    data-testid="cancel-button"
                    text
                    :label="$t('buttons.cancel')"
                    class="no-underline mr-2"
                    @click="closeDialog"
                />
                <Button
                    data-testid="save-button"
                    icon="pi pi-check"
                    :label="isEditMode ? $t('buttons.update') : $t('buttons.save')"
                    @click="save"
                    :loading="busy"
                />
            </div>
        </template>
    </Dialog>
</template>
<style>
.payment-methods-table th {
    padding-inline: 0.25rem !important;
}

.payment-methods-table tbody.p-datatable-tbody td {
    padding-inline: 0.5rem !important;
}
</style>
