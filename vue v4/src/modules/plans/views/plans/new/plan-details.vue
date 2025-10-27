<script setup>
import lodash from 'lodash';
import { onBeforeMount, ref, watch, inject } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useHelpers } from '@/composables';
import { useGlobalStore } from '@/stores';
import { usePlanStore } from '@/modules/plans/stores/Plan';
import { useClientStore } from '@/modules/clients/stores/Client';

import PeriodDatesForm from '@/modules/plans/components/plans/forms/PeriodDatesForm.vue';
import PlanDetailsForm from '@/modules/plans/components/plans/forms/PlanDetailsForm.vue';
import PolicyActionFrom from '@/modules/plans/components/plans/forms/PolicyActionFrom.vue';
import PolicyDefaultForm from '@/modules/plans/components/plans/forms/PolicyDefaultForm.vue';
import BundlesForm from '@/modules/plans/components/plans/forms/BundlesForm.vue';
import useEventsBus from '@/composables/event-bus';
import SyncPricesDialog from '@/modules/plans/components/shared/AttachBenefit/dialogs/SyncPricesDialog.vue';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const helpers = useHelpers();
const planStore = usePlanStore();
const clientStore = useClientStore();
const globalStore = useGlobalStore();

const chooseFromOption = ref({ name: t('common.template'), value: 'template' });
const plans = ref([]);
const allPlans = ref([]);
const clients = ref([]);
const businessUnits = ref([]);
const businessUnit = ref(null);
const selectedPlan = ref(null);
const selectedClient = ref(null);
const selectedBusinessUnit = ref(null);
const isLoadingBusinessUnit = ref(false);
const showUnsavedData = ref(false);
const selectFromExisting = ref(false);
const loadingPlans = ref(false);
const loadingAllPlans = ref(false);
const loadingClients = ref(false);
const loadingBusinessUnits = ref(false);
const loading = ref(false);
const busy = ref(false);

const parentBusinessUnit = ref(null);

const nonInsuranceProductChangeAction = ref(null);
const openSyncPricesDialog = ref(false);
const nonInsuranceProductActionType = ref('');
const originalNonInsuranceProduct = ref([]);

let formData = ref({
    name: {
        [useI18n().locale.value]: ''
    },
    bound: null,
    type: null,
    effective_date: null,
    end_date: null,
    user: {},
    minimum_age: null,
    maximum_age: null,
    enrolment_period: null,
    policy_term: null,
    is_cancellations: false,
    is_extensions: false,
    is_early_returns: false,
    is_opt_out: false,
    is_overlap: false,
    is_refundable: false,
    is_required_student_number: false,
    is_required_employee_number: false,
    status: 'draft',
    periods: [
        {
            id: null,
            name: '',
            start_date: null,
            end_date: null
        }
    ],
    enforce_start_date: false,
    enforce_end_date: false,
    cancellation_periods: [],
    extension_periods: [],
    early_return_periods: [],
    cancellation_type: {
        name: t('common.policy_action_type_open'),
        value: 'open'
    },
    early_return_type: {
        name: t('common.policy_action_type_open'),
        value: 'open'
    },
    extension_type: {
        name: t('common.policy_action_type_open'),
        value: 'open'
    },
    non_insurance_products: [],
    shouldIncludeNonInsuranceProducts: false
});

onBeforeMount(async () => {
    await getItem();
    if (formData.value?.non_insurance_products) {
        originalNonInsuranceProduct.value = [
            ...formData.value.non_insurance_products
        ];
    }
});

watch(selectedClient, () => {
    if (selectFromExisting.value) {
        getPlans();
        getBusinessUnits();
    }
});

watch(selectedBusinessUnit, () => {
    if (selectFromExisting.value) {
        selectedPlan.value = null;
        getPlans();
    }
});

watch(chooseFromOption, (value) => {
    selectedPlan.value = null;
});

const currentOptOutState = inject('currentOptOutState');

watch(
    () => formData.value.is_opt_out,
    (newValue) => {
        currentOptOutState.value = newValue;
    }
);

const fetchSelectedPlan = async () => {
    selectFromExisting.value = false;
    globalStore.showSuccess(
        t('notifications.existing_plan_data_imported_header'),
        t('notifications.existing_plan_data_imported_details', {
            item: selectedPlan.value?.name?.en
        })
    );
    await getItem();
};

const getItem = async () => {
    if (props.id == -1 && !selectedPlan.value?.id) {
        await getBusinessUnit();
        return;
    }
    loading.value = true;
    let planId = props.id;
    if (selectedPlan.value?.id) {
        planId = selectedPlan.value?.id;
    }
    const res = await planStore.getPlan(planId, {
        include:
            'authorized,periods,businessUnit,periods.cancellationPeriods,periods.extensionPeriods,periods.earlyReturnPeriods,nonInsuranceProducts',
        'aggregates[0][relation]': 'benefits',
        'aggregates[0][type]': 'count',
        'aggregates[1][relation]': 'benefitGroupBenefits',
        'aggregates[1][type]': 'count'
    });
    loading.value = false;

    const clonedData = lodash.cloneDeep(res.data);

    if (selectedPlan.value?.id) {
        if (clonedData.name) {
            Object.keys(clonedData.name).forEach((locale) => {
                clonedData.name[locale] = `${clonedData.name[locale]} ${t(
                    'common.copy'
                )}`;
            });
        }

        if (clonedData.bound) {
            clonedData.bound = clonedData.bound.value || clonedData.bound;
        }
        if (clonedData.type) {
            clonedData.type = clonedData.type.value || clonedData.type;
        }

        if (clonedData.periods) {
            clonedData.periods = clonedData.periods.map((period) => ({
                ...period,
                id: null,
                cancellation_periods:
                    period.cancellation_periods?.map((cp) => ({
                        ...cp,
                        id: null
                    })) || [],
                extension_periods:
                    period.extension_periods?.map((ep) => ({
                        ...ep,
                        id: null
                    })) || [],
                early_return_periods:
                    period.early_return_periods?.map((erp) => ({
                        ...erp,
                        id: null
                    })) || []
            }));
        }
    }
    planStore.setCurrentPlan(clonedData);
    formData.value = planStore.transferObject(clonedData);
    if (
        formData.value.non_insurance_products &&
        formData.value.non_insurance_products.length > 0
    ) {
        formData.value.shouldIncludeNonInsuranceProducts = true;
    }

    if (res.data?.business_unit) {
        businessUnit.value = res.data.business_unit;
        setParentBusinessUnit(res.data.business_unit?.id);
    }
};

const setParentBusinessUnit = async (businessUnitId) => {
    const businessUnitFromDB = await clientStore.getBusinessUnit(
        businessUnitId,
        {
            include: 'client'
        }
    );
    parentBusinessUnit.value = businessUnitFromDB.data;
};

const handleBack = () => {
    showUnsavedData.value = true;
};

const goBack = () => {
    useGlobalStore().clearErrors();
    if (planStore.currentPlan?.business_unit || businessUnit.value) {
        router.push({
            name: 'Business Unit Details',
            params: {
                clientId:
                    route.query.client_id ??
                    parentBusinessUnit.value.client?.id,
                id: planStore.currentPlan?.business_unit
                    ? planStore.currentPlan.business_unit.id
                    : businessUnit.value.id
            }
        });
    } else {
        router.push({ name: 'Plans' });
    }
};

const save = async () => {
    try {
        busy.value = true;
        props.id === '-1' ? await create() : await update();
    } finally {
        busy.value = false;
    }
};

const create = async () => {
    let periods = [];
    formData.value.periods.map((item) => {
        periods.push(item);
    });
    let cancellation_periods = [];
    if (formData.value.cancellation_type?.value === 'fixed') {
        formData.value.cancellation_periods.map((item) => {
            cancellation_periods.push({
                ...item,
                name: item.name?.value,
                plan_period_precedence: item.plan_period_precedence?.value,
                plan_period_date_reference:
                    item.plan_period_date_reference?.value
            });
        });
    }
    let extension_periods = [];
    if (formData.value.extension_type?.value === 'fixed') {
        formData.value.extension_periods.map((item) => {
            extension_periods.push({
                ...item,
                name: item.name?.value,
                plan_period_precedence: item.plan_period_precedence?.value,
                plan_period_date_reference:
                    item.plan_period_date_reference?.value
            });
        });
    }
    let early_return_periods = [];
    if (formData.value.early_return_type?.value === 'fixed') {
        formData.value.early_return_periods.map((item) => {
            early_return_periods.push({
                ...item,
                name: item.name?.value,
                plan_period_precedence: item.plan_period_precedence?.value,
                plan_period_date_reference:
                    item.plan_period_date_reference?.value
            });
        });
    }
    if (selectedPlan.value?.id) {
        formData.value.source_plan_id = selectedPlan.value.id;
    }
    let nonInsuranceProducts = [];
    if (formData.value.non_insurance_products.length > 0) {
        nonInsuranceProducts = formData.value.non_insurance_products.map(
            (m) => m.id
        );
    }
    const res = await planStore.createPlan({
        ...formData.value,
        bound: formData.value.bound?.value,
        type: formData.value.type?.value,
        maximum_age_type: formData.value.maximum_age_type?.id,
        minimum_age_type: formData.value.minimum_age_type?.id,
        enrolment_period_type: formData.value.enrolment_period_type?.id,
        policy_term_type: formData.value.policy_term_type?.id,
        authorized_by_id: formData.value.authorized?.id,
        effective_date:
            formData.value.effective_date !== 'Invalid date'
                ? formData.value.effective_date
                : null,
        end_date:
            formData.value.end_date !== 'Invalid date'
                ? formData.value.end_date
                : null,
        periods,
        cancellation_periods,
        extension_periods,
        early_return_periods,
        cancellation_type: formData.value.cancellation_type?.value,
        extension_type: formData.value.extension_type?.value,
        early_return_type: formData.value.early_return_type?.value,
        non_insurance_products: nonInsuranceProducts,
        business_unit_id: route.query.business_unit_id ?? null
    });
    goNext(res);
};

const update = async () => {
    formData.value.validateDates = false;
    const hasNonInsuranceProductChanges = checkForNonInsuranceProductChanges();
    const res = await planStore.updatePlan(
        props.id,
        planStore.transferPayload(formData.value, selectedPlan.value)
    );
    if (hasNonInsuranceProductChanges) {
        await handleNonInsuranceProductChangesInUpdate(res);
    } else {
        goNext(res);
    }
};

const handleNonInsuranceProductChanged = (event) => {
    nonInsuranceProductChangeAction.value = event.action;
};

const syncPricesDirectly = async (context = 'benefit') => {
    try {
        await planStore.syncPrices(props.id);
    } catch (error) {
        console.error('Error syncing prices:', error);
    }
};

const checkForNonInsuranceProductChanges = () => {
    if (
        !originalNonInsuranceProduct.value ||
        !formData.value.non_insurance_products
    ) {
        return false;
    }
    const originalIds = originalNonInsuranceProduct.value
        .map((m) => m.id)
        .sort();
    const currentIds = formData.value.non_insurance_products
        .map((m) => m.id)
        .sort();
    if (originalIds.length !== currentIds.length) {
        return true;
    }
    for (let i = 0; i < originalIds.length; i++) {
        if (originalIds[i] !== currentIds[i]) {
            return true;
        }
    }
    return false;
};

const handleNonInsuranceProductChangesInUpdate = async (res) => {
    planStore.setCurrentPlan(res.data);
    const originalIds = originalNonInsuranceProduct.value.map((m) => m.id);
    const currentIds = formData.value.non_insurance_products.map((m) => m.id);
    nonInsuranceProductActionType.value =
        currentIds.length > originalIds.length
            ? 'added'
            : currentIds.length < originalIds.length
              ? 'removed'
              : 'changed';
    try {
        const prices = await planStore.searchPlanPrices(props.id, {}, {});
        if (prices.data?.length > 0) {
            openSyncPricesDialog.value = true;
        } else {
            await syncPricesDirectly('nonInsuranceProduct');
            goNext(res);
        }
    } catch (error) {
        console.error('Error processing non-insurance-product changes:', error);
        goNext(res);
    }
};

const handleSyncDialogClose = async () => {
    openSyncPricesDialog.value = false;
    nonInsuranceProductActionType.value = '';
    await router.push({
        name: 'New Plan Step 2',
        params: { id: props.id }
    });
};

const goNext = (res) => {
    planStore.setCurrentPlan(res.data);
    if (
        nonInsuranceProductChangeAction.value &&
        nonInsuranceProductChangeAction.value !== 'disabled' &&
        props.id === '-1'
    ) {
        const { emit } = useEventsBus();
        emit('openSyncPricesDialog', nonInsuranceProductChangeAction.value);
    }
    router.push({
        name: 'New Plan Step 2',
        params: { id: res.data.id }
    });
};

const getPlans = async (search) => {
    try {
        loadingPlans.value = true;

        let businessUnitIds = [];
        if (selectedBusinessUnit.value) {
            businessUnitIds.push(selectedBusinessUnit.value.id);
        } else {
            let businessUnitsOfSelectedClient =
                await clientStore.searchBusinessUnits({
                    filters: [
                        {
                            field: 'client.id',
                            value: selectedClient?.value?.id
                        }
                    ]
                });
            businessUnitIds.push(
                ...businessUnitsOfSelectedClient.data.map((item) => item.id)
            );
        }

        const res = await planStore.searchPlanByBusinessUnitUuids({
            business_unit_ids: businessUnitIds,
            search
        });
        plans.value = res.data;
    } finally {
        loadingPlans.value = false;
    }
};
const getAllPlans = async (search) => {
    try {
        loadingAllPlans.value = true;

        const res = await planStore.searchPlans(
            {
                search: {
                    value: search
                },
                filters: [
                    {
                        field: 'business_unit_id',
                        value: null
                    }
                ]
            },
            { limit: 100 }
        );
        allPlans.value = res.data;
    } finally {
        loadingAllPlans.value = false;
    }
};

const getClients = async (search) => {
    try {
        loadingClients.value = true;
        const res = await clientStore.searchClients(
            {
                search: {
                    value: search
                }
            },
            { limit: 100 }
        );
        clients.value = res.data;
    } finally {
        loadingClients.value = false;
    }
};

const getBusinessUnits = async (search) => {
    try {
        loadingBusinessUnits.value = true;
        const res = await clientStore.searchBusinessUnits(
            {
                search: {
                    value: search
                },
                filters: [
                    {
                        field: 'client.id',
                        value: selectedClient?.value?.id
                    }
                ]
            },
            { limit: 100 }
        );
        businessUnits.value = res.data;
    } finally {
        loadingBusinessUnits.value = false;
    }
};

const openSelectFromExisting = function () {
    selectFromExisting.value = true;
    getClients();
    getAllPlans();
};

const closeSelectFromExisting = function () {
    selectFromExisting.value = false;
    plans.value = [];
    clients.value = [];
    selectedClient.value = null;
    selectedPlan.value = null;
    selectedBusinessUnit.value = null;
};

const getBusinessUnit = async () => {
    if (!route.query.business_unit_id) {
        return;
    }
    try {
        isLoadingBusinessUnit.value = true;
        const res = await clientStore.getBusinessUnit(
            route.query.business_unit_id ?? null
        );
        businessUnit.value = res.data;
    } catch (error) {
        //
    } finally {
        isLoadingBusinessUnit.value = false;
    }
};

const chooseFromOptions = [
    { name: t('common.template'), value: 'template' },
    { name: t('clients.title'), value: 'clients' }
];
</script>

<template>
    <Loader v-if="loading" />
    <div v-else>
        <div class="grid grid-cols-12 gap-4 mt-12">
            <div class="col-span-7 col-start-2">
                <Card class="mb-4">
                    <template #content>
                        <div class="flex justify-between edit-cancel-button">
                            <h5 data-testid="plan-details-title" class="mb-4">
                                {{ $t('plans.plan_details') }}
                            </h5>
                            <Button
                                v-if="props.id === '-1'"
                                :label="t('common.select_from_existing')"
                                class="p-button-outlined mr-2 w-fit"
                                icon="pi pi-folder"
                                @click="openSelectFromExisting"
                                data-testid="select-from-existing-button"
                            />
                        </div>
                        <PlanDetailsForm is-new v-model="formData" />
                    </template>
                </Card>
                <Card class="mb-4">
                    <template #content>
                        <h5 data-testid="set-period-dates-title" class="mb-4">
                            {{ $t('plans.set_enrolment_period_dates') }}
                            <i
                                v-tooltip="
                                    `lorem ipsum lorem ipsum lorem ipsum`
                                "
                                class="pi pi-info-circle"
                            ></i>
                        </h5>
                        <PeriodDatesForm is-new v-model="formData" />
                    </template>
                </Card>
                <Card class="mb-4">
                    <template #content>
                        <h5 data-testid="set-policy-actions-title" class="mb-8">
                            {{ $t('plans.set_policy_actions') }}
                        </h5>
                        <PolicyActionFrom is-new v-model="formData" />
                    </template>
                </Card>
                <Card class="mb-4">
                    <template #content>
                        <h5
                            data-testid="bundle-non-insurance-product-title"
                            class="mb-8"
                        >
                            {{ $t('plans.bundles') }}
                        </h5>
                        <BundlesForm
                            is-new
                            v-model="formData"
                            @nonInsuranceProductChanged="
                                handleNonInsuranceProductChanged
                            "
                        />
                    </template>
                </Card>
                <Card class="mb-4">
                    <template #content>
                        <h5 data-testid="policy-defaults-title" class="mb-8">
                            {{ $t('plans.policy_defaults') }}
                        </h5>
                        <PolicyDefaultForm is-new v-model="formData" />
                    </template>
                </Card>
            </div>
            <div class="col-span-3">
                <Card data-testid="main-default-plan-card">
                    <template #content>
                        <h5>
                            {{ helpers.getLocaleValue(businessUnit?.name) }}
                        </h5>
                        <p>
                            This is a main default plan that will be the base
                            plan for any associated plans.
                        </p>
                    </template>
                </Card>
            </div>
        </div>

        <div class="grid grid-cols-12 my-20">
            <div class="col-span-12">
                <div
                    class="mt-12 flex justify-between items-center edit-cancel-button"
                >
                    <Button
                        label="Cancel"
                        class="p-button-outlined"
                        @click="handleBack"
                        data-testid="cancel-button"
                    />
                    <Button
                        label="Save & Continue"
                        :loading="busy"
                        @click="save"
                        data-testid="save-continue-button"
                    />
                </div>
            </div>
        </div>

        <SyncPricesDialog
            v-if="openSyncPricesDialog"
            :openDialog="openSyncPricesDialog"
            :id="props.id"
            :store="planStore"
            :action="nonInsuranceProductActionType"
            context="nonInsuranceProduct"
            @closeDialog="handleSyncDialogClose"
        />

        <Confirmation
            v-if="showUnsavedData"
            v-model="showUnsavedData"
            :header="$t('common.cancel_creation_header', { item: 'Plan' })"
            :content="$t('common.cancel_creation_content')"
            :confirm-button-text="$t('buttons.cancel')"
            :cancel-button-text="$t('buttons.close')"
            confirm-button-class="bg-red-500 border-red-500"
            @confirm="goBack"
        />

        <Dialog
            v-if="selectFromExisting"
            v-model:visible="selectFromExisting"
            modal
            :header="$t('plans.select_from_existing_plans')"
            :style="{ width: '480px' }"
        >
            <div>{{ $t('plans.select_from_existing_plans_body') }}</div>
            <div class="mt-4 custom-select-button-md">
                <InputField
                    variant="selectButton"
                    id="choose_from_option"
                    v-model="chooseFromOption"
                    :options="chooseFromOptions"
                    optionLabel="name"
                    aria-labelledby="basic"
                    data-testid="choose-from-option"
                />
            </div>
            <div
                class="grid grid-cols-12 gap-4"
                v-if="chooseFromOption?.value === 'template'"
            >
                <div class="col-span-12">
                    <label for="template" class="mr-12 mt-8 mb-4"
                        >{{ $t('common.template') }}
                    </label>
                    <ApiDropdown
                        id="template"
                        localed
                        option-label="name"
                        v-model="selectedPlan"
                        @search="getAllPlans"
                        :loading="loadingAllPlans"
                        :items="allPlans"
                        data-testid="template"
                        class="w-full"
                    />
                </div>
            </div>
            <div
                class="grid grid-cols-12 mt-8 mb-4 gap-4"
                v-if="chooseFromOption?.value === 'clients'"
            >
                <div class="col-span-12 mb-8">
                    <label for="client" class="mb-4"
                        >{{ $t('common.client') }}
                    </label>
                    <ApiDropdown
                        id="client"
                        localed
                        option-label="name"
                        v-model="selectedClient"
                        @search="getClients"
                        :loading="loadingClients"
                        :items="clients"
                        data-testid="client"
                        class="w-full"
                    />
                </div>
                <div class="col-span-6" v-show="selectedClient">
                    <label for="plan" class="mb-4"
                        >{{ $t('common.plan') }}
                    </label>
                    <ApiDropdown
                        id="plan"
                        localed
                        option-label="name"
                        v-model="selectedPlan"
                        @search="getPlans"
                        :loading="loadingPlans || loadingBusinessUnits"
                        :items="plans"
                        data-testid="plan"
                        class="w-full"
                    />
                </div>
                <div class="col-span-6" v-show="selectedClient">
                    <label for="business_unit" class="mb-4"
                        >{{ $t('common.business_unit') }}
                    </label>
                    <ApiDropdown
                        id="business_unit"
                        localed
                        option-label="name"
                        v-model="selectedBusinessUnit"
                        @search="getBusinessUnits"
                        :loading="loadingBusinessUnits"
                        :items="businessUnits"
                        data-testid="business-unit"
                        class="w-full"
                    />
                </div>
            </div>
            <div class="flex justify-end gap-2 mt-20 edit-cancel-button">
                <Button
                    type="button"
                    :label="$t('buttons.cancel')"
                    class="p-button-outlined"
                    text
                    @click="closeSelectFromExisting"
                    data-testid="cancel-button"
                ></Button>
                <Button
                    type="button"
                    :disabled="!selectedPlan"
                    :label="$t('buttons.confirm')"
                    @click="fetchSelectedPlan"
                    data-testid="confirm-button"
                ></Button>
            </div>
        </Dialog>
    </div>
</template>
