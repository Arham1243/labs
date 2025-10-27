<script setup>
import { ref, computed, onBeforeMount } from 'vue';
import { useGlobalStore, useCommonStore } from '@/stores';
import {
    useClientUserStore,
    useBusinessUnitUserStore,
    useClientContactStore,
    useClientStore
} from '@/modules/clients/stores';
import { useI18n } from 'vue-i18n';
import { PaginationOptions, SortFilterOptions } from '@/config';
import { watch } from 'vue';

const props = defineProps({
    entity: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    }
});

const { t, locale } = useI18n();
const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();
const clientStore = useClientStore();
const clientContactsStore = useClientContactStore();
const clientUserStore = useClientUserStore();
const businessUnitUserStore = useBusinessUnitUserStore();
const stores = {
    client: clientContactsStore,
    business_unit: clientContactsStore
};
const contactStore = computed(() => stores[props.entity] || null);
const userStores = {
    client: clientUserStore,
    business_unit: businessUnitUserStore
};
const userStore = computed(() => userStores[props.entity] || null);
const globalStore = useGlobalStore();
const commonStore = useCommonStore();

const menu = ref();
const menuMultipleAction = ref();
const currentClient = ref(clientStore.currentClient);
const items = ref([]);
const loadingContactTypes = ref(false);
const contactTypes = ref([]);
const roles = ref([]);
const loadingRoles = ref(false);
const loadingBusinessUnits = ref(false);
const showBussinesUnits = ref(false);
const businessUnits = ref([]);
const isEditMode = ref(false);
const isDialogVisible = ref(false);
const busy = ref(false);
const busyAnother = ref(false);
const searchText = ref('');
const loading = ref(false);
const totalRecords = ref(0);
const selectedItem = ref(null);
const selectedItems = ref([]);
const menuItems = ref([]);
const deleteDialog = ref(false);

const formData = ref({
    [props.entity + '_id']: props.id,
    phone_number: '',
    contact_type_id: '',
    role_id: null,
    scopes: [],
    email: '',
    last_name: '',
    first_name: '',
    use_as_user: false,
    use_as_primary_contact: false
});

onBeforeMount(async () => {
    await getItems();
    await getContactTypes('');
    await getRoles('');
});

watch(
    () => showBussinesUnits.value,
    () => {
        getBusinessUnits('');
        if (!showBussinesUnits.value) {
            formData.value.scopes = [];
        }
    }
);

const isDraftOrInactiveClient = computed(() =>
    ['draft', 'inactive'].includes(currentClient.value?.status?.toLowerCase())
);

const contactHasUser = computed(() => selectedItem?.value?.has_user ?? false);

const errorMessage = computed(() => {
    const { email, phone_number, use_as_user, use_as_primary_contact } =
        formData.value;
    const emailTrimmed = email?.trim();
    const phoneTrimmed = phone_number?.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (use_as_user || use_as_primary_contact) {
        if (!emailTrimmed && !phoneTrimmed)
            return 'contacts.please_enter_the_email_and_phone';
        if (!emailTrimmed) return 'contacts.please_enter_the_email';
        if (!phoneTrimmed) return 'contacts.please_enter_the_phone_number';
        if (!emailRegex.test(emailTrimmed))
            return 'contacts.invalid_email_format';
        return '';
    }

    if (!emailTrimmed && !phoneTrimmed)
        return 'contacts.please_enter_the_email_or_phone';
    if (emailTrimmed && !emailRegex.test(emailTrimmed))
        return 'contacts.invalid_email_format';
    return '';
});

const deleteHeader = computed(() => {
    return selectedItems.value.length > 1
        ? t('common.delete_item_header', { item: t('contacts.contacts') })
        : t('common.delete_item_header', { item: t('contacts.contact') });
});

const deleteConfirmContent = computed(() => {
    const count = selectedItems.value.length;
    if (count > 0) {
        const item = count > 1 ? t('roles.items') : t('roles.item');
        return t('notifications.are_you_sure_delete_multiple_item', {
            count,
            item
        });
    }
    return t('common.are_you_sure_delete', {
        name:
            selectedItem.value?.first_name + ' ' + selectedItem.value?.last_name
    });
});

const dialogHeader = computed(() =>
    isEditMode.value
        ? t('common.edit_item_popup_header', {
              item: t('contacts.contact')
          })
        : t('common.new_item_popup_header', {
              item: t('contacts.contact')
          })
);

const menuMultipleActionItems = computed(() => {
    return [{ label: t('buttons.delete'), command: () => showDeleteDialog() }];
});

const onShow = () => {
    resetForm();
};

const showMenu = (event) => {
    menuMultipleAction.value.toggle(event);
};

const showActions = (event, item) => {
    selectedItem.value = item;
    menuItems.value = [
        { label: t('common.view'), icon: 'pi pi-eye', command: () => '' },
        {
            label: t('common.edit'),
            icon: 'pi pi-pencil',
            command: () => editItem()
        },
        {
            label: t('common.delete'),
            icon: 'pi pi-trash',
            command: () => showDeleteDialog()
        }
    ];

    menu.value.toggle(event);
};

const openDialog = async (mode = 'add') => {
    if (mode === 'edit') {
        getContactTypes(selectedItem.value.contact_type?.name);
        await getUser(selectedItem.value.user_id);
    }
    getContactTypes();
    getRoles('');
    getBusinessUnits('');
    isEditMode.value = mode === 'edit';
    isDialogVisible.value = true;
};

const closeDialog = () => {
    isDialogVisible.value = false;
    selectedItem.value = {};
    resetForm();
};

const resetForm = () => {
    formData.value.use_as_user = false;
    formData.value.use_as_primary_contact = false;
    showBussinesUnits.value = false;
    formData.value.phone_number = '';
    formData.value.role_id = null;
    formData.value.contact_type_id = null;
    formData.value.scopes = [];
    formData.value.email = '';
    formData.value.last_name = '';
    formData.value.first_name = '';
    globalStore.clearErrors();
};

const editItem = () => {
    resetForm();
    formData.value.phone_number = selectedItem.value.phone_number;
    formData.value.email = selectedItem.value.email;
    formData.value.last_name = selectedItem.value.last_name;
    formData.value.first_name = selectedItem.value.first_name;
    formData.value.contact_type_id = selectedItem.value.contact_type?.id;
    formData.value.use_as_user = selectedItem.value.has_user;
    formData.value.use_as_primary_contact =
        selectedItem.value.use_as_primary_contact;
    showBussinesUnits.value = !!selectedItem.value.user_scopes?.length;
    openDialog('edit');
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

const getUser = async (id) => {
    if (!id) return;
    try {
        let includes = 'roles';
        if (props.entity === 'client') includes += ',userScopes';

        const params = {
            [props.entity + '_id']: props.id,
            include: includes
        };
        const res = await userStore.value.getUser(id, params);
        if (res.data) {
            formData.value.scopes =
                res.data.user_scopes?.flatMap(
                    (item) => item.business_unit_ids || []
                ) || [];
            showBussinesUnits.value = !!res.data.user_scopes?.length;
            formData.value.role_id =
                res.data.roles && res.data.roles.length
                    ? res.data.roles[0]?.id
                    : null;
        }
    } catch (error) {
        console.log(error);
    }
};

const getItems = async () => {
    try {
        loading.value = true;
        const params = { ...pagination.getPageParams() };
        const { sort } = sortFilters.getSortFilters(searchText.value);
        const updatedSort = sort
            .map(({ field, direction }) => {
                switch (field) {
                    case 'contact_type.name':
                        return { field: 'contactType.name', direction };
                    default:
                        return { field, direction };
                }
            })
            .flat();

        const includes = [{ relation: 'contactType' }];
        const payload = {
            ...sortFilters.getSortFilters(searchText.value),
            sort: updatedSort,
            includes: includes,
            filters: [
                {
                    field: 'contactable_id',
                    value: props.id
                }
            ]
        };

        const res = await contactStore.value.search(payload, params);
        items.value = res.data;
        totalRecords.value = res.meta.total;
    } finally {
        loading.value = false;
    }
};

const getContactTypes = async (search) => {
    try {
        loadingContactTypes.value = true;
        const payload = {
            search: search ? { value: search } : undefined
        };
        const res = await commonStore.searchContactTypes(payload);
        contactTypes.value = res.data;
    } finally {
        loadingContactTypes.value = false;
    }
};

const getRoles = async (search) => {
    try {
        loadingRoles.value = true;
        const payload = {
            filters: [
                {
                    field: 'type',
                    operator: '=',
                    value: props.entity
                }
            ],
            search: search ? { value: search } : undefined
        };
        const params = {
            limit: 300
        };
        const res = await commonStore.searchRoles(payload, params);
        roles.value = res.data;
    } finally {
        loadingRoles.value = false;
    }
};
const getBusinessUnits = async (search) => {
    if (props.entity !== 'client') {
        return;
    }
    try {
        loadingBusinessUnits.value = true;
        const res = await clientStore.searchBusinessUnits(
            {
                filters: [
                    {
                        field: 'client.id',
                        operator: '=',
                        value: formData.value.client_id
                    }
                ],
                search: {
                    value: search
                }
            },
            { limit: 300 }
        );
        businessUnits.value = res.data;
    } finally {
        loadingBusinessUnits.value = false;
    }
};

const save = async (mode = 'normal') => {
    const isAnother = mode === 'another';
    const busyRef = isAnother ? busyAnother : busy;
    const modifiedFormData = {
        ...formData.value,
        scopes_toggle: showBussinesUnits.value
    };
    try {
        busyRef.value = true;
        if (isEditMode.value) {
            await contactStore.value.update(
                selectedItem.value.id,
                modifiedFormData
            );
        } else {
            await contactStore.value.create(modifiedFormData);
        }

        if (isAnother) {
            closeDialog();
            openDialog('add');
        } else {
            closeDialog();
        }

        await getItems();
        selectedItem.value = {};
    } catch (error) {
        console.log(error);
    } finally {
        busyRef.value = false;
    }
};

const deleteItems = async () => {
    try {
        loading.value = true;
        const ids =
            selectedItems.value.length > 0
                ? selectedItems.value.map((i) => i.id)
                : [selectedItem.value.id];
        const payload = { resources: ids };
        await contactStore.value.deleteItems(payload);
        await getItems();
        selectedItems.value = [];
        selectedItem.value = {};
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
            v-model:selection="selectedItems"
            class="client-contacts-table"
        >
            <template #header>
                <div
                    class="flex justify-between items-center col-span-12 mb-2"
                >
                    <div class="flex gap-4">
                        <div>
                            <Button
                                :disabled="selectedItems.length == 0"
                                :label="t('buttons.bulk_actions')"
                                icon="pi pi-chevron-down"
                                iconPos="right"
                                class="p-button-outlined mr-2"
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
                        <div>
                            <Search
                                data-testid="search-input"
                                v-model="searchText"
                                @search="search"
                            />
                        </div>
                    </div>
                    <Button
                        :label="
                        $t('common.create_item_btn_label', {
                            item: $t('contacts.contact')
                        })
                    "
                        icon="pi pi-plus"
                        @click="openDialog('add')"
                        data-testid="add-new-user-button"
                    />
                </div>
            </template>
            <template #empty>
                <span :data-testid="'empty-data-table'">
                    {{
                        $t('common.datatable_not_found', {
                            item: $t('contacts.contacts').toLowerCase()
                        })
                    }}
                </span>
            </template>

            <template #loading>{{
                $t('common.datatable_loading', {
                    item: $t('contacts.contacts').toLowerCase()
                })
            }}</template>

            <Column selectionMode="multiple" headerStyle="width: 2rem" />

            <Column :sortable="true" field="first_name" class="name-col">
                <template #header>
                    <span data-testid="table-header-name">{{
                        $t('common.name')
                    }}</span>
                </template>
                <template #body="{ data, index }">
                    <div
                        class="flex items-center justify-between gap-1"
                        :data-testid="'name-data-table-' + index"
                    >
                        <div class="w-7/12">
                            {{ data.first_name + ' ' + data.last_name }}
                        </div>
                        <Badge
                            v-if="data.use_as_primary_contact"
                            :value="t('contacts.primary')"
                            class="rounded-md primary-badge"
                            :data-testid="'primary-tag-' + index"
                        />
                    </div>
                </template>
            </Column>

            <Column :sortable="true" field="email" class="w-3/12">
                <template #header>
                    <span data-testid="table-header-email">{{
                        $t('contacts.email')
                    }}</span>
                </template>
                <template #body="{ data, index }">
                    <span :data-testid="'email-data-table-' + index">
                        {{ data.email }}
                    </span>
                </template>
            </Column>

            <Column :sortable="true" field="contact_type.name">
                <template #header>
                    <span
                        data-testid="contact-type-header-name"
                        style="
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            display: inline-block;
                            max-width: 100%;
                        "
                        >{{ $t('contacts.contact_type') }}</span
                    >
                </template>
                <template #body="{ data, index }">
                    <span :data-testid="'contact-type-data-table-' + index">
                        {{ data.contact_type?.name }}
                    </span>
                </template>
            </Column>

            <Column :sortable="true" field="user_id">
                <template #header>
                    <span
                        data-testid="has-user-header-name"
                        style="
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            display: inline-block;
                            max-width: 100%;
                        "
                        >{{ $t('contacts.has_user') }}</span
                    >
                </template>
                <template #body="{ data, index }">
                    <span :data-testid="'has-user-data-table-' + index">
                        {{
                            data.has_user ? t('contacts.yes') : t('contacts.no')
                        }}
                    </span>
                </template>
            </Column>

            <Column>
                <template #header>
                    <span :data-testid="'table-header-actions'">{{
                        t('common.actions')
                    }}</span>
                </template>
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
                            :disabled="selectedItems.length > 0"
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

        <Dialog
            v-model:visible="isDialogVisible"
            :header="dialogHeader"
            @update:visible="onShow"
            :style="{ width: '35vw' }"
            modal
            data-testid="dialog"
            :closable="false"
        >
            <template #header>
                <div
                    class="flex items-center justify-between w-full"
                >
                    <div class="p-dialog-title" data-testid="dialog-title">
                        {{ dialogHeader }}
                    </div>
                    <Button
                        icon="pi pi-times"
                        text
rounded
                        data-testid="dialog-close-button"
                        @click="closeDialog"
                        aria-label="Close"
                    />
                </div>
            </template>
            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12">
                    <label
                        data-testid="contact-type-label"
                        class="block required mb-2"
                        for="contact_type_id"
                    >
                        {{ $t('contacts.contact_type') }}
                    </label>
                    <ApiDropdown
                        :tooltipLength="50"
                        data-testid="contact-type-input"
                        id="contact_type_id"
                        option-value="id"
                        option-label="name"
                        v-model="formData.contact_type_id"
                        @search="getContactTypes"
                        :loading="loadingContactTypes"
                        :items="contactTypes"
                        :tooltip="true"
                        class="w-full"
                    />
                </div>
                <div class="col-span-6">
                    <div class="flex">
                        <InputField
                            data-testid="user-contact-checkbox"
                            id="use_as_user"
                            inputId="use_as_user"
                            variant="checkbox"
                            :disabled="
                                contactHasUser || isDraftOrInactiveClient
                            "
                            binary
                            v-model="formData.use_as_user"
                        />
                        <label
                            for="use_as_user"
                            data-testid="user-contact-text"
                            :class="[
                                'mt-1 ml-2 cursor-pointer',
                                (contactHasUser || isDraftOrInactiveClient) &&
                                    'text-surface-500 dark:text-surface-300'
                            ]"
                            >{{
                                t('contacts.use_this_contact_as_a_user')
                            }}</label
                        >
                    </div>
                </div>
                <div class="col-span-6">
                    <div class="flex">
                        <InputField
                            data-testid="primary-contact-checkbox"
                            id="use_as_primary_contact"
                            inputId="use_as_primary_contact"
                            variant="checkbox"
                            binary
                            v-model="formData.use_as_primary_contact"
                        />
                        <label
                            for="use_as_primary_contact"
                            data-testid="primary-contact-text"
                            class="mt-1 ml-2 flex gap-2 cursor-pointer"
                            >{{ t('contacts.use_as_primary_contact') }}
                            <span
                                v-tooltip.top="
                                    t(
                                        'contacts.user_can_have_only_one_primary_contact'
                                    )
                                "
                            >
                                <i class="pi pi-exclamation-circle"></i></span
                        ></label>
                    </div>
                </div>
                <div class="col-span-6">
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
                        class="w-full"
                    />
                </div>
                <div class="col-span-6">
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
                        class="w-full"
                    />
                </div>
                <div class="col-span-12">
                    <label
                        data-testid="email-address-label"
                        class="block required mb-2"
                        for="email"
                    >
                        {{ t('users.email_address') }}
                    </label>
                    <InputField
                        data-testid="email-address-input"
                        :disabled="isEditMode && selectedItem.email"
                        :placeholder="t('users.email_address')"
                        id="email"
                        type="email"
                        variant="text"
                        v-model="formData.email"
                        class="w-full"
                    />
                </div>
                <div class="col-span-12">
                    <label
                        data-testid="mobile-number-label"
                        class="block required mb-2"
                        for="phone_number"
                    >
                        {{ t('contacts.phone_number') }}
                    </label>
                    <InputField
                        data-testid="mobile-number-input"
                        :placeholder="t('users.mobile_number')"
                        id="phone_number"
                        variant="phone"
                        v-model="formData.phone_number"
                    />
                </div>
                <template v-if="formData.use_as_user">
                    <div class="col-span-12">
                        <label
                            data-testid="user-role-label"
                            class="block required mb-2"
                            for="role_id"
                        >
                            {{ $t('clients.user_role') }}
                        </label>
                        <ApiDropdown
                            :tooltipLength="50"
                            data-testid="user-role-input"
                            id="role_id"
                            option-value="id"
                            option-label="name"
                            v-model="formData.role_id"
                            @search="getRoles"
                            :loading="loadingRoles"
                            :items="roles"
                            :tooltip="true"
                            class="w-full"
                        />
                    </div>
                    <template v-if="props.entity === 'client'">
                        <div class="col-span-12">
                            <label
                                :data-testid="`limit-access-label`"
                                class="block mb-2"
                            >
                            </label>
                            <div class="flex items-center gap-4">
                                <InputField
                                    variant="switch"
                                    data-testid="limit-access-input"
                                    id="limit-access"
                                    v-model="showBussinesUnits"
                                />
                                <span>
                                    {{
                                        t(
                                            'clients.limit_access_to_business_units'
                                        )
                                    }}</span
                                >
                            </div>
                        </div>
                        <div
                            class="col-span-12"
                            v-if="
                                showBussinesUnits ||
                                (selectedItem && selectedItem.scopes?.length)
                            "
                        >
                            <InputField
                                data-testid="business-units-input"
                                filter
                                id="scopes"
                                :tooltipLength="50"
                                variant="multiselect"
                                display="chip"
                                :options="businessUnits"
                                optionValue="id"
                                :optionLabel="`name.${locale}`"
                                :placeholder="$t('common.select')"
                                v-model="formData.scopes"
                                @search="getBusinessUnits"
                                :loading="loadingBusinessUnits"
                                class="w-full"
                            />
                        </div>
                    </template>
                </template>
                <div class="col-span-12">
                    <div
                        class="message-box flex items-center"
                        v-if="errorMessage"
                    >
                        <i class="pi pi-info-circle icon"></i>
                        <div>
                            <div class="message">
                                {{ $t(errorMessage) }}
                            </div>
                        </div>
                    </div>
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
                    icon="pi pi-plus"
                    class="p-button-outlined"
                    :label="$t('buttons.save_add_other')"
                    @click="save('another')"
                    data-testid="save-add-other-button"
                    :loading="busyAnother"
                    v-if="!isEditMode"
                />
                <Button
                    data-testid="save-button"
                    icon="pi pi-check"
                    :label="
                        isEditMode ? $t('buttons.update') : $t('buttons.save')
                    "
                    @click="save"
                    :loading="busy"
                />
            </template>
        </Dialog>

        <Confirmation
            v-model="deleteDialog"
            :header="deleteHeader"
            :content="deleteConfirmContent"
            :confirm-button-text="$t('buttons.delete')"
            confirm-button-class="p-button-danger"
            @confirm="deleteItems"
            dialog-testid="delete-dialog"
            close-button-testid="delete-close-button"
            cancel-button-testid="delete-cancel-button"
            confirm-button-testid="delete-confirm-button"
            header-testid="delete-title"
            content-testid="delete-content"
        />
    </div>
</template>

<style lang="scss">
.p-dialog-footer {
    justify-content: flex-end;
}
.message-box {
    background-color: #bfdbfc;
    color: #14377d;
    border-radius: 7px;
    padding: 1.2rem 1.4rem;
    gap: 0.65rem;
}
.message-box .icon {
    font-size: 1.45rem;
}
.message-box .message {
    color: #495057;
}
.primary-badge {
    background: transparent;
    color: #14377d;
    border: 1px solid #14377d;
    height: auto;
    font-size: 0.6rem;
    line-height: 1;
    padding: 0.3rem !important;
    border-radius: 0.25rem !important;
}
.client-contacts-table tbody.p-datatable-tbody td {
    padding-inline: 0.5rem !important;
}
.client-contacts-table th {
    padding-inline: 0.25rem !important;
}
.client-contacts-table .name-col {
    width: 20% !important;
}
.p-tooltip-text {
    width: max-content !important;
}
</style>
