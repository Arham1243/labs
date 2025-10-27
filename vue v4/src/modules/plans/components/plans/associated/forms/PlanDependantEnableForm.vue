<script setup>
import { onMounted, ref, watch } from 'vue';
import { useHelpers } from '@/composables';
import { useI18n } from 'vue-i18n';

const props = defineProps({
    modelValue: {
        type: Object
    },
    isNew: {
        type: Boolean,
        default: false
    },
    periods: {
        type: Array,
        required: true
    }
});

const emit = defineEmits(['update:modelValue']);
const helpers = useHelpers();
const { t } = useI18n();

const formData = ref(props.modelValue);
const availableDatesList = ref([
    { id: 'policy_start', name: t('common.policy_start') },
    { id: 'policy_end_date', name: t('common.policy_end_date') }
]);

onMounted(() => {
    props.periods.forEach((period) => {
        availableDatesList.value.push({
            id: 'plan_period_start_date_' + period.id,
            name:
                period.name +
                ' Start Date (' +
                helpers.formatDate(period.start_date, 'DD-MMM') +
                ')'
        });
        availableDatesList.value.push({
            id: 'plan_period_end_date_' + period.id,
            name:
                period.name +
                ' End Date (' +
                helpers.formatDate(period.end_date, 'DD-MMM') +
                ')'
        });
    });
});

const dropdownList = ref([
    { id: 'days', name: t('common.days') },
    { id: 'months', name: t('common.months') },
    { id: 'years', name: t('common.years') }
]);

const dropdownListDates = ref([
    { id: 'before', name: t('common.before') },
    { id: 'after', name: t('common.after') }
]);

const eligibilityConditionsList = ref([
    { id: 'over', name: t('common.over') },
    { id: 'under', name: t('common.under') },
    { id: 'exactly', name: t('common.exactly') }
]);

watch(formData, (value) => {
    emit('update:modelValue', value);
});
</script>
<template>
    <div class="grid grid-cols-12 mt-12">
        <div class="col-span-12">
            <div class="flex mt-12">
                <InputField
                    variant="switch"
                    v-model="formData.is_parent"
                    :falseValue="false"
                    :trueValue="true"
                    data-testid="is_parent"
                />
                <span class="ml-2 mt-1">{{ $t('plans.parent') }}</span>
            </div>
            <div v-if="formData.is_parent">
                <div class="mt-20">
                    <div class="ml-12">
                        <div>
                            <InputField
                                id="is_checked"
                                variant="checkbox"
                                binary
                                v-model="formData.restrict_eligibility"
                                data-testid="restrict_eligibility"
                            />
                            <label for="is_checked" class="ml-2">
                                {{
                                    $t(
                                        'plans.restrict_eligibility_based_on_main_applicant_age'
                                    )
                                }}
                                <i
                                    v-tooltip="
                                        `lorem ipsum lorem ipsum lorem ipsum`
                                    "
                                    class="pi pi-info-circle"
                                ></i>
                            </label>
                        </div>
                        <div
                            v-if="formData.restrict_eligibility"
                            class="mt-12 flex items-center gap-12"
                        >
                            <div>
                                {{ $t('plans.main_applicant_age') }} *
                                <i
                                    v-tooltip="
                                        `lorem ipsum lorem ipsum lorem ipsum`
                                    "
                                    class="pi pi-info-circle"
                                ></i>
                            </div>
                            <div>
                                <InputField
                                    v-model="
                                        formData.main_applicant_age_condition
                                    "
                                    id="parent_main_applicant_age_condition"
                                    variant="select"
                                    style="width: 10rem"
                                    :options="eligibilityConditionsList"
                                    optionLabel="name"
                                    :placeholder="$t('common.select')"
                                />
                            </div>
                            <div>
                                <InputField
                                    v-model="formData.main_applicant_age"
                                    style="width: 5rem"
                                    id="parent_main_applicant_age"
                                    variant="number"
                                    :min="0"
                                />
                            </div>
                            <div>
                                <InputField
                                    v-model="formData.main_applicant_age_unit"
                                    id="parent_main_applicant_age_unit"
                                    variant="select"
                                    :options="dropdownList"
                                    optionLabel="name"
                                    :placeholder="$t('common.select')"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mt-20">
                    <div class="ml-12">
                        <InputField
                            id="is_checked"
                            variant="checkbox"
                            binary
                            v-model="formData.is_time_limit_parent"
                            data-testid="is_time_limit_parent"
                        />
                        <label for="is_checked" class="ml-2">
                            {{
                                $t(
                                    'plans.time_limit_restriction_on_plan_availability_as_the_main_applicant'
                                )
                            }}
                        </label>
                        <div v-if="formData.is_time_limit_parent">
                            <div
                                v-if="periods.length === 0"
                                class="mt-12 p-12 message-danger"
                            >
                                <i class="pi pi-info-circle mr-2"></i>
                                <span>{{
                                    $t(
                                        'plans.no_periods_available_on_main_plan'
                                    )
                                }}</span>
                            </div>
                            <div v-else>
                                <div class="my-12 message-info">
                                    <i class="pi pi-info-circle mr-2"></i>
                                    <strong class="mr-2">{{
                                        $t('common.periods')
                                    }}</strong>
                                    <span
                                        v-for="(period, i) in periods"
                                        :key="i"
                                    >
                                        <span class="p-break-all">{{
                                            period.name
                                        }}</span
                                        >:
                                        {{
                                            helpers.formatDate(
                                                period.start_date,
                                                'DD-MMM'
                                            )
                                        }}
                                        -
                                        {{
                                            helpers.formatDate(
                                                period.end_date,
                                                'DD-MMM'
                                            )
                                        }}<span v-if="i !== periods.length - 1"
                                            >,
                                        </span>
                                    </span>
                                </div>
                            </div>
                            <table
                                class="w-full border-collapse"
                                style="
                                    border-collapse: separate;
                                    border-spacing: 10px 10px;
                                "
                            >
                                <tbody>
                                    <tr>
                                        <td style="width: 13%">
                                            {{ $t('plans.available_from') }}
                                        </td>
                                        <td style="width: 7%">
                                            <InputField
                                                v-model="
                                                    formData.parent_available_from
                                                "
                                                id="parent_available_from"
                                                variant="number"
                                                :min="1"
                                            />
                                        </td>
                                        <td style="width: 12%">
                                            <InputField
                                                v-model="
                                                    formData.parent_available_from_unit
                                                "
                                                id="parent_available_from_unit"
                                                variant="select"
                                                :options="dropdownList"
                                                optionLabel="name"
                                                :placeholder="
                                                    $t('common.select')
                                                "
                                            />
                                        </td>
                                        <td style="width: 12%">
                                            <InputField
                                                v-model="
                                                    formData.parent_available_from_condition
                                                "
                                                id="parent_available_from_condition"
                                                variant="select"
                                                :options="dropdownListDates"
                                                optionLabel="name"
                                                :placeholder="
                                                    $t('common.select')
                                                "
                                            />
                                        </td>
                                        <td style="width: 60%">
                                            <InputField
                                                v-model="
                                                    formData.parent_available_from_value
                                                "
                                                id="parent_available_from_value"
                                                variant="select"
                                                :options="availableDatesList"
                                                optionLabel="name"
                                                :placeholder="
                                                    $t(
                                                        'plans.main_applicants_start_date'
                                                    )
                                                "
                                                :tooltip="true"
                                                :tooltipLength="40"
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="width: 13%">
                                            {{ $t('plans.available_until') }}
                                        </td>
                                        <td style="width: 7%">
                                            <InputField
                                                v-model="
                                                    formData.parent_available_until
                                                "
                                                id="parent_available_until"
                                                variant="number"
                                                :min="0"
                                            />
                                        </td>
                                        <td style="width: 12%">
                                            <InputField
                                                v-model="
                                                    formData.parent_available_until_unit
                                                "
                                                id="parent_available_until_unit"
                                                variant="select"
                                                :options="dropdownList"
                                                optionLabel="name"
                                                :placeholder="
                                                    $t('common.select')
                                                "
                                            />
                                        </td>
                                        <td style="width: 12%">
                                            <InputField
                                                v-model="
                                                    formData.parent_available_until_condition
                                                "
                                                id="parent_available_until_condition"
                                                variant="select"
                                                :options="dropdownListDates"
                                                optionLabel="name"
                                                :placeholder="
                                                    $t('common.select')
                                                "
                                            />
                                        </td>
                                        <td style="width: 60%">
                                            <InputField
                                                v-model="
                                                    formData.parent_available_until_value
                                                "
                                                id="parent_available_until_value"
                                                variant="select"
                                                :options="availableDatesList"
                                                optionLabel="name"
                                                :placeholder="
                                                    $t(
                                                        'plans.main_applicants_start_date'
                                                    )
                                                "
                                                :tooltip="true"
                                                :tooltipLength="40"
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div
            class="w-full mx-12 my-20"
            style="border-bottom: solid 2px #dfe2e8; padding-bottom: 1px"
        ></div>
        <div class="col-span-12">
            <div class="flex mt-12">
                <InputField
                    variant="switch"
                    v-model="formData.is_spouse"
                    :falseValue="false"
                    :trueValue="true"
                    data-testid="is_spouse"
                />
                <span class="ml-2 mt-1">{{
                    $t('plans.spouse_common_law')
                }}</span>
            </div>
            <div class="mt-20" v-if="formData.is_spouse">
                <div class="ml-12">
                    <InputField
                        id="is_checked"
                        variant="checkbox"
                        binary
                        v-model="formData.is_time_limit_spouse"
                        data-testid="is_time_limit_spouse"
                    />
                    <label for="is_checked" class="ml-2">
                        Time limit restriction on plan availability as the main
                        applicant
                    </label>
                    <div v-if="formData.is_time_limit_spouse">
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
                            <div class="my-12 message-info">
                                <i class="pi pi-info-circle mr-2"></i>
                                <strong class="mr-2">{{
                                    $t('common.periods')
                                }}</strong>
                                <span v-for="(period, i) in periods" :key="i">
                                    <span class="p-break-all">{{
                                        period.name
                                    }}</span
                                    >:
                                    {{
                                        helpers.formatDate(
                                            period.start_date,
                                            'DD-MMM'
                                        )
                                    }}
                                    -
                                    {{
                                        helpers.formatDate(
                                            period.end_date,
                                            'DD-MMM'
                                        )
                                    }}<span v-if="i !== periods.length - 1"
                                        >,
                                    </span>
                                </span>
                            </div>
                        </div>
                        <table
                            class="w-full border-collapse"
                            style="
                                border-collapse: separate;
                                border-spacing: 10px 10px;
                            "
                        >
                            <tbody>
                                <tr>
                                    <td style="width: 13%">
                                        {{ $t('plans.available_from') }}
                                    </td>
                                    <td style="width: 7%">
                                        <InputField
                                            v-model="
                                                formData.spouse_available_from
                                            "
                                            id="spouse_or_common_law_available_from"
                                            variant="number"
                                            :min="1"
                                        />
                                    </td>
                                    <td style="width: 12%">
                                        <InputField
                                            v-model="
                                                formData.spouse_available_from_unit
                                            "
                                            id="spouse_or_common_law_available_from_unit"
                                            variant="select"
                                            :options="dropdownList"
                                            optionLabel="name"
                                            :placeholder="$t('common.select')"
                                        />
                                    </td>
                                    <td style="width: 12%">
                                        <InputField
                                            v-model="
                                                formData.spouse_available_from_condition
                                            "
                                            id="spouse_or_common_law_available_from_condition"
                                            variant="select"
                                            :options="dropdownListDates"
                                            optionLabel="name"
                                            :placeholder="$t('common.select')"
                                        />
                                    </td>
                                    <td style="width: 60%">
                                        <InputField
                                            v-model="
                                                formData.spouse_available_from_value
                                            "
                                            id="spouse_or_common_law_available_from_value"
                                            variant="select"
                                            :options="availableDatesList"
                                            optionLabel="name"
                                            :placeholder="
                                                $t(
                                                    'plans.main_applicants_start_date'
                                                )
                                            "
                                            :tooltip="true"
                                            :tooltipLength="40"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td style="width: 13%">
                                        {{ $t('plans.available_until') }}
                                    </td>
                                    <td style="width: 7%">
                                        <InputField
                                            v-model="
                                                formData.spouse_available_until
                                            "
                                            id="spouse_or_common_law_available_until"
                                            variant="number"
                                            :min="0"
                                        />
                                    </td>
                                    <td style="width: 12%">
                                        <InputField
                                            v-model="
                                                formData.spouse_available_until_unit
                                            "
                                            id="spouse_or_common_law_available_until_unit"
                                            variant="select"
                                            :options="dropdownList"
                                            optionLabel="name"
                                            :placeholder="$t('common.select')"
                                        />
                                    </td>
                                    <td style="width: 12%">
                                        <InputField
                                            v-model="
                                                formData.spouse_available_until_condition
                                            "
                                            id="spouse_available_until_condition"
                                            variant="select"
                                            :options="dropdownListDates"
                                            optionLabel="name"
                                            :placeholder="$t('common.select')"
                                        />
                                    </td>
                                    <td style="width: 60%">
                                        <InputField
                                            v-model="
                                                formData.spouse_available_until_value
                                            "
                                            id="spouse_or_common_law_available_until_value"
                                            variant="select"
                                            :options="availableDatesList"
                                            optionLabel="name"
                                            :placeholder="
                                                $t(
                                                    'plans.main_applicants_start_date'
                                                )
                                            "
                                            :tooltip="true"
                                            :tooltipLength="40"
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        <div
            class="w-full mx-12 my-20"
            style="border-bottom: solid 2px #dfe2e8; padding-bottom: 1px"
        ></div>
        <div class="field col-span-12">
            <div class="flex my-12">
                <InputField
                    variant="switch"
                    v-model="formData.is_child"
                    :falseValue="false"
                    :trueValue="true"
                    data-testid="is_child"
                />
                <span class="ml-2 mt-1">Child</span>
            </div>
            <div class="ml-10" v-if="formData.is_child">
                <table class="border-collapse ml-12">
                    <tbody>
                        <tr>
                            <td style="width: 170px">
                                {{ $t('plans.minimum_child_age') }} *
                                <i
                                    v-tooltip="
                                        `lorem ipsum lorem ipsum lorem ipsum`
                                    "
                                    class="pi pi-info-circle"
                                ></i>
                            </td>
                            <td>
                                <InputField
                                    id="child_min_child_age"
                                    v-model="formData.min_child_age"
                                    style="width: 10rem"
                                    variant="number"
                                    :min="0"
                                />
                            </td>
                            <td>
                                <InputField
                                    v-model="formData.min_child_age_unit"
                                    id="min_child_age_unit"
                                    variant="select"
                                    :options="dropdownList"
                                    optionLabel="name"
                                    :placeholder="$t('common.select')"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                {{ $t('plans.maximum_child_age') }} *
                                <i
                                    v-tooltip="
                                        `lorem ipsum lorem ipsum lorem ipsum`
                                    "
                                    class="pi pi-info-circle"
                                ></i>
                            </td>
                            <td>
                                <InputField
                                    id="child_max_child_age"
                                    v-model="formData.max_child_age"
                                    style="width: 10rem"
                                    variant="number"
                                    :min="0"
                                />
                            </td>
                            <td>
                                <InputField
                                    v-model="formData.max_child_age_unit"
                                    id="max_child_age_unit"
                                    variant="select"
                                    :options="dropdownList"
                                    optionLabel="name"
                                    :placeholder="$t('common.select')"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td colspan="3">
                                <InputField
                                    id="is_checked"
                                    variant="checkbox"
                                    binary
                                    v-model="formData.is_time_limit_child"
                                    data-testid="is_time_limit_child"
                                />
                                <label for="is_checked" class="ml-2">
                                    {{
                                        $t(
                                            'plans.time_limit_restriction_on_plan_availability_as_the_main_applicant'
                                        )
                                    }}
                                </label>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div class="ml-12" v-if="formData.is_time_limit_child">
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
                        <div class="my-12 message-info">
                            <i class="pi pi-info-circle mr-2"></i>
                            <strong class="mr-2">{{
                                $t('common.periods')
                            }}</strong>
                            <span v-for="(period, i) in periods" :key="i">
                                <span class="p-break-all">{{
                                    period.name
                                }}</span
                                >:
                                {{
                                    helpers.formatDate(
                                        period.start_date,
                                        'DD-MMM'
                                    )
                                }}
                                -
                                {{
                                    helpers.formatDate(
                                        period.end_date,
                                        'DD-MMM'
                                    )
                                }}<span v-if="i !== periods.length - 1"
                                    >,
                                </span>
                            </span>
                        </div>
                    </div>
                    <table
                        class="w-full border-collapse"
                        style="
                            border-collapse: separate;
                            border-spacing: 10px 10px;
                        "
                    >
                        <tbody>
                            <tr>
                                <td style="width: 13%">
                                    {{ $t('plans.available_from') }}
                                </td>
                                <td style="width: 7%">
                                    <InputField
                                        v-model="formData.child_available_from"
                                        id="child_available_from"
                                        variant="number"
                                        :min="1"
                                    />
                                </td>
                                <td style="width: 12%">
                                    <InputField
                                        v-model="
                                            formData.child_available_from_unit
                                        "
                                        id="child_available_from_unit"
                                        variant="select"
                                        :options="dropdownList"
                                        optionLabel="name"
                                        :placeholder="$t('common.select')"
                                    />
                                </td>
                                <td style="width: 12%">
                                    <InputField
                                        v-model="
                                            formData.child_available_from_condition
                                        "
                                        id="child_available_from_condition"
                                        variant="select"
                                        :options="dropdownListDates"
                                        optionLabel="name"
                                        :placeholder="$t('common.select')"
                                    />
                                </td>
                                <td style="width: 60%">
                                    <InputField
                                        v-model="
                                            formData.child_available_from_value
                                        "
                                        id="child_available_from_value"
                                        variant="select"
                                        :options="availableDatesList"
                                        optionLabel="name"
                                        :placeholder="
                                            $t(
                                                'plans.main_applicants_start_date'
                                            )
                                        "
                                        :tooltip="true"
                                        :tooltipLength="40"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td style="width: 13%">
                                    {{ $t('plans.available_until') }}
                                </td>
                                <td style="width: 7%">
                                    <InputField
                                        v-model="formData.child_available_until"
                                        id="child_available_until"
                                        variant="number"
                                        :min="0"
                                    />
                                </td>
                                <td style="width: 12%">
                                    <InputField
                                        v-model="
                                            formData.child_available_until_unit
                                        "
                                        id="child_available_until_unit"
                                        variant="select"
                                        :options="dropdownList"
                                        optionLabel="name"
                                        :placeholder="$t('common.select')"
                                    />
                                </td>
                                <td style="width: 12%">
                                    <InputField
                                        v-model="
                                            formData.child_available_until_condition
                                        "
                                        id="child_available_until_condition"
                                        variant="select"
                                        :options="dropdownListDates"
                                        optionLabel="name"
                                        :placeholder="$t('common.select')"
                                    />
                                </td>
                                <td style="width: 60%">
                                    <InputField
                                        v-model="
                                            formData.child_available_until_value
                                        "
                                        id="child_available_until_value"
                                        variant="select"
                                        :options="availableDatesList"
                                        optionLabel="name"
                                        :placeholder="
                                            $t(
                                                'plans.main_applicants_start_date'
                                            )
                                        "
                                        :tooltip="true"
                                        :tooltipLength="40"
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>
