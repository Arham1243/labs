<script setup>
import { ref, computed, onBeforeMount, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import DetailsPanel from '@/modules/clients/components/DetailsPanel.vue';
import AuditTable from '@/components/common/AuditTable.vue';

import { useClientStore } from '@/modules/clients/stores';
import { useHelpers } from '@/composables';
import lodash from 'lodash';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});

const { t } = useI18n();
const router = useRouter();
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

onMounted(async () => {
    await getItem();
});

const menuItems = computed(() => {
    const allMenuItems = [
        // {
        //     label: 'Duplicate',
        //     icon: 'pi pi-copy',
        //     command: () => showDuplicateDialog()
        // },
        {
            label: 'Edit',
            icon: 'pi pi-pencil',
            command: () => editItem(),
            permission: 'update holdings'
        },
        {
            label: isItemActive.value
                ? t('common.make_inactive')
                : t('common.make_active'),
            icon: isItemActive.value ? 'pi pi-times' : 'pi pi-check',
            command: () => showStatusUpdateDialog(),
            permission: 'update holdings'
        },
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            command: () => showDeleteDialog(),
            permission: 'delete holdings'
        }
    ];

    return helpers.filterByPermission(allMenuItems);
});

const isItemActive = computed(() => {
    return item.value && item.value.status == 'active';
});

const statusDialogHeader = computed(() => {
    return isItemActive.value
        ? t('clients.make_holding_inactive')
        : t('clients.make_holding_active');
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

const goToClient = (id) => {
    router.push({
        name: 'Client Details',
        params: { id: id }
    });
};

const getItem = async () => {
    loading.value = true;
    const params = {
        include: 'clients,country,contacts'
    };
    const res = await clientStore.getHolding(props.id, params);
    item.value = res.data;
    loading.value = false;
};

const updateStatus = async () => {
    try {
        loading.value = true;
        const payload = {
            ...item.value,
            status: item.value.status == 'active' ? 'inactive' : 'active'
        };
        await clientStore.updateHolding(item.value.id, payload);
        await getItem();
    } finally {
        loading.value = false;
    }
};

const deleteItem = async () => {
    try {
        loading.value = true;
        await clientStore.deleteHolding(item.value.id);
        goBack();
    } finally {
        loading.value = false;
    }
};

const editItem = () => {
    router.push({ name: 'Holding Edit', params: { id: props.id } });
};

const showMenu = (event) => {
    menu.value.toggle(event);
};

const goBack = () => {
    router.push({ name: 'Holdings' });
};

const showStatusUpdateDialog = () => {
    statusUpdateDialog.value = true;
};

const showDeleteDialog = () => {
    deleteDialog.value = true;
};

// const showDuplicateDialog = () => {
//     duplicateDialog.value = true;
// };

const showEditDialog = () => {
    editDialog.value = true;
};

const getAddress = (client) => {
    const arr = [];
    if (client.address) {
        arr.push(client.address);
    }

    if (client.city) {
        arr.push(client.city);
    }

    if (client.postal_code) {
        arr.push(client.postal_code);
    }

    return arr.toString();
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
                                length: 50
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
                            $ability.can('update holdings') ||
                            $ability.can('delete holdings')
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

            <TabView :lazy="true">
                <TabPanel header="Clients" v-if="$ability.can('view clients')">
                    <Card
                        class="mt-2 cursor-pointer"
                        v-for="client in item.clients"
                        :key="client.id"
                        @click="goToClient(client.id)"
                        >>
                        <template #content>
                            <h5
                                class="mb-3"
                                v-tooltip.bottom="
                                    helpers.getLocaleValue(client.name)
                                "
                            >
                                {{
                                    lodash.truncate(
                                        helpers.getLocaleValue(client.name),
                                        { length: 65 }
                                    )
                                }}
                            </h5>
                            <div class="text-gray-600">
                                <template
                                    v-if="
                                        client.address ||
                                        client.city ||
                                        client.postal_code
                                    "
                                >
                                    <div v-tooltip.bottom="getAddress(client)">
                                        {{
                                            lodash.truncate(
                                                getAddress(client),
                                                { length: 65 }
                                            )
                                        }}
                                    </div>
                                </template>
                                <template v-else>
                                    No address provided
                                </template>
                            </div>
                        </template>
                    </Card>
                </TabPanel>
                <TabPanel header="Documents">
                    <div>Documents</div>
                </TabPanel>
                <TabPanel header="Users">
                    <div>Users</div>
                </TabPanel>
                <TabPanel header="Audit Log">
                    <Card class="mt-5">
                        <template #content>
                            <AuditTable
                                entity="holding"
                                :entity_id="props.id"
                            />
                        </template>
                    </Card>
                </TabPanel>
            </TabView>
            <router-view> </router-view>
        </div>
        <div class="col-3">
            <DetailsPanel :data="item" />
        </div>
        <Confirmation
            v-model="statusUpdateDialog"
            :header="statusDialogHeader"
            :content="statusDialogContent"
            :confirm-button-class="statusDialogButtonClass"
            :confirm-button-text="statusDialogButtonText"
            @confirm="updateStatus"
            v-if="$ability.can('update holdings')"
        />
        <Confirmation
            v-model="deleteDialog"
            show-alert-icon
            header="Delete Holding"
            :content="`Are you sure you want to delete ${helpers.getLocaleValue(
                item.name
            )}?`"
            confirm-button-class="p-button-danger"
            @confirm="deleteItem"
            v-if="$ability.can('delete holdings')"
        />
        <Confirmation
            v-model="duplicateDialog"
            :header="`Duplicate Holding`"
            :content="`Are you sure you want to duplicate ${helpers.getLocaleValue(
                item.name
            )}?`"
            v-if="$ability.can('create holdings')"
        />
        <Confirmation
            v-model="editDialog"
            :header="`Edit Client`"
            :content="`Are you sure you want to edit ${helpers.getLocaleValue(
                item.name
            )}?`"
            @confirm="editItem"
            v-if="$ability.can('update holdings')"
        />
    </div>
</template>

<style lang="scss" scoped></style>
