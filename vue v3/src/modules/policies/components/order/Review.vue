<script setup>
import { ref, computed, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { useHelpers } from '@/composables';
import { useSmartTemplate } from '@/modules/policies/composables/smartTemplate.js';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { utils, writeFileXLSX } from 'xlsx';
import { PaginationOptions, SortFilterOptions } from '@/config';

import { useCommonStore } from '@/stores';
import { usePlanStore } from '@/modules/plans/stores/Plan';
import { usePoliciesStore } from '@/modules/policies/stores/Policies';

import EnrollmentMessage from '@/modules/policies/components/order/EnrollmentMessage.vue';
import EnrollmentSidebar from '@/modules/policies/components/order/EnrollmentSidebar.vue';
import IconString from '@/modules/policies/components/order/IconString.vue';

const router = useRouter();
const commonStore = useCommonStore();
const planStore = usePlanStore();
const policiesStore = usePoliciesStore();
const helpers = useHelpers();
const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();
const toast = useToast();
const { checkoutTime, exportTemplateHeaders } = useSmartTemplate();
const { t } = useI18n();

const isLoading = ref(false);
const enrollmentsLoading = ref(false);
const availableCountries = ref([]);
const plans = ref([]);
const policyTypes = ref([]);
const overview = ref({});
const enrollments = ref([]);
const selectedEnrollments = ref([]);
const selectedEnrollment = ref(null);
const totalEnrollmentRecords = ref(0);
const searchText = ref(null);
const showErrorsOnly = ref(false);
const openEnrollmentSidebar = ref(false);
const showDeleteApplicantsWithErrorsConfirmation = ref(false);
const showSelectedApplicantsDeleteConfirmation = ref(false);
const showChangePlanDialog = ref(false);
const selectedPlan = ref(null);
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

const isNextButtonDisabled = computed(
    () => !enrollments.value.length || enrollmentsWithErrorsCount.value
);

const enrollmentsWithErrors = computed(() =>
    enrollments.value.filter(hasErrors)
);

const enrollmentsWithErrorsCount = computed(
    () => overview.value.enrollments_with_errors
);

const filteredEnrollments = computed(() => {
    if (showErrorsOnly.value) {
        return enrollmentsWithErrors.value;
    }

    return enrollments.value.slice().sort((a, b) => {
        const hasErrorA = hasErrors(a);
        const hasErrorB = hasErrors(b);

        if (hasErrorA && !hasErrorB) return -1;
        if (!hasErrorA && hasErrorB) return 1;
        return 0;
    });
});

const getLocalizedPlanName = (plan) => helpers.getLocaleValue(plan.name);

const hasErrors = (item) => {
    let errors = item.errors;

    if (typeof errors === 'string') {
        try {
            errors = JSON.parse(errors);
        } catch {
            errors = {};
        }
    }

    return (
        errors && typeof errors === 'object' && Object.keys(errors).length > 0
    );
};

const hasAttributeError = (attribute, data) => {
    return (
        data.errors &&
        data.errors[attribute] &&
        data.errors[attribute].messages &&
        data.errors[attribute].messages.length > 0
    );
};

const onPageChange = (event) => {
    pagination.updatePageParams(event);
    getEnrollments();
};

const onSortChange = (event) => {
    pagination.resetPageParams();
    sortFilters.updateSortFilters(event);
    getEnrollments();
};

const enrollmentRowClicked = ({ data }) => {
    selectedEnrollment.value = data;
    openEnrollmentSidebar.value = true;
};

const closeEnrollmentSidebar = (event) => {
    openEnrollmentSidebar.value = false;
};

const showMenu = (event) => {
    menu.value.toggle(event);
};
const deleteApplicantsWithErrors = (event) => {
    showDeleteApplicantsWithErrorsConfirmation.value = true;
};

const deleteSelectedApplicants = (event) => {
    showSelectedApplicantsDeleteConfirmation.value = true;
};

const changePlan = (event) => {
    showChangePlanDialog.value = true;
};

const deleteEnrollments = async (enrollments) => {
    try {
        const enrollmentIds = enrollments.map((enrollment) => enrollment.id);
        await policiesStore.deleteEnrollments(enrollmentIds);

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
        getEnrollments();
        isLoading.value = false;
    }
};

const confirmDeleteApplicantsWithErrors = (event) => {
    deleteEnrollments(enrollmentsWithErrors.value);
    showDeleteApplicantsWithErrorsConfirmation.value = false;
};

const confirmSelectedApplicantDeletion = (event) => {
    deleteEnrollments(selectedEnrollments.value);
    showSelectedApplicantsDeleteConfirmation.value = false;
};

const confirmNewPlan = async (event) => {
    try {
        await policiesStore.changeEnrollmentsPlan(
            selectedPlan.value,
            selectedEnrollments.value.map((enrollment) => enrollment.id)
        );

        toast.add({
            severity: 'success',
            summary: t('policies.review.success'),
            detail: t('policies.review.applicants_plan_updated_message'),
            life: 2000
        });
    } catch (error) {
    } finally {
        getEnrollments();
        showChangePlanDialog.value = false;
        selectedPlan.value = null;
    }
};

const dataToExport = () => {
    return enrollmentsWithErrors.value.map((applicant) => {
        const plan = plans.value.find((plan) => plan.id == applicant.plan_id);

        const residentCountryName = getNameById(
            availableCountries.value,
            applicant.residence_country_id
        );

        const destinationCountryName = getNameById(
            availableCountries.value,
            applicant.destination_country_id
        );

        const nationalityCountryName = getNameById(
            availableCountries.value,
            applicant.origin_country_id
        );

        const policyType = getNameById(
            policyTypes.value,
            applicant.applicant_type_id
        );

        return {
            plan: plan ? getLocalizedPlanName(plan) : '',
            first_name: applicant.first_name,
            last_name: applicant.last_name,
            resident_country:
                residentCountryName ?? applicant.residence_country_id,
            destination_country:
                destinationCountryName ?? applicant.destination_country_id,
            nationality: nationalityCountryName ?? applicant.nationality,
            type: policyType ?? applicant.applicant_type_id,
            email: applicant.email,
            gender: applicant?.gender?.name || '',
            date_of_birth: helpers.isValidDate(applicant.date_of_birth)
                ? helpers.formatDate(applicant.date_of_birth)
                : applicant.date_of_birth,
            passport_number: applicant.passport_number,
            student_number: applicant.student_number,
            group_name: applicant.group_name,
            start_date: helpers.isValidDate(applicant.start_date)
                ? helpers.formatDate(applicant.start_date)
                : applicant.start_date,
            end_date: helpers.isValidDate(applicant.end_date)
                ? helpers.formatDate(applicant.end_date)
                : applicant.end_date
        };
    });
};
const downloadErrors = (event) => {
    const ws = utils.json_to_sheet(
        [exportTemplateHeaders.value, ...dataToExport()],
        {
            skipHeader: true
        }
    );
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Data');
    writeFileXLSX(wb, 'Data.xlsx');
};
const search = async () => {
    pagination.resetPageParams();
    sortFilters.updateSearch(searchText.value);
    getEnrollments();
};
const addtoCart = (event) => {
    router.push({
        name: 'Summary'
    });
};

const getPlans = async () => {
    try {
        if (policiesStore.businessUnit?.id) {
            const res = await planStore.searchPlanByBusinessUnitUuids(
                {
                    business_unit_ids: [policiesStore.businessUnit.id]
                },
                { onlyActive: true }
            );
            plans.value = res.data;
        } else {
            plans.value = [];
        }
    } finally {
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

const getAllCountries = async (search) => {
    const res = await commonStore.searchCountries({});
    availableCountries.value = res.data;
};

const loadCartOverview = async () => {
    const response = await policiesStore.getCartOverview();
    const plans = response.data?.plans ?? {};
    const associatedPlans = response.data?.associated_plans ?? {};

    const allPlanStats = [
        ...Object.values(plans),
        ...Object.values(associatedPlans)
    ];

    overview.value = allPlanStats.reduce(
        (acc, item) => {
            acc.enrollments_with_errors += item.enrollments_with_errors || 0;
            acc.duplicate_enrollments += item.duplicate_enrollments || 0;
            return acc;
        },
        { enrollments_with_errors: 0, duplicate_enrollments: 0 }
    );
};

const getEnrollments = async () => {
    enrollmentsLoading.value = true;

    await loadCartOverview();

    try {
        const params = pagination.getPageParams();
        const payload = sortFilters.getSortFilters();
        const res = await policiesStore.searchEnrollments(payload, params);
        enrollments.value = res.data;
        totalEnrollmentRecords.value = res.total;
    } finally {
        enrollmentsLoading.value = false;
        selectedEnrollments.value = [];
        selectedEnrollment.value = null;
    }
};

function getNameById(dataSource, id) {
    const item = dataSource.find((entry) => entry.id === id);
    return item ? item.name : null;
}

onBeforeMount(async () => {
    isLoading.value = true;
    await getPlans();
    await getEnrollmentTypes();
    await getAllCountries();

    pagination.resetPageParams();
    sortFilters.updateFilters('policy_batch_id', policiesStore.cart.id);
    await getEnrollments();
    isLoading.value = false;
});
</script>

<template>
    <div class="mt-6">
        <div>
            <div
                class="font-semibold text-xl"
                data-testid="review-applicants-title"
            >
                {{ $t('policies.review.title') }}
            </div>

            <div
                class="text-sm mt-4"
                data-testid="review-applicants-description"
            >
                {{ $t('policies.review.description') }}
            </div>

            <EnrollmentMessage type="warning" icon="pi-clock" class="mt-4">
                {{
                    $t('policies.order.checkout_time', {
                        time: checkoutTime
                    })
                }}
            </EnrollmentMessage>

            <BaseTable
                v-model:selection="selectedEnrollments"
                class="border-radius-n-box-shadow mt-4"
                :value="filteredEnrollments"
                :loading="enrollmentsLoading"
                :page="pagination.page"
                :rows="pagination.limit"
                :total-records="totalEnrollmentRecords"
                :rowClass="(item) => (hasErrors(item) ? 'red-bg' : '')"
                @row-click="enrollmentRowClicked"
                @page="onPageChange"
                @sort="onSortChange"
                data-testid="enrollments-table"
            >
                <template #header>
                    <div class="p-1">
                        <div class="flex justify-content-between">
                            <div class="flex align-items-center">
                                <div
                                    class="flex align-items-center font-weight-bold text-error"
                                    data-testid="errors-count"
                                    v-if="enrollmentsWithErrorsCount"
                                >
                                    <i
                                        color="#B30000"
                                        class="mr-2 pi pi-exclamation-triangle"
                                    ></i>
                                    <span>
                                        {{
                                            $t(
                                                'policies.review.items_to_fix',
                                                enrollmentsWithErrorsCount,
                                                {
                                                    count: enrollmentsWithErrorsCount
                                                }
                                            )
                                        }}
                                    </span>
                                </div>
                                <div
                                    class="flex align-items-center font-weight-bold text-green"
                                    data-testid="no-errors-found"
                                    v-else
                                >
                                    <i
                                        color="#15803D"
                                        class="mr-2 pi pi-check-circle"
                                    ></i>
                                    <span>
                                        {{
                                            $t(
                                                'policies.review.no_errors_found'
                                            )
                                        }}
                                    </span>
                                </div>
                            </div>
                            <div
                                class="flex align-items-center gap-1"
                                v-if="enrollmentsWithErrorsCount"
                            >
                                <div
                                    class="mr-1"
                                    data-testid="show-errors-only"
                                >
                                    <InputSwitch v-model="showErrorsOnly" />
                                </div>
                                <div class="label-text">
                                    <span>
                                        {{
                                            $t(
                                                'policies.review.show_errors_only'
                                            )
                                        }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Divider />

                        <div>
                            <div
                                class="flex flex-wrap align-items-center justify-content-between"
                            >
                                <div class="flex gap-3">
                                    <div>
                                        <Button
                                            :label="
                                                $t(
                                                    'policies.review.bulk_actions_button_label'
                                                )
                                            "
                                            data-testid="bulk-actions-button"
                                            icon="pi pi-chevron-down"
                                            class="p-button-outlined"
                                            iconPos="right"
                                            :disabled="
                                                !selectedEnrollments.length
                                            "
                                            @click="showMenu"
                                        />
                                        <Menu
                                            ref="menu"
                                            id="overlay_menu"
                                            :model="menuItems"
                                            :popup="true"
                                            data-testid="bulk-actions-menu"
                                        />
                                    </div>
                                    <Button
                                        v-if="enrollmentsWithErrorsCount"
                                        data-testid="delete-applicants-with-errors-button"
                                        :label="
                                            $t(
                                                'policies.review.delete_applicants_with_errors_button_label'
                                            )
                                        "
                                        class="p-button-outlined"
                                        severity="danger"
                                        icon="pi pi-trash"
                                        @click="deleteApplicantsWithErrors"
                                    />
                                    <Button
                                        v-if="enrollmentsWithErrorsCount"
                                        data-testid="download-errors-button"
                                        :label="
                                            $t(
                                                'policies.review.download_errors_button_label'
                                            )
                                        "
                                        class="p-button-outlined"
                                        icon="pi pi-download"
                                        @click="downloadErrors"
                                    />
                                </div>
                                <Search v-model="searchText" @search="search" />
                            </div>
                        </div>
                    </div>
                </template>
                <template #empty>
                    <p>{{ $t('policies.review.no_applicants_added') }}</p>
                </template>
                <template #loading>{{
                    $t('policies.review.loading_applicants')
                }}</template>
                <Column
                    selectionMode="multiple"
                    headerStyle="width: 3rem"
                    :pt="{
                        checkboxWrapper: {
                            onClick(e) {
                                e.stopPropagation();
                            }
                        },
                        headerCheckbox: {
                            'data-testid': 'checkbox-select-all'
                        }
                    }"
                >
                    <template #body="slotProps">
                        <Checkbox
                            :data-testid="`enrollment-checkbox-${slotProps.index}`"
                            v-model="selectedEnrollments"
                            :value="slotProps.data"
                            @click.stop
                        />
                    </template>
                </Column>
                <Column
                    field="applicant_type_id"
                    :header="$t('policies.applicant.type')"
                >
                    <template #body="{ data, index }">
                        <span :data-testid="'type-data-table-' + index">
                            <IconString
                                icon="pi-exclamation-triangle"
                                :hide-icon="
                                    !hasAttributeError(
                                        'applicant_type_id',
                                        data
                                    )
                                "
                            >
                                {{
                                    getNameById(
                                        policyTypes,
                                        data.applicant_type_id
                                    )
                                }}
                            </IconString>
                        </span>
                    </template>
                </Column>
                <Column
                    field="first_name"
                    :header="$t('policies.applicant.first_name')"
                >
                    <template #body="{ data, index }">
                        <span :data-testid="'first-name-data-table-' + index">
                            <IconString
                                icon="pi-exclamation-triangle"
                                :hide-icon="
                                    !hasAttributeError('first_name', data)
                                "
                            >
                                {{ data.first_name }}
                            </IconString>
                        </span>
                    </template>
                </Column>
                <Column
                    field="last_name"
                    :header="$t('policies.applicant.last_name')"
                >
                    <template #body="{ data, index }">
                        <span :data-testid="'last-name-data-table-' + index">
                            <IconString
                                icon="pi-exclamation-triangle"
                                :hide-icon="
                                    !hasAttributeError('last_name', data)
                                "
                            >
                                {{ data.last_name }}
                            </IconString>
                        </span>
                    </template>
                </Column>
                <Column
                    field="gender"
                    :header="$t('policies.applicant.gender')"
                >
                    <template #body="{ data, index }">
                        <span :data-testid="'gender-data-table-' + index">
                            <IconString
                                icon="pi-exclamation-triangle"
                                :hide-icon="!hasAttributeError('gender', data)"
                            >
                                {{ data?.gender?.name || '' }}
                            </IconString>
                        </span>
                    </template>
                </Column>
                <Column
                    field="date_of_birth"
                    :header="$t('policies.applicant.date_of_birth')"
                >
                    <template #body="{ data, index }">
                        <span
                            :data-testid="'date-of-birth-data-table-' + index"
                        >
                            <IconString
                                icon="pi-exclamation-triangle"
                                :hide-icon="
                                    !hasAttributeError('date_of_birth', data)
                                "
                            >
                                {{ helpers.formatDate(data.date_of_birth) }}
                            </IconString>
                        </span>
                    </template>
                </Column>
                <Column
                    field="passport_number"
                    :header="$t('policies.applicant.passport')"
                >
                    <template #body="{ data, index }">
                        <span :data-testid="'passport-data-table-' + index">
                            <IconString
                                icon="pi-exclamation-triangle"
                                :hide-icon="
                                    !hasAttributeError('passport_number', data)
                                "
                            >
                                {{ data.passport_number }}
                            </IconString>
                        </span>
                    </template>
                </Column>
                <Column
                    field="residence_country_id"
                    :header="$t('policies.applicant.country_of_residence')"
                >
                    <template #body="{ data, index }">
                        <span
                            :data-testid="
                                'resident-country-data-table-' + index
                            "
                        >
                            <IconString
                                icon="pi-exclamation-triangle"
                                :hide-icon="
                                    !hasAttributeError(
                                        'residence_country_id',
                                        data
                                    )
                                "
                            >
                                {{
                                    getNameById(
                                        availableCountries,
                                        data.residence_country_id
                                    )
                                }}
                            </IconString>
                        </span>
                    </template>
                </Column>
                <Column
                    field="origin_country_id"
                    :header="$t('policies.applicant.nationality')"
                >
                    <template #body="{ data, index }">
                        <span
                            :data-testid="'origin-country-data-table-' + index"
                        >
                            <IconString
                                icon="pi-exclamation-triangle"
                                :hide-icon="
                                    !hasAttributeError(
                                        'origin_country_id',
                                        data
                                    )
                                "
                            >
                                {{
                                    getNameById(
                                        availableCountries,
                                        data.origin_country_id
                                    )
                                }}
                            </IconString>
                        </span>
                    </template>
                </Column>
                <Column
                    field="destination_country_id"
                    :header="$t('policies.applicant.country_of_destination')"
                >
                    <template #body="{ data, index }">
                        <span
                            :data-testid="
                                'destination-country-data-table-' + index
                            "
                        >
                            <IconString
                                icon="pi-exclamation-triangle"
                                :hide-icon="
                                    !hasAttributeError(
                                        'destination_country_id',
                                        data
                                    )
                                "
                            >
                                {{
                                    getNameById(
                                        availableCountries,
                                        data.destination_country_id
                                    )
                                }}
                            </IconString>
                        </span>
                    </template>
                </Column>
            </BaseTable>

            <div class="flex justify-content-end gap-2 mt-6">
                <Button
                    type="button"
                    :label="$t('buttons.continue')"
                    icon="pi pi-chevron-right"
                    iconPos="right"
                    :disabled="isNextButtonDisabled"
                    @click="addtoCart"
                ></Button>
            </div>
        </div>

        <EnrollmentSidebar
            :is-open="openEnrollmentSidebar"
            :plans="plans"
            :enrollment="selectedEnrollment"
            @refresh="getEnrollments"
            @close="closeEnrollmentSidebar"
        />

        <Dialog
            v-model:visible="showDeleteApplicantsWithErrorsConfirmation"
            modal
            :style="{ width: '480px' }"
            :closable="false"
        >
            <template #header>
                <div
                    class="flex align-items-center justify-content-between w-full"
                >
                    <div class="p-dialog-title">
                        {{
                            $t(
                                'policies.review.delete_confirmation_dialog.title'
                            )
                        }}
                    </div>
                    <Button
                        icon="pi pi-times"
                        class="p-dialog-header-close border-none p-button-outlined p-2 border-circle"
                        @click="
                            showDeleteApplicantsWithErrorsConfirmation = false
                        "
                        aria-label="Close"
                    />
                </div>
            </template>
            <div class="flex align-items-center">
                <p>
                    {{
                        $t('policies.review.delete_confirmation_dialog.message')
                    }}
                </p>
            </div>

            <template #footer>
                <Button
                    text
                    autofocus
                    :label="
                        $t(
                            'policies.review.delete_confirmation_dialog.export_errors'
                        )
                    "
                    @click="downloadErrors"
                />
                <Button
                    class="p-button-danger"
                    :label="
                        $t(
                            'policies.review.delete_confirmation_dialog.delete_applicants'
                        )
                    "
                    @click="confirmDeleteApplicantsWithErrors"
                />
            </template>
        </Dialog>

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
                    data-testid="cancel-change-plan"
                    text
                    autofocus
                    :label="$t('buttons.cancel')"
                    @click="showChangePlanDialog = false"
                />
                <Button
                    data-testid="confirm-change-plan"
                    :label="$t('buttons.update')"
                    :disabled="!selectedPlan"
                    @click="confirmNewPlan"
                />
            </template>
        </Dialog>
    </div>
</template>

<style lang="scss">
.text-error {
    color: #b32b23;
}

.text-green {
    color: #15803d !important;
}

.red-bg {
    background-color: #f9dedc !important;
}

.border-radius-n-box-shadow {
    border-radius: 8px;
    box-shadow:
        0px 2px 4px -1px rgba(0, 0, 0, 0.06),
        0px 2px 4px -2px rgba(0, 0, 0, 0.04),
        0px 0px 0px 1px rgba(0, 0, 0, 0.09) inset;
    overflow: hidden;
}
</style>
