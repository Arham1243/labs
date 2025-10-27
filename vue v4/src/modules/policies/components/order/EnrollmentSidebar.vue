<script setup>
import { ref, watch, computed, nextTick } from 'vue';
import { useCommonStore } from '@/stores';
import { useGlobalStore } from '@/stores';
import { usePoliciesStore } from '@/modules/policies/stores/Policies';
import { useInsuredsStore } from '@/modules/policies/stores/Insureds';
import { usePlanStore } from '@/modules/plans/stores/Plan';
import { useAssociatedPlanStore } from '@/modules/plans/stores/AssociatedPlan';
import {
    useGenders,
    getGenderLabelById
} from '@/modules/policies/composables/Genders.js';
import { useHelpers } from '@/composables';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import moment from 'moment-timezone';
import lodash from 'lodash';

import '@/modules/policies/assets/styles/style.css';
import { countriesCache } from '@/modules/policies/composables/helpers';

const ENROLLMENT_TEMPLATE = {
    plan_id: null,
    applicant_type_id: null,
    first_name: null,
    last_name: null,
    date_of_birth: null,
    gender: null,
    address: null,
    email: null,
    phone_number: '',
    passport_number: null,
    residence_country_id: null,
    destination_country_id: null,
    origin_country_id: null,
    start_date: null,
    end_date: null,
    name_of_school_attended: null,
    student_number: null,
    group_name: null
};

const commonStore = useCommonStore();
const globalStore = useGlobalStore();
const policiesStore = usePoliciesStore();
const insuredsStore = useInsuredsStore();
const planStore = usePlanStore();
const associatedPlanStore = useAssociatedPlanStore();
const helpers = useHelpers();
const { t } = useI18n();
const toast = useToast();

const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false
    },
    plans: {
        type: Array,
        default: []
    },
    enrollment: {
        type: Object,
        default: null
    }
});

const emits = defineEmits(['close', 'refresh']);
const formTypes = ['Insured', 'Dependent'];

const loadingResidentCountries = ref(true);
const loadingDestinationCountries = ref(true);
const loadingOriginCountries = ref(true);
const residentCountries = ref([]);
const destinationCountries = ref([]);
const originCountries = ref([]);
const countryDropdownKeys = ref({
    origin: 0,
    residence: 0,
    destination: 0
});
const originalEnrollment = ref({});
const enrollment = ref({});
const discardDialog = ref(false);
const deleteDialog = ref(false);
const saveAndCloseLoading = ref(false);
const saveAndAddLoading = ref(false);
const errorCount = ref(0);
const formType = ref(formTypes[0]);
const insureds = ref([]);
const isLoadingInsureds = ref(false);
const parentInsured = ref();
const parentPlan = ref();
const associatedPlan = ref();
const isLoadingForm = ref(false);
const loadingEnrollmentTypes = ref(false);
const enrollmentTypes = ref([]);
const genders = ref([]);

const dependentRelations = insuredsStore.getRelations();

const isVisible = computed({
    get() {
        return props.isOpen;
    },
    set() {
        emits('close');
    }
});

const isEditView = computed(() => {
    return props.enrollment && !!props.enrollment.id;
});

const isNotChanged = computed(() => {
    return lodash.isEqual(originalEnrollment.value, enrollment.value);
});

const hasErrors = computed(() => {
    return !!errorCount.value;
});

const fullName = computed(() => {
    return `${enrollment.value.first_name} ${enrollment.value.last_name}`;
});

const duplicateEnrollment = computed(
    () => enrollment.value.duplicate_enrollment
);

const duplicateEnrollmentStartDate = computed(() => {
    const startDate = getEnrollmentAttribute(
        duplicateEnrollment.value,
        'start_date'
    );

    return startDate ? helpers.formatDate(startDate) : null;
});

const duplicateEnrollmentEndDate = computed(() => {
    const endDate = getEnrollmentAttribute(
        duplicateEnrollment.value,
        'end_date'
    );

    return endDate ? helpers.formatDate(endDate) : null;
});

const sidebarPassThroughOptions = computed(() => {
    return {
        closeButton: {
            'data-testid': 'enrollment-sidebar-close-button'
        }
    };
});

const insuredPolicies = computed(() => {
    return (
        parentInsured.value?.policies?.filter(
            (p) =>
                ['active', 'not_started'].includes(p.status) &&
                p.client_id === policiesStore.client.id
        ) || []
    );
});

const getEnrollmentAttribute = (enrollment, attribute) => {
    if (!enrollment || typeof enrollment !== 'object') return null;

    if (attribute in enrollment && enrollment[attribute] !== null) {
        return enrollment[attribute];
    }

    if (
        enrollment.errors &&
        typeof enrollment.errors === 'object' &&
        attribute in enrollment.errors
    ) {
        return enrollment.errors[attribute]?.value ?? null;
    }

    return null;
};

const lockScroll = () => {
    document.body.style.overflow = 'hidden';
};

const unlockScroll = () => {
    document.body.style.overflow = '';
};

const getCountries = async (search) => {
    const res = await commonStore.searchCountries({
        search: {
            value: search
        }
    });

    return res.data;
};

const getResidentCountries = async (search) => {
    try {
        loadingResidentCountries.value = true;
        residentCountries.value = await getCountries(search);
    } finally {
        loadingResidentCountries.value = false;
    }
};

const getDestinationCountries = async (search) => {
    try {
        loadingDestinationCountries.value = true;
        destinationCountries.value = await getCountries(search);
    } finally {
        loadingDestinationCountries.value = false;
    }
};

const getOriginCountries = async (search) => {
    try {
        loadingOriginCountries.value = true;
        originCountries.value = await getCountries(search);
    } finally {
        loadingOriginCountries.value = false;
    }
};

const cancel = (event) => {
    isNotChanged.value ? close() : (discardDialog.value = true);
};

const close = () => {
    isVisible.value = false;
};

const showToastMessage = () => {
    toast.add({
        severity: 'success',
        summary: t(
            isEditView.value
                ? 'policies.order.enrollment_sidebar.success'
                : 'policies.order.enrollment_sidebar.new_applicant'
        ),
        detail: t(
            isEditView.value
                ? 'policies.order.enrollment_sidebar.applicant_saved_successfully'
                : 'policies.order.enrollment_sidebar.applicant_added_successfully'
        ),
        life: 2000
    });
};

const saveAndAdd = async (event) => {
    saveAndAddLoading.value = true;
    const isSuccessful = await save();

    if (isSuccessful) {
        globalStore.clearErrors();
        loadEnrollment();
        showToastMessage();
    }
};

const saveAndClose = async (event) => {
    saveAndCloseLoading.value = true;
    const isSuccessful = await save();

    if (isSuccessful) {
        close();
        showToastMessage();
    }
};

const deleteEnrollment = async (event) => {
    deleteDialog.value = true;
};

const confirmDelete = async (event) => {
    await policiesStore.deleteEnrollments([enrollment.value.id]);
    toast.add({
        severity: 'success',
        summary: t('policies.order.enrollment_sidebar.success'),
        detail: t(
            'policies.order.enrollment_sidebar.applicant_deleted_successfully'
        ),
        life: 2000
    });
    close();
    emits('refresh');
};

const getLocalizedPlanName = (plan) => helpers.getLocaleValue(plan.name);

const scrollToError = () => {
    const errorElement = document.querySelector('small.p-error');
    const container = document.querySelector('.p-sidebar-content');
    if (errorElement && container) {
        const offsetTop = errorElement.offsetTop;
        container.scrollTo({
            top: offsetTop - 175,
            behavior: 'smooth'
        });
    }
};

const save = async () => {
    const modifiedEnrollment = {
        ...enrollment.value,

        residence_country_id: enrollment.value.residence_country_id?.id,
        destination_country_id: enrollment.value.destination_country_id?.id,
        origin_country_id: enrollment.value.origin_country_id?.id,

        address: enrollment.value.address
    };

    try {
        const res = await policiesStore.validateEnrollments([
            modifiedEnrollment
        ]);

        if (isDependentForm.value) {
            const errors = globalStore.errors;
            const validateData = enrollment.value;

            if (!validateData.parent_policy_id) {
                errors['parent_policy_id'] = [
                    t(
                        'policies.order.enrollment_sidebar.dependent_fields_error',
                        {
                            field: t(
                                'insured_overview.dependents.select_primary_policy'
                            )
                        }
                    )
                ];
                res.isValid = false;
            }

            if (!validateData.associated_plan_id) {
                errors['associated_plan_id'] = [
                    t(
                        'policies.order.enrollment_sidebar.dependent_fields_error',
                        {
                            field: t(
                                'insured_overview.dependents.select_associated_plan'
                            )
                        }
                    )
                ];
                res.isValid = false;
            }

            if (!validateData.relation) {
                errors['relation'] = [
                    t(
                        'policies.order.enrollment_sidebar.dependent_fields_error',
                        { field: t('insured_overview.dependents.relationship') }
                    )
                ];
                res.isValid = false;
            }

            if (!validateData.insured_id) {
                errors['insured_id'] = [
                    t(
                        'policies.order.enrollment_sidebar.dependent_fields_error',
                        {
                            field: t(
                                'policies.order.enrollment_sidebar.primary_policy_holder'
                            )
                        }
                    )
                ];
                res.isValid = false;
            }

            globalStore.errors = errors;
        }

        enrollment.value.is_duplicate = false;
        if (!res.isValid) {
            if (res.isDuplicate) {
                enrollment.value.is_duplicate = true;
                enrollment.value.duplicate_enrollment = res.duplicateEnrollment;
            }
            scrollToError();
            return false;
        }

        if (isEditView.value) {
            await policiesStore.updateEnrollment(
                modifiedEnrollment.id,
                modifiedEnrollment
            );
        } else {
            await policiesStore.createEnrollments([modifiedEnrollment]);
        }
        emits('refresh');
        return true;
    } catch (error) {
        scrollToError();
        return false;
    } finally {
        saveAndCloseLoading.value = false;
        saveAndAddLoading.value = false;
    }
};

const updateErrorCount = () => {
    const errorElements = document.querySelectorAll('small.p-error');
    errorCount.value = errorElements.length;
};

const loadCountries = async () => {
    loadingResidentCountries.value = true;
    loadingDestinationCountries.value = true;
    loadingOriginCountries.value = true;

    const countries = await getCountries('');
    countriesCache.set(countries);

    residentCountries.value = [...countries];
    destinationCountries.value = [...countries];
    originCountries.value = [...countries];

    countryDropdownKeys.value = {
        origin: countryDropdownKeys.value.origin + 1,
        residence: countryDropdownKeys.value.residence + 1,
        destination: countryDropdownKeys.value.destination + 1
    };

    loadingResidentCountries.value = false;
    loadingDestinationCountries.value = false;
    loadingOriginCountries.value = false;
};

const getEnrollmentTypes = async (search) => {
    try {
        loadingEnrollmentTypes.value = true;
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
        enrollmentTypes.value = res.data;
    } finally {
        loadingEnrollmentTypes.value = false;
    }

    return enrollmentTypes.value;
};

const loadEnrollment = async () => {
    await loadCountries();
    originalEnrollment.value = lodash.cloneDeep(ENROLLMENT_TEMPLATE);

    if (isEditView.value) {
        originalEnrollment.value = {
            ...originalEnrollment.value,
            ...props.enrollment,
            residence_country_id: residentCountries.value.find(
                (country) => country.id == props.enrollment.residence_country_id
            ),
            destination_country_id: destinationCountries.value.find(
                (country) =>
                    country.id == props.enrollment.destination_country_id
            ),
            origin_country_id: destinationCountries.value.find(
                (country) => country.id == props.enrollment.origin_country_id
            ),
            date_of_birth: moment
                .utc(props.enrollment.date_of_birth)
                .format('YYYY-MM-DD'),
            start_date: moment
                .utc(props.enrollment.start_date)
                .format('YYYY-MM-DD'),
            end_date: moment.utc(props.enrollment.end_date).format('YYYY-MM-DD')
        };
    }

    enrollment.value = lodash.cloneDeep(originalEnrollment.value);
    const errors = policiesStore.getFormattedErrors(
        enrollment.value.errors ?? {}
    );
    if (Object.keys(errors).length > 0) {
        globalStore.errors = errors;
    }
};

const isDependentForm = computed(() => {
    return formType.value === formTypes[1];
});

const searchInsureds = async (e) => {
    try {
        isLoadingInsureds.value = true;

        const params = { limit: 100 };
        const payload = {
            sort: [{ field: 'created_at', direction: 'desc' }]
        };

        if (e?.value) {
            payload.search = { value: e.value };
        }

        const res = await insuredsStore.searchInsureds(payload, params);
        insureds.value = res.data;
    } catch (error) {
    } finally {
        isLoadingInsureds.value = false;
    }
};

const getPlan = async (planId) => {
    parentPlan.value = {};
    const res = await planStore.getPlan(planId, {
        include: 'associatedPlans'
    });
    parentPlan.value = res.data;
};

const getAssociatedPlan = async (planId, associatedPlanId) => {
    associatedPlan.value = {};
    const res = await associatedPlanStore.getPlan(planId, associatedPlanId, {
        include: 'dependantsSetting.dependantsSettingsPricingDiscounts'
    });
    associatedPlan.value = res.data;
};

const getInsured = async (insuredId) => {
    try {
        const res = await insuredsStore.getInsured(insuredId);
        return res.data;
    } finally {
    }
};

const onPolicyChanged = async (e) => {
    const policyId = e.value;
    const policy = parentInsured.value?.policies?.find(
        (policy) => policy.id === policyId
    );
    enrollment.value.plan_id = policy.plan_id;

    await getPlan(policy.plan_id);
    updateDependentTripDates();
};

const updateDependentTripDates = () => {
    const dependantsSetting = associatedPlan.value.dependantsSetting;
    enrollment.value.isEnforced = false;
    const policy = parentInsured.value?.policies?.find(
        (policy) => policy.id === enrollment.value.parent_policy_id
    );

    if (dependantsSetting?.enforce_start_date) {
        enrollment.value.isEnforced = true;
        const today = moment().utc().startOf('day');
        const startDate = moment.utc(policy.start_date);
        enrollment.value.start_date = helpers.formatDate(
            today > startDate ? today : startDate
        );
    }

    if (dependantsSetting?.enforce_end_date) {
        enrollment.value.isEnforced = true;
        enrollment.value.end_date = policy.end_date;
    }
};

const onAssociatedPlanChanged = async (e) => {
    const associatedPlanId = e.value;
    await getAssociatedPlan(parentPlan.value.id, associatedPlanId);

    updateDependentTripDates();
};

const onInsuredChanged = async (e) => {
    if (e.value) {
        parentInsured.value = await getInsured(e.value);

        if (e.originalEvent) {
            enrollment.value.parent_policy_id = null;
            enrollment.value.associated_plan_id = null;
            enrollment.value.isEnforced = false;
        }
    }
};

const isStartDateDisabled = computed(() => {
    if (isDependentForm.value) {
        return !!associatedPlan.value?.dependantsSetting?.enforce_start_date;
    } else {
        return false;
    }
});

const isEndDateDisabled = computed(() => {
    if (isDependentForm.value) {
        return !!associatedPlan.value?.dependantsSetting?.enforce_end_date;
    } else {
        return false;
    }
});

const isApplicantDetailsValid = computed(() => {
    return (
        enrollment.value.residence_country_id &&
        enrollment.value.destination_country_id &&
        enrollment.value.origin_country_id &&
        enrollment.value.start_date &&
        enrollment.value.end_date
    );
});

watch(isVisible, async (newValue) => {
    if (newValue) {
        lockScroll();
        await getEnrollmentTypes('');
        await searchInsureds();
        globalStore.clearErrors();
        await loadEnrollment();

        if (enrollment.value.parent_policy_id) {
            formType.value = formTypes[1];

            const data = await policiesStore.getPolicy(
                policiesStore.client.id,
                enrollment.value.parent_policy_id
            );
            const policy = data.data;
            enrollment.value.insured_id = policy.insured_id;

            await onInsuredChanged({ value: policy.insured_id });
            await onPolicyChanged({ value: enrollment.value.parent_policy_id });
        }

        nextTick(() => {
            updateErrorCount();

            const observer = new MutationObserver(() => {
                updateErrorCount();
            });

            observer.observe(document.querySelector('.p-sidebar-content'), {
                childList: true,
                subtree: true,
                attributes: true,
                characterData: true
            });
        });
    } else {
        unlockScroll();
    }

    genders.value = (await useGenders()).genders;

    isLoadingForm.value = false;
});

const onSidebarShowed = () => {
    isLoadingForm.value = true;

    if (props.enrollment?.parent_policy_id) {
        formType.value = formTypes[1];
    } else {
        formType.value = formTypes[0];
    }

    parentInsured.value = {};
    parentPlan.value = {};
    associatedPlan.value = {};
};
</script>

<template>
    <Drawer
        :visible="isVisible"
        position="right"
        :dismissable="false"
        class="w-full w-35rem enrollment-sidebar"
        :data-testid="'applicant-sidebar'"
        :pt="sidebarPassThroughOptions"
        @update:visible="cancel"
        @show="onSidebarShowed"
    >
        <template #header>
            <div class="custom-header flex-row-reverse relative inline-flex items-center">
                <Button
                    v-if="isEditView"
                    severity="danger"
                    class="delete-btn absolute"
                    icon="pi pi-trash"
                    @click="deleteEnrollment"
                    rounded
                ></Button>

                <h5 class="text-left mt-0">
                    <span :data-testid="'applicant-sidebar-title'">
                        {{ isEditView ? 'Edit Applicant' : 'New Applicant' }}
                    </span>
                </h5>
            </div>
        </template>

        <div
            v-if="isLoadingForm"
            class="absolute w-full h-full bg-gray-200 opacity-50 flex items-center justify-center z-50"
        >
            <ProgressSpinner />
        </div>
        <div class="my-3 custom-select-button">
            <SelectButton
                v-model="formType"
                :options="formTypes"
                class=""
                :pt="{
                    button: () => ({
                        class: 'col-span-6 flex justify-center'
                    }),
                    root: {
                        class: 'grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 grid-cols-2'
                    }
                }"
            >
                <template #option="slotProps">
                    <div class="py-2">{{ slotProps.option }}</div>
                </template>
            </SelectButton>
        </div>
        <div class="enrollment-section">
            <div
                class="error-banner-container"
                v-if="hasErrors"
                data-testid="applicant-sidebar-errors-container"
            >
                <div class="banner">
                    <div class="flex items-center gap-2">
                        <i class="pi pi-times-circle"></i>
                        <div v-if="enrollment.is_duplicate">
                            <span>
                                {{
                                    $t(
                                        'policies.order.enrollment_sidebar.duplicate_details',
                                        {
                                            start_date:
                                                duplicateEnrollmentStartDate,
                                            end_date: duplicateEnrollmentEndDate
                                        }
                                    )
                                }}
                            </span>
                        </div>
                        <div class="flex gap-1" v-else>
                            <span class="font-bold"
                                >{{
                                    $t(
                                        'policies.order.enrollment_sidebar.error_found',
                                        {
                                            count: errorCount
                                        }
                                    )
                                }}
                            </span>
                            <a href="#" @click.prevent="scrollToError()">
                                {{ $t('common.view') }}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <Divider align="center">
                <b>
                    <span
                        :data-testid="'applicant-sidebar-applicant-title'"
                        class="uppercase"
                        >{{
                            $t(
                                'policies.order.enrollment_sidebar.applicant_details'
                            )
                        }}</span
                    ></b
                >
            </Divider>

            <div class="mt-3 grid grid-cols-12 gap-4">
                <div class="col-span-12">
                    <label for="applicant_type_id" data-testid="type-label" class="mb-2"
                        >{{ $t('policies.applicant.type') }} *</label
                    >
                    <InputField
                        data-testid="type-input"
                        showClear
                        id="applicant_type_id"
                        variant="select"
                        appendTo="body"
                        optionLabel="name"
                        optionValue="id"
                        v-model="enrollment.applicant_type_id"
                        :options="enrollmentTypes"
                        :placeholder="$t('common.select')"
                        class="w-full"
                    />
                </div>

                <div class="col-span-12" v-if="isDependentForm">
                    <label for="type" data-testid="type-label" class="mb-2">
                        {{
                            $t(
                                'policies.order.enrollment_sidebar.primary_policy_holder'
                            )
                        }}
                        *
                    </label>
                    <Select
                        id="insured_id"
                        data-testid="dependent-select"
                        filter
                        @filter="searchInsureds"
                        v-model="enrollment.insured_id"
                        option-value="id"
                        @change="onInsuredChanged"
                        :options="insureds"
                        :loading="isLoadingInsureds"
                        :optionLabel="
                            (item) => `${item.first_name} ${item.last_name}`
                        "
                        :placeholder="$t('common.select')"
                    >
                        <template #option="slotProps">
                            <div>
                                <label class="font-semibold mb-2">
                                    {{
                                        `${slotProps.option.first_name} ${slotProps.option.last_name}`
                                    }}
                                </label>
                                <p>
                                    {{
                                        `
                            ${helpers.formatDate(
                                slotProps.option?.date_of_birth,
                                'DD-MMM-YYYY'
                            )}
                            · ${helpers.capitalizeWords(
                                getGenderLabelById(
                                    slotProps.option?.gender_id
                                ) || ''
                            )}
                            · ${countriesCache.getById(
                                slotProps.option?.country_id
                            )}
                            `
                                    }}
                                </p>
                            </div>
                        </template>
                        class="w-full"
                    </Select>

                    <span v-if="globalStore.errors?.insured_id">
                        <small
                            v-for="(error, index) in globalStore.errors
                                ?.insured_id"
                            :key="index"
                            class="p-error block"
                            :class="{
                                'mb-2':
                                    index ===
                                    globalStore.errors?.insured_id?.length - 1
                            }"
                            id="text-error"
                            data-testid="validation-error"
                        >
                            {{ error }}
                        </small>
                    </span>
                </div>

                <div class="col-span-12">
                    <label for="first_name" data-testid="first-name-label" class="mb-2">
                        {{
                            isDependentForm
                                ? $t(
                                      'policies.order.enrollment_sidebar.dependent_first_name'
                                  )
                                : $t('policies.applicant.first_name')
                        }}
                        *
                    </label>
                    <InputField
                        id="first_name"
                        data-testid="first-name-input"
                        variant="text"
                        v-model="enrollment.first_name"
                        class="w-full"
                    />
                </div>
                <div class="col-span-12">
                    <label for="last_name" data-testid="last-name-label" class="mb-2">
                        {{
                            isDependentForm
                                ? $t(
                                      'policies.order.enrollment_sidebar.dependent_last_name'
                                  )
                                : $t('policies.applicant.last_name')
                        }}
                        *
                    </label>
                    <InputField
                        id="last_name"
                        data-testid="last-name-input"
                        variant="text"
                        v-model="enrollment.last_name"
                        class="w-full"
                    />
                </div>

                <div class="col-span-12" v-if="isDependentForm">
                    <label
                        for="dependent-relation-select"
                        data-testid="dependent-relation-select-label"
                        class="mb-2"
                        >{{
                            $t('insured_overview.dependents.relationship')
                        }}
                        *</label
                    >
                    <Select
                        data-testid="dependent-relation-select"
                        v-model="enrollment.relation"
                        option-value="value"
                        option-label="label"
                        :options="dependentRelations"
                        :placeholder="$t('common.select')"
                        class="w-full"
                    />

                    <span v-if="globalStore.errors?.relation">
                        <small
                            v-for="(error, index) in globalStore.errors
                                ?.relation"
                            :key="index"
                            class="p-error block"
                            :class="{
                                'mb-2':
                                    index ===
                                    globalStore.errors?.relation?.length - 1
                            }"
                            id="text-error"
                            data-testid="validation-error"
                        >
                            {{ error }}
                        </small>
                    </span>
                </div>

                <div class="col-span-12">
                    <label for="date_of_birth" data-testid="date-of-birth-label" class="mb-2"
                        >{{ $t('policies.applicant.date_of_birth') }} *</label
                    >
                    <DatePickerV2
                        id="date_of_birth"
                        v-model="enrollment.date_of_birth"
                        data-testid="date-of-birth"
                    />
                </div>
                <div class="col-span-12">
                    <label for="gender" data-testid="gender-label" class="mb-2"
                        >{{ $t('policies.applicant.gender') }} *</label
                    >
                    <InputField
                        showClear
                        id="gender"
                        data-testid="gender-input"
                        variant="select"
                        appendTo="body"
                        optionLabel="name"
                        optionValue="id"
                        v-model="enrollment.gender_id"
                        :options="genders"
                        :placeholder="$t('common.select')"
                        class="w-full"
                    />

                    <span v-if="globalStore.errors?.gender_id">
                        <small
                            v-for="(error, index) in globalStore.errors
                                ?.gender_id"
                            :key="index"
                            class="p-error block"
                            :class="{
                                'mb-2':
                                    index ===
                                    globalStore.errors?.gender_id?.length - 1
                            }"
                            id="text-error"
                            data-testid="validation-error"
                        >
                            {{ error }}
                        </small>
                    </span>
                </div>
                <div class="col-span-12">
                    <label for="email" data-testid="email-label" class="mb-2">{{
                        $t('policies.applicant.email_address')
                    }}</label>
                    <InputField
                        id="email"
                        data-testid="email-input"
                        variant="text"
                        v-model="enrollment.email"
                        class="w-full"
                    />
                </div>
                <div class="col-span-12">
                    <label
                        for="passport_number"
                        data-testid="passport-number-label"
                        class="mb-2"
                        >{{ $t('policies.applicant.passport_number') }}</label
                    >
                    <InputField
                        id="passport_number"
                        data-testid="passport-number-input"
                        variant="text"
                        v-model="enrollment.passport_number"
                        class="w-full"
                    />
                </div>
                <div class="col-span-12">
                    <label
                        for="phone_number"
                        data-testid="phone-number-label"
                        class="mb-2"
                        >{{
                            $t('policies.applicant.mobile_phone_number')
                        }}</label
                    >
                    <InputField
                        id="phone_number"
                        data-testid="phone-number-input"
                        variant="phone"
                        v-model="enrollment.phone_number"
                        class="w-full"
                    />
                </div>

                <div class="col-span-12">
                    <label
                        for="origin_country"
                        :data-testid="'origin-country-label'"
                        class="mb-2"
                    >
                        {{ $t('policies.applicant.nationality') }} *
                    </label>
                    <ApiDropdown
                        :key="countryDropdownKeys.origin"
                        id="origin_country_id"
                        option-label="name"
                        v-model="enrollment.origin_country_id"
                        @search="getOriginCountries"
                        :loading="loadingOriginCountries"
                        :items="originCountries"
                        :data-testid="'origin-country-dropdown'"
                        class="w-full"
                    />
                </div>
                <div class="col-span-12">
                    <label
                        for="residence_country"
                        data-testid="residence-country-label"
                        class="mb-2"
                    >
                        {{ $t('policies.applicant.country_of_residence') }} *
                    </label>
                    <ApiDropdown
                        :key="countryDropdownKeys.residence"
                        id="residence_country_id"
                        data-testid="residence-country-input"
                        option-label="name"
                        v-model="enrollment.residence_country_id"
                        @search="getResidentCountries"
                        :loading="loadingResidentCountries"
                        :items="residentCountries"
                        class="w-full"
                    />
                </div>
                <div class="col-span-12">
                    <label
                        for="destination_country"
                        :data-testid="'destination-country-label'"
                        class="mb-2"
                    >
                        {{ $t('policies.applicant.country_of_destination') }} *
                    </label>
                    <ApiDropdown
                        :key="countryDropdownKeys.destination"
                        id="destination_country_id"
                        option-label="name"
                        v-model="enrollment.destination_country_id"
                        @search="getDestinationCountries"
                        :loading="loadingDestinationCountries"
                        :items="destinationCountries"
                        :data-testid="'destination-country-dropdown'"
                        class="w-full"
                    />
                </div>
                <div class="col-span-12">
                    <label
                        for="trip_start_date"
                        :data-testid="'trip-start-date-label'"
                        class="mb-2"
                    >
                        {{ $t('policies.applicant.trip_start_date') }} *
                    </label>
                    <DatePickerV2
                        id="start_date"
                        v-model="enrollment.start_date"
                        data-testid="trip-start-date"
                        :disabled="isStartDateDisabled"
                    />
                </div>
                <div class="col-span-12">
                    <label
                        for="trip_end_date"
                        :data-testid="'trip-end-date-label'"
                        class="mb-2"
                    >
                        {{ $t('policies.applicant.trip_end_date') }} *
                    </label>
                    <DatePickerV2
                        id="end_date"
                        v-model="enrollment.end_date"
                        data-testid="trip-end-date"
                        :disabled="isEndDateDisabled"
                    />
                </div>
            </div>
        </div>
        <div class="enrollment-section" v-if="isApplicantDetailsValid">
            <Divider align="center">
                <b>
                    <span
                        :data-testid="'applicant-sidebar-policy-title'"
                        class="uppercase"
                    >
                        {{
                            $t(
                                'policies.order.enrollment_sidebar.policy_details'
                            )
                        }}
                    </span>
                </b>
            </Divider>
            <div class="mt-3 grid grid-cols-12 gap-4">
                <div class="field col-span-12" v-if="!isDependentForm">
                    <label for="plan" :data-testid="'plan-label'" class="mb-2">
                        {{ $t('policies.applicant.plan') }}
                        *
                    </label>
                    <InputField
                        data-testid="plan-input"
                        showClear
                        id="plan_id"
                        variant="select"
                        appendTo="body"
                        :optionLabel="getLocalizedPlanName"
                        optionValue="id"
                        v-model="enrollment.plan_id"
                        :options="plans"
                        :placeholder="$t('common.select')"
                        class="w-full"
                    />
                </div>

                <div class="field col-span-12" v-if="isDependentForm">
                    <label
                        for="insured-policy-select"
                        data-testid="insured-policy-select-label"
                        class="mb-2"
                        >{{
                            $t(
                                'insured_overview.dependents.select_primary_policy'
                            )
                        }}
                        *</label
                    >
                    <Select
                        id="parent_policy_id"
                        data-testid="insured-policy-select"
                        filter
                        v-model="enrollment.parent_policy_id"
                        option-value="id"
                        option-label="policy_number"
                        @change="onPolicyChanged"
                        :options="insuredPolicies"
                        :placeholder="$t('common.select')"
                        class="w-full"
                    />

                    <span v-if="globalStore.errors?.parent_policy_id">
                        <small
                            v-for="(error, index) in globalStore.errors
                                ?.parent_policy_id"
                            :key="index"
                            class="p-error block"
                            :class="{
                                'mb-2':
                                    index ===
                                    globalStore.errors?.parent_policy_id
                                        ?.length -
                                        1
                            }"
                            id="text-error"
                            data-testid="validation-error"
                        >
                            {{ error }}
                        </small>
                    </span>
                </div>

                <div class="col-span-12" v-if="isDependentForm">
                    <label
                        for="dependent-plan-select"
                        data-testid="dependent-plan-select-label"
                        class="mb-2"
                        >{{
                            $t(
                                'insured_overview.dependents.select_associated_plan'
                            )
                        }}
                        *</label
                    >
                    <Select
                        id="associated_plan_id"
                        filter
                        data-testid="dependent-plan-select"
                        v-model="enrollment.associated_plan_id"
                        option-value="id"
                        :option-label="(item) => $t(`common.${item.category}`)"
                        :options="
                            parentPlan?.associated_plans?.filter((p) =>
                                ['active'].includes(p.status)
                            )
                        "
                        :placeholder="$t('common.select')"
                        @change="onAssociatedPlanChanged"
                        class="w-full"
                    />

                    <span v-if="globalStore.errors?.associated_plan_id">
                        <small
                            v-for="(error, index) in globalStore.errors
                                ?.associated_plan_id"
                            :key="index"
                            class="p-error block"
                            :class="{
                                'mb-2':
                                    index ===
                                    globalStore.errors?.associated_plan_id
                                        ?.length -
                                        1
                            }"
                            id="text-error"
                            data-testid="validation-error"
                        >
                            {{ error }}
                        </small>
                    </span>
                </div>

                <div class="col-span-12">
                    <label
                        for="name_of_school_attended"
                        :data-testid="'school-attended-label'"
                        class="mb-2"
                    >
                        {{ $t('policies.applicant.name_of_school_attended') }}
                    </label>
                    <InputField
                        id="name_of_school_attended"
                        variant="text"
                        v-model="enrollment.name_of_school_attended"
                        :data-testid="'school-attended-input'"
                        class="w-full"
                    />
                </div>
                <div class="col-span-12">
                    <label
                        for="student_number"
                        :data-testid="'student-number-label'"
                        class="mb-2"
                    >
                        {{ $t('policies.applicant.student_number') }}
                    </label>
                    <InputField
                        id="student_number"
                        variant="text"
                        v-model="enrollment.student_number"
                        :data-testid="'student-number-input'"
                        class="w-full"
                    />
                </div>
                <div class="col-span-12">
                    <label
                        for="destination_address"
                        :data-testid="'destination-address-label'"
                        class="mb-2"
                    >
                        {{ $t('policies.applicant.destination_address') }}
                    </label>
                    <InputField
                        id="address"
                        variant="text"
                        v-model="enrollment.address"
                        :data-testid="'destination-address-input'"
                        class="w-full"
                    />
                </div>
                <div class="col-span-12">
                    <label for="group_name" :data-testid="'group-name-label'" class="mb-2">
                        {{ $t('policies.applicant.group_name') }}
                    </label>
                    <InputField
                        id="group_name"
                        variant="text"
                        v-model="enrollment.group_name"
                        :data-testid="'group-name-input'"
                        class="w-full"
                    />
                </div>

                <div class="col-span-12 mb-0" v-if="enrollment.isEnforced">
                    <Message :closable="false" class="my-0">{{
                        $t('insured_overview.dependents.warning_enforce_date', {
                            start_date: helpers.formatDate(
                                enrollment.start_date
                            ),
                            end_date: helpers.formatDate(enrollment.end_date),
                            num_of_days:
                                moment
                                    .utc(enrollment.end_date)
                                    .diff(
                                        moment.utc(enrollment.start_date),
                                        'days'
                                    ) + 1
                        })
                    }}</Message>
                </div>
            </div>
        </div>
        <div class="enrollment-section">
            <Divider />
            <div class="flex justify-end gap-2">
                <Button
                    :data-testid="'applicant-sidebar-cancel-button'"
                    type="button"
                    :label="$t('buttons.cancel')"
                    class="p-button-outlined"
                    text
                    @click="cancel"
                />
                <Button
                    :data-testid="'applicant-sidebar-save-add-button'"
                    v-if="!isEditView"
                    type="button"
                    class="p-button-outlined"
                    :label="$t('buttons.save_add_other')"
                    icon="pi pi-plus"
                    :loading="saveAndAddLoading"
                    @click="saveAndAdd"
                />
                <Button
                    :data-testid="'applicant-sidebar-save-close-button'"
                    type="button"
                    :label="$t('buttons.save_close')"
                    :loading="saveAndCloseLoading"
                    @click="saveAndClose"
                />
            </div>
        </div>

        <Confirmation
            v-model="discardDialog"
            :header="
                $t(
                    isEditView
                        ? 'policies.order.enrollment_sidebar.confirmation.edit.title'
                        : 'policies.order.enrollment_sidebar.confirmation.new.title'
                )
            "
            :content="
                $t(
                    isEditView
                        ? 'policies.order.enrollment_sidebar.confirmation.edit.content'
                        : 'policies.order.enrollment_sidebar.confirmation.new.content'
                )
            "
            confirm-button-class="p-button-danger"
            :confirmButtonText="
                $t(
                    'policies.order.enrollment_sidebar.confirmation.discard_changes'
                )
            "
            :cancelButtonText="
                $t(
                    'policies.order.enrollment_sidebar.confirmation.continue_editing'
                )
            "
            dialogTestid="discard-dialog"
            headerTestid="discard-dialog-title"
            contentTestid="discard-dialog-content"
            cancelButtonTestid="discard-dialog-cancel-button"
            closeButtonTestid="discard-dialog-close-button"
            confirmButtonTestid="discard-dialog-confirm-button"
            @confirm="close"
        />

        <Confirmation
            v-model="deleteDialog"
            :header="
                $t(
                    'policies.order.enrollment_sidebar.confirmation.delete.title'
                )
            "
            :content="
                $t(
                    'policies.order.enrollment_sidebar.confirmation.delete.content',
                    {
                        user: fullName
                    }
                )
            "
            confirm-button-class="p-button-danger"
            :confirmButtonText="
                $t(
                    'policies.order.enrollment_sidebar.confirmation.confirm_delete'
                )
            "
            :cancelButtonText="$t('buttons.cancel')"
            dialogTestid="delete-dialog"
            headerTestid="delete-dialog-title"
            contentTestid="delete-dialog-content"
            cancelButtonTestid="delete-dialog-cancel-button"
            closeButtonTestid="delete-dialog-close-button"
            confirmButtonTestid="delete-dialog-confirm-button"
            @confirm="confirmDelete"
        />
    </Drawer>
</template>

<style lang="scss">
.enrollment-section {
    .error-banner-container {
        position: sticky;
        top: 0px;
        z-index: 999;

        .banner {
            background: #ffe7e6;
            padding: 10.5px;
            color: #b32b23;
            border-radius: 6px;

            a {
                color: #b32b23;
                text-decoration: underline;
            }
        }
    }

    .p-divider-content {
        z-index: 0;
    }
}

.custom-header {
    .delete-btn {
        right: -19rem;
    }
}
</style>
