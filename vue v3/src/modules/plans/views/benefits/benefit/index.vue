<script setup>
import lodash from 'lodash';
import {
    ref,
    computed,
    onBeforeMount,
    watch,
    onMounted,
    onUnmounted
} from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import useEventsBus from '@/composables/event-bus';
import { useBenefitStore } from '@/modules/plans/stores/Benefit';
import { useHelpers } from '@/composables';

import BenefitDetails from '@/modules/plans/components/benefits/BenefitDetails.vue';
import BenefitRestrictions from '@/modules/plans/components/benefits/BenefitRestrictions.vue';
import AuditTable from '@/components/common/AuditTable.vue';
import DocumentsTable from '@/components/documents/DocumentsTable.vue';
import BenefitServices from '@/modules/plans/components/benefits/BenefitServices.vue';
import AttachPricingInit from '@/modules/plans/components/shared/AttachPricing/AttachPricingInit.vue';
import { provideEditState } from '@/modules/plans/composables/useEditState';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});

const { t } = useI18n();
const router = useRouter();
const helpers = useHelpers();
const benefitStore = useBenefitStore();
const { bus } = useEventsBus();

const {
    showUnsavedDialog,
    shouldUseLazy,
    activeEditComponent,
    confirmDiscard,
    cancelDiscard,
    clearActiveComponent,
    triggerCancelEdit,
    setForceSkipConfirmation,
    setupTabPrevention,
    clearTabListeners
} = provideEditState();

const menu = ref();
const item = ref({});
const busy = ref(false);
const loading = ref(false);
const deleteDialog = ref(false);
const statusUpdateDialog = ref(false);
const duplicateDialog = ref(false);

const showExitEditDialog = ref(false);
const pendingAction = ref(null);
const menuTriggeredExitDialog = ref(false);
const pendingTabIndex = ref(null);
const activeTabIndex = ref(0);

onBeforeMount(() => {
    getItem();
});

watch(
    () => bus.value.get('reloadBenefit'),
    async () => {
        await getItem();
    }
);

const menuItems = computed(() => {
    const items = [
        {
            label: t('buttons.duplicate'),
            icon: 'pi pi-copy',
            command: () => showDuplicateDialog(),
            permission: 'create benefits'
        },
        {
            label: isItemActive.value
                ? t('common.make_inactive')
                : t('common.make_active'),
            icon: isItemActive.value ? 'pi pi-times' : 'pi pi-check',
            command: () => showStatusUpdateDialog(),
            permission: 'update benefits'
        },
        {
            label: t('buttons.delete'),
            icon: 'pi pi-trash',
            command: () => showDeleteDialog(),
            permission: 'delete benefits'
        }
    ];

    return helpers.filterByPermission(items);
});

const isItemActive = computed(() => {
    return item.value && item.value.status === 'active';
});

const statusDialogHeader = computed(() => {
    return isItemActive.value
        ? t('services.make_code_set_inactive')
        : t('services.make_code_set_active');
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
        include: 'category,underwriter,vendors,serviceCodes,serviceCodeGroups',
        with_count: 'serviceCodes,serviceCodeGroupsServiceCodes'
    };
    const res = await benefitStore.getBenefit(props.id, params);
    processResponse(res.data);
    loading.value = false;
};

const processResponse = (data) => {
    benefitStore.setCurrentBenefit(data);
    item.value = data;
    item.value.rules = data.rules ? data.rules : [];
    item.value.min_time_req = data.min_time_req ? data.min_time_req : {};
    item.value.is_individual = data.is_individual ? 1 : 0;
    item.value.isTimeRequirement =
        data.min_time_req && Object.keys(data.min_time_req).length > 0;
    item.value.isIncludeSupply = data.rules?.length > 0;
    item.value.is_reportable_to_vendors = data.is_reportable_to_vendors;
};

const showMenu = (event) => {
    if (activeEditComponent.value) {
        menuTriggeredExitDialog.value = true;
        showExitEditDialog.value = true;
    } else {
        menu.value.toggle(event);
    }
};

const goBack = () => {
    router.push({ name: 'Benefits' });
};

const setShowExitEditDialog = (value) => {
    showExitEditDialog.value = value;
};

const setPendingTabIndex = (value) => {
    pendingTabIndex.value = value;
};

const setMenuTriggeredExitDialog = (value) => {
    menuTriggeredExitDialog.value = value;
};

onMounted(() => {
    setTimeout(() => {
        setupTabPrevention(
            setShowExitEditDialog,
            setPendingTabIndex,
            setMenuTriggeredExitDialog
        );
    }, 100);
});

onUnmounted(() => {
    clearTabListeners();
});

const handleTabChange = (event) => {
    if (!activeEditComponent.value) {
        activeTabIndex.value = event.index;
    }
};

const showStatusUpdateDialog = () => {
    if (activeEditComponent.value) {
        pendingAction.value = 'status';
        showExitEditDialog.value = true;
    } else {
        statusUpdateDialog.value = true;
    }
};

const showDeleteDialog = () => {
    deleteDialog.value = true;
};

const showDuplicateDialog = () => {
    if (activeEditComponent.value) {
        pendingAction.value = 'duplicate';
        showExitEditDialog.value = true;
    } else {
        duplicateDialog.value = true;
    }
};

const updateStatus = async () => {
    try {
        busy.value = true;
        const payload = {
            status: item.value.status === 'active' ? 'inactive' : 'active'
        };
        const res = await benefitStore.changeBenefitStatus(
            item.value.id,
            payload
        );
        item.value = res.data;
        getItem();
        clearActiveComponent();
    } finally {
        busy.value = false;
    }
};

const deleteItem = async () => {
    try {
        busy.value = true;
        await benefitStore.deleteBenefit(props.id);
        goBack();
    } finally {
        busy.value = false;
    }
};

const duplicateItem = async () => {
    try {
        loading.value = true;
        const res = await benefitStore.duplicateBenefit(props.id);

        const routeData = router.resolve({
            name: 'Benefit Details',
            params: { id: res.data.id }
        });

        window.open(routeData.href, '_blank');
    } finally {
        loading.value = false;
    }
};

const confirmExitEdit = () => {
    showExitEditDialog.value = false;
    const wasMenuTriggered = menuTriggeredExitDialog.value;
    const pendingTab = pendingTabIndex.value;
    menuTriggeredExitDialog.value = false;
    pendingTabIndex.value = null;
    wasMenuTriggered && setForceSkipConfirmation(true);

    triggerCancelEdit();
    setTimeout(
        () => {
            wasMenuTriggered && pendingTab !== null
                ? (activeTabIndex.value = pendingTab)
                : !wasMenuTriggered && (statusUpdateDialog.value = true);
        },
        wasMenuTriggered ? 100 : 50
    );
};

const cancelExitEdit = () => {
    showExitEditDialog.value = false;
    pendingTabIndex.value = null;
};
</script>

<template>
    <Loader v-if="loading" />
    <Header @goBack="goBack">
        <template #title>
            <div data-testid="benefit-name-title" class="p-break-all">
                {{
                    lodash.truncate(
                        helpers.getLocaleValue(
                            benefitStore.currentBenefit?.name
                        ),
                        {
                            length: 80
                        }
                    )
                }}
            </div>
            <StatusTag
                v-if="item.status"
                class="ml-2 mr-2"
                :status="item.status"
            />
        </template>
        <template #actions>
            <Button
                label="Actions"
                icon="pi pi-chevron-down"
                iconPos="right"
                :loading="busy"
                v-if="menuItems.length > 0"
                @click="showMenu"
                data-testid="actions-button"
            />
            <Menu
                ref="menu"
                id="overlay_menu"
                :model="menuItems"
                :popup="true"
            />
        </template>
    </Header>
    <TabView v-model:activeIndex="activeTabIndex" @tab-change="handleTabChange">
        <TabPanel header="Overview">
            <div class="grid my-2" v-if="item.id">
                <div class="col-8">
                    <Card>
                        <template #content>
                            <BenefitDetails
                                :data="item"
                                v-if="!loading"
                                @reloadItem="getItem"
                                component-id="benefit-details"
                            />
                        </template>
                    </Card>
                </div>
                <div class="col-8">
                    <Card>
                        <template #content>
                            <BenefitRestrictions
                                :data="item"
                                v-if="!loading"
                                @reloadData="getItem"
                                component-id="benefit-restrictions"
                            />
                        </template>
                    </Card>
                </div>
            </div>
        </TabPanel>
        <TabPanel header="Services">
            <div class="mt-4">
                <Card>
                    <template #content>
                        <BenefitServices
                            :id="props.id"
                            :title="$t('benefit_groups.benefit_services')"
                            :is-new="false"
                            component-id="benefit-services"
                        />
                    </template>
                </Card>
            </div>
        </TabPanel>
        <TabPanel :header="$t('common.pricing')">
            <Card class="mt-5">
                <template #content>
                    <AttachPricingInit
                        :is-new="false"
                        :isCopy="false"
                        :id="props.id"
                        :store="benefitStore"
                        :title="$t('common.benefit_pricing')"
                        :isBenefit="true"
                        component-id="benefit-prices"
                    />
                </template>
            </Card>
        </TabPanel>
        <TabPanel header="Documents">
            <Card class="mt-5">
                <template #content>
                    <DocumentsTable
                        type="benefits"
                        :id="props.id"
                        :is-new="false"
                        component-id="documents-table"
                        permission="update benefits"
                    />
                </template>
            </Card>
        </TabPanel>
        <TabPanel header="Audit Log">
            <Card class="mt-5">
                <template #content>
                    <AuditTable entity="benefit" :entity_id="props.id" />
                </template>
            </Card>
        </TabPanel>
    </TabView>
    <Confirmation
        v-if="$ability.can('update benefits')"
        v-model="statusUpdateDialog"
        :header="statusDialogHeader"
        :content="statusDialogContent"
        :confirm-button-class="statusDialogButtonClass"
        :confirm-button-text="statusDialogButtonText"
        @confirm="updateStatus"
    />
    <Confirmation
        v-if="$ability.can('delete benefits')"
        v-model="deleteDialog"
        show-alert-icon
        header="Delete Benefit"
        :content="`Are you sure you want to delete ${helpers.getLocaleValue(
            item.name
        )}?`"
        confirm-button-class="p-button-danger"
        @confirm="deleteItem"
    />
    <Confirmation
        v-if="$ability.can('create benefits')"
        v-model="duplicateDialog"
        :header="`Duplicate Benefit`"
        :content="`Are you sure you want to duplicate ${helpers.getLocaleValue(
            item?.name
        )}?`"
        @confirm="duplicateItem"
    />
    <Confirmation
        v-model="showUnsavedDialog"
        header="Discard Changes"
        content="Are you sure you want to discard changes made on this page?"
        confirm-button-class="p-button-danger"
        confirm-button-text="Discard"
        cancel-button-text="Continue Editing"
        class="w-auto"
        @confirm="confirmDiscard"
        @cancel="cancelDiscard"
    />

    <Confirmation
        v-model="showExitEditDialog"
        header="Exit Edit Mode"
        content="Are you sure you want to exit edit mode? Any changes made will be lost."
        confirm-button-class="p-button-danger"
        confirm-button-text="Exit Edit Mode"
        cancel-button-text="Continue Editing"
        class="w-auto"
        @confirm="confirmExitEdit"
        @cancel="cancelExitEdit"
    />
</template>
