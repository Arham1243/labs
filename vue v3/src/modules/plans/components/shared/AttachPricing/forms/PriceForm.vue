<script setup>
import lodash from 'lodash';
import { ref, onBeforeMount, computed, onUnmounted, watch } from 'vue';
import { useCommonStore, useGlobalStore } from '@/stores';
import useEventsBus from '@/composables/event-bus';
import { unitTerms } from '@/config';
import { useHelpers } from '@/composables';
import { useI18n } from 'vue-i18n';
import { useBenefitStore } from '@/modules/plans/stores/Benefit';
import { useNonInsuranceProductStore } from '@/modules/plans/stores/NonInsuranceProduct';

import {
    open_end_iso,
    isValidDate,
    formatEndDateForDatepicker
} from '@/modules/plans/utils/end_date_utils.js';
import { usePlanStore } from '@/modules/plans/stores/Plan';
import { useAssociatedPlanStore } from '@/modules/plans/stores/AssociatedPlan';

const props = defineProps({
    id: {
        type: String,
        required: true
    },
    modelValue: {
        type: Object
    },
    isOpen: {
        type: Boolean,
        default: false
    },
    isNew: {
        type: Boolean,
        default: false
    },
    store: {
        type: Object,
        required: true
    },
    isDisabledNetPrice: {
        type: Boolean,
        required: true
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
    }
});

const emits = defineEmits(['update:modelValue', 'closed', 'saved', 'close']);

const commonStore = useCommonStore();
const benefitStore = useBenefitStore();
const nonInsuranceProductStore = useNonInsuranceProductStore();
const planStore = usePlanStore();
const associatedPlanStore = useAssociatedPlanStore();

const { emit } = useEventsBus();
const helpers = useHelpers();
const { t } = useI18n();

const busy = ref(false);
const loadingCountries = ref(false);
const countries = ref([]);

const terms = helpers.buildIdNamePair(unitTerms);

const formData = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emits('update:modelValue', value);
    }
});

const endDateForDatepicker = computed({
    get() {
        return formatEndDateForDatepicker(formData.value?.end_date);
    },
    set(value) {
        const updatedFormData = {
            ...formData.value,
            end_date: value
        };
        emits('update:modelValue', updatedFormData);
    }
});

const isVisible = computed({
    get() {
        return props.isOpen;
    },
    set() {
        if (busy.value) return;
        emits('close');
    }
});

const showNetPriceField = computed(() => {
    return !props.isDisabledNetPrice;
});

const headerText = computed(() => {
    let entityType = 'plan';

    if (props.isBenefit) {
        entityType = 'benefit';
    } else if (props.isBenefitGroup) {
        entityType = 'benefit_groups';
    } else if (props.isNonInsuranceProduct) {
        entityType = 'non_insurance_product';
    }

    const action = formData.value.id ? 'update' : 'new';
    return t(`common.${action}_${entityType}_price`);
});

const isAllCountriesRule = (rule) => {
    const countryFields = [
        'origin_country_id',
        'destination_country_id',
        'residency_country_id'
    ];
    return countryFields.every((field) => rule[field]?.id === 'ALL');
};

const hasAllCountriesRule = computed(() => {
    return formData.value.rules.some(isAllCountriesRule);
});

const hasOverlappingRules = computed(() => {
    if (!hasAllCountriesRule.value) return false;
    return formData.value.rules.length > 1;
});

const isAddRuleDisabled = computed(() => {
    return (
        busy.value ||
        formData.value.rules.length >= 10 ||
        hasAllCountriesRule.value
    );
});

const isSubmitDisabled = computed(() => {
    return busy.value || hasOverlappingRules.value;
});

const warningMessages = computed(() => {
    const messages = [];
    if (hasAllCountriesRule.value) {
        messages.push({
            severity: 'info',
            detail: t('pricing.all_countries_rule_warning')
        });
        if (hasOverlappingRules.value) {
            messages.push({
                severity: 'error',
                detail: t('pricing.overlapping_rules_warning')
            });
        }
    }
    return messages;
});

const isPlanOrAssociatedPlan = computed(
    () => props.isPlan || props.isAssociatedPlan
);

const taxes = computed(() => {
    if (props.isPlan) {
        return planStore.currentPlan?.business_unit?.taxes;
    }
    if (props.isAssociatedPlan) {
        return associatedPlanStore.currentPlan?.plan?.business_unit?.taxes;
    }
    return [];
});

const sale_price_subtotal = computed(
    () =>
        formData.value.sale_price +
        (formData.value.sale_price *
            formData.value.sale_price_commission_percent) /
            100
);

const getTaxAmount = (percentage) => {
    return (sale_price_subtotal.value * percentage) / 100;
};

const sale_price_total = computed(
    () =>
        sale_price_subtotal.value +
        taxes.value?.reduce((total, tax) => {
            return total + getTaxAmount(tax.percentage);
        }, 0)
);

onBeforeMount(() => {
    getCountries();
});

onUnmounted(() => {
    useGlobalStore().clearErrors();
});

watch(
    () => formData.value.effective_date,
    (newDate) => {
        if (!newDate) {
            return;
        }

        if (formData.value.end_date) {
            return;
        }

        const effectiveDateObject = new Date(newDate);
        const newYear = effectiveDateObject.getFullYear() + 5;

        let calculatedEndDate = new Date(
            newYear,
            effectiveDateObject.getMonth(),
            effectiveDateObject.getDate()
        );

        if (calculatedEndDate.getDate() !== effectiveDateObject.getDate()) {
            calculatedEndDate = new Date(
                newYear,
                effectiveDateObject.getMonth() + 1,
                0
            );
        }

        const formattedEndDate =
            helpers.formatDateForDisplay(calculatedEndDate);
        formData.value.end_date = formattedEndDate;

        emits('update:modelValue', {
            ...formData.value,
            end_date: formattedEndDate
        });
    }
);

const getCountries = async () => {
    try {
        loadingCountries.value = true;

        if (countries.value.length === 0) {
            const res = await commonStore.searchCountries({});
            const mappedCountries = res.data.map((item) => {
                return {
                    ...item,
                    name: lodash.truncate(item.name, {
                        length: 45
                    })
                };
            });

            // Add "All Countries" option at the beginning of the array
            countries.value = [
                { id: 'ALL', name: t('common.all_countries') },
                ...mappedCountries
            ];
        }
    } finally {
        loadingCountries.value = false;
    }
};

const save = async (addOther) => {
    try {
        busy.value = true;
        const payload = {
            ...formData.value,
            effective_date:
                formData.value.effective_date != 'Invalid date'
                    ? helpers.formatDateForSave(formData.value.effective_date)
                    : null,
            end_date:
                formData.value.end_date != 'Invalid date'
                    ? helpers.formatDateForSave(formData.value.end_date)
                    : null,
            rules: formData.value.rules.map((rule) => {
                return {
                    origin_country_id: rule.origin_country_id?.id,
                    destination_country_id: rule.destination_country_id?.id,
                    residency_country_id: rule.residency_country_id?.id
                };
            })
        };

        let response;

        // Use the correct store for each entity type
        if (props.isBenefit) {
            response = formData.value?.id
                ? await benefitStore.benefitPricesUpdate(
                      props.id,
                      formData.value.id,
                      payload
                  )
                : await benefitStore.benefitPricesStore(props.id, payload);
        } else if (props.isBenefitGroup) {
            response = formData.value?.id
                ? await benefitStore.benefitGroupPricesUpdate(
                      props.id,
                      formData.value.id,
                      payload
                  )
                : await benefitStore.benefitGroupPricesStore(props.id, payload);
        } else if (props.isNonInsuranceProduct) {
            response = formData.value?.id
                ? await nonInsuranceProductStore.nonInsuranceProductPricesUpdate(
                      props.id,
                      formData.value.id,
                      payload
                  )
                : await nonInsuranceProductStore.nonInsuranceProductPricesStore(
                      props.id,
                      payload
                  );
        } else {
            response = formData.value?.id
                ? await props.store.planPricesUpdate(
                      props.id,
                      formData.value.id,
                      payload
                  )
                : await props.store.planPricesStore(props.id, payload);
        }

        if (response?.meta?.has_missing_overlapping_prices) {
            emit('hasMissingPrices');
        }
        emit('reloadPrices');
        emits('saved', addOther);
    } finally {
        busy.value = false;
    }
};

const lockScroll = () => {
    document.body.dataset.scrollY = window.scrollY;
    document.body.classList.add('scroll-locked');
};

const unlockScroll = () => {
    const scrollY = document.body.dataset.scrollY || '0';
    document.body.classList.remove('scroll-locked');
    window.scrollTo(0, parseInt(scrollY, 10));
};

const addRule = () => {
    if (formData.value.rules.length < 10) {
        formData.value.rules.push({
            origin_country_id: null,
            destination_country_id: null,
            residency_country_id: null
        });
    }
};

const removeRule = async (item) => {
    const periodIndex = formData.value.rules.indexOf(item);
    formData.value.rules.splice(periodIndex, 1);
};
</script>

<template>
    <Sidebar
        v-model:visible="isVisible"
        position="right"
        class="w-full md:w-20rem lg:w-30rem"
    >
        <h4>{{ headerText }}</h4>
        <div class="mt-3 grid p-fluid formgrid">
            <div class="field col-12">
                <label for="category">{{ $t('common.unit_term') }} *</label>
                <InputField
                    showClear
                    id="unit_term"
                    variant="dropdown"
                    appendTo="body"
                    @click="lockScroll"
                    @blur="unlockScroll"
                    @close="unlockScroll"
                    optionLabel="name"
                    optionValue="id"
                    v-model="formData.unit_term"
                    :disabled="busy"
                    :options="terms"
                    :placeholder="$t('common.select')"
                    data-testid="unit-term"
                />
            </div>
            <div class="field col-12 mb-0">
                <label for="rules">{{ $t('common.rules') }} *</label>
            </div>
            <div
                class="field formgrid grid justify-content-evenly mb-2 pb-0 bg-gray-100 border-bottom-1 border-gray-300 mx-2 w-full"
            >
                <div
                    class="field col-3 pl-1 mx-0 pr-0 align-items-center align-content-center mt-2 mb-2"
                >
                    <label for="origin_ids" class="my-1 font-bold">{{
                        $t('common.origin')
                    }}</label>
                </div>
                <div
                    class="field col-3 pl-1 mx-0 pr-0 align-items-center align-content-center mt-2 mb-2"
                >
                    <label for="destination_ids" class="my-1 font-bold">{{
                        $t('common.destination')
                    }}</label>
                </div>
                <div
                    class="field col-3 pl-1 mx-0 pr-0 align-items-center align-content-center mt-2 mb-2"
                >
                    <label for="residency_ids" class="my-1 font-bold">{{
                        $t('common.residency')
                    }}</label>
                </div>
                <div class="field col-1 p-0">
                    <!-- Empty space for the delete button column -->
                </div>
            </div>
            <div
                v-for="(item, i) in formData.rules"
                :key="i"
                class="field col-12 formgrid grid gap-1 justify-content-evenly mb-1 mr-0 pr-0"
            >
                <div class="field col-3 pl-0 pr-0">
                    <ApiDropdown
                        :id="`rules.${i}.origin_country_id`"
                        appendTo="body"
                        @click="lockScroll"
                        @blur="unlockScroll"
                        @close="unlockScroll"
                        @change="lockScroll"
                        v-model="item.origin_country_id"
                        :loading="loadingCountries"
                        :disabled="busy"
                        :items="countries"
                        optionLabel="name"
                        :placeholder="$t('common.select')"
                        :tooltip="true"
                        :closedTooltip="true"
                        data-testid="origin_ids"
                    />
                </div>
                <div class="field col-3 p-0">
                    <ApiDropdown
                        :id="`rules.${i}.destination_country_id`"
                        appendTo="body"
                        @click="lockScroll"
                        @blur="unlockScroll"
                        @close="unlockScroll"
                        @change="lockScroll"
                        v-model="item.destination_country_id"
                        :loading="loadingCountries"
                        :disabled="busy"
                        :items="countries"
                        optionLabel="name"
                        :placeholder="$t('common.select')"
                        :tooltip="true"
                        :closedTooltip="true"
                        data-testid="destination_ids"
                    />
                </div>
                <div class="field col-3 pl-0 pr-0">
                    <ApiDropdown
                        :id="`rules.${i}.residency_country_id`"
                        appendTo="body"
                        @click="lockScroll"
                        @blur="unlockScroll"
                        @close="unlockScroll"
                        @change="lockScroll"
                        v-model="item.residency_country_id"
                        :loading="loadingCountries"
                        :disabled="busy"
                        :items="countries"
                        optionLabel="name"
                        :placeholder="$t('common.select')"
                        :tooltip="true"
                        :closedTooltip="true"
                        data-testid="residency_ids"
                    />
                </div>
                <div class="field col-1 p-0">
                    <Button
                        :disabled="busy || formData.rules.length === 1"
                        icon="pi pi-trash"
                        class="p-button-rounded p-button-outlined"
                        @click="removeRule(item)"
                        style="color: red"
                        data-testid="remove-period-button"
                    />
                </div>
            </div>
            <div v-if="warningMessages.length > 0" class="field col-12">
                <Message
                    v-for="(message, index) in warningMessages"
                    :key="index"
                    :severity="message.severity"
                    :closable="false"
                    class="custom-message-all-countries"
                >
                    <template #messageicon>
                        <i
                            :class="
                                message.severity === 'error'
                                    ? 'pi pi-times-circle'
                                    : 'pi pi-info-circle'
                            "
                            class="mr-3"
                        ></i>
                    </template>
                    {{ message.detail }}
                </Message>
            </div>
            <div
                class="flex justify-content-end mb-3"
                v-if="formData.rules.length < 10"
            >
                <Button
                    icon="pi pi-plus"
                    label="Add Rule"
                    text
                    @click="addRule"
                    :disabled="isAddRuleDisabled"
                    class="w-max mb-2 ml-1"
                    data-testid="add-period-button"
                />
            </div>
            <div class="formgrid grid col-12 mr-0 pr-0">
                <div
                    class="field pr-0"
                    :class="[isPlanOrAssociatedPlan ? 'col-6' : 'col-12']"
                >
                    <label for="net_price"
                        >{{ $t('common.net_price') }} *</label
                    >
                    <InputField
                        id="net_price"
                        variant="number"
                        :addon-after="$t('common.cad')"
                        :disabled="busy || !showNetPriceField"
                        v-model="formData.net_price"
                        data-testid="net_price"
                    />
                </div>
                <div v-if="isPlanOrAssociatedPlan" class="field col-6 pr-0">
                    <label for="net_price">{{
                        $t('common.net_price_commission')
                    }}</label>
                    <InputField
                        id="net_price"
                        variant="number"
                        addon-after="%"
                        :disabled="busy"
                        v-model="formData.net_price_commission_percent"
                        data-testid="net_price_commission_percent"
                    />
                </div>
            </div>
            <div class="formgrid grid col-12 mr-0 pr-0">
                <div
                    class="field pr-0"
                    :class="[isPlanOrAssociatedPlan ? 'col-6' : 'col-12']"
                >
                    <label for="name">{{ $t('common.sale_price') }} *</label>
                    <InputField
                        id="sale_price"
                        variant="number"
                        :addon-after="$t('common.cad')"
                        :disabled="busy"
                        v-model="formData.sale_price"
                        data-testid="sale_price"
                    />
                </div>
                <div v-if="isPlanOrAssociatedPlan" class="field col-6 pr-0">
                    <label for="net_price">{{
                        $t('common.sale_price_commission')
                    }}</label>
                    <InputField
                        id="net_price"
                        variant="number"
                        addon-after="%"
                        :disabled="busy"
                        v-model="formData.sale_price_commission_percent"
                        data-testid="sale_price_commission_percent"
                    />
                </div>
            </div>
            <div v-if="isPlanOrAssociatedPlan" class="grid mt-2 col-12">
                <div class="col-6 font-semibold py-1">Subtotal</div>
                <div class="col-6 py-1">
                    {{ helpers.moneyFormat(sale_price_subtotal) }}
                </div>
                <template v-for="tax in taxes">
                    <div class="col-6 font-semibold py-1">
                        {{ tax.tax_type }} ({{ tax.percentage }}%)
                    </div>
                    <div class="col-6">
                        {{ helpers.moneyFormat(getTaxAmount(tax.percentage)) }}
                    </div>
                </template>
                <div class="col-6 font-semibold py-1">
                    Estimated Total
                    <i
                        v-tooltip="`This price might change after creation`"
                        class="pi pi-info-circle"
                    ></i>
                </div>

                <div class="col-6 py-1">
                    {{ helpers.moneyFormat(sale_price_total) }}
                </div>
            </div>
            <divider v-if="isPlanOrAssociatedPlan" class="mx-2" />
            <template
                v-if="
                    ['flat_daily', 'flat_monthly'].includes(formData.unit_term)
                "
            >
                <div class="field col-12">
                    <label for="min_days"
                        >{{ $t('common.min_period') }} *</label
                    >
                    <InputField
                        id="min_days"
                        variant="number"
                        :addon-after="
                            formData.unit_term === 'flat_daily'
                                ? $t('common.days')
                                : $t('common.months')
                        "
                        :disabled="busy"
                        :min="Number(0)"
                        v-model="formData.min_days"
                        data-testid="min_days"
                    />
                </div>
                <div class="field col-12">
                    <label for="max_days"
                        >{{ $t('common.max_period') }} *</label
                    >
                    <InputField
                        id="max_days"
                        variant="number"
                        :addon-after="
                            formData.unit_term === 'flat_daily'
                                ? $t('common.days')
                                : $t('common.months')
                        "
                        :disabled="busy"
                        :min="Number(0)"
                        v-model="formData.max_days"
                        data-testid="max_days"
                    />
                </div>
            </template>
            <div class="field col-12">
                <label for="effective_date"
                    >{{ $t('common.effective_date') }} *</label
                >
                <InputField
                    data-testid="effective-date-input"
                    id="effective_date"
                    variant="date"
                    :disabled="busy"
                    v-model="formData.effective_date"
                />
            </div>
            <div class="field col-12 flex flex-wrap flex-column">
                <label for="end_date">{{ $t('common.end_date') }}</label>
                <InputField
                    data-testid="end-date-input"
                    id="end_date"
                    variant="date"
                    :disabled="busy"
                    v-model="endDateForDatepicker"
                />
            </div>
        </div>
        <div class="w-full text-right mt-4">
            <Button
                :disabled="busy"
                :label="$t('buttons.cancel')"
                class="p-button-outlined"
                @click="isVisible = false"
                data-testid="cancel"
            />
            <Button
                v-if="!formData.id"
                :loading="busy"
                :disabled="isSubmitDisabled"
                :label="$t('buttons.save_add_other')"
                class="p-button-outlined ml-2"
                @click="save(true)"
                data-testid="save-add-other"
            />
            <Button
                :loading="busy"
                :disabled="isSubmitDisabled"
                :label="$t('buttons.save')"
                class="ml-2"
                icon="pi pi-check"
                @click="save(false)"
                data-testid="save"
            />
        </div>
    </Sidebar>
</template>

<style scoped>
body.scroll-locked {
    position: fixed;
    width: 100%;
    overflow-y: scroll;
    top: var(--scroll-y);
}

::v-deep #api-dropdown-choice {
    color: black;
}

.p-message.p-message-info {
    background: #bfdbfe;
    color: #14377d;
    border: 0;
}

.p-message.p-message-error {
    border: 0;
}
</style>
