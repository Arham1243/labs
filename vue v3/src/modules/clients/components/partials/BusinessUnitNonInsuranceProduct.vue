<script setup>
import lodash from 'lodash';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHelpers } from '@/composables';
import { useNonInsuranceProductStore } from '@/modules/plans/stores/NonInsuranceProduct';
import useEventsBus from '@/composables/event-bus';
import EditPricingDialog from '@/modules/clients/components/dialogs/EditPricingDialog.vue';

const props = defineProps({
    nonInsuranceProduct: {
        type: Object,
        required: true
    }
});

const { t } = useI18n();
const helpers = useHelpers();
const nonInsuranceProductStore = useNonInsuranceProductStore();
const { emit } = useEventsBus();

const loading = ref(false);
const statusUpdateDialog = ref(false);
const deleteDialog = ref(false);
const menu = ref();
const editPricingDialog = ref(false);

const isItemActive = computed(() => {
    return props.nonInsuranceProduct.status === 'active';
});

const showMenuItems = (event, item) => {
    menu.value.toggle(event);
};

const showDeleteDialog = () => {
    deleteDialog.value = true;
};

const showStatusUpdateDialog = () => {
    statusUpdateDialog.value = true;
};

const showPricingDialog = () => {
    editPricingDialog.value = true;
};

const menuItems = computed(() => {
    return [
        { label: t('common.view'), icon: 'pi pi-eye', command: () => '' },
        {
            label: isItemActive.value
                ? t('common.make_inactive')
                : t('common.make_active'),
            icon: isItemActive.value ? 'pi pi-times' : 'pi pi-check',
            command: () => showStatusUpdateDialog()
        },
        {
            label: t('business_units.business_unit_edit_pricing'),
            icon: 'pi pi-pencil',
            command: () => showPricingDialog()
        },
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            command: () => showDeleteDialog()
        }
    ];
});

const statusDialogHeader = computed(() => {
    return isItemActive.value
        ? t('non_insurance_products.make_non_insurance_product_inactive')
        : t('non_insurance_products.make_non_insurance_product_active');
});

const statusDialogContent = computed(() => {
    return isItemActive.value
        ? t('common.are_you_sure_inactive', {
              item: helpers.getLocaleValue(props.nonInsuranceProduct?.name)
          })
        : t('common.are_you_sure_active', {
              item: helpers.getLocaleValue(props.nonInsuranceProduct?.name)
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

const deleteItem = async () => {
    try {
        loading.value = true;
        await nonInsuranceProductStore.deleteNonInsuranceProduct(
            props.nonInsuranceProduct.id
        );
        emit('reloadBusinessUnit');
    } finally {
        loading.value = false;
    }
};

const updateStatus = async () => {
    try {
        loading.value = true;
        const payload = {
            ...props.nonInsuranceProduct,
            status: isItemActive.value ? 'inactive' : 'active'
        };
        await nonInsuranceProductStore.updateNonInsuranceProductStatus(
            props.nonInsuranceProduct.id,
            payload
        );
        emit('reloadBusinessUnit');
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <Card class="mb-3 cursor-pointer px-0" @click="() => {}">
        <template #title>
            <div
                class="flex justify-content-between w-full align-items-center px-4"
            >
                <h5
                    data-testid="name-title"
                    class="flex align-items-center gap-2"
                >
                    {{
                        lodash.truncate(
                            helpers.getLocaleValue(nonInsuranceProduct.name),
                            {
                                length: 50
                            }
                        )
                    }}
                    <Tag
                        v-bind="$attrs"
                        value="NON-INSURANCE PRODUCT"
                        class="bg-gray-300 text-gray-900"
                    />
                    <StatusTag
                        data-testid="status-tag"
                        :status="nonInsuranceProduct.status"
                    />
                </h5>
                <div>
                    <Button
                        label="Actions"
                        icon="pi pi-chevron-down"
                        iconPos="right"
                        class="p-button-text"
                        :loading="loading"
                        @click.stop="showMenuItems"
                        data-testid="actions-button"
                    />
                    <Menu
                        ref="menu"
                        id="overlay_menu"
                        :model="menuItems"
                        :popup="true"
                    />
                </div>
            </div>
        </template>
    </Card>

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
        :header="`Delete Non-Insurance Product`"
        :content="`Are you sure you want to delete ${helpers.getLocaleValue(
            nonInsuranceProduct?.name
        )}?`"
        confirm-button-class="p-button-danger"
        @confirm="deleteItem"
    />

    <EditPricingDialog
        v-model="editPricingDialog"
        :nonInsuranceProduct="nonInsuranceProduct"
    />
</template>
