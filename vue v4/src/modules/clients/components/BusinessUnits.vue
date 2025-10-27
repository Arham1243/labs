<script setup>
import { onBeforeMount, ref, computed } from 'vue';
import { useHelpers } from '@/composables';
import { useRouter, useRoute } from 'vue-router';
import { useClientStore } from '@/modules/clients/stores';
import lodash from 'lodash';
import NewBusinessUnit from '@/modules/clients/components/dialogs/NewBusinessUnit.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const props = defineProps({
    data: {
        type: Array,
        required: true
    }
});
const clientStore = useClientStore();
const route = useRoute();
const router = useRouter();
const helpers = useHelpers();
const menu = ref();
const busy = ref(false);
const selectedItem = ref(null);
const loading = ref(false);

const units = ref([]);
const businessUnitDialog = ref(false);

const deleteDialog = ref(false);
const editDialog = ref(false);

const emit = defineEmits(['reloadBusinessUnitsList']);
const statusUpdateDialog = ref(false);

onBeforeMount(() => {
    setItem();
});

const setItem = () => {
    if (props.data) units.value = lodash.cloneDeep(props.data);
};

const addnew = () => {
    clientStore.setCurrentBusinessUnit(null);
    router.push({
        name: 'New Business Unit',
        params: { clientId: route.params.id, id: -1 }
    });
};

const goToEdit = (id) => {
    router.push({
        name: 'Business Unit Edit',
        params: { clientId: route.params.id, id: id }
    });
};

const goToBusinessUnitDetails = (id) => {
    router.push({
        name: 'Business Unit Details',
        params: { clientId: route.params.id, id: id }
    });
};

const menuItems = ref([]);
const showMenu = (event, item) => {
    selectedItem.value = item;
    const allMenuItems = [
        {
            label: 'View',
            icon: 'pi pi-eye',
            command: () => goToBusinessUnitDetails(selectedItem.value.id),
            permission: 'view business units'
        },
        {
            label: 'Edit',
            icon: 'pi pi-pencil',
            command: () => goToEdit(selectedItem?.value?.id),
            permission: 'edit business units'
        },
        {
            label: isItemActive.value
                ? t('common.make_inactive')
                : t('common.make_active'),
            icon: isItemActive.value ? 'pi pi-times' : 'pi pi-check',
            command: () => showStatusUpdateDialog(),
            permission: 'edit business units'
        },
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            command: () => showDeleteDialog(),
            permission: 'delete business units'
        }
    ];

    menuItems.value = helpers.filterByPermission(allMenuItems);

    menu.value.toggle(event);
};
const isItemActive = computed(() => {
    return selectedItem.value && selectedItem.value.status == 'active';
});

const statusDialogHeader = computed(() => {
    return isItemActive.value
        ? t('business_units.make_business_unit_inactive')
        : t('business_units.make_business_unit_active');
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

const showDeleteDialog = () => {
    deleteDialog.value = true;
};

const showEditDialog = () => {
    editDialog.value = true;
};

const deleteItem = async (id) => {
    try {
        loading.value = true;
        await clientStore.deleteBusinessUnit(id);
        emit('reloadBusinessUnitsList');
    } finally {
        loading.value = false;
    }
};

const showStatusUpdateDialog = () => {
    statusUpdateDialog.value = true;
};

const updateStatus = async () => {
    try {
        loading.value = true;
        let businessUnit = await clientStore.getBusinessUnit(
            selectedItem.value.id,
            {
                include: 'accountManager'
            }
        );
        businessUnit.data.account_manager_user_id =
            businessUnit.data.account_manager_user?.id;
        const payload = {
            ...businessUnit.data,
            status:
                selectedItem.value.status == 'active' ? 'inactive' : 'active'
        };
        await clientStore.updateBusinessUnit(selectedItem.value.id, payload);
        emit('reloadBusinessUnitsList');
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div>
        <Card
            class="mt-2 cursor-pointer border border-gray-400"
            v-for="unit in units"
            :key="unit.id"
            @click="goToBusinessUnitDetails(unit.id)"
        >
            <template #content>
                <div class="flex justify-between">
                    <div>
                        <div class="flex justify-between gap-12">
                            <h5
                                class="mb-1"
                                v-tooltip.top="
                                    helpers.getLocaleValue(unit.name)
                                "
                            >
                                {{
                                    lodash.truncate(
                                        helpers.getLocaleValue(unit.name),
                                        { length: 50 }
                                    )
                                }}
                            </h5>
                            <StatusTag :status="unit.status" />
                        </div>
                        <span>{{ unit.active_plans_count }} Active Plans</span>
                    </div>
                    <Button
                        label="Actions"
                        icon="pi pi-chevron-down"
                        :outlined="true"
                        iconPos="right"
                        :loading="busy"
                        @click.stop="showMenu($event, unit)"
                    />
                </div>
            </template>
        </Card>
        <Button
            class="mt-2"
            label="New Business Unit"
            v-if="$ability.can('create business units')"
            icon="pi pi-plus"
            iconPos="left"
            @click="addnew"
            data-testid="new-business-unit-button"
        />
        <NewBusinessUnit v-model="businessUnitDialog" />
        <Menu ref="menu" id="overlay_menu" :model="menuItems" :popup="true" />
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
            header="Delete Business Unit"
            :content="`Are you sure you want to delete ${helpers.getLocaleValue(
                selectedItem?.name
            )}?`"
            confirm-button-class="p-button-danger"
            @confirm="deleteItem(selectedItem?.id)"
        />
        <Confirmation
            v-model="editDialog"
            :header="`Edit Business Unit`"
            :content="`Are you sure you want to edit ${helpers.getLocaleValue(
                selectedItem?.name
            )}?`"
            @confirm="goToEdit(selectedItem?.id)"
        />
    </div>
</template>
