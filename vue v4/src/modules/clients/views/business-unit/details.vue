<script setup>
import { ref, computed, onBeforeMount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useClientStore } from '@/modules/clients/stores';
import { useHelpers } from '@/composables';
import lodash from 'lodash';

import useEventsBus from '@/composables/event-bus';
import AuditTable from '@/components/common/AuditTable.vue';
import DetailsPanel from '@/modules/clients/components/DetailsPanel.vue';
import BusinessUnitPlans from '@/modules/clients/components/BusinessUnitPlans.vue';
import UserTable from '@/modules/clients/components/tables/UserTable.vue';
import ContactsTable from '@/modules/clients/components/tables/ContactsTable.vue';
import Tab from 'primevue/tab';
import TabPanel from 'primevue/tabpanel';
import TabPanels from 'primevue/tabpanels';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';

const props = defineProps({
    clientId: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    }
});

const { t } = useI18n();
const router = useRouter();
const helpers = useHelpers();
const { bus } = useEventsBus();
const clientStore = useClientStore();

const menu = ref();
const item = ref({});
const busy = ref(false);
const loading = ref(false);
const deleteDialog = ref(false);
const statusUpdateDialog = ref(false);
const duplicateDialog = ref(false);
const editDialog = ref(false);

onBeforeMount(() => {
    getItem();
});

watch(
    () => bus.value.get('reloadBusinessUnit'),
    async () => {
        await getItem();
    }
);

const menuItems = computed(() => {
    const allMenuItems = [
        {
            label: 'Edit',
            icon: 'pi pi-pencil',
            command: () => goToBusinessUnitDetails(props.id),
            permission: 'update business units'
        },
        {
            label: isItemActive.value
                ? t('common.make_inactive')
                : t('common.make_active'),
            icon: isItemActive.value ? 'pi pi-times' : 'pi pi-check',
            command: () => showStatusUpdateDialog(),
            permission: 'update business units'
        },
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            command: () => showDeleteDialog(),
            permission: 'delete business units'
        }
    ];

    return helpers.filterByPermission(allMenuItems);
});

const showStatusUpdateDialog = () => {
    statusUpdateDialog.value = true;
};

const isItemActive = computed(() => {
    return item.value && item.value.status == 'active';
});

const statusDialogHeader = computed(() => {
    return isItemActive.value
        ? t('business_units.make_business_unit_inactive')
        : t('business_units.make_business_unit_active');
});

const goToBusinessUnitDetails = (id) => {
    router.push({
        name: 'Business Unit Edit',
        params: { clientId: props.clientId, id: id }
    });
};

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
            'client,accountManager,billingDetail.country,contacts,nonInsuranceProducts'
    };
    const res = await clientStore.getBusinessUnit(props.id, params);

    item.value = res.data;
    item.value.account_manager_user_id = item.value.account_manager_user?.id;

    clientStore.setCurrentBusinessUnit(item.value);

    loading.value = false;
};

const updateStatus = async () => {
    try {
        loading.value = true;
        const payload = {
            ...item.value,
            status: item.value.status == 'active' ? 'inactive' : 'active'
        };
        console.log(payload);
        await clientStore.updateBusinessUnit(item.value.id, payload);
        await getItem();
    } finally {
        loading.value = false;
    }
};

const deleteItem = async () => {
    try {
        loading.value = true;
        await clientStore.deleteBusinessUnit(item.value.id);
        goBack();
    } finally {
        loading.value = false;
    }
};

const editItem = () => {
    router.push({
        name: 'Business Unit Edit',
        params: { clientId: props.clientId, id: props.id }
    });
};

const showMenu = (event) => {
    menu.value.toggle(event);
};

const goBack = () => {
    router.push({ name: 'Client Details', params: { id: props.clientId } });
};

const showDeleteDialog = () => {
    deleteDialog.value = true;
};
</script>

<template>
    <Loader v-if="loading" />
    <div v-else class="grid grid-cols-12 gap-6">
        <div class="col-span-9">
            <Header @goBack="goBack">
                <template #title>
                    <div
                        class="p-break-word"
                        v-tooltip.top="helpers.getLocaleValue(item.name)"
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
                    <div class="custom-button-header-action">
                        <Button
                            label="0"
                            icon="pi pi-check-square"
                            class="mr-2 p-button-outlined"
                            iconPos="left"
                        />
                        <Button
                            label="2"
                            icon="pi pi-comment"
                            class="mr-2 p-button-outlined"
                            iconPos="left"
                        />
                        <Button
                            label="Actions"
                            icon="pi pi-chevron-down"
                            iconPos="right"
                            :loading="busy"
                            @click="showMenu"
                        />
                        <Menu
                            ref="menu"
                            id="overlay_menu"
                            :model="menuItems"
                            :popup="true"
                        />
                    </div>
                </template>
            </Header>

            <Tabs :lazy="true" value="0">
                <TabList class="custom-tab">
                    <Tab value="0">Plans</Tab>
                    <Tab value="1">Contacts</Tab>
                    <Tab value="2">Users</Tab>
                    <Tab value="3">Audit Log</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel value="0">
                        <div class="mt-4">
                            <BusinessUnitPlans
                                :id="props.id"
                                :clientId="props.clientId"
                            />
                        </div>
                    </TabPanel>
                    <TabPanel value="1">
                        <div class="mt-4">
                            <Card>
                                <template #content>
                                    <ContactsTable
                                        :id="props.id"
                                        entity="business_unit"
                                    />
                                </template>
                            </Card>
                        </div>
                    </TabPanel>
                    <TabPanel value="2">
                        <div class="mt-4">
                            <Card>
                                <template #content>
                                    <UserTable
                                        :id="props.id"
                                        entity="business_unit"
                                    />
                                </template>
                            </Card>
                        </div>
                    </TabPanel>
                    <TabPanel value="3">
                        <div class="mt-4">
                            <Card>
                                <template #content>
                                    <AuditTable
                                        entity="business-unit"
                                        :entity_id="props.id"
                                    />
                                </template>
                            </Card>
                        </div>
                    </TabPanel>
                </TabPanels>
            </Tabs>
            <router-view> </router-view>
        </div>
        <div class="col-span-3">
            <DetailsPanel :data="item" variant="businessUnit" />
        </div>
        <Confirmation
            v-model="statusUpdateDialog"
            :header="statusDialogHeader"
            :content="statusDialogContent"
            :confirm-button-class="statusDialogButtonClass"
            :confirm-button-text="statusDialogButtonText"
            @confirm="updateStatus"
            v-if="$ability.can('update business units')"
        />
        <Confirmation
            v-model="deleteDialog"
            show-alert-icon
            header="Delete Business Unit"
            :content="`Are you sure you want to delete ${helpers.getLocaleValue(
                item.name
            )}?`"
            confirm-button-class="p-button-danger"
            @confirm="deleteItem"
            v-if="$ability.can('delete business units')"
        />
        <Confirmation
            v-model="duplicateDialog"
            :header="`Duplicate Client`"
            :content="`Are you sure you want to duplicate ${helpers.getLocaleValue(
                item.name
            )}?`"
            v-if="$ability.can('create business units')"
        />
        <Confirmation
            v-model="editDialog"
            :header="`Edit Business Unit`"
            :content="`Are you sure you want to edit ${helpers.getLocaleValue(
                item.name
            )}?`"
            @confirm="editItem"
            v-if="$ability.can('update business units')"
        />
    </div>
</template>
