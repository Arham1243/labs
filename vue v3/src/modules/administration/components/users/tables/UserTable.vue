<script setup>
import { computed, onBeforeMount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCommonStore } from '@/stores';
import { useUserStore, useSettingStore } from '@/modules/administration/stores';
import { useGlobalStore } from '@/stores';
import { PaginationOptions, SortFilterOptions } from '@/config';
import { useRoute, useRouter } from 'vue-router';
import { useHelpers } from '@/composables';

const { t } = useI18n();
const helpers = useHelpers();
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const globalStore = useGlobalStore();
const commonStore = useCommonStore();
const settingStore = useSettingStore();

const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();

const statusUpdateDialog = ref(false);
const resendActivationDialog = ref(false);
const searchText = ref('');
const menu = ref();
const selectedItem = ref(null);
const loading = ref(false);
const isEditMode = ref(false);
const users = ref([]);
const provinces = ref([]);
const countries = ref([]);
const languages = ref([]);
const loadingProvinces = ref(false);
const loadingCountries = ref(false);
const loadingLanguages = ref(false);
const isDialogVisible = ref(false);
const busy = ref(false);
const totalRecords = ref();
const deleteDialog = ref(false);
const formData = ref({
    country_id: '',
    status: true,
    postal_code: '',
    province_id: '',
    city: '',
    secondary_address: '',
    address: '',
    phone_number: '',
    preferred_language: null,
    email: '',
    last_name: '',
    first_name: ''
});

onBeforeMount(async () => {
    await getItems();
    await getSettings();
    await getCountries('');
    await getLanguages('');
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
              item: t('common.user')
          })
        : t('common.make_item_active', {
              item: t('common.user')
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

const dialogHeader = computed(() =>
    isEditMode.value
        ? t('common.edit_item_popup_header', {
              item: t('common.user')
          })
        : t('common.create_item_popup_header', {
              item: t('common.user')
          })
);
const menuItems = computed(() => {
    if (!selectedItem.value) return [];

    const allMenuItems = [
        {
            label: t('common.view'),
            icon: 'pi pi-eye',
            command: () => goToView(),
            permission: 'view users'
        },
        {
            label: t('buttons.edit'),
            icon: 'pi pi-pencil',
            command: () => editItem(selectedItem.value),
            permission: 'update users'
        },
        {
            label: t('buttons.delete'),
            icon: 'pi pi-trash',
            command: () => showDeleteDialog(),
            disabled: isItemActive.value,
            permission: 'delete users'
        },
        ...(isUnconfirmed.value
            ? [
                  {
                      label: t('users.resend_activation_email'),
                      icon: 'pi pi-refresh',
                      command: () => showResendActivationDialog(),
                      permission: 'update users'
                  }
              ]
            : [
                  {
                      label: isItemActive.value
                          ? t('common.make_inactive')
                          : t('common.make_active'),
                      icon: isItemActive.value ? 'pi pi-times' : 'pi pi-check',
                      command: () => showStatusUpdateDialog(),
                      permission: 'update users'
                  },
                  {
                      label: t('users.login_as_this_user'),
                      icon: 'pi pi-sign-in',
                      command: () => '',
                      permission: 'update users'
                  }
              ])
    ];

    return helpers.filterByPermission(allMenuItems);
});

const isItemActive = computed(() => {
    return selectedItem.value && selectedItem.value.status === 'active';
});
const isUnconfirmed = computed(() => {
    return selectedItem.value && selectedItem.value.status === 'unconfirmed';
});

const statusDialogButtonText = computed(() => {
    return isItemActive.value
        ? t('common.make_inactive')
        : t('common.make_active');
});

const openDialog = (mode = 'add') => {
    getLanguages('');
    getSettings();
    isEditMode.value = mode === 'edit';
    isDialogVisible.value = true;
};

const closeDialog = () => {
    isDialogVisible.value = false;
    resetForm();
};
const resetForm = () => {
    getCountries('');
    formData.value.country_id = '';
    formData.value.status = true;
    formData.value.postal_code = '';
    formData.value.province_id = '';
    formData.value.city = '';
    formData.value.secondary_address = '';
    formData.value.address = '';
    formData.value.phone_number = '';
    formData.value.preferred_language = null;
    formData.value.email = '';
    formData.value.last_name = '';
    formData.value.first_name = '';
    globalStore.clearErrors();
};

const editItem = async () => {
    resetForm();
    await getCountries('');
    formData.value.country_id = selectedItem.value.country?.id;
    formData.value.status = selectedItem.value.status;
    formData.value.postal_code = selectedItem.value.postal_code;
    formData.value.province_id = selectedItem.value.province?.id;
    formData.value.city = selectedItem.value.city;
    formData.value.secondary_address = selectedItem.value.secondary_address;
    formData.value.address = selectedItem.value.address;
    formData.value.phone_number = selectedItem.value.phone_number;
    formData.value.preferred_language = selectedItem.value.preferred_language;
    formData.value.email = selectedItem.value.email;
    formData.value.last_name = selectedItem.value.last_name;
    formData.value.first_name = selectedItem.value.first_name;
    formData.value.status =
        selectedItem.value.status === 'active' ? true : false;
    openDialog('edit');
};

const showDeleteDialog = () => {
    deleteDialog.value = true;
};

const showStatusUpdateDialog = () => {
    statusUpdateDialog.value = true;
};

const showResendActivationDialog = () => {
    resendActivationDialog.value = true;
};

const showActions = (event, item) => {
    selectedItem.value = item;
    menu.value.toggle(event);
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

const rowClicked = ({ data }) => {
    sessionStorage.setItem('previousRoute', route.fullPath);
    router.push({
        name: 'User Teams',
        params: { id: data.id }
    });
};

const goToView = () => {
    sessionStorage.setItem('previousRoute', route.fullPath);
    router.push({
        name: 'User Teams',
        params: { id: selectedItem.value.id }
    });
};

const save = async () => {
    const modifiedFormData = {
        ...formData.value,
        status: formData.value.status === true ? 'active' : 'inactive'
    };
    try {
        busy.value = true;
        if (isEditMode.value) {
            await userStore.update(selectedItem.value.id, modifiedFormData);
            closeDialog();
            await getItems();
        } else {
            await userStore.create(modifiedFormData);
            closeDialog();
            await getItems();
        }
    } catch (error) {
        console.error(error);
    } finally {
        busy.value = false;
    }
};

const search = async () => {
    pagination.resetPageParams();
    sortFilters.updateSearch(searchText.value);
    getItems();
};

const getSettings = async () => {
    const res = await settingStore.getSettings();
    if (formData.value.preferred_language === null) {
        formData.value.preferred_language = res.default_language?.code;
    }
};

const getItems = async () => {
    try {
        loading.value = true;
        const params = { ...pagination.getPageParams() };
        const { sort } = sortFilters.getSortFilters(searchText.value);
        const updatedSort =
            sort[0]?.field === 'name'
                ? [
                      { field: 'first_name', direction: sort[0]?.direction },
                      { field: 'last_name', direction: sort[0]?.direction }
                  ]
                : sort;
        const payload = {
            ...sortFilters.getSortFilters(searchText.value),
            sort: updatedSort,
            includes: [{ relation: 'province' }, { relation: 'country' }],
            scopes: searchText.value
                ? [{ name: 'fullNameLike', parameters: [searchText.value] }]
                : []
        };
        const res = await userStore.search(payload, params);
        users.value = res.data;
        totalRecords.value = res.meta.total;
    } finally {
        loading.value = false;
    }
};

const getLanguages = async (search) => {
    try {
        loadingLanguages.value = true;
        const payload = {
            search: search ? { value: search } : undefined
        };
        const res = await commonStore.searchLanguages(payload);
        languages.value = res.data;
    } finally {
        loadingLanguages.value = false;
    }
};

const getCountries = async (search) => {
    try {
        loadingCountries.value = true;
        const res = await commonStore.searchCountries({
            search: {
                value: search
            }
        });
        countries.value = res.data;
    } finally {
        loadingCountries.value = false;
    }
};

const getProvinces = async (search) => {
    try {
        loadingProvinces.value = true;

        if (!formData.value.country_id) return;
        const res = await commonStore.searchProvinces({
            filters: [
                {
                    field: 'country_id',
                    operator: '=',
                    value: formData.value.country_id
                }
            ],
            search: {
                value: search
            }
        });
        provinces.value = res.data;
    } finally {
        loadingProvinces.value = false;
    }
};

watch(
    () => formData.value.country_id,
    () => getProvinces(''),
    { immediate: true }
);

const updateStatus = async () => {
    try {
        loading.value = true;
        const payload = {
            status:
                selectedItem.value.status === 'active' ? 'inactive' : 'active'
        };
        await userStore.updateStatus(selectedItem.value.id, payload);
        await getItems();
    } finally {
        loading.value = false;
    }
};

const resendActivation = async () => {
    try {
        loading.value = true;
        await userStore.resendActivation(selectedItem.value.email);
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
};

const deleteItem = async () => {
    try {
        loading.value = true;
        if (selectedItem.value) {
            await userStore.deleteItem(selectedItem.value.id);
        }
        await getItems();
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <BaseTable
        :value="users"
        :page="pagination.page"
        :rows="pagination.limit"
        :total-records="totalRecords"
        @row-click="rowClicked"
        :loading="loading"
        @sort="onSortChange"
        @page="onPageChange"
    >
        <template #header>
            <div class="flex justify-content-between mb-2">
                <Search
                    data-testid="search-input"
                    v-model="searchText"
                    @search="search"
                    :style="{ width: '25vw' }"
                />
                <Button
                    :label="
                        $t('common.create_item_btn_label', {
                            item: $t('common.user')
                        })
                    "
                    icon="pi pi-plus"
                    @click="openDialog('add')"
                    data-testid="add-new-user-button"
                    v-if="$ability.can('create users')"
                />
            </div>
        </template>
        <template #empty>
            <span :data-testid="'empty-data-table'">
                {{
                    $t('common.datatable_not_found', {
                        item: $t('common.users').toLowerCase()
                    })
                }}
            </span>
        </template>

        <template #loading>{{
            $t('common.datatable_loading', {
                item: $t('common.users').toLowerCase()
            })
        }}</template>

        <Column :sortable="true" field="name" class="w-6">
            <template #header>
                <span data-testid="table-header-name">{{
                    t('common.name')
                }}</span>
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'name-data-table-' + index">
                    {{ data.name }}
                </span>
            </template>
        </Column>

        <Column :sortable="true" field="status">
            <template #header>
                <span data-testid="table-header-status">{{
                    t('common.status')
                }}</span>
            </template>
            <template #body="{ data, index }">
                <StatusTag
                    :status="data.status"
                    :data-testid="'status-tag-' + index"
                />
            </template>
        </Column>

        <Column class="w-1 text-right">
            <template #body="{ data, index }">
                <i
                    v-if="data.systemic"
                    :data-testid="'systemic-data-table-' + index"
                    class="pi pi-lock text-2xl font-semibold text-red-500 opacity-90"
                ></i>
            </template>
        </Column>

        <Column class="w-1" v-if="$ability.can('update users')">
            <template #body="{ data, index }">
                <Button
                    :disabled="data.systemic"
                    :label="t('common.actions')"
                    icon="pi pi-chevron-down"
                    iconPos="right"
                    size="small"
                    class="p-button-outlined ml-auto flex"
                    @click="showActions($event, data)"
                    :data-testid="'actions-button-' + index"
                />
                <Menu
                    class="w-16rem"
                    ref="menu"
                    id="overlay_menu"
                    :model="menuItems"
                    :popup="true"
                    :data-testid="'actions-menu-' + index"
                />
            </template>
        </Column>
    </BaseTable>

    <Dialog
        v-model:visible="isDialogVisible"
        :header="dialogHeader"
        @update:visible="onShow"
        :style="{ width: '35vw' }"
        modal
        data-testid="dialog"
        :closable="false"
        v-if="$ability.can('update users') || $ability.can('create users')"
    >
        <template #header>
            <div class="flex align-items-center justify-content-between w-full">
                <div class="p-dialog-title" data-testid="dialog-title">
                    {{ dialogHeader }}
                </div>
                <Button
                    icon="pi pi-times"
                    class="p-dialog-header-close border-none p-button-outlined p-2 border-circle"
                    data-testid="dialog-close-button"
                    @click="closeDialog"
                    aria-label="Close"
                />
            </div>
        </template>
        <div class="p-fluid formgrid grid">
            <div class="field col-12 mb-4">
                <label
                    data-testid="first-name-label"
                    class="block required mb-2"
                    for="first_name"
                >
                    {{ t('users.first_name') }}
                </label>
                <InputField
                    data-testid="first-name-input"
                    :placeholder="t('users.first_name')"
                    id="first_name"
                    type="text"
                    variant="text"
                    v-model="formData.first_name"
                />
            </div>
            <div class="field col-12 mb-4">
                <label
                    data-testid="last-name-label"
                    class="block required mb-2"
                    for="last_name"
                >
                    {{ t('users.last_name') }}
                </label>
                <InputField
                    data-testid="last-name-input"
                    :placeholder="t('users.last_name')"
                    id="last_name"
                    type="text"
                    variant="text"
                    v-model="formData.last_name"
                />
            </div>
            <div class="field col-12 mb-4">
                <label
                    data-testid="email-address-label"
                    class="block required mb-2"
                    for="email"
                >
                    {{ t('users.email_address') }}
                </label>
                <InputField
                    data-testid="email-address-input"
                    :disabled="isEditMode"
                    :placeholder="t('users.email_address')"
                    id="email"
                    type="email"
                    variant="text"
                    v-model="formData.email"
                />
            </div>
            <div class="field col-12 mb-4">
                <label
                    data-testid="mobile-number-label"
                    class="block required mb-2"
                    for="phone_number"
                >
                    {{ t('users.mobile_number') }}
                </label>
                <InputField
                    data-testid="mobile-number-input"
                    :placeholder="t('users.mobile_number')"
                    id="phone_number"
                    variant="phone"
                    v-model="formData.phone_number"
                />
            </div>
            <div class="field col-12 mb-4">
                <label
                    data-testid="preferred-language-label"
                    class="block required mb-2"
                    for="preferred_language"
                >
                    {{ $t('users.preferred_language') }}
                </label>
                <ApiDropdown
                    :tooltipLength="50"
                    data-testid="preferred-language-input"
                    id="preferred_language"
                    option-value="code"
                    option-label="name"
                    v-model="formData.preferred_language"
                    @search="getLanguages"
                    :loading="loadingLanguages"
                    :items="languages"
                    :tooltip="true"
                />
            </div>
            <div class="field col-12 mb-4">
                <label
                    data-testid="address-label"
                    class="block mb-2"
                    for="address"
                >
                    {{ t('users.address') }}
                </label>
                <InputField
                    data-testid="address-input"
                    id="address"
                    type="text"
                    variant="text"
                    v-model="formData.address"
                />
            </div>
            <div class="field col-12 mb-4">
                <label
                    data-testid="address2-label"
                    class="block mb-2"
                    for="secondary_address"
                >
                    {{ t('users.address') }} 2
                </label>
                <InputField
                    data-testid="address2-input"
                    id="secondary_address"
                    type="text"
                    variant="text"
                    v-model="formData.secondary_address"
                />
            </div>
            <div class="field col-6 mb-4">
                <label data-testid="city-label" class="block mb-2" for="city">
                    {{ t('users.city') }}
                </label>
                <InputField
                    data-testid="city-input"
                    id="city"
                    type="text"
                    variant="text"
                    v-model="formData.city"
                />
            </div>
            <div class="field col-6 mb-4">
                <label
                    data-testid="province-label"
                    class="block mb-2"
                    for="province_id"
                >
                    {{ $t('common.province') }}
                </label>
                <ApiDropdown
                    data-testid="province-input"
                    id="province_id"
                    option-value="id"
                    option-label="name"
                    v-model="formData.province_id"
                    @search="getProvinces"
                    :loading="loadingProvinces"
                    :items="provinces"
                />
            </div>
            <div class="field col-6 mb-4">
                <label
                    data-testid="postal-code-label"
                    class="block mb-2"
                    for="postal_code"
                >
                    {{ t('users.postal_code') }}
                </label>
                <InputField
                    data-testid="postal-code-input"
                    id="postal_code"
                    type="text"
                    variant="text"
                    v-model="formData.postal_code"
                />
            </div>
            <div class="field col-6 mb-4">
                <label
                    data-testid="country-label"
                    class="block mb-2"
                    for="country_id"
                >
                    {{ $t('common.country') }}
                </label>
                <ApiDropdown
                    data-testid="country-input"
                    id="country_id"
                    option-value="id"
                    option-label="name"
                    v-model="formData.country_id"
                    @search="getCountries"
                    @change="getProvinces"
                    :loading="loadingCountries"
                    :items="countries"
                />
            </div>
        </div>
        <template #footer>
            <Button
                text
                :label="$t('buttons.cancel')"
                @click="closeDialog"
                data-testid="cancel-button"
            />
            <Button
                data-testid="save-button"
                icon="pi pi-check"
                :label="isEditMode ? $t('buttons.update') : $t('buttons.save')"
                @click="save"
                :loading="busy"
            />
        </template>
    </Dialog>

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
        v-if="$ability.can('update users')"
    />

    <Confirmation
        v-model="resendActivationDialog"
        :header="t('users.resend_activation_email')"
        :content="t('users.are_you_sure_resend_activation_email')"
        confirm-button-class="p-button-success"
        :confirm-button-text="t('users.send')"
        @confirm="resendActivation"
        dialog-testid="resend-activation-dialog"
        close-button-testid="resend-activation-close-button"
        cancel-button-testid="resend-activation-cancel-button"
        confirm-button-testid="resend-activation-confirm-button"
        header-testid="resend-activation-title"
        content-testid="resend-activation-content"
        v-if="$ability.can('update users')"
    />

    <Confirmation
        v-model="deleteDialog"
        show-alert-icon
        :header="t('common.delete_item_header', { item: t('common.user') })"
        :content="deleteConfirmContent"
        confirm-button-class="p-button-danger"
        @confirm="deleteItem"
        dialog-testid="delete-dialog"
        close-button-testid="delete-close-button"
        cancel-button-testid="delete-cancel-button"
        confirm-button-testid="delete-confirm-button"
        header-testid="delete-title"
        content-testid="delete-content"
        v-if="$ability.can('delete users')"
    />
</template>
