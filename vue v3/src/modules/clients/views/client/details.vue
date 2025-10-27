<script setup>
import lodash from 'lodash';
import { ref, computed, onBeforeMount, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useClientStore } from '@/modules/clients/stores';
import { ability } from '@/plugins/ability';
import { useHelpers } from '@/composables';

import AuditTable from '@/components/common/AuditTable.vue';
import InsuredsTable from '@/components/common/InsuredsTable.vue';
import UserTable from '@/modules/clients/components/tables/UserTable.vue';
import ContactsTable from '@/modules/clients/components/tables/ContactsTable.vue';
import DetailsPanel from '@/modules/clients/components/DetailsPanel.vue';
import BusinessUnits from '@/modules/clients/components/BusinessUnits.vue';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const helpers = useHelpers();
const clientStore = useClientStore();

const menu = ref();
const item = ref({});
const busy = ref(false);
const loading = ref(false);
const deleteDialog = ref(false);
const statusUpdateDialog = ref(false);
const duplicateDialog = ref(false);
const editDialog = ref(false);
const viteShowInsuredsTab = import.meta.env.VITE_SHOW_INSUREDS_TAB === 'true';
const activeTabIndex = ref(0);

onMounted(() => {
    const userId = route.query.user_id;
    const usersIndex = visibleTabs.value.findIndex((h) => h === 'Users');
    if (userId) {
        if (usersIndex !== -1) {
            activeTabIndex.value = usersIndex;
        } else {
            clearUserParams();
        }
    }
});

onBeforeMount(async () => {
    await getItem();
});

watch(activeTabIndex, (newIndex) => {
    const userId = route.query.user_id;
    const usersIndex = visibleTabs.value.findIndex((h) => h === 'Users');
    if (userId && newIndex !== usersIndex) {
        router.replace({
            query: { ...route.query, user_id: undefined, type: undefined }
        });
    }
});

const visibleTabs = computed(() => {
    const tabs = [
        {
            header: 'Business Units',
            visible: ability.can('view business units')
        },
        { header: 'Documents', visible: true },
        { header: 'Contacts', visible: true },
        { header: 'Users', visible: ability.can('view client users') },
        { header: 'Audit Log', visible: true },
        { header: 'Insureds', visible: viteShowInsuredsTab }
    ];
    return tabs.filter((t) => t.visible).map((t) => t.header);
});

const menuItems = computed(() => {
    const allMenuItems = [
        {
            label: 'Edit',
            icon: 'pi pi-pencil',
            command: () => editItem(),
            permission: 'update clients'
        },
        {
            label: isItemActive.value
                ? t('common.make_inactive')
                : t('common.make_active'),
            icon: isItemActive.value ? 'pi pi-times' : 'pi pi-check',
            command: () => showStatusUpdateDialog(),
            permission: 'update clients'
        },
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            command: () => showDeleteDialog(),
            permission: 'delete clients'
        }
    ];

    return helpers.filterByPermission(allMenuItems);
});

const isItemActive = computed(() => {
    return item.value && item.value.status == 'active';
});

const statusDialogHeader = computed(() => {
    return isItemActive.value
        ? t('clients.make_client_inactive')
        : t('clients.make_client_active');
});

const statusDialogContent = computed(() => {
    return isItemActive.value
        ? t('common.are_you_sure_inactive', {
              item: helpers.getLocaleValue(item.value?.name)
          })
        : t('common.are_you_sure_active', {
              item: helpers.getLocaleValue(item.value?.name)
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

const getItem = async () => {
    loading.value = true;
    const params = {
        include:
            'clientSector,country,billingDetail,businessUnits,businessUnits.activePlansCount,contacts,billingDetail.country,defaultBusinessUnit'
    };
    const res = await clientStore.getClient(props.id, params);
    item.value = res.data;
    loading.value = false;
};

const updateStatus = async () => {
    try {
        loading.value = true;
        const payload = {
            ...item.value,
            preferred_language: item.value.preferred_language?.id,
            status: item.value.status === 'active' ? 'inactive' : 'active'
        };
        await clientStore.updateClient(item.value.id, payload);
        await getItem();
    } finally {
        loading.value = false;
    }
};

const deleteItem = async () => {
    try {
        loading.value = true;
        await clientStore.deleteClient(item.value.id);
        goBack();
    } finally {
        loading.value = false;
    }
};

const editItem = () => {
    router.push({ name: 'Client Edit', params: { id: props.id } });
};

const showMenu = (event) => {
    menu.value.toggle(event);
};

const goBack = () => {
    router.push({ name: 'Clients' });
};

const showStatusUpdateDialog = () => {
    statusUpdateDialog.value = true;
};

const showDeleteDialog = () => {
    deleteDialog.value = true;
};

const clearUserParams = () => {
    const params = new URLSearchParams(route.query);
    if (params.has('user_id') || params.has('type')) {
        params.delete('user_id');
        params.delete('type');
        router.replace({ query: Object.fromEntries(params.entries()) });
    }
};
</script>

<template>
    <Loader v-if="loading" />
    <div v-else class="grid">
        <div class="col-9">
            <Header @goBack="goBack">
                <template #title>
                    <div
                        class="p-break-word"
                        v-tooltip.bottom="helpers.getLocaleValue(item.name)"
                    >
                        {{
                            lodash.truncate(helpers.getLocaleValue(item.name), {
                                length: 30
                            })
                        }}
                    </div>
                    <StatusTag class="ml-2" :status="item.status" />
                </template>
                <template #actions>
                    <Button
                        label="0"
                        icon="pi pi-check-square"
                        data-testid="square-button"
                        class="mr-2 p-button-outlined"
                        iconPos="left"
                    />
                    <Button
                        label="2"
                        icon="pi pi-comment"
                        data-testid="comment-button"
                        class="mr-2 p-button-outlined"
                        iconPos="left"
                    />
                    <Button
                        label="Actions"
                        data-testid="actions-button"
                        icon="pi pi-chevron-down"
                        iconPos="right"
                        :loading="busy"
                        @click="showMenu"
                        v-if="
                            $ability.can('update clients') ||
                            $ability.can('delete clients')
                        "
                    />
                    <Menu
                        ref="menu"
                        id="overlay_menu"
                        :model="menuItems"
                        :popup="true"
                    />
                </template>
            </Header>
            <TabView :lazy="true" v-model:activeIndex="activeTabIndex">
                <TabPanel
                    header="Business Units"
                    v-if="$ability.can('view business units')"
                >
                    <div>
                        <BusinessUnits
                            :data="item.business_units"
                            @reloadBusinessUnitsList="getItem"
                        />
                    </div>
                </TabPanel>
                <TabPanel header="Documents">
                    <div data-testid="documents-div">Documents</div>
                </TabPanel>
                <TabPanel header="Contacts">
                    <div data-testid="contacts-div">
                        <Card class="mt-5 p-3">
                            <template #content>
                                <ContactsTable :id="props.id" entity="client" />
                            </template>
                        </Card>
                    </div>
                </TabPanel>
                <TabPanel
                    header="Users"
                    v-if="$ability.can('view client users')"
                >
                    <div data-testid="users-div">
                        <Card class="mt-5 p-3">
                            <template #content>
                                <UserTable :id="props.id" entity="client" />
                            </template>
                        </Card>
                    </div>
                </TabPanel>
                <TabPanel header="Audit Log">
                    <Card class="mt-5">
                        <template #content>
                            <AuditTable entity="client" :entity_id="props.id" />
                        </template>
                    </Card>
                </TabPanel>
                <div v-if="viteShowInsuredsTab">
                    <TabPanel header="Insureds">
                        <Card class="mt-5">
                            <template #content>
                                <InsuredsTable :entity_id="props.id" />
                            </template>
                        </Card>
                    </TabPanel>
                </div>
            </TabView>
            <router-view> </router-view>
        </div>
        <div class="col-3">
            <DetailsPanel :data="item" v-if="$ability.can('view clients')" />
        </div>
        <Confirmation
            v-model="statusUpdateDialog"
            :header="statusDialogHeader"
            :content="statusDialogContent"
            :confirm-button-class="statusDialogButtonClass"
            :confirm-button-text="statusDialogButtonText"
            @confirm="updateStatus"
            data-testid="update-confirmation"
            v-if="$ability.can('update clients')"
        />
        <Confirmation
            v-model="deleteDialog"
            show-alert-icon
            header="Delete Client"
            :content="`Are you sure you want to delete ${helpers.getLocaleValue(
                item.name
            )}?`"
            confirm-button-class="p-button-danger"
            @confirm="deleteItem"
            data-testid="delete-confirmation"
            v-if="$ability.can('delete clients')"
        />
        <Confirmation
            v-model="duplicateDialog"
            data-testid="duplicate-confirmation"
            :header="`Duplicate Client`"
            :content="`Are you sure you want to duplicate ${helpers.getLocaleValue(
                item.name
            )}?`"
            v-if="$ability.can('create clients')"
        />
        <Confirmation
            v-model="editDialog"
            data-testid="edit-confirmation"
            :header="`Edit Client`"
            :content="`Are you sure you want to edit ${helpers.getLocaleValue(
                item.name
            )}?`"
            @confirm="editItem"
            v-if="$ability.can('update clients')"
        />
    </div>
</template>
