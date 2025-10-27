<script setup>
import { ref, computed, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { useHelpers } from '@/composables';
import { PaginationOptions, SortFilterOptions, planCategories } from '@/config';
import { useSmartTemplate } from '@/modules/policies/composables/smartTemplate.js';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';

import { useCommonStore } from '@/stores';
import { usePlanStore } from '@/modules/plans/stores/Plan';
import { usePoliciesStore } from '@/modules/policies/stores/Policies';
import { PolicyModulePermission } from '@/config';

import EnrollmentSidebar from '@/modules/policies/components/order/EnrollmentSidebar.vue';
import EnrollmentMessage from '@/modules/policies/components/order/EnrollmentMessage.vue';
import {
    useCartsStore,
    useOrdersStore
} from '@/modules/policies/stores/index.js';

const router = useRouter();
const commonStore = useCommonStore();
const planStore = usePlanStore();
const policiesStore = usePoliciesStore();
const cartStore = useCartsStore();
const orderStore = useOrdersStore();
const helpers = useHelpers();
const { checkoutTime } = useSmartTemplate();
const { t } = useI18n();
const toast = useToast();

const props = defineProps({
    readOnly: {
        type: Boolean,
        default: false
    },
    order: {
        type: Object,
        default: null
    }
});

const sortFilters = new SortFilterOptions();

const activeTab = ref(0);
const isLoading = ref(false);
const searchText = ref(null);
const availableCountries = ref([]);
const planGroups = ref([]);
const selectedEnrollmentGroups = ref([]);
const selectedEnrollments = ref([]);
const selectedEnrollment = ref(null);
const selectedPlan = ref(null);
const expandedRows = ref(null);
const openEnrollmentSidebar = ref(false);
const plans = ref([]);
const policyTypes = ref([]);
const sendWelcomeEmail = ref(false);
const showSelectedApplicantsDeleteConfirmation = ref(false);
const showChangePlanDialog = ref(false);
const menu = ref();
const menuItems = ref([
    {
        label: t('policies.review.bulk_action_change_plan'),
        command: () => changePlan()
    },
    {
        label: t('policies.review.bulk_action_delete_applicants'),
        command: () => deleteSelectedApplicants()
    }
]);

const tabs = computed(() => {
    const hasPlans = planGroups.value.some((p) => p.type === 'plan');
    const hasAssociatedPlans = planGroups.value.some(
        (p) => p.type === 'associated_plan'
    );

    return [
        {
            title: t('policies.summary.show_all'),
            disabled: planGroups.value.length === 0
        },
        { title: t('policies.summary.plans'), disabled: !hasPlans },
        {
            title: t('policies.summary.associated_plans'),
            disabled: !hasAssociatedPlans
        }
    ];
});

const isCheckoutButtonDisabled = computed(
    () => !planGroups.value.length || enrollmentsWithErrorsCount.value
);

const totalEnrollmentRecords = computed(() => {
    return planGroups.value.reduce(
        (sum, plan) => sum + plan.total_enrollments,
        0
    );
});

const enrollmentTypeCounts = computed(() => {
    return planGroups.value.reduce((acc, plan) => {
        Object.entries(plan.enrollment_types).forEach(([type, count]) => {
            acc[type] = (acc[type] || 0) + count;
        });
        return acc;
    }, {});
});

const enrollmentsWithErrorsCount = computed(() =>
    planGroups.value.reduce(
        (sum, plan) => sum + plan.enrollments_with_errors,
        0
    )
);

const duplicateApplicantsCount = computed(() =>
    planGroups.value.reduce((sum, plan) => sum + plan.duplicate_enrollments, 0)
);

const applicantsWithoutEmailAddressCount = computed(() =>
    planGroups.value.reduce(
        (sum, plan) => sum + plan.enrollments_without_email,
        0
    )
);

const totalAmount = computed(() => {
    return planGroups.value.reduce(
        (sum, plan) => sum + plan?.sale_price_total,
        0
    );
});

const associatedPlans = computed(() => {
    return plans.value.reduce((acc, plan) => {
        if (plan.associated_plans) {
            acc.push(...plan.associated_plans);
        }
        return acc;
    }, []);
});

const filteredPlanGroups = computed(() => {
    if (activeTab.value === 0) {
        return planGroups.value;
    } else if (activeTab.value === 1) {
        return planGroups.value.filter((plan) => plan.type === 'plan');
    } else if (activeTab.value === 2) {
        return planGroups.value.filter(
            (plan) => plan.type === 'associated_plan'
        );
    }
    return [];
});

const getLocalizedPlanName = (plan) => helpers.getLocaleValue(plan.name);

const getPlanNameById = (planId) => {
    const plan = plans.value.find((plan) => plan.id == planId);
    return getLocalizedPlanName(plan);
};

const getAssociatedPlanNameById = (associatedPlanId) => {
    const associatedPlan = associatedPlans.value.find(
        (plan) => plan.id == associatedPlanId
    );
    return planCategories[associatedPlan.category];
};

const proceedToCheckout = async (event) => {
    await confirmCart();

    router.push({
        name: 'Success'
    });
};
const proceedToPayment = (event) => {
    router.push({
        name: 'Payment'
    });
};
const fixErrors = (event) => {
    router.push({
        name: 'Review'
    });
};
const addMoreApplicants = (event) => {
    selectedEnrollment.value = null;
    openEnrollmentSidebar.value = true;
};
const search = async () => {
    expandedRows.value = null;
    planGroups.value.forEach((plan) => {
        if (plan.pagination) {
            plan.pagination.resetPageParams();
        }
    });
};

const showMenu = (event) => {
    menu.value.toggle(event);
};
const deleteSelectedApplicants = (event) => {
    showSelectedApplicantsDeleteConfirmation.value = true;
};

const changePlan = (event) => {
    showChangePlanDialog.value = true;
};

const loadEnrollmentsForPlan = async (plan, isAssociate = false) => {
    plan.enrollments = props.order
        ? await getOrderEnrollments(plan, isAssociate)
        : await getEnrollments(plan, isAssociate);
};

const onRowExpand = async (event) => {
    expandedRows.value = [event.data];

    const plan = event.data;
    plan.loadingEnrollments = true;

    await loadEnrollmentsForPlan(plan, plan.type === 'associated_plan');

    plan.loadingEnrollments = false;
};

const onRowCollapse = (event) => {
    const plan = event.data;
    plan.enrollments = [];

    expandedRows.value = [];
};

const filterSelectedEnrollments = () => {
    const plansToProcess = new Set(
        selectedEnrollmentGroups.value.map((group) => group.planId)
    );

    return selectedEnrollments.value
        .filter((enrollment) => !plansToProcess.has(enrollment.plan_id))
        .map((enrollment) => enrollment.id);
};

const deleteSelectedEnrollments = async () => {
    try {
        await Promise.all(
            selectedEnrollmentGroups.value.map((group) =>
                policiesStore.deleteEnrollmentByPlan(group.planId)
            )
        );

        const enrollmentsToDelete = filterSelectedEnrollments();
        if (enrollmentsToDelete.length) {
            await policiesStore.deleteEnrollments(enrollmentsToDelete);
        }

        toast.add({
            severity: 'success',
            summary: t('policies.review.success'),
            detail: t('policies.review.applicants_deleted_message'),
            life: 2000
        });
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: t('policies.review.error'),
            detail: t('policies.review.applicants_deletion_failed'),
            life: 2000
        });
    } finally {
        loadOverview();
        selectedEnrollmentGroups.value = [];
        selectedEnrollments.value = [];
        isLoading.value = false;
    }
};

const confirmSelectedApplicantDeletion = (event) => {
    deleteSelectedEnrollments();
    showSelectedApplicantsDeleteConfirmation.value = false;
};

const confirmNewPlan = async (event) => {
    try {
        await Promise.all(
            selectedEnrollmentGroups.value.map((group) =>
                policiesStore.replaceEnrollmentsPlan(
                    group.planId,
                    selectedPlan.value
                )
            )
        );

        const enrollmentsToUpdate = new Set(filterSelectedEnrollments());
        await Promise.all(
            selectedEnrollments.value
                .filter((enrollment) => enrollmentsToUpdate.has(enrollment.id))
                .map((enrollment) =>
                    policiesStore.updateEnrollment(enrollment.id, {
                        ...enrollment,
                        plan_id: selectedPlan.value
                    })
                )
        );

        toast.add({
            severity: 'success',
            summary: t('policies.review.success'),
            detail: t('policies.review.applicants_plan_updated_message'),
            life: 2000
        });
    } catch (error) {
    } finally {
        loadOverview();
        selectedEnrollmentGroups.value = [];
        selectedEnrollments.value = [];
        showChangePlanDialog.value = false;
        selectedPlan.value = null;
    }
};

const getAllCountries = async (search) => {
    const res = await commonStore.searchCountries({});
    availableCountries.value = res.data;
};

const getPlans = async () => {
    try {
        isLoading.value = true;
        const res = await planStore.searchPlanByBusinessUnitUuids(
            {
                business_unit_ids: [policiesStore.businessUnit.id]
            },
            { onlyActive: true }
        );
        plans.value = res.data;
    } finally {
        isLoading.value = false;
    }
};

const getEnrollmentTypes = async (search) => {
    try {
        const res = await policiesStore.searchEnrollmentTypes({
            search: {
                value: search
            },
            filters: [
                {
                    field: 'status',
                    value: 'active'
                }
            ]
        });
        policyTypes.value = res.data;
    } finally {
    }

    return policyTypes.value;
};

const getEnrollments = async (plan = null, isAssociate = false) => {
    try {
        sortFilters.resetSortFilters();

        if (searchText.value) {
            sortFilters.updateSearch(searchText.value);
        }

        var params = {};
        if (plan) {
            sortFilters.updateFilters('associated_plan_id', null);
            if (isAssociate) {
                sortFilters.updateFilters('associated_plan_id', plan?.planId);
            } else {
                sortFilters.updateFilters('plan_id', plan?.planId);
            }
            params = plan.pagination.getPageParams();
        }

        const payload = sortFilters.getSortFilters();
        if (!searchText.value) {
            delete payload.search;
        }

        const res = await policiesStore.searchEnrollments(payload, params);
        return res.data;
    } finally {
    }
};

const getOrderEnrollments = async (plan = null, isAssociate = false) => {
    try {
        sortFilters.resetSortFilters();

        if (searchText.value) {
            sortFilters.updateSearch(searchText.value);
        }

        var params = {};
        if (plan) {
            sortFilters.updateFilters('associated_plan_id', null);
            if (isAssociate) {
                sortFilters.updateFilters('associated_plan_id', plan?.planId);
            } else {
                sortFilters.updateFilters('plan_id', plan?.planId);
            }
            params = plan.pagination.getPageParams();
        }

        const payload = sortFilters.getSortFilters();
        if (!searchText.value) {
            delete payload.search;
        }

        const res = await orderStore.searchEnrollments(
            props.order.client.id,
            props.order.id,
            payload,
            params
        );
        return res.data;
    } finally {
    }
};

const getCartOverview = async () => {
    return await policiesStore.getCartOverview();
};

const getOrderOverview = async () => {
    if (!props.order) return;

    return await orderStore.getOverview(props.order.client.id, props.order.id);
};

const mapPlanData = (entries, type) => {
    return Object.entries(entries).map(([planId, data]) => ({
        planId,
        type,
        ...data,
        enrollments: [],
        pagination: new PaginationOptions(),
        enrollment_types: {
            ...data.enrollment_types
        },
        loadingEnrollments: false
    }));
};

const loadOverview = async () => {
    expandedRows.value = [];
    const res = props.order
        ? await getOrderOverview()
        : await getCartOverview();

    const { plans = {}, associated_plans = {} } = res.data;

    planGroups.value = [
        ...mapPlanData(plans, 'plan'),
        ...mapPlanData(associated_plans, 'associated_plan')
    ];
};

const confirmCart = async () => {
    try {
        const billingDetails = await cartStore.getCheckout();
        const res = await cartStore.processCheckout({
            payment_type: billingDetails.data.payment_type
        });

        policiesStore.setOrder(res.data);
    } finally {
    }
};

const closeEnrollmentSidebar = (event) => {
    openEnrollmentSidebar.value = false;
};

const enrollmentRowClicked = ({ data }) => {
    if (props.readOnly) {
        return;
    }

    selectedEnrollment.value = data;
    openEnrollmentSidebar.value = true;
};

const onPageChange = async (event, plan) => {
    plan.pagination.updatePageParams(event);

    plan.loadingEnrollments = true;

    await loadEnrollmentsForPlan(plan);

    plan.loadingEnrollments = false;
};

const getNameById = (dataSource, id) => {
    const item = dataSource.find((entry) => entry.id === id);
    return item ? item.name : null;
};

const isEnrollmentSelected = (enrollment) => {
    return selectedEnrollments.value.includes(enrollment);
};

const checkEnrollment = (enrollment, value) => {
    if (value === true) {
        selectedEnrollments.value.push(enrollment);
    } else {
        const enrollmentIndex = selectedEnrollments.value.indexOf(enrollment);
        if (enrollmentIndex !== -1)
            selectedEnrollments.value.splice(enrollmentIndex, 1);
    }
};

const toggleEnrollment = (enrollment) => {
    const isSelected = isEnrollmentSelected(enrollment);
    checkEnrollment(enrollment, !isSelected);
};

onBeforeMount(async () => {
    isLoading.value = true;
    await getAllCountries();
    await getPlans();
    await getEnrollmentTypes();
    await loadOverview();
    isLoading.value = false;
});
</script>

<template>
    <div class="mt-6">
        <div>
            <div
                class="font-semibold text-xl"
                data-testid="summary-screen-title"
            >
                {{
                    $t(
                        `policies.summary.${props.order ? 'title_order' : 'title'}`
                    )
                }}
            </div>
        </div>

        <div class="mt-4 grid">
            <div class="col-9 pt-0">
                <Card>
                    <template #content>
                        <EnrollmentMessage
                            v-if="!props.readOnly"
                            type="warning"
                            icon="pi-exclamation-triangle"
                        >
                            <span class="text-sm">
                                {{
                                    $t('policies.summary.applicant_data_check')
                                }}
                            </span>
                        </EnrollmentMessage>
                        <TabView v-model:activeIndex="activeTab" lazy>
                            <TabPanel
                                v-for="tab in tabs"
                                :key="tab.title"
                                :header="tab.title"
                                :disabled="tab.disabled"
                            >
                                <BaseTable
                                    v-model:selection="selectedEnrollmentGroups"
                                    class="plan-enrollments-table border-radius-n-box-shadow mt-0"
                                    dataKey="planId"
                                    v-model:expandedRows="expandedRows"
                                    :value="filteredPlanGroups"
                                    :loading="isLoading"
                                    @row-expand="onRowExpand"
                                    @row-collapse="onRowCollapse"
                                >
                                    <template #header>
                                        <div class="p-1">
                                            <div
                                                class="flex justify-content-between align-items-center"
                                                v-if="
                                                    duplicateApplicantsCount ||
                                                    enrollmentsWithErrorsCount
                                                "
                                            >
                                                <div
                                                    class="flex font-weight-bold text-error"
                                                >
                                                    <i
                                                        color="#B30000"
                                                        class="mr-2 pi pi-exclamation-triangle"
                                                    ></i>
                                                    <span
                                                        v-if="
                                                            duplicateApplicantsCount
                                                        "
                                                        data-testid="duplicate-applicants-count"
                                                    >
                                                        {{
                                                            $t(
                                                                'policies.summary.duplicate_found',
                                                                {
                                                                    count: duplicateApplicantsCount
                                                                }
                                                            )
                                                        }}
                                                    </span>

                                                    <span
                                                        class="px-2"
                                                        v-if="
                                                            duplicateApplicantsCount &&
                                                            enrollmentsWithErrorsCount
                                                        "
                                                        >&#x2022;</span
                                                    >

                                                    <span
                                                        v-if="
                                                            enrollmentsWithErrorsCount
                                                        "
                                                        data-testid="enrollments-with-errors-count"
                                                    >
                                                        {{
                                                            $t(
                                                                'policies.summary.error_to_be_fixed',
                                                                {
                                                                    count: enrollmentsWithErrorsCount
                                                                }
                                                            )
                                                        }}
                                                    </span>
                                                </div>
                                                <Button
                                                    v-if="
                                                        $ability.can(
                                                            PolicyModulePermission
                                                                .POLICIES.CREATE
                                                        )
                                                    "
                                                    data-testid="fix-errors-button"
                                                    type="button"
                                                    label="Fix Errors"
                                                    severity="danger"
                                                    icon="pi pi-chevron-right"
                                                    iconPos="right"
                                                    @click="fixErrors"
                                                ></Button>
                                            </div>

                                            <Divider
                                                v-if="
                                                    duplicateApplicantsCount ||
                                                    enrollmentsWithErrorsCount
                                                "
                                            />

                                            <div>
                                                <div
                                                    class="flex flex-wrap align-items-center justify-content-between"
                                                >
                                                    <div
                                                        class="flex gap-3"
                                                        v-if="!props.readOnly"
                                                    >
                                                        <div>
                                                            <Button
                                                                data-testid="bulk-actions-button"
                                                                :label="
                                                                    $t(
                                                                        'policies.summary.bulk_actions_button_label'
                                                                    )
                                                                "
                                                                icon="pi pi-chevron-down"
                                                                class="p-button-outlined"
                                                                iconPos="right"
                                                                :disabled="
                                                                    !selectedEnrollments.length &&
                                                                    !selectedEnrollmentGroups.length
                                                                "
                                                                @click="
                                                                    showMenu
                                                                "
                                                            />
                                                            <Menu
                                                                ref="menu"
                                                                id="overlay_menu"
                                                                :model="
                                                                    menuItems
                                                                "
                                                                :popup="true"
                                                            />
                                                        </div>
                                                        <Button
                                                            v-if="
                                                                $ability.can(
                                                                    PolicyModulePermission
                                                                        .POLICIES
                                                                        .CREATE
                                                                )
                                                            "
                                                            data-testid="add-more-applicants-button"
                                                            :label="
                                                                $t(
                                                                    'policies.summary.add_more_applicants_button_label'
                                                                )
                                                            "
                                                            class="p-button-outlined"
                                                            icon="pi pi-plus"
                                                            @click="
                                                                addMoreApplicants
                                                            "
                                                        />
                                                    </div>
                                                    <div></div>
                                                    <Search
                                                        v-model="searchText"
                                                        @search="search"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </template>
                                    <template #empty>
                                        <p>
                                            {{
                                                $t(
                                                    'policies.summary.no_applicants_added'
                                                )
                                            }}
                                        </p>
                                    </template>
                                    <template #loading>
                                        {{
                                            $t(
                                                'policies.summary.loading_applicants'
                                            )
                                        }}
                                    </template>
                                    <Column expander style="width: 5rem" />
                                    <Column
                                        v-if="!props.readOnly"
                                        selectionMode="multiple"
                                        headerStyle="width: 3rem"
                                        :pt="{
                                            checkboxWrapper: {
                                                onClick(e) {
                                                    e.stopPropagation();
                                                }
                                            },
                                            headerCheckbox: {
                                                'data-testid':
                                                    'plan-checkbox-select-all'
                                            }
                                        }"
                                    >
                                        <template #body="slotProps">
                                            <Checkbox
                                                :data-testid="`plan-checkbox-${slotProps.index}`"
                                                v-model="
                                                    selectedEnrollmentGroups
                                                "
                                                :value="slotProps.data"
                                                @click.stop
                                            />
                                        </template>
                                    </Column>
                                    <Column
                                        field="plan_name"
                                        :header="
                                            $t(
                                                'policies.summary.plan_or_associated_plan'
                                            )
                                        "
                                    >
                                        <template #body="{ data, index }">
                                            <span
                                                :data-testid="
                                                    'plan-data-table-' + index
                                                "
                                            >
                                                {{
                                                    data.type == 'plan'
                                                        ? getPlanNameById(
                                                              data.planId
                                                          )
                                                        : getAssociatedPlanNameById(
                                                              data.planId
                                                          )
                                                }}
                                            </span>
                                        </template>
                                    </Column>
                                    <Column
                                        field="total_enrollments"
                                        :header="
                                            $t('policies.summary.applicants')
                                        "
                                    >
                                    </Column>
                                    <Column
                                        v-for="(
                                            count, type
                                        ) in enrollmentTypeCounts"
                                        :key="type"
                                        :field="`enrollment_types.${type}`"
                                        :header="getNameById(policyTypes, type)"
                                    ></Column>
                                    <Column field="amount" header="Amount">
                                        <template #body="{ data, index }">
                                            <span
                                                :data-testid="
                                                    'amount-data-table-' + index
                                                "
                                            >
                                                {{
                                                    helpers.moneyFormat(
                                                        data.sale_price_total
                                                    )
                                                }}
                                            </span>
                                        </template>
                                    </Column>
                                    <template #expansion="slotProps">
                                        <BaseTable
                                            lazy
                                            v-model:selection="
                                                selectedEnrollments
                                            "
                                            :value="slotProps.data.enrollments"
                                            :loading="
                                                slotProps.data
                                                    .loadingEnrollments
                                            "
                                            :page="
                                                slotProps.data.pagination.page
                                            "
                                            :rows="
                                                slotProps.data.pagination.limit
                                            "
                                            :total-records="
                                                slotProps.data.total_enrollments
                                            "
                                            @row-click="enrollmentRowClicked"
                                            @page="
                                                (event) =>
                                                    onPageChange(
                                                        event,
                                                        slotProps.data
                                                    )
                                            "
                                            data-testid="enrollments-table"
                                        >
                                            <template #empty>
                                                <p>
                                                    {{
                                                        $t(
                                                            searchText
                                                                ? 'policies.summary.no_applicants_found_for_search'
                                                                : 'policies.summary.no_applicants_added'
                                                        )
                                                    }}
                                                </p>
                                            </template>
                                            <template #loading>
                                                {{
                                                    $t(
                                                        'policies.summary.loading_applicants'
                                                    )
                                                }}
                                            </template>
                                            <Column style="width: 5rem" />
                                            <Column
                                                v-if="!props.readOnly"
                                                headerStyle="width: 3rem"
                                                :pt="{
                                                    checkboxWrapper: {
                                                        onClick(e) {
                                                            e.stopPropagation();
                                                        }
                                                    }
                                                }"
                                            >
                                                <template #body="slotProps">
                                                    <Checkbox
                                                        :data-testid="`enrollment-checkbox-${slotProps.index}`"
                                                        :binary="true"
                                                        :modelValue="
                                                            isEnrollmentSelected(
                                                                slotProps.data
                                                            )
                                                        "
                                                        @change="
                                                            toggleEnrollment(
                                                                slotProps.data
                                                            )
                                                        "
                                                        @click.stop
                                                    />
                                                </template>
                                            </Column>
                                            <Column
                                                field="applicant_type_id"
                                                :header="
                                                    $t(
                                                        'policies.applicant.type'
                                                    )
                                                "
                                            >
                                                <template
                                                    #body="{ data, index }"
                                                >
                                                    <span
                                                        :data-testid="
                                                            'type-data-table-' +
                                                            index
                                                        "
                                                    >
                                                        {{
                                                            getNameById(
                                                                policyTypes,
                                                                data.applicant_type_id
                                                            )
                                                        }}
                                                    </span>
                                                </template>
                                            </Column>
                                            <Column
                                                field="first_name"
                                                :header="
                                                    $t(
                                                        'policies.applicant.first_name'
                                                    )
                                                "
                                            >
                                                <template
                                                    #body="{ data, index }"
                                                >
                                                    <span
                                                        :data-testid="
                                                            'first-name-data-table-' +
                                                            index
                                                        "
                                                    >
                                                        {{ data.first_name }}
                                                    </span>
                                                </template>
                                            </Column>
                                            <Column
                                                field="last_name"
                                                :header="
                                                    $t(
                                                        'policies.applicant.last_name'
                                                    )
                                                "
                                            >
                                                <template
                                                    #body="{ data, index }"
                                                >
                                                    <span
                                                        :data-testid="
                                                            'last-name-data-table-' +
                                                            index
                                                        "
                                                    >
                                                        {{ data.last_name }}
                                                    </span>
                                                </template>
                                            </Column>
                                            <Column
                                                field="date_of_birth"
                                                :header="
                                                    $t(
                                                        'policies.applicant.date_of_birth'
                                                    )
                                                "
                                            >
                                                <template
                                                    #body="{ data, index }"
                                                >
                                                    <span
                                                        :data-testid="
                                                            'date-of-birth-data-table-' +
                                                            index
                                                        "
                                                    >
                                                        {{
                                                            helpers.formatDate(
                                                                data.date_of_birth
                                                            )
                                                        }}
                                                    </span>
                                                </template>
                                            </Column>
                                            <Column
                                                field="start_date"
                                                :header="
                                                    $t(
                                                        'policies.applicant.trip_start_date'
                                                    )
                                                "
                                            >
                                                <template
                                                    #body="{ data, index }"
                                                >
                                                    <span
                                                        :data-testid="
                                                            'trip-start-date-data-table-' +
                                                            index
                                                        "
                                                    >
                                                        {{
                                                            helpers.formatDate(
                                                                data.start_date
                                                            )
                                                        }}
                                                    </span>
                                                </template>
                                            </Column>
                                            <Column
                                                field="end_date"
                                                :header="
                                                    $t(
                                                        'policies.applicant.trip_end_date'
                                                    )
                                                "
                                            >
                                                <template
                                                    #body="{ data, index }"
                                                >
                                                    <span
                                                        :data-testid="
                                                            'trip-end-date-data-table-' +
                                                            index
                                                        "
                                                    >
                                                        {{
                                                            helpers.formatDate(
                                                                data.end_date
                                                            )
                                                        }}
                                                    </span>
                                                </template>
                                            </Column>
                                            <Column
                                                field="email"
                                                :header="
                                                    $t(
                                                        'policies.applicant.email_address'
                                                    )
                                                "
                                            >
                                                <template
                                                    #body="{ data, index }"
                                                >
                                                    <span
                                                        :data-testid="
                                                            'passport-data-table-' +
                                                            index
                                                        "
                                                    >
                                                        {{ data.email }}
                                                    </span>
                                                </template>
                                            </Column>
                                        </BaseTable>
                                    </template>
                                </BaseTable>
                            </TabPanel>
                        </TabView>
                    </template>
                </Card>
            </div>
            <div class="col-3 pt-0">
                <card>
                    <template #content>
                        <div class="text-sm">
                            <div class="text-base font-semibold">
                                {{ $t('policies.summary.summary') }}
                            </div>

                            <div class="flex flex-column gap-2 mt-4">
                                <div
                                    class="flex justify-content-between"
                                    v-for="(
                                        count, type
                                    ) in enrollmentTypeCounts"
                                >
                                    <div>
                                        {{ getNameById(policyTypes, type) }}
                                    </div>
                                    <div>{{ count }}</div>
                                </div>
                                <div
                                    class="flex justify-content-between font-semibold"
                                >
                                    <div>
                                        {{
                                            $t(
                                                'policies.summary.total_applicants'
                                            )
                                        }}
                                    </div>
                                    <div>{{ totalEnrollmentRecords }}</div>
                                </div>
                            </div>

                            <Divider />

                            <div class="flex flex-column gap-2 mt-4">
                                <div class="flex justify-content-between">
                                    <div>
                                        {{
                                            $t(
                                                'policies.summary.current_amount'
                                            )
                                        }}
                                    </div>
                                    <div>
                                        {{ helpers.moneyFormat(totalAmount) }}
                                    </div>
                                </div>
                                <div class="flex justify-content-between">
                                    <div>
                                        {{
                                            $t(
                                                'policies.summary.available_credits'
                                            )
                                        }}
                                    </div>
                                    <div>$0.00</div>
                                </div>
                                <div
                                    class="flex justify-content-between font-semibold"
                                >
                                    <div>
                                        {{
                                            $t(
                                                'policies.summary.remaining_balance'
                                            )
                                        }}
                                    </div>
                                    <div>
                                        {{ helpers.moneyFormat(totalAmount) }}
                                    </div>
                                </div>
                            </div>

                            <template
                                v-if="
                                    !props.readOnly &&
                                    $ability.can(
                                        PolicyModulePermission.POLICIES.CREATE
                                    )
                                "
                            >
                                <Divider />

                                <div
                                    class="flex align-items-center justify-content-between"
                                >
                                    <div class="flex align-items-center gap-1">
                                        <div class="mr-1">
                                            <InputSwitch
                                                v-model="sendWelcomeEmail"
                                            />
                                        </div>
                                        <div class="label-text">
                                            <span>
                                                {{
                                                    $t(
                                                        'policies.summary.send_welcome_email'
                                                    )
                                                }}
                                            </span>
                                        </div>
                                    </div>
                                    <i
                                        v-tooltip="
                                            $t(
                                                'policies.summary.send_welcome_email_info'
                                            )
                                        "
                                        class="pl-2 pi pi-info-circle"
                                    ></i>
                                </div>

                                <EnrollmentMessage
                                    v-if="
                                        sendWelcomeEmail &&
                                        applicantsWithoutEmailAddressCount
                                    "
                                    type="warning"
                                    icon="pi-envelope"
                                    class="mt-4"
                                >
                                    <span class="text-sm">
                                        {{
                                            $t(
                                                'policies.summary.applicant_without_email',
                                                applicantsWithoutEmailAddressCount,
                                                {
                                                    count: applicantsWithoutEmailAddressCount
                                                }
                                            )
                                        }}
                                    </span>
                                </EnrollmentMessage>

                                <Divider />

                                <div>
                                    <Button
                                        data-testid="proceed-to-checkout-button"
                                        class="w-full"
                                        type="button"
                                        :label="
                                            $t(
                                                policiesStore.isPayLater
                                                    ? 'policies.summary.proceed_to_checkout_button_label'
                                                    : 'policies.summary.proceed_to_payment_button_label'
                                            )
                                        "
                                        icon="pi pi-chevron-right"
                                        iconPos="right"
                                        :disabled="isCheckoutButtonDisabled"
                                        @click="
                                            (e) => {
                                                policiesStore.isPayLater
                                                    ? proceedToCheckout(e)
                                                    : proceedToPayment(e);
                                            }
                                        "
                                    ></Button>
                                </div>

                                <div class="mt-4">
                                    {{
                                        $t('policies.order.checkout_time', {
                                            time: checkoutTime
                                        })
                                    }}
                                </div>
                            </template>
                        </div>
                    </template>
                </card>
            </div>
        </div>

        <EnrollmentSidebar
            :is-open="openEnrollmentSidebar"
            :plans="plans"
            :enrollment="selectedEnrollment"
            @refresh="loadOverview"
            @close="closeEnrollmentSidebar"
        />

        <Confirmation
            v-model="showSelectedApplicantsDeleteConfirmation"
            :header="
                $t('policies.review.delete_selected_confirmation_dialog.title')
            "
            :content="
                $t(
                    'policies.review.delete_selected_confirmation_dialog.message'
                )
            "
            confirm-button-class="p-button-danger"
            :confirmButtonText="
                $t(
                    'policies.review.delete_selected_confirmation_dialog.delete_applicants'
                )
            "
            :cancelButtonText="$t('buttons.cancel')"
            cancelButtonTestid="delete-applicants-dialog-cancel-button"
            closeButtonTestid="delete-applicants-dialog-close-button"
            confirmButtonTestid="delete-applicants-dialog-confirm-button"
            @confirm="confirmSelectedApplicantDeletion"
        />

        <Dialog
            v-model:visible="showChangePlanDialog"
            modal
            :style="{ width: '480px' }"
            :closable="false"
        >
            <template #header>
                <div
                    class="flex align-items-center justify-content-between w-full"
                >
                    <div class="p-dialog-title">
                        {{ $t('policies.review.change_plan_dialog.title') }}
                    </div>
                    <Button
                        data-testid="change-plan-dialog-close-button"
                        icon="pi pi-times"
                        class="p-dialog-header-close border-none p-button-outlined p-2 border-circle"
                        @click="showChangePlanDialog = false"
                        aria-label="Close"
                    />
                </div>
            </template>
            <div class="flex align-items-center">
                <InputField
                    class="w-full"
                    data-testid="plan-input"
                    showClear
                    id="plan_id"
                    variant="dropdown"
                    appendTo="body"
                    :optionLabel="getLocalizedPlanName"
                    optionValue="id"
                    v-model="selectedPlan"
                    :options="plans"
                    :placeholder="$t('common.select')"
                />
            </div>

            <template #footer>
                <Button
                    data-testid="change-plan-dialog-cancel-button"
                    text
                    autofocus
                    :label="$t('buttons.cancel')"
                    @click="showChangePlanDialog = false"
                />
                <Button
                    data-testid="change-plan-dialog-confirm-button"
                    :label="$t('buttons.update')"
                    :disabled="!selectedPlan"
                    @click="confirmNewPlan"
                />
            </template>
        </Dialog>
    </div>
</template>

<style lang="scss">
.border-radius-n-box-shadow {
    border-radius: 8px;
    box-shadow:
        0px 2px 4px -1px rgba(0, 0, 0, 0.06),
        0px 2px 4px -2px rgba(0, 0, 0, 0.04),
        0px 0px 0px 1px rgba(0, 0, 0, 0.09) inset;
    overflow: hidden;
}

.text-error {
    color: #b32b23;
}

.plan-enrollments-table {
    .p-datatable-row-expansion > td {
        padding: 0 !important;
    }
}
</style>
