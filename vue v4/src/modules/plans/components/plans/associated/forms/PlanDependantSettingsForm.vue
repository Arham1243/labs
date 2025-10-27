<script setup>
import { onMounted, ref, watch } from 'vue';
import { useGlobalStore, useCommonStore } from '@/stores';
import { useI18n } from 'vue-i18n';

import ViewPricingDialogComponent from '@/modules/plans/components/plans/associated/dialogs/ViewPricingDialog.vue';
import { useHelpers } from '@/composables';

const props = defineProps({
    modelValue: {
        type: Object
    },
    isNew: {
        type: Boolean,
        default: false
    },
    id: {
        type: String,
        required: true
    },
    periods: {
        type: Array,
        required: true
    }
});

const emit = defineEmits(['update:modelValue']);

const commonStore = useCommonStore();
const helpers = useHelpers();
const { t } = useI18n();

const loadingUsers = ref(false);
const viewPricingDialog = ref(false);
const users = ref([]);
const selectedItem = ref(null);
const formData = ref(props.modelValue);

const conditions = [
    { name: t('plans.more_than'), code: 'more_than' },
    { name: t('plans.less_than'), code: 'less_than' },
    { name: t('plans.equal_to'), code: 'equal_to' }
];
const eligibilityConditionsList = ref([
    { id: 'over', name: t('common.over') },
    { id: 'under', name: t('common.under') },
    { id: 'exactly', name: t('common.exactly') }
]);
const ageUnitList = [
    { id: 'days', name: t('common.days') },
    { id: 'months', name: t('common.months') },
    { id: 'years', name: t('common.years') }
];
const availabilityConditionsList = ref([
    { id: 'before', name: t('common.before') },
    { id: 'after', name: t('common.after') }
]);
const availabilityValuesList = ref([
    { id: 'policy_start', name: t('common.policy_start') },
    { id: 'policy_end_date', name: t('common.policy_end_date') }
]);

onMounted(() => {
    getUsers();
});

watch(formData, (value) => {
    emit('update:modelValue', value);
});

const getUsers = async (search) => {
    try {
        loadingUsers.value = true;
        const res = await commonStore.searchCompanyUsers(
            {
                scopes: search
                    ? [{ name: 'fullNameLike', parameters: [search] }]
                    : []
            },
            { limit: 100 }
        );
        users.value = res.data;
    } finally {
        loadingUsers.value = false;
    }
};

const removePricingDiscount = (item) => {
    formData.value.pricing_discounts.splice(
        formData.value.pricing_discounts.indexOf(item),
        1
    );
};

const addPricingDiscount = () => {
    formData.value.pricing_discounts.push({
        percentage: 0,
        condition: { name: t('plans.more_than'), code: 'more_than' },
        num_of_dependants: 1
    });
};

const setViewPricingDialog = (item) => {
    selectedItem.value = item;
    viewPricingDialog.value = true;
};

const globalStore = useGlobalStore();

const handleApplyPricingSwitch = () => {
    if (formData.value.apply_pricing_discount) {
        formData.value.pricing_discounts = [
            {
                percentage: 0,
                condition: { name: t('plans.more_than'), code: 'more_than' },
                num_of_dependants: 1
            }
        ];
    } else {
        formData.value.pricing_discounts = [];
    }
};

onMounted(() => {
    props.periods.forEach((period) => {
        availabilityValuesList.value.push({
            id: 'plan_period_start_date_' + period.id,
            name:
                period.name +
                ' Start Date (' +
                helpers.formatDate(period.start_date, 'DD-MMM') +
                ')'
        });
        availabilityValuesList.value.push({
            id: 'plan_period_end_date_' + period.id,
            name:
                period.name +
                ' End Date (' +
                helpers.formatDate(period.end_date, 'DD-MMM') +
                ')'
        });
    });
});
</script>
<template>
    <div class="grid grid-cols-12">
        <div class="flex items-center col-span-12">
            <label for="maximum_dependant"
                >{{ $t('plans.maximum_dependant') }}
                <i
                    v-tooltip="`lorem ipsum lorem ipsum lorem ipsum`"
                    class="pi pi-info-circle"
                ></i
            ></label>
            <div class="custom-number-input">
                <InputNumber
                    id="max_num_of_dependants"
                    v-model="formData.max_num_of_dependants"
                    showButtons
                    buttonLayout="horizontal"
                    class="md:w-40 ml-20 text-center"
                    :min="0"
                    :max="99"
                >
                    <template #incrementbuttonicon>
                        <span class="pi pi-plus" />
                    </template>
                    <template #decrementbuttonicon>
                        <span class="pi pi-minus" />
                    </template>
                </InputNumber>
            </div>
            <small
                class="p-error block mb-2"
                id="text-error"
                v-if="
                    globalStore?.errors &&
                    globalStore?.errors['max_num_of_dependants']
                "
                data-testid="validation-error"
            >
                {{ globalStore?.errors['max_num_of_dependants'][0] }}
            </small>
        </div>
        <div class="col-span-12">
            <div class="flex my-8">
                <InputField
                    variant="switch"
                    v-model="formData.apply_pricing_discount"
                    @change="handleApplyPricingSwitch"
                />
                <span class="ml-2 mt-1">{{
                    $t('plans.apply_pricing_discount')
                }}</span>
            </div>
        </div>
        <div
            class="field md:col-span-12 col-span-6"
            v-if="formData.apply_pricing_discount"
        >
            <div v-for="(item, i) in formData.pricing_discounts" :key="i">
                <div class="flex flex-wrap items-center gap-12 mb-12">
                    <div class="custom-percentage">
                        <InputField
                            :id="`pricing_discounts.${i}.percentage`"
                            v-model="item.percentage"
                            :min="0"
                            :max="100"
                            variant="number"
                            icon-after="pi pi-percentage"
                            class="md:w-60"
                        />
                    </div>
                    <div>
                        <div class="mt-2">
                            {{ $t('plans.discount_for_of_dependant') }}
                        </div>
                    </div>
                    <div class="grow">
                        <InputField
                            :id="`pricing_discounts.${i}.condition`"
                            variant="select"
                            v-model="item.condition"
                            :options="conditions"
                            optionLabel="name"
                            class="w-full"
                        />
                    </div>
                    <div>
                        <InputField
                            :id="`pricing_discounts.${i}.num_of_dependants`"
                            v-model="item.num_of_dependants"
                            :min="1"
                            :max="formData.max_num_of_dependants"
                            variant="number"
                            class="w-full"
                        />
                    </div>
                    <div class="shrink-0 ml-auto">
                        <div class="flex gap-2 edit-cancel-button">
                            <Button
                                label="View Pricing"
                                @click="setViewPricingDialog(item)"
                                class="p-button-outlined w-full sm:w-auto"
                            />
                            <Button
                                outlined
                                :disabled="
                                    formData.pricing_discounts.length == 1
                                "
                                icon="pi pi-trash"
                                class="p-button-rounded p-button-danger p-button-outlined"
                                @click="removePricingDiscount(item)"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex justify-end md:col-span-12">
                <div class="flex">
                    <Button
                        @click="addPricingDiscount"
                        text
                        icon="pi pi-plus"
                        :label="$t('plans.new_price_condition')"
                    />
                </div>
            </div>
        </div>

        <Divider class="col-span-12" />

        <div class="field col-span-12">
            <div class="flex mt-4">
                <InputField
                    variant="switch"
                    v-model="formData.enforce_start_date"
                />
                <span class="ml-2 mt-1">{{
                    $t('plans.enforce_main_applicant_start_date')
                }}</span>
            </div>
        </div>
        <div class="field col-span-12">
            <div class="flex mt-4">
                <InputField
                    variant="switch"
                    v-model="formData.enforce_end_date"
                />
                <span class="ml-2 mt-1">{{
                    $t('plans.enforce_main_applicant_end_date')
                }}</span>
            </div>
        </div>

        <Divider class="col-span-12" />

        <div class="col-span-12">
            <div class="flex mt-4">
                <InputField
                    variant="switch"
                    id="restrict_eligibility"
                    v-model="formData.restrict_eligibility"
                />
                <span class="ml-2 mt-1">{{
                    $t('plans.restrict_eligibility_based_on_main_applicant_age')
                }}</span>
                <i
                    v-tooltip="`lorem ipsum lorem ipsum lorem ipsum`"
                    class="pi pi-info-circle ml-2 my-auto"
                ></i>
            </div>
        </div>
        <div v-if="formData.restrict_eligibility"
             class="col-span-12 flex items-center gap-2 my-6"
        >
            <div class="pl-11">
                {{ $t('plans.main_applicant_age') }}*
                <i
                    v-tooltip="`lorem ipsum lorem ipsum lorem ipsum`"
                    class="pi pi-info-circle"
                ></i>
            </div>
            <div class="pl-3">
                <InputField
                    v-model="formData.main_applicant_age_condition"
                    id="main_applicant_age_condition"
                    variant="select"
                    :options="eligibilityConditionsList"
                    optionLabel="name"
                    :placeholder="$t('common.select')"
                    class="md:w-40"
                />
            </div>
            <div>
                <InputField
                    v-model="formData.main_applicant_age"
                    id="main_applicant_age"
                    variant="number"
                    :min="0"
                    class="md:w-20"
                />
            </div>
            <div>
                <InputField
                    v-model="formData.main_applicant_age_unit"
                    id="main_applicant_age_unit"
                    variant="select"
                    :options="ageUnitList"
                    optionLabel="name"
                    :placeholder="$t('common.select')"
                />
            </div>
        </div>
        <div class="col-span-12 flex flex-wrap items-center gap-4 mb-6">
            <div>
                {{ $t('dependants.minimum_dependant_age') }}*
                <i
                    v-tooltip="`lorem ipsum lorem ipsum lorem ipsum`"
                    class="pi pi-info-circle"
                ></i>
            </div>
            <div>
                <InputField
                    id="min_dependant_age"
                    v-model="formData.min_dependant_age"
                    class="md:w-40"
                    variant="number"
                    :min="0"
                />
            </div>
            <div>
                <InputField
                    v-model="formData.min_dependant_age_unit"
                    id="min_dependant_age_unit"
                    variant="select"
                    :options="ageUnitList"
                    optionLabel="name"
                    :placeholder="$t('common.select')"
                />
            </div>
        </div>
        <div class="col-span-12 flex flex-wrap items-center gap-4">
            <div>
                {{ $t('dependants.maximum_dependant_age') }}*
                <i
                    v-tooltip="`lorem ipsum lorem ipsum lorem ipsum`"
                    class="pi pi-info-circle"
                ></i>
            </div>
            <div>
                <InputField
                    id="max_dependant_age"
                    v-model="formData.max_dependant_age"
                    class="md:w-40"
                    variant="number"
                    :min="0"
                />
            </div>
            <div>
                <InputField
                    v-model="formData.max_dependant_age_unit"
                    id="max_dependant_age_unit"
                    variant="select"
                    :options="ageUnitList"
                    optionLabel="name"
                    :placeholder="$t('common.select')"
                />
            </div>
        </div>
        <div class="field col-span-12 mt-12">
            <div class="flex">
                <InputField
                    variant="switch"
                    id="time_limit"
                    v-model="formData.time_limit"
                />
                <span class="ml-2 mt-1">{{
                    $t(
                        'plans.time_limit_restriction_on_plan_availability_as_the_main_applicant'
                    )
                }}</span>
                <i
                    v-tooltip="`lorem ipsum lorem ipsum lorem ipsum`"
                    class="pi pi-info-circle ml-2 my-auto"
                ></i>
            </div>
        </div>
        <div v-if="formData.time_limit" class="col-span-12">
            <div class="my-4 ml-12">
                <div
                    v-if="periods.length === 0"
                    class="mt-12 p-12 message-danger"
                >
                    <i class="pi pi-info-circle mr-2"></i>
                    <span>{{
                        $t('plans.no_periods_available_on_main_plan')
                    }}</span>
                </div>
                <div v-else>
                    <div class="message-info mr-12">
                        <i class="pi pi-info-circle mr-2"></i>
                        <strong class="mr-2">{{ $t('common.periods') }}</strong>
                        <span v-for="(period, i) in periods" :key="i">
                            <span class="p-break-all">{{ period.name }}</span
                            >:
                            {{
                                helpers.formatDate(period.start_date, 'DD-MMM')
                            }}
                            -
                            {{ helpers.formatDate(period.end_date, 'DD-MMM')
                            }}<span v-if="i !== periods.length - 1">, </span>
                        </span>
                    </div>
                </div>
            </div>
            <div
                class="field col-span-12 flex flex-wrap items-center gap-12 pl-12"
            >
                <div>
                    {{ $t('plans.available_from') }}
                </div>
                <div>
                    <InputField
                        class="md:w-20"
                        v-model="formData.available_from"
                        id="available_from"
                        variant="number"
                        :min="1"
                    />
                </div>
                <div>
                    <InputField
                        v-model="formData.available_from_unit"
                        id="available_from_unit"
                        variant="select"
                        :options="ageUnitList"
                        optionLabel="name"
                        :placeholder="$t('common.select')"
                    />
                </div>
                <div>
                    <InputField
                        v-model="formData.available_from_condition"
                        id="available_from_condition"
                        variant="select"
                        :options="availabilityConditionsList"
                        optionLabel="name"
                        :placeholder="$t('common.select')"
                    />
                </div>
                <div class="grow">
                    <InputField
                        v-model="formData.available_from_value"
                        id="available_from_value"
                        variant="select"
                        :options="availabilityValuesList"
                        optionLabel="name"
                        :placeholder="$t('plans.main_applicants_start_date')"
                        :tooltip="true"
                        :tooltipLength="40"
                    />
                </div>
            </div>
            <div
                class="field col-span-12 flex flex-wrap items-center gap-12 pl-12"
            >
                <div>
                    {{ $t('plans.available_until') }}
                </div>
                <div>
                    <InputField
                        class="md:w-20"
                        v-model="formData.available_until"
                        id="available_until"
                        variant="number"
                        :min="1"
                    />
                </div>
                <div>
                    <InputField
                        v-model="formData.available_until_unit"
                        id="available_until_unit"
                        variant="select"
                        :options="ageUnitList"
                        optionLabel="name"
                        :placeholder="$t('common.select')"
                    />
                </div>
                <div>
                    <InputField
                        v-model="formData.available_until_condition"
                        id="available_until_condition"
                        variant="select"
                        :options="availabilityConditionsList"
                        optionLabel="name"
                        :placeholder="$t('common.select')"
                    />
                </div>
                <div class="grow">
                    <InputField
                        v-model="formData.available_until_value"
                        id="available_until_value"
                        variant="select"
                        :options="availabilityValuesList"
                        optionLabel="name"
                        :placeholder="$t('plans.main_applicants_start_date')"
                        :tooltip="true"
                        :tooltipLength="40"
                    />
                </div>
            </div>
        </div>
    </div>
    <ViewPricingDialogComponent
        v-if="viewPricingDialog"
        v-model="viewPricingDialog"
        :item="selectedItem"
        :id="id"
    />
</template>
<style>
.p-button-label {
    font-weight: 1000;
}
.p-inputnumber-buttons-horizontal .p-inputnumber-input {
    text-align: center;
}
</style>
