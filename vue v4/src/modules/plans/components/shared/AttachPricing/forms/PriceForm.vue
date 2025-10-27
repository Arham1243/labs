<script setup>
import lodash from 'lodash';
import { ref, onBeforeMount, computed, onUnmounted, watch, nextTick } from 'vue';
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
    async (newDate) => {
        if (!newDate) {
            return;
        }

        if (formData.value.end_date) {
            return;
        }

        let year, month, day;

        if (typeof newDate === 'string') {
            if (/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
                const parts = newDate.split('-');
                year = parseInt(parts[0]);
                month = parseInt(parts[1]) - 1;
                day = parseInt(parts[2]);
            } else {
                const dateObj = new Date(newDate);
                if (isNaN(dateObj.getTime())) return;
                year = dateObj.getFullYear();
                month = dateObj.getMonth();
                day = dateObj.getDate();
            }
        } else if (newDate instanceof Date) {
            year = newDate.getFullYear();
            month = newDate.getMonth();
            day = newDate.getDate();
        } else {
            return;
        }

        const newYear = year + 5;
        let calculatedEndDate = new Date(newYear, month, day);

        if (calculatedEndDate.getDate() !== day) {
            calculatedEndDate = new Date(newYear, month + 1, 0);
        }

        const endDateString = `${newYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        formData.value.end_date = endDateString;

        await nextTick();

        emits('update:modelValue', {
            ...formData.value,
            end_date: endDateString
        });
    },
    { deep: true }
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
    <Drawer
        v-model:visible="isVisible"
        position="right"
        class="!w-full md:!w-80 lg:!w-[30rem]"
    >
        <template #header>
            <div class="flex justify-center items-center"></div>
        </template>
        <h4>{{ headerText }}</h4>
        <div class="mt-4 grid grid-cols-12 gap-4">
            <div class="col-span-12">
                <label for="category" class="mb-2">{{ $t('common.unit_term') }} *</label>
                <InputField
                    showClear
                    id="unit_term"
                    variant="select"
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
                    class="w-full"
                />
            </div>
            <div class="col-span-12 mb-0">
                <label for="rules">{{ $t('common.rules') }} *</label>
            </div>
            <div class="col-span-12 grid grid-cols-12 bg-gray-100 border-b border-gray-300 py-3 font-bold">
                <div class="col-span-3 pl-2">
                    <label for="origin_ids" class="my-1">{{
                            $t('common.origin')
                        }}</label>
                </div>
                <div class="col-span-3 pl-2">
                    <label for="destination_ids" class="my-1">{{
                            $t('common.destination')
                        }}</label>
                </div>
                <div class="col-span-3 pl-2">
                    <label for="residency_ids" class="my-1">{{
                            $t('common.residency')
                        }}</label>
                </div>
                <div class="col-span-3">
                    <!-- Empty space for the delete button column -->
                </div>
            </div>
            <div
                v-for="(item, i) in formData.rules"
                :key="i"
                class="col-span-12 grid grid-cols-12 gap-2 items-center"
            >
                <div class="col-span-3">
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
                        class="w-full"
                    />
                </div>
                <div class="col-span-3">
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
                        class="w-full"
                    />
                </div>
                <div class="col-span-3">
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
                        class="w-full"
                    />
                </div>
                <div class="col-span-3 text-center">
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
            <div v-if="warningMessages.length > 0" class="col-span-12 flex flex-col gap-3">
                <InputField
                    variant="message"
                    v-for="(message, index) in warningMessages"
                    :key="index"
                    :severity="message.severity"
                    :closable="false"
                    :icon=" message.severity === 'error'
                                    ? 'pi pi-times-circle mr-3'
                                    : 'pi pi-info-circle mr-3'"
                    class="custom-message-all-countries"
                >
                    <template #messageicon>
                    </template>
                    {{ message.detail }}
                </InputField>
            </div>
            <div
                class="col-span-12"
                v-if="formData.rules.length < 10"
            >
                <Button
                    icon="pi pi-plus"
                    label="Add Rule"
                    text
                    @click="addRule"
                    :disabled="isAddRuleDisabled"
                    data-testid="add-period-button"
                />
            </div>
            <div class="col-span-12 gap-3 custom-number-input">
                <div
                    :class="[isPlanOrAssociatedPlan ? 'col-span-6' : 'col-span-12']"
                    class="mb-4"
                >
                    <label for="net_price" class="mb-2"
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
                <div v-if="isPlanOrAssociatedPlan" class="col-span-6">
                    <label for="net_price" class="mb-2">{{
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
            <div class="col-span-12 gap-3 custom-number-input">
                <div
                    :class="[isPlanOrAssociatedPlan ? 'col-span-6' : 'col-span-12']"
                    class="mb-4"
                >
                    <label for="name" class="mb-2">{{ $t('common.sale_price') }} *</label>
                    <InputField
                        id="sale_price"
                        variant="number"
                        :addon-after="$t('common.cad')"
                        :disabled="busy"
                        v-model="formData.sale_price"
                        data-testid="sale_price"
                    />
                </div>
                <div v-if="isPlanOrAssociatedPlan" class="col-span-6">
                    <label for="net_price" class="mb-2">{{
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
            <div v-if="isPlanOrAssociatedPlan" class="grid mt-2 col-span-12">
                <div class="col-span-6 font-semibold py-1">Subtotal</div>
                <div class="col-span-6 py-1">
                    {{ helpers.moneyFormat(sale_price_subtotal) }}
                </div>
                <template v-for="tax in taxes">
                    <div class="col-span-6 font-semibold py-1">
                        {{ tax.tax_type }} ({{ tax.percentage }}%)
                    </div>
                    <div class="col-span-6">
                        {{ helpers.moneyFormat(getTaxAmount(tax.percentage)) }}
                    </div>
                </template>
                <div class="col-span-6 font-semibold py-1">
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

            <divider v-if="isPlanOrAssociatedPlan" class="col-span-12"/>

            <template
                v-if="
                    ['flat_daily', 'flat_monthly'].includes(formData.unit_term)
                "
            >
                <div class="col-span-12 custom-number-input">
                    <label for="min_days" class="mb-2"
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
                        class="w-full"
                        data-testid="min_days"
                    />
                </div>
                <div class="col-span-12 custom-number-input">
                    <label for="max_days" class="mb-2"
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
                        class="w-full"
                        data-testid="max_days"
                    />
                </div>
            </template>
            <div class="col-span-12">
                <label for="effective_date" class="mb-2">{{ $t('common.effective_date') }} *</label>
                <InputField
                    data-testid="effective-date-input"
                    id="effective_date"
                    variant="date"
                    :disabled="busy"
                    v-model="formData.effective_date"
                    class="w-full"
                />
            </div>
            <div class="col-span-12">
                <label for="end_date" class="mb-2">{{ $t('common.end_date') }}</label>
                <InputField
                    :key="formData.end_date"
                    data-testid="end-date-input"
                    id="end_date"
                    variant="date"
                    :disabled="busy"
                    v-model="endDateForDatepicker"
                    class="w-full"
                />
            </div>
        </div>
        <div class="w-full text-right mt-12">
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
    </Drawer>
</template>
