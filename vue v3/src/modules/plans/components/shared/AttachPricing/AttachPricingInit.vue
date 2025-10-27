<script setup>
import lodash from 'lodash';
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue';

import PriceForm from '@/modules/plans/components/shared/AttachPricing/forms/PriceForm.vue';
import PriceTable from '@/modules/plans/components/shared/AttachPricing/tables/PriceTable.vue';
import CopyFromParentDialog from '@/modules/plans/components/shared/AttachPricing/dialogs/CopyFromParentDialog.vue';
import SyncPricesDialog from '../AttachBenefit/dialogs/SyncPricesDialog.vue';
import useEventsBus from '@/composables/event-bus';
import { useBenefitStore } from '@/modules/plans/stores/Benefit';
import { useNonInsuranceProductStore } from '@/modules/plans/stores/NonInsuranceProduct';
import { useEditState } from '@/modules/plans/composables/useEditState';
import PlanPriceGapChecker from '@/modules/plans/components/plans/PlanPriceGapChecker.vue';
import { usePlanStore } from '@/modules/plans/stores/Plan.js';
import { useAssociatedPlanStore } from '@/modules/plans/stores/AssociatedPlan.js';

const props = defineProps({
    id: {
        type: String,
        required: true
    },
    parent: {
        type: String,
        default: ''
    },
    isNew: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        required: true
    },
    store: {
        type: Object,
        required: true
    },
    isDisabledNetPrice: {
        type: Boolean,
        default: false
    },
    isCopy: {
        type: Boolean,
        default: false
    },
    hasPriceBreakdown: {
        type: Boolean,
        default: false
    },
    canRecalculatePricings: {
        type: Boolean,
        default: false
    },
    isBenefit: {
        type: Boolean,
        default: false
    },
    isBenefitGroup: {
        type: Boolean,
        default: false
    },
    isNonInsuranceProduct: {
        type: Boolean,
        default: false
    },
    isPlan: {
        type: Boolean,
        default: false
    },
    isAssociatedPlan: {
        type: Boolean,
        default: false
    },
    isHide: {
        type: Boolean,
        default: false
    },
    componentId: {
        type: String,
        required: true
    },
    isReview: {
        type: Boolean,
        default: false
    },
    isInDialog: {
        type: Boolean,
        default: false
    }
});

const { bus } = useEventsBus();

const {
    activeEditComponent,
    setActiveComponent,
    clearActiveComponent,
    registerCancelCallback,
    unregisterCancelCallback
} = useEditState();

const discardDialog = ref(false);
const openCopyDialog = ref(false);
const isEditing = ref(false);
const openDialog = ref(false);
const itemToUpdate = ref({});
const item = ref({});
const openSyncPricesDialog = ref(false);
const benefitStore = useBenefitStore();
const nonInsuranceProductStore = props.isNonInsuranceProduct
    ? useNonInsuranceProductStore()
    : null;
const planStore = usePlanStore();
const associatedPlanStore = useAssociatedPlanStore();
const currentPlan = ref(null);
const planPrices = ref([]);

const isAssociatedPlanStore = computed(() => {
    return (
        props.store &&
        props.store.getAssociatedPlans &&
        !props.isBenefitGroup &&
        !props.isNonInsuranceProduct &&
        !props.isBenefit
    );
});

const planStartDate = computed(() => {
    if (!currentPlan.value) return null;
    return currentPlan.value.effective_date;
});

const planEndDate = computed(() => {
    if (!currentPlan.value) return null;
    return currentPlan.value.end_date;
});

const showPriceBreakdown = computed(() => {
    return (
        props.hasPriceBreakdown &&
        !props.isBenefit &&
        !props.isNonInsuranceProduct
    );
});

const showRecalculatePricing = computed(() => {
    return (
        props.canRecalculatePricings &&
        (props.isBenefitGroup || !props.isSpecialEntityType)
    );
});

watch(
    () => bus.value.get('openSyncPricesDialogFromPrices'),
    () => {
        openSyncPricesDialog.value = true;
    }
);

watch(openDialog, (newVal, oldVal) => {
    if (oldVal && !newVal) {
        getPlanData();
    }
});

watch(
    () => bus.value.get('priceDeleted'),
    () => {
        getPlanData();
    }
);

const getAssociatedPlanData = async () => {
    if (props.store.currentPlan?.value) {
        return { data: props.store.currentPlan.value };
    }
    try {
        return props.parent
            ? await props.store.getPlan(props.parent, props.id, {
                  include: 'plan,plan.businessUnit.province.taxes'
              })
            : await props.store.getAssociatedPlans(props.id);
    } catch (err) {
        console.warn('Failed to get associated plan data');
        if (props.store.currentPlan?.value?.plan) {
            return {
                data: {
                    ...props.store.currentPlan.value,
                    effective_date:
                        props.store.currentPlan.value.plan.effective_date,
                    end_date: props.store.currentPlan.value.plan.end_date
                }
            };
        }
        return { data: null };
    }
};

const getPlanData = async () => {
    try {
        let entityRes = null;

        if (props.isBenefitGroup) {
            entityRes = await benefitStore.getBenefitGroup(props.id, {});
        } else if (props.isNonInsuranceProduct && nonInsuranceProductStore) {
            entityRes = await nonInsuranceProductStore.getNonInsuranceProduct(
                props.id,
                {}
            );
        } else if (props.isBenefit) {
            entityRes = await props.store.getBenefit(props.id, {});
        } else if (isAssociatedPlanStore.value) {
            entityRes = await getAssociatedPlanData();
            if (entityRes?.data) {
                associatedPlanStore.setCurrentPlan(entityRes.data);
                if (entityRes.data.plan) {
                    const planData = entityRes.data.plan;
                    entityRes.data = {
                        ...entityRes.data,
                        effective_date: planData.effective_date,
                        end_date: planData.end_date
                    };
                }
            }
        } else {
            entityRes = await props.store.getPlan(props.id, {
                include: 'businessUnit,businessUnit.province.taxes'
            });
        }
        if (entityRes?.data) {
            planStore.setCurrentPlan(entityRes.data);
            currentPlan.value = entityRes.data;
        }
        const pricesRes = await adapterStore.searchPlanPrices(props.id, {}, {});
        if (pricesRes?.data) {
            planPrices.value = pricesRes.data;
        }
    } catch (error) {
        console.error('Error fetching entity data:', error);
    }
};

onMounted(async () => {
    registerCancelCallback(props.componentId, handleCancel);
    await getPlanData();
});

onUnmounted(() => {
    unregisterCancelCallback(props.componentId);
});

// Helper
const createSafeResponse = (response) => {
    if (!response || !response.data) {
        return { data: [], meta: { total: 0 } };
    }

    const safeData = response.data.map((item) => ({
        ...item,
        priceRules: item.priceRules || []
    }));

    return {
        ...response,
        data: safeData
    };
};

// store adapter
const adapterStore = {
    searchPlanPrices: async (id, payload, params) => {
        try {
            let result;
            const safePayload = { ...payload };

            if (props.isBenefit || props.isNonInsuranceProduct) {
                safePayload.includes = [{ relation: 'priceRules' }];
            } else if (props.isBenefitGroup) {
                safePayload.includes = [
                    { relation: 'priceRules' },
                    { relation: 'contributors.priceable' },
                    { relation: 'priceable.benefits' }
                ];
            } else {
                safePayload.includes = [
                    { relation: 'priceRules' },
                    { relation: 'priceTaxes' },
                    { relation: 'contributors.priceable' },
                    { relation: 'priceable.benefits' },
                    { relation: 'priceable.benefitGroups' },
                    { relation: 'priceable.nonInsuranceProducts' }
                ];
            }

            if (props.isBenefit) {
                result = await props.store.searchBenefitPrices(
                    id,
                    safePayload,
                    params
                );
            } else if (props.isBenefitGroup) {
                result = await benefitStore.searchBenefitGroupPrices(
                    id,
                    safePayload,
                    params
                );
            } else if (props.isNonInsuranceProduct) {
                result =
                    await nonInsuranceProductStore.searchNonInsuranceProductPrices(
                        id,
                        safePayload,
                        params
                    );
            } else {
                result = await props.store.searchPlanPrices(
                    id,
                    safePayload,
                    params
                );
            }

            return createSafeResponse(result);
        } catch (error) {
            console.error('Error in searchPlanPrices:', error);
            return { data: [], meta: { total: 0 } };
        }
    },

    planPricesStore: async (id, payload) => {
        try {
            const sanitizedPayload = { ...payload };

            if (
                sanitizedPayload.net_price === null ||
                sanitizedPayload.net_price === undefined
            ) {
                sanitizedPayload.net_price = 0;
            }

            if (props.isBenefit) {
                return props.store.benefitPricesStore(id, sanitizedPayload);
            } else if (props.isBenefitGroup) {
                return benefitStore.benefitGroupPricesStore(
                    id,
                    sanitizedPayload
                );
            } else if (props.isNonInsuranceProduct) {
                return nonInsuranceProductStore.nonInsuranceProductPricesStore(
                    id,
                    sanitizedPayload
                );
            } else {
                return props.store.planPricesStore(id, sanitizedPayload);
            }
        } catch (error) {
            console.error('Error in planPricesStore:', error);
            throw error;
        }
    },

    planPricesUpdate: async (id, priceId, payload) => {
        try {
            if (props.isBenefit) {
                return props.store.benefitPricesUpdate(id, priceId, payload);
            } else if (props.isBenefitGroup) {
                return benefitStore.benefitGroupPricesUpdate(
                    id,
                    priceId,
                    payload
                );
            } else if (props.isNonInsuranceProduct) {
                return nonInsuranceProductStore.nonInsuranceProductPricesUpdate(
                    id,
                    priceId,
                    payload
                );
            } else {
                return props.store.planPricesUpdate(id, priceId, payload);
            }
        } catch (error) {
            console.error('Error in planPricesUpdate:', error);
            throw error;
        }
    },

    planPricesDelete: async (id, priceId) => {
        try {
            if (props.isBenefit) {
                return props.store.benefitPricesDelete(id, priceId);
            } else if (props.isBenefitGroup) {
                return benefitStore.benefitGroupPricesDelete(id, priceId);
            } else if (props.isNonInsuranceProduct) {
                return nonInsuranceProductStore.nonInsuranceProductPricesDelete(
                    id,
                    priceId
                );
            } else {
                return props.store.planPricesDelete(id, priceId);
            }
        } catch (error) {
            console.error('Error in planPricesDelete:', error);
            throw error;
        }
    },

    detachPlanWithPrices: async (id, resources) => {
        try {
            if (props.isBenefit) {
                return props.store.detachBenefitWithPrices(id, resources);
            } else if (props.isBenefitGroup) {
                return benefitStore.detachBenefitGroupWithPrices(id, resources);
            } else if (props.isNonInsuranceProduct) {
                return nonInsuranceProductStore.detachNonInsuranceProductWithPrices(
                    id,
                    resources
                );
            } else {
                return props.store.detachPlanWithPrices(id, resources);
            }
        } catch (error) {
            console.error('Error in detachPlanWithPrices:', error);
            throw error;
        }
    },

    syncPrices: async (id) => {
        try {
            if (props.isBenefit || props.isBenefitGroup) {
                if (benefitStore.syncPrices) {
                    return benefitStore.syncPrices(id);
                }
            } else if (props.isNonInsuranceProduct) {
                if (nonInsuranceProductStore.syncPrices) {
                    return nonInsuranceProductStore.syncPrices(id);
                }
            } else if (props.store.syncPrices) {
                return props.store.syncPrices(id);
            }
            return Promise.resolve({ data: null });
        } catch (error) {
            //console.error('Error in syncPrices:', error);
            globalStore.error = error;
            return { data: null };
        }
    },

    revertToDefaultNonInsuranceProductablePrices: async (id, payload) => {
        try {
            if (props.isNonInsuranceProduct) {
                return nonInsuranceProductStore.revertToDefaultNonInsuranceProductablePrices(
                    id,
                    payload
                );
            } else if (
                props.store.revertToDefaultNonInsuranceProductablePrices
            ) {
                return props.store.revertToDefaultNonInsuranceProductablePrices(
                    id,
                    payload
                );
            }
            return Promise.resolve({ data: null });
        } catch (error) {
            globalStore.error = error;
            throw error;
        }
    }
};

const isNotChanged = computed(() => {
    return lodash.isEqual(item.value, itemToUpdate.value);
});

const isEditDisabled = computed(() => {
    return (
        activeEditComponent.value &&
        activeEditComponent.value !== props.componentId
    );
});

const handleEdit = () => {
    isEditing.value = true;
    setActiveComponent(props.componentId);
};

const handleCancel = () => {
    if (props.isReview) {
        isEditing.value = false;
        clearActiveComponent();
    } else {
        isEditing.value = false;
        clearActiveComponent();
    }
};

const discardChanges = () => {
    isNotChanged.value
        ? (openDialog.value = false)
        : (discardDialog.value = true);
};

const createNewPrice = (gapInfo) => {
    resetItem();
    if (gapInfo) {
        item.value.effective_date = gapInfo.start_date;
        item.value.end_date = gapInfo.end_date;
        itemToUpdate.value.effective_date = gapInfo.start_date;
        itemToUpdate.value.end_date = gapInfo.end_date;
    }
    openDialog.value = true;
};

const handleGapPrice = (gapInfo) => {
    createNewPrice(gapInfo);
};

const resetItem = () => {
    item.value = {
        unit_term: null,
        rules: [
            {
                origin_country_id: null,
                residency_country_id: null,
                destination_country_id: null
            }
        ],
        net_price: null,
        sale_price: null,
        min_days: null,
        max_days: null,
        effective_date: null,
        end_date: null
    };
    itemToUpdate.value = {
        unit_term: null,
        rules: [
            {
                origin_country_id: null,
                residency_country_id: null,
                destination_country_id: null
            }
        ],
        net_price: null,
        sale_price: null,
        min_days: null,
        max_days: null,
        effective_date: null,
        end_date: null
    };
};

const editPrice = (data) => {
    item.value = lodash.cloneDeep(data);
    itemToUpdate.value = lodash.cloneDeep(data);
    openDialog.value = true;
};

const saved = (addOther) => {
    openDialog.value = false;

    if (addOther) {
        nextTick(() => {
            createNewPrice();
        });
    }
};

// pricing permissions check
const shouldShowEditButton = computed(() => {
    if (props.isBenefit) {
        return (
            !props.isNew &&
            !isEditing.value &&
            (typeof $ability === 'undefined' || $ability.can('update benefits'))
        );
    }
    if (props.isBenefitGroup) {
        return (
            !props.isNew &&
            !isEditing.value &&
            (typeof $ability === 'undefined' ||
                $ability.can('update benefit groups'))
        );
    }
    if (props.isNonInsuranceProduct) {
        return !props.isNew && !isEditing.value;
    }
    return !props.isNew && !isEditing.value;
});

const pricesAreEditable = computed(() => {
    if (props.isBenefit) {
        return (
            (isEditing.value || props.isNew) &&
            (typeof $ability === 'undefined' || $ability.can('update benefits'))
        );
    }
    if (props.isBenefitGroup) {
        return (
            (isEditing.value || props.isNew) &&
            (typeof $ability === 'undefined' ||
                $ability.can('update benefit groups'))
        );
    }
    if (props.isNonInsuranceProduct) {
        return isEditing.value || props.isNew;
    }
    return isEditing.value || props.isNew;
});

const canShowPriceForm = computed(() => {
    if (props.isBenefit) {
        return (
            openDialog.value &&
            (typeof $ability === 'undefined' || $ability.can('update benefits'))
        );
    }
    if (props.isBenefitGroup) {
        return (
            openDialog.value &&
            (typeof $ability === 'undefined' ||
                $ability.can('update benefit groups'))
        );
    }
    if (props.isNonInsuranceProduct) {
        return openDialog.value;
    }
    return openDialog.value;
});

const isSpecialEntityType = computed(() => {
    return (
        props.isBenefit || props.isBenefitGroup || props.isNonInsuranceProduct
    );
});

const recalculatePricings = () => {
    if (items.value && items.value.length > 0) {
        emit('openSyncPricesDialogFromPrices');
    } else {
        if (props.isBenefitGroup) {
            benefitStore.syncPrices(props.id).then(() => {
                getItems();
            });
        } else {
            props.store.syncPrices(props.id).then(() => {
                getItems();
            });
        }
    }
};

const shouldShowDefinedTaxRateWarning = computed(() => {
    if (isSpecialEntityType.value || props.isInDialog) {
        return false;
    }
    return !currentPlan.value?.business_unit?.taxes;
});
</script>
<template>
    <div class="flex justify-content-between align-items-center mb-3">
        <h5>{{ title }}</h5>
        <div>
            <Button
                v-if="isCopy && (isEditing || isNew) && !isSpecialEntityType"
                :label="$t('common.select_from_default_plan')"
                class="p-button-outlined mr-2 w-fit"
                icon="pi pi-folder"
                @click="openCopyDialog = true"
                data-testid="copy-from-parent-button"
            />
            <Button
                v-if="!isNew && isEditing"
                label="Done"
                icon="pi pi-check"
                class="p-button mr-2"
                @click="handleCancel"
                data-testid="cancel-edit"
            />
            <Button
                v-else-if="!isHide && shouldShowEditButton"
                size="small"
                text
                class="px-2 py-1"
                label="Edit"
                icon="pi pi-pencil"
                :disabled="isEditDisabled"
                @click="handleEdit"
                data-testid="edit-button"
            />
        </div>
    </div>

    <PlanPriceGapChecker
        v-if="planPrices && planPrices.length > 0 && planStartDate"
        :planPrices="planPrices"
        :planStartDate="planStartDate"
        :planEndDate="planEndDate"
        @create-price="handleGapPrice"
    />

    <div
        v-if="shouldShowDefinedTaxRateWarning"
        class="flex align-items-center my-2 bg-orange-100 p-2 text-orange-800 border-round"
    >
        <div class="flex align-items-center mr-2 gap-2">
            <i class="pi pi-exclamation-triangle"></i>
        </div>
        {{ $t('plans.no_defined_tax_rate') }}
    </div>

    <PriceTable
        :id="props.id"
        :is-editable="pricesAreEditable"
        :store="adapterStore"
        @addNewPrice="createNewPrice"
        @edit-price="editPrice"
        :hasPriceBreakdown="showPriceBreakdown"
        :canRecalculatePricings="showRecalculatePricing"
        :isBenefit="isBenefit"
        :isBenefitGroup="isBenefitGroup"
        :isNonInsuranceProduct="isNonInsuranceProduct"
        :isPlan="isPlan"
        :isAssociatedPlan="isAssociatedPlan"
        :entityStore="store"
        :isInDialog="props.isInDialog"
    />

    <PriceForm
        v-if="canShowPriceForm"
        v-model="itemToUpdate"
        :id="props.id"
        :is-open="openDialog"
        :is-disabled-net-price="isDisabledNetPrice"
        :store="adapterStore"
        :isBenefit="isBenefit"
        :isBenefitGroup="isBenefitGroup"
        :isNonInsuranceProduct="isNonInsuranceProduct"
        :isPlan="isPlan"
        :isAssociatedPlan="isAssociatedPlan"
        @close="discardChanges"
        @saved="saved"
    />

    <Confirmation
        v-model="discardDialog"
        show-alert-icon
        :header="$t('common.discard_header')"
        :content="$t('common.discard_content')"
        confirm-button-class="p-button-danger"
        :confirmButtonText="$t('common.discard_cancel')"
        :cancelButtonText="$t('common.discard_continue')"
        @confirm="openDialog = false"
    />

    <template v-if="!isSpecialEntityType || isBenefitGroup">
        <CopyFromParentDialog
            v-if="openCopyDialog && !isBenefitGroup"
            :copyDialog="openCopyDialog"
            :id="props.id"
            :parent="props.parent"
            :store="store"
            @closeDialog="openCopyDialog = false"
        />

        <SyncPricesDialog
            v-if="openSyncPricesDialog"
            :openDialog="openSyncPricesDialog"
            :id="props.id"
            :store="isBenefitGroup ? benefitStore : store"
            @closeDialog="openSyncPricesDialog = false"
        />
    </template>
</template>
