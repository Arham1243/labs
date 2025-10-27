<script setup>
import { useHelpers } from '@/composables';
import { ability } from '@/plugins/ability';
import { useToast } from 'primevue/usetoast';
import { ref, computed, onBeforeMount, watch, nextTick } from 'vue';
import { useSettingStore } from '@/modules/administration/stores';
import { useGlobalStore, useCommonStore } from '@/stores';
import {
    useClientUserStore,
    useBusinessUnitUserStore,
    useClientStore
} from '@/modules/clients/stores';
import { useI18n } from 'vue-i18n';
import { PaginationOptions, SortFilterOptions } from '@/config';
import { useRoute, useRouter } from 'vue-router';
import UserApprovalForm from '@/modules/clients/components/forms/UserApprovalForm.vue';

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
const toast = useToast();
const route = useRoute();
const router = useRouter();
const helpers = useHelpers();
const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();
const settingStore = useSettingStore();
const clientUserStore = useClientUserStore();
const clientStore = useClientStore();
const businessUnitUserStore = useBusinessUnitUserStore();
const stores = {
    client: clientUserStore,
    business_unit: businessUnitUserStore
};
const userStore = computed(() => stores[props.entity] || null);
const globalStore = useGlobalStore();
const commonStore = useCommonStore();

const userApprovalRef = ref(null);
const menu = ref();
const menuMultipleAction = ref();
const items = ref([]);
const requests = ref([]);
const isEditMode = ref(false);
const provinces = ref([]);
const countries = ref([]);
const roles = ref([]);
const loadingRoles = ref(false);
const loadingBusinessUnits = ref(false);
const showBussinesUnits = ref(false);
const businessUnits = ref([]);
const languages = ref([]);
const loadingProvinces = ref(false);
const loadingCountries = ref(false);
const loadingLanguages = ref(false);
const isDialogVisible = ref(false);
const busy = ref(false);
const searchText = ref('');
const loading = ref(false);
const totalRecords = ref(0);
const selectedItem = ref(null);
const selectedItems = ref([]);
const statusUpdateDialog = ref(false);
const resendActivationDialog = ref(false);
const cancelWorkflowDialog = ref(false);
const deleteDialog = ref(false);
const originalFormData = ref(null);
const selectedStatus = ref('all');
const statuses = [
    { name: 'active' },
    { name: 'unconfirmed' },
    { name: 'pending approval' },
    { name: 'pending deletion' },
    { name: 'inactive' },
    { name: 'declined' }
];
const formData = ref({
    country_id: null,
    postal_code: '',
    province_id: null,
    [props.entity + '_id']: props.id,
    city: '',
    secondary_address: '',
    address: '',
    phone_number: '',
    role_id: null,
    preferred_language: null,
    scopes: [],
    email: '',
    last_name: '',
    first_name: ''
});

onBeforeMount(async () => {
    await getItems();
    await clientStore.getClient(
        props.entity === 'client' ? route.params.id : route.params.clientId,
        {}
    );
    const userId = route.query.user_id;
    if (userId && items.value.length > 0) {
        await handleUserUpdate(userId);
    }
    await getSettings();
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

const statusFilterOptions = computed(() => [
    { label: t('common.all'), value: 'all' },
    ...statuses.map((status) => ({
        label: formatStatus(status.name),
        value: status.name
    }))
]);

const lastDeclineReason = computed(() => {
    if (selectedItem.value?.status !== 'declined') return null;

    const last = [...selectedItem.value.requests]
        .reverse()
        .find((r) => r.reason);

    return last
        ? { reason: last.reason, date: helpers.formatDate(last.created_at) }
        : null;
});

const hasFormChanged = computed(() => {
    if (!originalFormData.value) return false;
    return (
        JSON.stringify(formData.value) !==
        JSON.stringify(originalFormData.value)
    );
});

const isEntityStatusActive = computed(() => {
    if (props.entity === 'client') {
        return clientStore.currentClient?.status === 'active';
    }
    if (props.entity === 'business_unit') {
        return clientStore.currentBusinessUnit?.status === 'active';
    }
    return false;
});

const tableColumns = computed(() => {
    const commonColumns = {
        name: { field: 'name', header: t('common.name'), sortable: true },
        roles: {
            field: 'roles.name',
            header: t('clients.user_role'),
            sortable: true
        },
        status: { field: 'status', header: t('common.status'), sortable: true },
        last_login: {
            field: 'last_login',
            header: t('users.last_login'),
            sortable: true
        }
    };

    const clientColumns = [
        commonColumns.name,
        commonColumns.roles,
        commonColumns.status,
        commonColumns.last_login
    ];

    const entitySpecificColumns = {
        client: clientColumns,
        business_unit: clientColumns
    };

    return entitySpecificColumns[props.entity];
});

const formFields = computed(() => {
    const commonFields = {
        first_name: {
            col_class: 'col-span-12',
            label: t('users.first_name'),
            key: 'first_name',
            required: true,
            type: 'text'
        },
        last_name: {
            col_class: 'col-span-12',
            label: t('users.last_name'),
            key: 'last_name',
            required: true,
            type: 'text'
        },
        email: {
            label: t('users.email_address'),
            key: 'email',
            type: 'email',
            disabled: isEditMode.value,
            required: true,
            col_class: 'col-span-12'
        },
        phone_number: {
            col_class: 'col-span-12',
            label: t('users.mobile_number'),
            key: 'phone_number',
            required: true,
            type: 'phone'
        },
        preferred_language: {
            col_class: 'col-span-12',
            label: t('users.preferred_language'),
            key: 'preferred_language',
            type: 'apiDropdown',
            fetchItems: getLanguages,
            loading: loadingLanguages.value,
            items: languages.value,
            optionValue: 'code',
            required: true,
            optionLabel: 'name'
        },
        address: {
            col_class: 'col-span-12',
            label: t('users.address'),
            key: 'address',
            type: 'text'
        },
        secondary_address: {
            col_class: 'col-span-12',
            label: `${t('users.address')} 2`,
            key: 'secondary_address',
            type: 'text'
        },
        city: {
            col_class: 'col-span-6',
            label: t('users.city'),
            key: 'city',
            type: 'text'
        },
        province_id: {
            col_class: 'col-span-6',
            label: t('common.province'),
            key: 'province_id',
            type: 'apiDropdown',
            fetchItems: getProvinces,
            loading: loadingProvinces.value,
            items: provinces.value,
            optionValue: 'id',
            optionLabel: 'name'
        },
        postal_code: {
            col_class: 'col-span-6',
            label: t('users.postal_code'),
            key: 'postal_code',
            type: 'text'
        },
        country_id: {
            col_class: 'col-span-6',
            label: t('common.country'),
            key: 'country_id',
            type: 'apiDropdown',
            fetchItems: getCountries,
            onChange: getProvinces,
            loading: loadingCountries.value,
            items: countries.value,
            optionValue: 'id',
            optionLabel: 'name'
        },
        user_role: {
            col_class: 'col-span-12',
            label: t('clients.user_role'),
            key: 'role_id',
            required: true,
            type: 'apiDropdown',
            fetchItems: getRoles,
            loading: loadingRoles.value,
            items: roles.value,
            optionValue: 'id',
            optionLabel: 'name'
        }
    };

    const clientFields = [
        commonFields.first_name,
        commonFields.last_name,
        commonFields.email,
        commonFields.phone_number,
        commonFields.preferred_language,
        commonFields.address,
        commonFields.secondary_address,
        commonFields.city,
        commonFields.province_id,
        commonFields.postal_code,
        commonFields.country_id,
        commonFields.user_role
    ];

    const entitySpecificFields = {
        client: clientFields,
        business_unit: clientFields
    };

    return entitySpecificFields[props.entity];
});

const dialogHeader = computed(() =>
    isEditMode.value
        ? t('common.edit_item_popup_header', {
              item: t('common.user')
          })
        : t('common.new_item_popup_header', {
              item: t('common.user')
          })
);

const isItemActive = computed(() => {
    return selectedItem.value && selectedItem.value.status === 'active';
});
const isUnconfirmed = computed(() => {
    return selectedItem.value && selectedItem.value.status === 'unconfirmed';
});
const canCancelWorkflow = computed(() => {
    return (
        selectedItem.value &&
        ['pending approval', 'pending deletion'].includes(
            selectedItem.value.status
        )
    );
});
const canChangeItemStatus = computed(() => {
    return (
        selectedItem.value &&
        (selectedItem.value.status === 'active' ||
            selectedItem.value.status === 'inactive')
    );
});
const canDeleteItem = computed(() => {
    return (
        selectedItem.value &&
        (selectedItem.value.status === 'inactive' ||
            selectedItem.value.status === 'unconfirmed')
    );
});

const canDoBulkDelete = computed(() => {
    return (
        selectedItems.value &&
        selectedItems.value.length > 0 &&
        ability.can('update client approvals') &&
        selectedItems.value.every(
            (item) =>
                item.status === 'inactive' || item.status === 'unconfirmed'
        )
    );
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

const statusDialogButtonText = computed(() => {
    return isItemActive.value
        ? t('common.make_inactive')
        : t('common.make_active');
});

const deleteHeader = computed(() => {
    return selectedItems.value.length > 1
        ? t('common.delete_item_header', { item: t('clients.client_users') })
        : t('common.delete_item_header', { item: t('clients.client_user') });
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
    return t('common.are_you_sure_delete', { name: selectedItem.value?.name });
});

const menuMultipleActionItems = computed(() => {
    return [{ label: t('buttons.delete'), command: () => showDeleteDialog() }];
});

const menuItems = computed(() => {
    if (!selectedItem.value) return [];
    const allMenuItems = [
        {
            label: t('buttons.edit'),
            icon: 'pi pi-pencil',
            command: () => editItem(),
            permission: 'update client users'
        },
        {
            label: isItemActive.value
                ? t('common.make_inactive')
                : t('common.make_active'),
            icon: 'pi pi-check',
            command: () => showStatusUpdateDialog(),
            disabled: !canChangeItemStatus.value,
            permission: 'update client users'
        },
        {
            label: t('common.delete'),
            icon: 'pi pi-trash',
            command: () => showDeleteDialog(),
            disabled: !canDeleteItem.value,
            permission: 'delete client users'
        },
        ...(canCancelWorkflow.value
            ? [
                  {
                      label: t('users.cancel_workflow'),
                      icon: 'pi pi-times',
                      command: () => showCancelWorkflowDialog(),
                      permission: 'update client users'
                  }
              ]
            : []),
        ...(isUnconfirmed.value
            ? [
                  {
                      label: t('users.resend_activation_link'),
                      icon: 'pi pi-refresh',
                      command: showResendActivationDialog,
                      permission: 'update client users'
                  }
              ]
            : [])
    ];
    return helpers.filterByPermission(allMenuItems);
});

const onShow = () => {
    resetForm();
};

const formatStatus = (value) =>
    value
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

const showMenu = (event) => {
    menuMultipleAction.value.toggle(event);
};

const showActions = (event, item) => {
    selectedItem.value = item;
    menu.value.toggle(event);
};

const openDialog = (mode = 'add') => {
    getCountries('');
    getLanguages('');
    getRoles('');
    getSettings();
    getBusinessUnits('');
    isEditMode.value = mode === 'edit';
    isDialogVisible.value = true;
};

const closeDialog = () => {
    isDialogVisible.value = false;
    resetForm();
};
const resetForm = () => {
    formData.value.country_id = null;
    formData.value.status = true;
    formData.value.postal_code = '';
    formData.value.province_id = null;
    formData.value.city = '';
    formData.value.secondary_address = '';
    formData.value.address = '';
    formData.value.phone_number = '';
    formData.value.role_id = null;
    formData.value.preferred_language = null;
    formData.value.scopes = [];
    provinces.value = [];
    formData.value.email = '';
    formData.value.last_name = '';
    showBussinesUnits.value = false;
    formData.value.first_name = '';
    globalStore.clearErrors();
    clearUserIdParam();
};

const editItem = () => {
    resetForm();
    formData.value.country_id = selectedItem.value.country?.id;
    formData.value.status = selectedItem.value.status;
    formData.value.postal_code = selectedItem.value.postal_code;
    formData.value.province_id = selectedItem.value.province?.id;
    formData.value.city = selectedItem.value.city;
    formData.value.secondary_address = selectedItem.value.secondary_address;
    formData.value.address = selectedItem.value.address;
    formData.value.phone_number = selectedItem.value.phone_number;
    formData.value.preferred_language = selectedItem.value.preferred_language;
    formData.value.scopes =
        selectedItem.value.user_scopes?.flatMap(
            (item) => item.business_unit_ids || []
        ) || [];
    showBussinesUnits.value = !!selectedItem.value.user_scopes?.length;
    formData.value.role_id =
        selectedItem.value.roles && selectedItem.value.roles.length
            ? selectedItem.value.roles[0]?.id
            : null;
    formData.value.email = selectedItem.value.email;
    formData.value.last_name = selectedItem.value.last_name;
    formData.value.first_name = selectedItem.value.first_name;
    formData.value.status =
        selectedItem.value.status === 'active' ? true : false;
    originalFormData.value = JSON.parse(JSON.stringify(formData.value));
    openDialog('edit');
};

const showStatusUpdateDialog = () => {
    statusUpdateDialog.value = true;
};

const showResendActivationDialog = () => {
    resendActivationDialog.value = true;
};

const showCancelWorkflowDialog = () => {
    cancelWorkflowDialog.value = true;
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

const onStatusFilterChange = (event) => {
    const value = event.value.value;
    if (value !== 'all') {
        sortFilters.updateFilters('status', value);
    } else {
        sortFilters.filters = [];
    }
    pagination.resetPageParams();
    getItems();
};

const rowClicked = ({ data }) => {
    selectedItem.value = data;
    openSidebarIfApprovalPossible();
};

const checkUpdatePermission = () => {
    const isApprover =
        new URLSearchParams(window.location.search).get('type') === 'approver';
    if (
        !ability.can('update client approvals') &&
        !ability.can('update client users') &&
        isApprover
    ) {
        toast.add({
            severity: 'error',
            summary: t('notifications.oops'),
            detail: t('clients.You_dont_have_access_to_this'),
            life: 4000
        });
        return false;
    }
    return true;
};

const clearUserIdParam = () => {
    const params = new URLSearchParams(route.query);
    if (params.has('user_id') || params.has('type')) {
        params.delete('user_id');
        params.delete('type');
        router.replace({ query: Object.fromEntries(params.entries()) });
    }
};

const handleUserUpdate = async (userId) => {
    const canUpdate = checkUpdatePermission();
    if (!canUpdate) {
        clearUserIdParam();
        return;
    }

    try {
        const res = await getUser(userId);
        selectedItem.value = res.data || null;

        if (selectedItem.value) {
            notifyIfAlreadyHandled();
            openSidebarIfApprovalPossible();
        } else {
            clearUserIdParam();
        }
    } catch (error) {
        console.error(error);
        clearUserIdParam();
    }
};

const notifyIfAlreadyHandled = () => {
    const status = selectedItem.value?.status;
    const isApprover =
        new URLSearchParams(window.location.search).get('type') === 'approver';

    if (!isApprover) {
        if (status === 'declined' && ability.can('update client users'))
            editItem();
        clearUserIdParam();
        return;
    }

    const approvedToastData = {
        type: 'error',
        title: t('notifications.user_already_approved'),
        message: t('notifications.user_already_approved_detail')
    };

    const keyMap = {
        unconfirmed: approvedToastData,
        active: approvedToastData,
        inactive: approvedToastData,
        declined: {
            type: 'error',
            title: t('notifications.user_already_declined'),
            message: t('notifications.user_already_declined_detail')
        }
    };

    const toastData = keyMap[status];
    if (!toastData) return;

    toast.add({
        severity: toastData.type,
        summary: toastData.title,
        detail: toastData.message,
        life: 3000
    });

    clearUserIdParam();
};

const openSidebarIfApprovalPossible = () => {
    if (selectedItem.value?.actions?.length > 0 && !canChangeItemStatus.value) {
        nextTick(() => {
            userApprovalRef.value?.openSidebar?.();
        });
    }
};

const isSelected = (item) => selectedItems.value.some((i) => i.id === item.id);

const selectableItems = computed(() => {
    const selectedSet = new Set(selectedItems.value.map((i) => i.id));
    const unselected = items.value.filter((i) => !selectedSet.has(i.id));
    return selectedItems.value.concat(unselected).slice(0, 10);
});

const isAllSelected = computed(
    () =>
        selectableItems.value.length > 0 &&
        selectableItems.value.every((item) => isSelected(item))
);

const toggleSelection = (item, isChecked) => {
    if (isChecked) {
        if (
            selectedItems.value.length < 10 &&
            !selectedItems.value.some((i) => i.id === item.id)
        ) {
            selectedItems.value = [...selectedItems.value, item];
        }
    } else {
        if (selectedItems.value.some((i) => i.id === item.id)) {
            selectedItems.value = selectedItems.value.filter(
                (i) => i.id !== item.id
            );
        }
    }
};

const toggleSelectAll = (checked) => {
    selectedItems.value = checked
        ? [...selectableItems.value.slice(0, 10)]
        : [];
};

const search = async () => {
    pagination.resetPageParams();
    sortFilters.updateSearch(searchText.value);
    getItems();
};

const getUser = async (id) => {
    try {
        let includes = 'requests,province,country,roles';
        if (props.entity === 'client') includes += ',userScopes';

        const params = {
            [props.entity + '_id']: props.id,
            include: includes
        };
        return userStore.value.getUser(id, params);
    } catch (error) {
        console.log(error);
    }
};

const getItems = async () => {
    try {
        loading.value = true;
        const params = {
            ...pagination.getPageParams(),
            [props.entity + '_id']: props.id
        };
        const { sort } = sortFilters.getSortFilters(searchText.value);
        const updatedSort =
            sort[0]?.field === 'name'
                ? [
                      { field: 'first_name', direction: sort[0]?.direction },
                      { field: 'last_name', direction: sort[0]?.direction }
                  ]
                : sort;
        const includes = [
            { relation: 'requests' },
            { relation: 'province' },
            { relation: 'country' },
            { relation: 'roles' }
        ];

        if (props.entity === 'client') {
            includes.push({ relation: 'userScopes' });
        }

        const payload = {
            ...sortFilters.getSortFilters(searchText.value),
            sort: updatedSort,
            includes
        };
        const res = await userStore.value.search(payload, params);
        items.value = res.data;
        totalRecords.value = res.meta.total;
        await getPendingItems();
    } finally {
        loading.value = false;
    }
};

const getPendingItems = async () => {
    try {
        const params = {
            [props.entity + '_id']: props.id,
            limit: 500
        };

        const includes = [
            { relation: 'requests' },
            { relation: 'province' },
            { relation: 'country' },
            { relation: 'roles' }
        ];

        if (props.entity === 'client') {
            includes.push({ relation: 'userScopes' });
        }

        const payload = {
            includes,
            filters: [
                {
                    field: 'status',
                    operator: 'in',
                    value: ['pending approval', 'pending deletion']
                }
            ]
        };
        const res = await userStore.value.search(payload, params);
        requests.value = res.data.map((req) => ({
            ...req,
            client_name: helpers.getLocaleValue(
                clientStore.currentClient?.name
            ),
            business_unit_names:
                req?.user_scopes
                    ?.flatMap((scope) =>
                        scope.business_unit_ids.map((id) => {
                            const match = businessUnits.value.find(
                                (unit) => unit.id === id
                            );
                            return match
                                ? helpers.getLocaleValue(match.name)
                                : null;
                        })
                    )
                    .filter(Boolean) || []
        }));
    } catch (error) {
        console.log(error);
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

const getCountries = async (search) => {
    try {
        loadingCountries.value = true;
        const payload = {
            search: search ? { value: search } : undefined
        };
        const res = await commonStore.searchCountries(payload);
        countries.value = res.data;
    } finally {
        loadingCountries.value = false;
    }
};
const getSettings = async () => {
    const res = await settingStore.getSettings();
    if (formData.value.preferred_language === null) {
        formData.value.preferred_language = res.default_language?.code;
    }
};
const save = async () => {
    try {
        const modifiedFormData = {
            ...formData.value,
            scopes_toggle: showBussinesUnits.value
        };
        busy.value = true;
        if (isEditMode.value) {
            await userStore.value.update(
                selectedItem.value.id,
                modifiedFormData
            );
        } else {
            await userStore.value.create(modifiedFormData);
        }
        closeDialog();
        selectedItem.value = {};
        await getItems();
    } catch (error) {
        console.log(error);
    } finally {
        busy.value = false;
    }
};

const updateStatus = async () => {
    try {
        loading.value = true;
        const payload = {
            action:
                selectedItem.value.status === 'active'
                    ? 'deactivate'
                    : 'activate'
        };
        await userStore.value.updateStatus(selectedItem.value.id, payload);
        selectedItem.value = {};
        await getItems();
    } finally {
        loading.value = false;
    }
};

const resendActivation = async () => {
    try {
        loading.value = true;
        await userStore.value.resendActivation(selectedItem.value.email);
        selectedItem.value = {};
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
};

const cancelWorkflow = async () => {
    try {
        loading.value = true;
        await userStore.value.cancelWorkflow(selectedItem.value.id);
        selectedItem.value = {};
        await getItems();
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
};

const deleteItems = async () => {
    try {
        loading.value = true;
        if (selectedItems.value.length > 0) {
            await userStore.value.deleteItems({
                resources: selectedItems.value.map((i) => i.id)
            });
        } else {
            await userStore.value.deleteItem(selectedItem.value.id);
        }
        await getItems();
        selectedItem.value = {};
        selectedItems.value = [];
    } finally {
        loading.value = false;
    }
};

watch(
    () => formData.value.country_id,
    () => getProvinces(''),
    { immediate: true }
);
</script>

<template>
    <UserApprovalForm
        @reloadUsers="getItems"
        ref="userApprovalRef"
        v-if="
            $ability.can('update client users') &&
            $ability.can('update client approvals') &&
            requests.length > 0 &&
            selectedItem
        "
        :requests="requests"
        :selectedUser="selectedItem"
        :entity="props.entity"
        :key="selectedItem?.id"
    />
    <div>
        <BaseTable
            dataKey="id"
            :value="items"
            :loading="loading"
            :page="pagination.page"
            :rows="pagination.limit"
            :total-records="totalRecords"
            @row-click="rowClicked"
            @page="onPageChange"
            @sort="onSortChange"
            v-model:selection="selectedItems"
        >
            <template #header>
                <div
                    class="flex justify-between items-center col-span-12 mb-2"
                >
                    <div class="flex gap-4">
                        <div>
                            <Button
                                v-if="$ability.can('delete client users')"
                                :disabled="!canDoBulkDelete"
                                :label="t('buttons.bulk_actions')"
                                icon="pi pi-chevron-down"
                                iconPos="right"
                                class="p-button-outlined"
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
                                v-if="$ability.can('view client users')"
                                data-testid="search-input"
                                v-model="searchText"
                                @search="search"
                            />
                        </div>
                        <div>
                            <Select
                                data-testid="status-filter-dropdown"
                                :options="statusFilterOptions"
                                v-model="selectedStatus"
                                @change="onStatusFilterChange"
                                optionLabel="label"
                                class="filter-dropdown filter-dropdown--status"
                            >
                                <template #value="{ value }">
                                    {{ $t('common.status') }}:
                                    {{ value.label ?? $t('common.all') }}
                                </template>
                            </Select>
                        </div>
                    </div>
                    <Button
                        :label="
                            $t('common.create_item_btn_label', {
                                item: $t('common.user')
                            })
                        "
                        icon="pi pi-plus"
                        @click="openDialog('add')"
                        data-testid="add-new-user-button"
                        :disabled="!isEntityStatusActive"
                        v-if="$ability.can('create client users')"
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

            <Column
                headerStyle="width: 2rem"
                v-if="$ability.can('delete client users')"
            >
                <template #header>
                    <InputField
                        data-testid="table-header-bulk"
                        binary
                        variant="checkbox"
                        :model-value="isAllSelected"
                        :disabled="selectableItems.length === 0"
                        @update:model-value="toggleSelectAll"
                        @click.stop
                    />
                </template>
                <template #body="{ data }">
                    <InputField
                        :data-testid="`bulk-data-table-${data.id}`"
                        :id="`bulk-checkbox-${data.id}`"
                        binary
                        variant="checkbox"
                        :model-value="isSelected(data)"
                        :disabled="
                            !isSelected(data) && selectedItems.length >= 10
                        "
                        @update:model-value="
                            (val) => toggleSelection(data, val)
                        "
                        @click.stop
                    />
                </template>
            </Column>
            <Column
                v-for="col in tableColumns"
                :key="col.field"
                :sortable="col.sortable"
                :field="col.field"
                class="px-1"
            >
                <template #header>
                    <span :data-testid="'table-header-' + col.field">{{
                        col.header
                    }}</span>
                </template>
                <template #body="{ data, index }">
                    <span
                        v-if="col.field === 'roles.name'"
                        :data-testid="'roles-data-table-' + index"
                        v-tooltip.top="helpers.getLocaleValue(data.name)"
                        class="cursor-pointer"
                    >
                        {{ data.roles?.[0]?.name || '-' }}
                    </span>
                    <span v-else-if="col.field === 'status'">
                        <StatusTag
                            :status="data.status.replace('-', ' ')"
                            :data-testid="'status-tag-' + index"
                        />
                    </span>
                    <span
                        v-else-if="col.field === 'last_login'"
                        :data-testid="'last-login-data-table-' + index"
                    >
                        {{ helpers.formatDate(data.last_login) }}
                    </span>
                    <span
                        v-else
                        :data-testid="col.field + '-data-table-' + index"
                    >
                        {{ data[col.field] }}
                    </span>
                </template>
            </Column>

            <Column
                v-if="
                    $ability.can('update client users') ||
                    $ability.can('delete client users')
                "
            >
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
                            class="w-16rem"
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

        <Dialog
            v-model:visible="isDialogVisible"
            :header="dialogHeader"
            @update:visible="onShow"
            :style="{ width: '35vw' }"
            modal
            data-testid="item-dialog"
            :closable="false"
            v-if="
                $ability.can('create client users') ||
                $ability.can('update client users')
            "
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
                <div
                    class="col-span-12"
                    v-if="lastDeclineReason && isEditMode"
                >
                    <div class="decline-box flex">
                        <i
                            v-tooltip.top="lastDeclineReason.date"
                            class="pi pi-info-circle icon"
                        ></i>
                        <div>
                            <div class="font-bold title">
                                {{ $t('clients.decline_reason') }}
                            </div>
                            <div class="message">
                                {{ lastDeclineReason.reason }}
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    v-for="field in formFields"
                    :key="field.key"
                    :class="`${field.col_class}`"
                >
                    <label
                        :data-testid="`${field.key}-label`"
                        :for="field.key"
                        :class="`block ${
                            field.required ? 'required' : ''
                        }  mb-2`"
                    >
                        {{ field.label }}
                    </label>

                    <InputField
                        v-if="field.type === 'text' || field.type === 'email'"
                        :data-testid="`${field.key}-input`"
                        :placeholder="
                            field.key === 'first_name' ||
                            field.key === 'last_name' ||
                            field.key === 'email'
                                ? field.label
                                : ''
                        "
                        :id="field.key"
                        :type="field.type"
                        variant="text"
                        v-model="formData[field.key]"
                        :disabled="field.disabled || false"
                        class="w-full"
                    />

                    <InputField
                        v-if="field.type === 'phone'"
                        :data-testid="`${field.key}-input`"
                        :placeholder="field.label"
                        :id="field.key"
                        :type="field.type"
                        variant="phone"
                        v-model="formData[field.key]"
                        class="w-full"
                    />

                    <ApiDropdown
                        v-else-if="field.type === 'apiDropdown'"
                        :tooltipLength="50"
                        :tooltip="true"
                        :data-testid="`${field.key}-input`"
                        :id="field.key"
                        :option-value="`${field.optionValue}`"
                        :option-label="`${field.optionLabel}`"
                        v-model="formData[field.key]"
                        :items="field.items"
                        @search="field.fetchItems"
                        @change="
                            field.key === 'country_id'
                                ? field.onChange('')
                                : () => {}
                        "
                        :loading="field.loading"
                        class="w-full"
                    />
                </div>
                <template v-if="props.entity === 'client'">
                    <div class="field col-span-12 mb-4">
                        <label
                            :data-testid="`limit-access-label`"
                            class="block mb-2"
                        >
                        </label>
                        <div class="flex items-center gap-3">
                            <InputField
                                variant="switch"
                                data-testid="limit-access-input"
                                id="limit-access"
                                v-model="showBussinesUnits"
                            />
                            <span>
                                {{
                                    t('clients.limit_access_to_business_units')
                                }}</span
                            >
                        </div>
                    </div>
                    <div
                        class="field col-span-12"
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
            </div>
            <template #footer>
                <div class="flex justify-end w-full edit-cancel-button">
                    <Button
                        text
                        :label="$t('buttons.cancel')"
                        @click="closeDialog"
                        data-testid="cancel-button"
                        class="p-button-outlined mr-2"
                    />
                    <Button
                        data-testid="save-button"
                        icon="pi pi-check"
                        :label="
                            isEditMode
                                ? $t('buttons.update')
                                : $t('common.create')
                        "
                        @click="save"
                        :loading="busy"
                        :disabled="isEditMode && !hasFormChanged"
                    />
                </div>
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
            v-if="$ability.can('update client users')"
        />

        <Confirmation
            v-model="resendActivationDialog"
            :header="t('users.resend_activation_link')"
            :content="t('users.are_you_sure_resend_activation_link')"
            confirm-button-class="p-button-success"
            :confirm-button-text="t('users.send')"
            @confirm="resendActivation"
            dialog-testid="resend-activation-dialog"
            close-button-testid="resend-activation-close-button"
            cancel-button-testid="resend-activation-cancel-button"
            confirm-button-testid="resend-activation-confirm-button"
            header-testid="resend-activation-title"
            content-testid="resend-activation-content"
            v-if="$ability.can('update client users')"
        />

        <Confirmation
            v-model="cancelWorkflowDialog"
            :header="t('users.cancel_workflow')"
            :content="t('users.are_you_sure_cancel_workflow')"
            confirm-button-class="p-button-success"
            :confirm-button-text="t('buttons.confirm')"
            @confirm="cancelWorkflow"
            dialog-testid="cancel-workflow-dialog"
            close-button-testid="cancel-workflow-close-button"
            cancel-button-testid="cancel-workflow-cancel-button"
            confirm-button-testid="cancel-workflow-confirm-button"
            header-testid="cancel-workflow-title"
            content-testid="cancel-workflow-content"
            v-if="$ability.can('update client users')"
        />

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
            v-if="$ability.can('delete client users')"
        />
    </div>
</template>

<style lang="scss">
.p-dialog-footer {
    justify-content: flex-end;
}
.decline-box {
    background-color: #ffe7e6;
    color: #b52a22;
    border-radius: 7px;
    padding: 1.2rem 1.1rem;
    gap: 0.95rem;
}
.decline-box .icon {
    font-size: 1.45rem;
}
.decline-box .title {
    color: #343a40;
    margin-bottom: 0.55rem;
}
.decline-box .message {
    color: #323b3a;
}
</style>
