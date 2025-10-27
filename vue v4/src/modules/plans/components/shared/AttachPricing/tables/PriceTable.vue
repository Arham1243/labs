<script setup>
import { useHelpers } from '@/composables';
import { onMounted, ref, watch, computed } from 'vue';
import {
    PaginationOptions,
    SortFilterOptions,
    unitTermsMapper
} from '@/config';
import useEventsBus from '@/composables/event-bus';
import { useI18n } from 'vue-i18n';
import lodash from 'lodash';
import { useToast } from 'primevue/usetoast';
import BenefitDetailsDialog from '@/modules/plans/components/benefits/BenefitDetailsDialog.vue';
import { useBenefitStore } from '@/modules/plans/stores/Benefit';
import { usePlanStore } from '@/modules/plans/stores/Plan';
import { useNonInsuranceProductStore } from '@/modules/plans/stores/NonInsuranceProduct';
import { useDateFormatter } from '@/composables/useDateFormatter.js';
import { formatDate } from '@fullcalendar/core';
import { formatEndDateForDisplay } from '@/modules/plans/utils/end_date_utils.js';
import PriceTotalBreakdownOverlay from '@/modules/plans/components/plans/PriceTotalBreakdownOverlay.vue';
import { useGlobalStore } from '@/stores/index.js';

const props = defineProps({
    id: {
        type: String,
        required: true
    },
    isEditable: {
        type: Boolean,
        default: false
    },
    store: {
        type: Object,
        required: true
    },
    entityStore: {
        type: Object,
        required: true
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
    isInDialog: {
        type: Boolean,
        default: false
    }
});

const emits = defineEmits(['addNewPrice', 'editPrice']);
const { formatValue, formatEndDateDisplayTables, initialize } =
    useDateFormatter();

const helpers = useHelpers();
const { bus, emit } = useEventsBus();
const { t } = useI18n();
const toast = useToast();
const globalStore = useGlobalStore();

const menu = ref();
const selectedItem = ref(null);
const deleteDialog = ref(false);
const loading = ref(false);
const totalRecords = ref(0);
const searchText = ref('');
const selectedBenefit = ref(null);
const benefitDetailsDialog = ref(false);
const items = ref([]);
const selectedItems = ref([]);
const expandedRows = ref([]);
const overlayPanels = ref({});

const resetDialog = ref(false);
const isResetting = ref(false);

const editingContributorId = ref(null);
const isSaving = ref(false);

const showResetButton = computed(() => {
    return (
        props.isInDialog &&
        typeof props.store.revertToDefaultNonInsuranceProductablePrices ===
            'function'
    );
});

const showSalePriceTotalOverlayPanel = (event, id) => {
    if (overlayPanels.value[id]) {
        overlayPanels.value[id].toggle(event);
    }
};

const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();
const toggleExpanderShow = ref(props.hasPriceBreakdown);

const parentItem = ref(null);
const benefitStore = useBenefitStore();
const planStore = usePlanStore();
const nonInsuranceProductStore = useNonInsuranceProductStore();

const formatEndDate = (dateStr) => {
    return formatEndDateForDisplay(dateStr, helpers.formatDate);
};

const isPlanOrAssociatedPlan = computed(
    () => props.isPlan || props.isAssociatedPlan
);

onMounted(() => {
    getItems();
    initialize();
});

watch(
    () => bus.value.get('reloadPrices'),
    () => {
        getItems();
    }
);

if (props.isBenefit) {
    watch(
        () => props.entityStore.currentBenefit,
        (newValue) => {
            if (newValue) {
                parentItem.value = newValue;
            }
        },
        { immediate: true }
    );
}

if (props.isBenefitGroup) {
    watch(
        () => props.entityStore.currentBenefitGroup,
        (newValue) => {
            if (newValue) {
                parentItem.value = newValue;
            }
        },
        { immediate: true }
    );
}

if (props.isNonInsuranceProduct) {
    watch(
        () => props.entityStore?.currentNonInsuranceProduct,
        (newValue) => {
            if (newValue) {
                parentItem.value = newValue;
            }
        },
        { immediate: true }
    );
}

watch(
    () => bus.value.get('hasMissingPrices'),
    () => {
        toast.add({
            severity: 'info',
            summary: 'Info',
            detail: 'Some benefit or benefit group prices were missing in the created price',
            life: 5000
        });
    }
);

const menuItems = computed(() => {
    return [{ label: t('buttons.delete'), command: () => showDeleteDialog() }];
});

const isTaxable = computed(
    () => props.isBenefit || props.isNonInsuranceProduct || props.isBenefitGroup
);

const updateIsPricingSubjectToTax = () => {
    if (!props.isEditable || !isTaxable.value) return;

    switch (true) {
        case props.isBenefit:
            parentItem.value.benefit_category_id =
                parentItem.value.benefit_category?.id;
            parentItem.value.underwriter_id = parentItem.value.underwriter?.id;

            benefitStore.updateBenefit(parentItem.value.id, parentItem.value);

            parentItem.value = benefitStore.currentBenefit;
            break;

        case props.isBenefitGroup:
            benefitStore.updateBenefitGroup(
                parentItem.value.id,
                parentItem.value
            );

            parentItem.value = benefitStore.currentBenefitGroup;
            break;

        case props.isNonInsuranceProduct:
            parentItem.value.authorized_by_id = parentItem.value.authorized?.id;

            nonInsuranceProductStore.updateNonInsuranceProduct(
                parentItem.value.id,
                parentItem.value
            );
            break;
    }
};

const getItems = async () => {
    try {
        loading.value = true;
        const params = pagination.getPageParams();
        let includes = [
            { relation: 'priceRules' },
            { relation: 'contributors.priceable' },
            { relation: 'priceable.benefits' },
            { relation: 'priceable.benefitGroups' }
        ];
        if (!props.store.$id?.includes('Associated')) {
            includes.push({ relation: 'priceable.non-insurance-product' });
        }
        const payload = {
            ...sortFilters.getSortFilters(),
            includes: includes
        };
        const res = await props.store.searchPlanPrices(
            props.id,
            payload,
            params
        );

        items.value = res.data;
        toggleExpanderShow.value = items.value[0]?.contributors?.length > 0;
        totalRecords.value = res.meta.total;
    } finally {
        loading.value = false;
    }
};

const showMenu = (event) => {
    menu.value.toggle(event);
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

const search = () => {
    pagination.resetPageParams();
    sortFilters.updateSearch(searchText.value);
    getItems();
};

const showDeleteDialog = () => {
    deleteDialog.value = true;
};

const deleteItem = async () => {
    try {
        loading.value = true;
        selectedItems.value.length > 0
            ? await props.store.detachPlanWithPrices(props.id, {
                  resources: [...selectedItems.value.map((item) => item.id)]
              })
            : await props.store.planPricesDelete(
                  props.id,
                  selectedItem.value.id
              );
        selectedItems.value = [];
        emit('priceDeleted');
        getItems();
        emit('reloadPrices');
    } finally {
        loading.value = false;
    }
};

const addNewPrice = () => {
    emits('addNewPrice');
};

const recalculatePricings = () => {
    if (items.value.length > 0) {
        emit('openSyncPricesDialogFromPrices');
    } else {
        props.store.syncPrices(props.id).then(() => {
            getItems();
        });
    }
};

const expansionRowStyle = (data) => {
    let condition = data.net_price === null;
    return {
        'background-color': condition ? '#FFF2E2' : '',
        height: '3rem',
        'border-bottom': 'thin solid #E2E8F0',
    };
};

const countUndefinedNetPrice = (contributors) => {
    return contributors.filter((item) => item.net_price === null).length;
};

const showBenefitDetailsDialog = (item) => {
    selectedBenefit.value = item;
    selectedBenefit.value.id = item.priceable_id;
    benefitDetailsDialog.value = true;
};

const getCountryNamesFromRules = (item, ruleName) => {
    return item.rules
        ?.map((item) => item[ruleName]?.name || t('common.all_countries'))
        ?.join(', ');
};

const getFirstTwoCountryNamesFromRules = (item, ruleName) => {
    let names = item.rules
        ?.slice(0, 2)
        ?.map((item) => item[ruleName]?.name || t('common.all_countries'))
        ?.join(', ');
    item.rules?.length > 2 ? (names += '...') : '';
    return names;
};

const setContributorEditMode = (contributorId) => {
    editingContributorId.value = contributorId;
};

const cancelContributorEdit = () => {
    editingContributorId.value = null;
    getItems();
};

const saveContributorPrice = async (contributor) => {
    if (isSaving.value) {
        return;
    }
    if (contributor.sale_price === null || isNaN(contributor.sale_price)) {
        globalStore.showError(
            t('pricing.validation_error'),
            t('pricing.invalid_sale_price')
        );
        return;
    }
    isSaving.value = true;
    try {
        const payload = {
            sale_price: contributor.sale_price
        };
        const priceContributionId = contributor.id;

        if (contributor.type.includes('Benefit')) {
            await planStore.updateContributorPrice(
                priceContributionId,
                payload
            );
        } else {
            throw new Error(`Unknown contributor type: ${contributor.type}`);
        }
        editingContributorId.value = null;
        await getItems();
    } finally {
        isSaving.value = false;
    }
};

const resetPricingToDefault = () => {
    resetDialog.value = true;
};

const confirmResetPricing = async () => {
    try {
        isResetting.value = true;
        loading.value = true;
        await props.store.revertToDefaultNonInsuranceProductablePrices(
            props.id,
            {}
        );
        toast.add({
            severity: 'success',
            summary: t('common.success'),
            detail: t('non_insurance_products.pricing.reset_success'),
            life: 3000
        });

        await getItems();
        emit('reloadPrices');
        resetDialog.value = false;
    } catch (error) {
        console.error('Error resetting prices:', error);
        toast.add({
            severity: 'error',
            summary: t('common.error'),
            detail: t('non_insurance_products.pricing.reset_error'),
            life: 5000
        });
    } finally {
        isResetting.value = false;
        loading.value = false;
    }
};

const cancelResetPricing = () => {
    resetDialog.value = false;
};
</script>

<template>
    <BaseTable
        :value="items"
        :loading="loading"
        :page="pagination.page"
        :rows="pagination.limit"
        :total-records="totalRecords"
        @page="onPageChange"
        @sort="onSortChange"
        v-model:selection="selectedItems"
        v-model:expandedRows="expandedRows"
    >
        <template #header>
            <div class="flex justify-between col-span-12">
                <div class="flex items-center gap-2">
                    <div v-if="isEditable">
                        <Button
                            label="Bulk Actions"
                            icon="pi pi-chevron-down"
                            iconPos="right"
                            class="p-button-outlined mr-2"
                            :disabled="!selectedItems.length"
                            @click="showMenu"
                            data-testid="bulk-actions-button"
                        />
                        <Menu
                            ref="menu"
                            id="overlay_menu"
                            :model="menuItems"
                            :popup="true"
                        />
                        <Button
                            :label="$t('common.new_price')"
                            icon="pi pi-plus"
                            class="ml-2 p-button-outlined mr-2"
                            @click="addNewPrice"
                            data-testid="add-new-price-button"
                        />
                        <Button
                            v-if="canRecalculatePricings"
                            :label="$t('plans.recalculate_pricing')"
                            icon="pi pi-refresh"
                            class="ml-2 p-button-outlined"
                            @click="recalculatePricings"
                            data-testid="recalculate-pricing-button"
                        />
                    </div>
                    <div
                        v-if="isTaxable && parentItem"
                        :class="{ 'text-gray-600': !isEditable }"
                        class="flex"
                    >
                        <InputField
                            id="is_checked"
                            variant="checkbox"
                            :disabled="!isEditable"
                            binary
                            v-model="parentItem.is_pricing_subject_to_tax"
                            @change="updateIsPricingSubjectToTax"
                        />
                        <label for="is_checked" class="ml-2 font-normal">
                            {{ $t('pricing.subject_to_tax') }}
                        </label>
                        <i
                            v-tooltip="'lorem ipsum'"
                            class="pi pi-info-circle ml-2"
                        ></i>
                    </div>
                </div>

                <div class="flex align-items-center gap-2">
                    <Button
                        v-if="isEditable && showResetButton"
                        label="Reset Pricing Back to Default"
                        icon="pi pi-replay"
                        class="p-button-outlined"
                        @click="resetPricingToDefault"
                        data-testid="reset-pricing-button"
                    />
                    <Search
                        v-if="!showResetButton"
                        v-model="searchText"
                        @search="search"
                    />
                </div>
            </div>
        </template>
        <template #empty
            >{{
                $t('common.datatable_no_found', { item: $t('common.prices') })
            }}
        </template>
        <template #loading
            >{{ $t('common.datatable_loading', { item: $t('common.prices') }) }}
        </template>
        <Column
            v-if="isEditable"
            selectionMode="multiple"
            headerStyle="width: 3rem"
        />
        <Column v-if="toggleExpanderShow" expander style="width: 5rem" />
        <Column
            sortable
            field="unit_term"
            header="Unit Term"
            headerStyle="width: 10rem"
        >
            <template #body="{ data }">
                {{ $t(`unit_terms.${data.unit_term}`) }}
            </template>
        </Column>
        <Column field="origin" header="Origin" headerStyle="width: 10rem">
            <template #body="{ data }">
                <span
                    v-tooltip.top="
                        data.rules?.length > 2 &&
                        getCountryNamesFromRules(data, 'origin_country_id')
                    "
                >
                    {{
                        getFirstTwoCountryNamesFromRules(
                            data,
                            'origin_country_id'
                        )
                    }}
                </span>
            </template>
        </Column>
        <Column
            field="destination"
            header="Destination"
            headerStyle="width: 10rem"
        >
            <template #body="{ data }">
                <span
                    v-tooltip.top="
                        data.rules?.length > 2 &&
                        getCountryNamesFromRules(data, 'destination_country_id')
                    "
                >
                    {{
                        getFirstTwoCountryNamesFromRules(
                            data,
                            'destination_country_id'
                        )
                    }}
                </span>
            </template>
        </Column>
        <Column field="residency" header="Residency" headerStyle="width: 10rem">
            <template #body="{ data }">
                <span
                    v-tooltip.top="
                        data.rules?.length > 2 &&
                        getCountryNamesFromRules(data, 'residency_country_id')
                    "
                >
                    {{
                        getFirstTwoCountryNamesFromRules(
                            data,
                            'residency_country_id'
                        )
                    }}
                </span>
            </template>
        </Column>
        <Column field="net_price" header="Net Price" headerStyle="width: 10rem">
            <template #body="{ data }">
                <div
                    :class="{
                        'flex justify-start':
                            countUndefinedNetPrice(data.contributors) > 0,
                        flex: countUndefinedNetPrice(data.contributors) == 0
                    }"
                >
                    <Badge
                        v-if="countUndefinedNetPrice(data.contributors) > 0"
                        v-tooltip.bottom="
                            `${countUndefinedNetPrice(
                                data.contributors
                            )} undefined net ${
                                countUndefinedNetPrice(data.contributors) > 1
                                    ? 'prices'
                                    : 'price'
                            }`
                        "
                        :value="countUndefinedNetPrice(data.contributors)"
                        :severity="'warn'"
                        class="mr-2"
                    />
                    <span style="padding-left: 8px">{{
                        data.net_price !== null
                            ? helpers.moneyFormat(data.net_price_subtotal)
                            : '-'
                    }}</span>
                </div>
            </template>
        </Column>
        <Column
            v-if="isPlanOrAssociatedPlan"
            field="net_price_commission_percent"
            header="Net Comm"
            headerStyle="width: 10rem"
        >
            <template #body="{ data }">
                <div class="flex justify-start">
                    <span>{{ data.net_price_commission_percent }}%</span>
                </div>
            </template>
        </Column>
        <Column
            field="sale_price"
            header="Sale Price"
            headerStyle="width: 10rem"
        >
            <template #body="{ data }">
                <div class="flex justify-start">
                    <span>{{ helpers.moneyFormat(data.sale_price) }}</span>
                </div>
            </template>
        </Column>
        <template v-if="isPlanOrAssociatedPlan">
            <Column
                field="sale_price_commission_percent"
                header="Sale Comm"
                headerStyle="width: 10rem"
            >
                <template #body="{ data }">
                    <div class="flex justify-start">
                        <span>{{ data.sale_price_commission_percent }}%</span>
                    </div>
                </template>
            </Column>
            <Column
                field="sale_price_subtotal"
                header="Sub Total"
                headerStyle="width: 10rem"
            >
                <template #body="{ data }">
                    <div class="flex justify-start">
                        <span>{{
                            helpers.moneyFormat(data.sale_price_subtotal)
                        }}</span>
                    </div>
                </template>
            </Column>
            <Column field="tax_amount" header="Tax" headerStyle="width: 10rem">
                <template #body="{ data }">
                    <div class="flex justify-start">
                        <span>{{
                            helpers.moneyFormat(
                                data.taxes?.reduce(
                                    (sum, t) =>
                                        sum + Number(t.sale_price_tax_amount),
                                    0
                                )
                            )
                        }}</span>
                    </div>
                </template>
            </Column>
            <Column
                field="sale_price_total"
                header="Total Amt"
                headerStyle="width: 10rem"
            >
                <template #body="{ data }">
                    <div
                        @mouseover="
                            (event) =>
                                showSalePriceTotalOverlayPanel(event, data.id)
                        "
                        @mouseleave="(event) => hideSalePriceTotalOverlayPanel(event, data.id)"
                        class="flex justify-end pr-3"
                    >
                        <span>{{
                            helpers.moneyFormat(data.sale_price_total)
                        }}</span>
                    </div>
                    <Popover
                        :ref="(el) => (overlayPanels[data.id] = el)"
                        class="w-20rem"
                    >
                        <PriceTotalBreakdownOverlay :price="data" />
                    </Popover>
                </template>
            </Column>
        </template>
        <Column
            field="min_days"
            :header="$t('common.min_period')"
            headerStyle="width: 10rem"
        >
            <template #body="{ data }">
                {{
                    data.min_days
                        ? `${data.min_days} ${helpers.getMappedText(
                              unitTermsMapper,
                              data.unit_term
                          )}`
                        : '-'
                }}
            </template>
        </Column>
        <Column
            field="max_days"
            :header="$t('common.max_period')"
            headerStyle="width: 10rem"
        >
            <template #body="{ data }">
                {{
                    data.max_days
                        ? `${data.max_days} ${helpers.getMappedText(
                              unitTermsMapper,
                              data.unit_term
                          )}`
                        : '-'
                }}
            </template>
        </Column>
        <Column
            field="effective_date"
            :header="$t('common.effective_date')"
            headerStyle="width: 11rem"
        >
            <template #body="{ data }">
                {{
                    formatValue(data.effective_date, {
                        type: 'date',
                        format: 'short'
                    })
                }}
            </template>
        </Column>
        <Column
            field="end_date"
            :header="$t('common.end_date')"
            headerStyle="width: 11rem"
        >
            <template #body="{ data }">
                {{ formatEndDateDisplayTables(data.end_date) }}
            </template>
        </Column>
        <Column
            v-if="isEditable"
            headerStyle="width: 10rem"
            class="edit-cancel-button">
            <template #body="{ data }">
                <Button
                    :disabled="selectedItems.length"
                    class="p-button-rounded p-button-text"
                    icon="pi pi-pencil"
                    @click="emits('editPrice', data)"
                    data-testid="edit-price-button"
                ></Button>
                <Button
                    :disabled="selectedItems.length"
                    class="p-button-rounded p-button-text p-button-danger"
                    icon="pi pi-trash"
                    @click="
                        () => {
                            selectedItem = data;
                            showDeleteDialog();
                        }
                    "
                    data-testid="delete-price-button"
                ></Button>
            </template>
        </Column>

        <template #expansion="slotProps" v-if="hasPriceBreakdown">
            <div class="expansion-container">
                <div
                    v-for="(data, index) in slotProps.data.contributors"
                    :key="data.id"
                    class="expansion-row"
                    :style="expansionRowStyle(data, index)"
                >
                    <div
                        v-if="isEditable"
                        class="expansion-cell"
                        style="width: 3rem; min-width: 3rem"
                    ></div>
                    <div
                        v-if="toggleExpanderShow"
                        class="expansion-cell"
                        style="
                            width: 5rem;
                            min-width: 5rem;
                            justify-content: flex-start;
                        "
                    ></div>
                    <div
                        class="expansion-cell contributor-cell"
                        style="
                            width: 10rem;
                            min-width: 10rem;
                            justify-content: flex-start;
                        "
                    >
                        <strong
                            :class="{
                                'cursor-pointer text-blue-700':
                                    data.type ===
                                        'Horus\\PlanModule\\Models\\Benefit' &&
                                    data.priceable_id
                            }"
                            @click="
                                data.type ===
                                    'Horus\\PlanModule\\Models\\Benefit' &&
                                data.priceable_id &&
                                showBenefitDetailsDialog(data)
                            "
                        >
                            {{
                                lodash.truncate(
                                    helpers.getLocaleValue(data.name),
                                    { length: 15 }
                                )
                            }}
                        </strong>
                    </div>
                    <div
                        class="expansion-cell"
                        style="
                            width: 10rem;
                            min-width: 10rem;
                            justify-content: flex-start;
                        "
                    ></div>
                    <div
                        class="expansion-cell"
                        style="
                            width: 10rem;
                            min-width: 10rem;
                            justify-content: flex-start;
                        "
                    ></div>
                    <div
                        class="expansion-cell"
                        style="
                            width: 10rem;
                            min-width: 10rem;
                            justify-content: flex-start;
                        "
                    ></div>
                    <div
                        class="expansion-cell"
                        style="width: 10rem; min-width: 10rem"
                    >
                        <i
                            v-if="data.net_price === null"
                            class="pi pi-info-circle text-orange-600 mr-2"
                            v-tooltip="'Net price undefined'"
                        />
                        <span>{{
                            data.net_price !== null
                                ? helpers.moneyFormat(data.net_price)
                                : '-'
                        }}</span>
                    </div>
                    <div
                        v-if="isPlanOrAssociatedPlan"
                        class="expansion-cell"
                        style="
                            width: 10rem;
                            min-width: 10rem;
                            justify-content: flex-start !important;
                            text-align: left !important;
                        "
                    ></div>
                    <div
                        class="expansion-cell price-cell"
                        style="
                            width: 10rem;
                            min-width: 10rem;
                            justify-content: flex-start !important;
                            text-align: left !important;
                        "
                    >
                        <div
                            v-if="
                                isEditable &&
                                editingContributorId === data.id &&
                                editingContributorId !== null
                            "
                        >
                            <InputField
                                variant="number"
                                v-model.number="data.sale_price"
                                :addon-after="$t('common.cad')"
                                style="width: 6rem"
                            />
                        </div>
                        <div v-else>
                            <i
                                v-if="data.sale_price === null"
                                class="pi pi-info-circle text-orange-600 mr-2"
                                v-tooltip="'Sale price undefined'"
                            />
                            <span>{{
                                data.sale_price !== null
                                    ? helpers.moneyFormat(data.sale_price)
                                    : '-'
                            }}</span>
                        </div>
                    </div>
                    <template v-if="isPlanOrAssociatedPlan">
                        <div
                            class="expansion-celll"
                            style="
                                width: 10rem;
                                min-width: 10rem;
                                justify-content: flex-start;
                            "
                        ></div>
                        <div
                            class="expansion-cell"
                            style="
                                width: 10rem;
                                min-width: 10rem;
                                justify-content: flex-start;
                            "
                        ></div>
                        <div
                            class="expansion-cell"
                            style="
                                width: 10rem;
                                min-width: 10rem;
                                justify-content: flex-start;
                            "
                        ></div>
                        <div
                            class="expansion-cell"
                            style="
                                width: 10rem;
                                min-width: 10rem;
                                justify-content: flex-start;
                            "
                        ></div>
                    </template>
                    <div
                        class="expansion-cell"
                        style="
                            width: 10rem;
                            min-width: 10rem;
                            justify-content: flex-start;
                        "
                    ></div>
                    <div
                        class="expansion-cell"
                        style="
                            width: 10rem;
                            min-width: 10rem;
                            justify-content: flex-start;
                        "
                    ></div>
                    <div
                        class="expansion-cell"
                        style="
                            width: 11rem;
                            min-width: 11rem;
                            justify-content: flex-start;
                        "
                    ></div>
                    <div
                        class="expansion-cell"
                        style="
                            width: 11rem;
                            min-width: 11rem;
                            justify-content: flex-start;
                        "
                    ></div>
                    <div
                        v-if="isEditable && data.id"
                        class="expansion-cell"
                        style="justify-content: flex-start"
                    >
                        <div
                            v-if="editingContributorId === data.id"
                            class="flex"
                        >
                            <Button
                                icon="pi pi-check"
                                class="p-button-rounded p-button-text"
                                @click="saveContributorPrice(data)"
                                v-tooltip.top="'Save'"
                                :loading="isSaving"
                            />
                            <Button
                                icon="pi pi-times-circle"
                                class="p-button-rounded p-button-text p-button-danger"
                                @click="cancelContributorEdit"
                                v-tooltip.top="'Cancel'"
                                :disabled="isSaving"
                            />
                        </div>
                        <div v-else>
                            <Button
                                class="p-button-rounded p-button-text"
                                icon="pi pi-pencil"
                                severity="primary"
                                @click="setContributorEditMode(data.id)"
                                v-tooltip.top="'Edit Sale Price'"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </BaseTable>

    <Confirmation
        v-model="deleteDialog"
        show-alert-icon
        :header="$t('benefit_groups.delete_benefit_group_price_header')"
        :content="
            selectedItems?.length > 1
                ? `Are you sure you want to delete the selected prices?`
                : `Are you sure you want to delete this price?`
        "
        confirm-button-class="p-button-danger"
        @confirm="deleteItem"
    />

    <Confirmation
        v-model="resetDialog"
        show-alert-icon
        :header="$t('non_insurance_products.reset_pricing_header')"
        :content="$t('non_insurance_products.reset_pricing_content')"
        confirm-button-class="p-button-danger"
        :confirmButtonText="$t('buttons.confirm')"
        :cancelButtonText="$t('buttons.cancel')"
        :loading="isResetting"
        @confirm="confirmResetPricing"
        @cancel="cancelResetPricing"
    />

    <BenefitDetailsDialog
        v-if="benefitDetailsDialog"
        v-model="benefitDetailsDialog"
        :id="selectedBenefit.id"
    />
</template>
<style lang="scss" scoped>
.expansion-container {
    width: 100%;
}

.expansion-row {
    display: flex;
    width: 100%;
    border-bottom: 1px solid #dee2e6;

    .expansion-cell {
        padding: 0.75rem;
        height: 3rem;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        flex-shrink: 0;

        &.contributor-cell {
            font-weight: 500;

            strong {
                display: block;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                width: 100%;
            }
        }

        //&.price-cell {
        //    .flex {
        //        width: 100%;
        //    }
        //}
    }

    &:hover {
        background-color: #f1f5f9;
    }
}

:deep(.p-datatable-row-expansion > td) {
    padding: 0 !important;
}
</style>
