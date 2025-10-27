<script setup>
import { ref, watch, computed, onBeforeMount, nextTick } from 'vue';
import { useCommonStore } from '@/stores';
import { useGlobalStore } from '@/stores';
import { usePoliciesStore } from '@/modules/policies/stores/Policies';
import { useCartsStore } from '@/modules/policies/stores/Carts';
import { useClientStore } from '@/modules/clients/stores/Client';
import { usePlanStore } from '@/modules/plans/stores/Plan';
import { useHelpers } from '@/composables';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useGenders } from '@/modules/policies/composables/Genders.js';
import lodash from 'lodash';

import '@/modules/policies/assets/styles/style.css';

const ENROLLMENT_TEMPLATE = {
    plan_id: null,
    applicant_type_id: null,
    first_name: null,
    last_name: null,
    date_of_birth: null,
    gender_id: null,
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
const cartStore = useCartsStore();
const clientStore = useClientStore();
const planStore = usePlanStore();
const helpers = useHelpers();
const { t } = useI18n();
const toast = useToast();
const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false
    },
    insured: {
        type: Object,
        required: true
    }
});

const emits = defineEmits(['close', 'refresh']);

const clients = ref([]);
const businessUnits = ref([]);
const plans = ref([]);
const selectedClient = ref(null);
const selectedBusinessUnit = ref(null);
const loadingClients = ref(false);
const loadingBusinessUnits = ref(false);
const loadingResidentCountries = ref(true);
const loadingDestinationCountries = ref(true);
const loadingOriginCountries = ref(true);
const residentCountries = ref([]);
const destinationCountries = ref([]);
const originCountries = ref([]);
const policyTypes = ref([]);
const originalEnrollment = ref({});
const enrollment = ref({});
const discardDialog = ref(false);
const confirmLoading = ref(false);
const errorCount = ref(0);
const cart = ref(null);
const genders = ref([]);

const isVisible = computed({
    get() {
        return props.isOpen;
    },
    set() {
        close();
    }
});

const isBusinessUnitFieldDisabled = computed(
    () =>
        !selectedClient.value ||
        (!!selectedBusinessUnit.value && businessUnits.value.length == 1)
);

const isNotChanged = computed(() => {
    return lodash.isEqual(originalEnrollment.value, enrollment.value);
});

const hasErrors = computed(() => {
    return !!errorCount.value;
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
    } catch (error) {
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
    } catch (error) {
    } finally {
        loadingBusinessUnits.value = false;
    }
};

const getPlans = async () => {
    try {
        if (selectedBusinessUnit.value?.id) {
            const res = await planStore.searchPlanByBusinessUnitUuids(
                {
                    business_unit_ids: [selectedBusinessUnit.value.id]
                },
                { onlyActive: true }
            );
            plans.value = res.data;
        } else {
            plans.value = [];
        }
    } catch (error) {
    } finally {
    }
};

const getCountries = async (search) => {
    try {
        const res = await commonStore.searchCountries({
            search: {
                value: search
            }
        });
        return res.data;
    } catch (error) {
        return [];
    }
};

const getResidentCountries = async (search) => {
    try {
        loadingResidentCountries.value = true;
        residentCountries.value = await getCountries(search);
    } catch (error) {
    } finally {
        loadingResidentCountries.value = false;
    }
};

const getDestinationCountries = async (search) => {
    try {
        loadingDestinationCountries.value = true;
        destinationCountries.value = await getCountries(search);
    } catch (error) {
    } finally {
        loadingDestinationCountries.value = false;
    }
};

const getOriginCountries = async (search) => {
    try {
        loadingOriginCountries.value = true;
        originCountries.value = await getCountries(search);
    } catch (error) {
    } finally {
        loadingOriginCountries.value = false;
    }
};

const cancel = (event) => {
    isNotChanged.value ? close() : (discardDialog.value = true);
};

const close = () => {
    unlockScroll();
    emits('close');
};

const showToastMessage = () => {
    toast.add({
        severity: 'success',
        summary: t('insured_overview.new_policy'),
        detail: t('insured_overview.new_policy_sidebar.added_successfully'),
        life: 2000
    });
};

const confirm = async (event) => {
    const isSuccessful = await save();

    if (isSuccessful) {
        showToastMessage();
        close();
    }
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

const createCart = async () => {
    try {
        const res = await policiesStore.createCart({
            business_unit_id: policiesStore?.businessUnit?.id
        });
        cart.value = res.data;
    } catch (error) {
    } finally {
    }
};

const save = async () => {
    confirmLoading.value = true;

    policiesStore.setOrderDetails(
        selectedClient.value,
        selectedBusinessUnit.value
    );

    try {
        if (
            !cart.value ||
            (cart.value &&
                (cart.value.client_id != selectedClient.value.id ||
                    cart.value.business_unit_id !=
                        selectedBusinessUnit.value.id))
        ) {
            await createCart();
        }

        if (!cart.value) {
            scrollToError();
            return false;
        }

        const modifiedEnrollment = {
            ...enrollment.value,

            residence_country_id: enrollment.value.residence_country_id?.id,
            destination_country_id: enrollment.value.destination_country_id?.id,
            origin_country_id: enrollment.value.origin_country_id?.id,

            address: enrollment.value.address,
            date_of_birth: helpers.formatDate(
                enrollment.value.date_of_birth,
                'YYYY-MM-DD'
            ),
            start_date: helpers.formatDate(
                enrollment.value.start_date,
                'YYYY-MM-DD'
            ),
            end_date: helpers.formatDate(
                enrollment.value.end_date,
                'YYYY-MM-DD'
            )
        };

        const res = await policiesStore.validateEnrollments([
            modifiedEnrollment
        ]);

        enrollment.value.is_duplicate = false;
        if (!res.isValid) {
            if (res.isDuplicate) {
                enrollment.value.is_duplicate = true;
                enrollment.value.duplicate_enrollment = res.duplicateEnrollment;
            }
            scrollToError();
            return false;
        }

        await policiesStore.createEnrollments([modifiedEnrollment]);
        const billingDetails = await cartStore.getCheckout();
        await cartStore.processCheckout({
            payment_type: billingDetails.data.payment_type
        });
        await new Promise((resolve) => setTimeout(resolve, 2000));
        emits('refresh');
        return true;
    } catch (error) {
        scrollToError();
        return false;
    } finally {
        confirmLoading.value = false;
    }
};

const updateErrorCount = () => {
    const errorElements = document.querySelectorAll('small.p-error');
    errorCount.value = errorElements.length;
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

const loadEnrollment = () => {
    originalEnrollment.value = lodash.cloneDeep(ENROLLMENT_TEMPLATE);

    originalEnrollment.value = {
        ...originalEnrollment.value,
        first_name: props.insured.first_name,
        last_name: props.insured.last_name,
        date_of_birth: props.insured.date_of_birth,
        gender_id: props.insured.gender_id,
        email: props.insured.email,
        passport_number: props.insured.passport_no,
        origin_country_id: originCountries.value.find(
            (country) => country.id == props.insured.country_id
        )
    };

    enrollment.value = lodash.cloneDeep(originalEnrollment.value);
    const errors = policiesStore.getFormattedErrors(
        enrollment.value.errors ?? {}
    );
    if (Object.keys(errors).length > 0) {
        globalStore.errors = errors;
    }
};

onBeforeMount(async () => {
    loadingResidentCountries.value = true;
    loadingDestinationCountries.value = true;
    loadingOriginCountries.value = true;

    const countries = await getCountries('');

    residentCountries.value = [...countries];
    destinationCountries.value = [...countries];
    originCountries.value = [...countries];

    loadingResidentCountries.value = false;
    loadingDestinationCountries.value = false;
    loadingOriginCountries.value = false;

    useGenders().then((data) => {
        genders.value = data.genders;
    });
});

watch(selectedClient, async (newValue) => {
    if (newValue) {
        await getBusinessUnits();

        if (businessUnits.value.length == 1) {
            selectedBusinessUnit.value = businessUnits.value[0];
        }
    }
});

watch(selectedBusinessUnit, async (newValue) => {
    if (newValue) {
        await getPlans();
    }
});

watch(isVisible, (newValue) => {
    if (newValue) {
        lockScroll();
        globalStore.clearErrors();
        clients.value = [];
        businessUnits.value = [];
        cart.value = null;
        loadingClients.value = false;
        loadingBusinessUnits.value = false;
        selectedClient.value = null;
        selectedBusinessUnit.value = null;
        getClients();
        getEnrollmentTypes();
        loadEnrollment();

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
});
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
    >
        <template #header>
            <div class="custom-header relative inline-flex items-center">
                <h5 class="text-left mt-0">
                    <span :data-testid="'applicant-sidebar-title'">
                        {{ $t('insured_overview.new_policy_sidebar.title') }}
                    </span>
                </h5>
            </div>
        </template>
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
                    >
                        {{
                            $t(
                                'insured_overview.new_policy_sidebar.organization'
                            )
                        }}
                    </span></b
                >
            </Divider>
            <div class="mt-3 grid p-fluid formgrid">
                <div class="field col-12">
                    <label for="client" data-testid="client-label"
                        >{{
                            $t('insured_overview.new_policy_sidebar.client')
                        }}
                        *</label
                    >
                    <ApiDropdown
                        id="client"
                        localed
                        option-label="name"
                        v-model="selectedClient"
                        @search="getClients"
                        :loading="loadingClients"
                        :items="clients"
                        data-testid="client-name-input"
                    />
                </div>
                <div class="field col-span-12">
                    <label for="business-unit" data-testid="business-unit-label"
                        >{{
                            $t(
                                'insured_overview.new_policy_sidebar.business_unit'
                            )
                        }}
                        *</label
                    >
                    <ApiDropdown
                        id="business_unit"
                        localed
                        option-label="name"
                        v-model="selectedBusinessUnit"
                        @search="getBusinessUnits"
                        :loading="loadingBusinessUnits"
                        :disabled="isBusinessUnitFieldDisabled"
                        :items="businessUnits"
                        data-testid="business-unit-input"
                    />
                </div>
                <div class="field col-span-12">
                    <label for="plan" :data-testid="'plan-label'">
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
                    />
                </div>
            </div>
            <Divider align="center">
                <b>
                    <span
                        :data-testid="'applicant-sidebar-applicant-title'"
                        class="uppercase"
                        >{{
                            $t(
                                'insured_overview.new_policy_sidebar.insured_details'
                            )
                        }}</span
                    ></b
                >
            </Divider>
            <div class="mt-3 grid p-fluid formgrid">
                <div class="field col-12">
                    <label for="first_name" data-testid="first-name-label"
                        >{{ $t('policies.applicant.first_name') }} *</label
                    >
                    <InputField
                        id="first_name"
                        data-testid="first-name-input"
                        variant="text"
                        v-model="enrollment.first_name"
                        disabled
                    />
                </div>
                <div class="field col-span-12">
                    <label for="last_name" data-testid="last-name-label"
                        >{{ $t('policies.applicant.last_name') }} *</label
                    >
                    <InputField
                        id="last_name"
                        data-testid="last-name-input"
                        variant="text"
                        v-model="enrollment.last_name"
                        disabled
                    />
                </div>
                <div class="field col-span-12">
                    <label for="date_of_birth" data-testid="date-of-birth-label"
                        >{{ $t('policies.applicant.date_of_birth') }} *</label
                    >
                    <DatePickerV2
                        id="date_of_birth"
                        v-model="enrollment.date_of_birth"
                        disabled
                        data-testid="date-of-birth"
                    />
                </div>
                <div class="field col-span-12">
                    <label for="gender" data-testid="gender-label"
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
                        disabled
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
                <div class="field col-span-12">
                    <label for="email" data-testid="email-label">{{
                        $t('policies.applicant.email_address')
                    }}</label>
                    <InputField
                        id="email"
                        data-testid="email-input"
                        variant="text"
                        v-model="enrollment.email"
                        disabled
                    />
                </div>
                <div class="field col-span-12">
                    <label
                        for="passport_number"
                        data-testid="passport-number-label"
                        >{{ $t('policies.applicant.passport_number') }}</label
                    >
                    <InputField
                        id="passport_number"
                        data-testid="passport-number-input"
                        variant="text"
                        v-model="enrollment.passport_number"
                        disabled
                    />
                </div>
                <div class="field col-span-12">
                    <label
                        for="phone_number"
                        data-testid="phone-number-label"
                        >{{
                            $t('policies.applicant.mobile_phone_number')
                        }}</label
                    >
                    <InputField
                        id="phone_number"
                        data-testid="phone-number-input"
                        variant="phone"
                        disabled
                        v-model="enrollment.phone_number"
                    />
                </div>
                <div class="field col-span-12">
                    <label
                        for="origin_country"
                        data-testid="origin-country-label"
                        >{{ $t('policies.applicant.nationality') }} *</label
                    >
                    <ApiDropdown
                        id="origin_country_id"
                        data-testid="origin-country-input"
                        option-label="name"
                        v-model="enrollment.origin_country_id"
                        @search="getOriginCountries"
                        :loading="loadingOriginCountries"
                        :items="originCountries"
                        disabled
                    />
                </div>
                <div class="field col-span-12">
                    <label
                        for="residence_country"
                        data-testid="residence-country-label"
                        >{{
                            $t('policies.applicant.country_of_residence')
                        }}
                        *</label
                    >
                    <ApiDropdown
                        id="residence_country_id"
                        data-testid="residence-country-input"
                        option-label="name"
                        v-model="enrollment.residence_country_id"
                        @search="getResidentCountries"
                        :loading="loadingResidentCountries"
                        :items="residentCountries"
                    />
                </div>
            </div>
        </div>
        <div class="enrollment-section">
            <Divider align="center">
                <b
                    ><span
                        :data-testid="'applicant-sidebar-policy-title'"
                        class="uppercase"
                        >{{
                            $t(
                                'policies.order.enrollment_sidebar.policy_details'
                            )
                        }}</span
                    ></b
                >
            </Divider>
            <div class="mt-3 grid p-fluid formgrid">
                <div class="field col-span-12">
                    <label
                        for="applicant_type_id"
                        data-testid="applicant-type-label"
                        >{{ $t('policies.applicant.type') }} *</label
                    >
                    <InputField
                        data-testid="applicant-type-input"
                        showClear
                        id="applicant_type_id"
                        variant="select"
                        appendTo="body"
                        optionLabel="name"
                        optionValue="id"
                        v-model="enrollment.applicant_type_id"
                        :options="policyTypes"
                        :placeholder="$t('common.select')"
                    />
                </div>
                <div class="field col-span-12">
                    <label
                        for="destination_country"
                        :data-testid="'destination-country-label'"
                    >
                        {{ $t('policies.applicant.country_of_destination') }}
                        *
                    </label>
                    <ApiDropdown
                        id="destination_country_id"
                        option-label="name"
                        v-model="enrollment.destination_country_id"
                        @search="getDestinationCountries"
                        :loading="loadingDestinationCountries"
                        :items="destinationCountries"
                        :data-testid="'destination-country-dropdown'"
                    />
                </div>
                <div class="field col-span-12">
                    <label
                        for="trip_start_date"
                        :data-testid="'trip-start-date-label'"
                    >
                        {{ $t('policies.applicant.trip_start_date') }}
                        *
                    </label>
                    <DatePickerV2
                        id="start_date"
                        v-model="enrollment.start_date"
                        data-testid="trip-start-date"
                    />
                </div>
                <div class="field col-span-12">
                    <label
                        for="trip_end_date"
                        :data-testid="'trip-end-date-label'"
                    >
                        {{ $t('policies.applicant.trip_end_date') }}
                        *
                    </label>
                    <DatePickerV2
                        id="end_date"
                        v-model="enrollment.end_date"
                        data-testid="trip-end-date"
                    />
                </div>
                <div class="field col-span-12">
                    <label
                        for="name_of_school_attended"
                        :data-testid="'school-attended-label'"
                    >
                        {{ $t('policies.applicant.name_of_school_attended') }}
                    </label>
                    <InputField
                        id="name_of_school_attended"
                        variant="text"
                        v-model="enrollment.name_of_school_attended"
                        :data-testid="'school-attended-input'"
                    />
                </div>
                <div class="field col-span-12">
                    <label
                        for="student_number"
                        :data-testid="'student-number-label'"
                    >
                        {{ $t('policies.applicant.student_number') }}
                    </label>
                    <InputField
                        id="student_number"
                        variant="text"
                        v-model="enrollment.student_number"
                        :data-testid="'student-number-input'"
                    />
                </div>
                <div class="field col-span-12">
                    <label
                        for="destination_address"
                        :data-testid="'destination-address-label'"
                    >
                        {{ $t('policies.applicant.destination_address') }}
                    </label>
                    <InputField
                        id="address"
                        variant="text"
                        v-model="enrollment.address"
                        :data-testid="'destination-address-input'"
                    />
                </div>
                <div class="field col-span-12">
                    <label for="group_name" :data-testid="'group-name-label'">
                        {{ $t('policies.applicant.group_name') }}
                    </label>
                    <InputField
                        id="group_name"
                        variant="text"
                        v-model="enrollment.group_name"
                        :data-testid="'group-name-input'"
                    />
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
                    :data-testid="'applicant-sidebar-confirm-button'"
                    icon-pos="right"
                    icon="pi pi-chevron-right"
                    type="button"
                    :label="$t('buttons.confirm')"
                    :loading="confirmLoading"
                    @click="confirm"
                />
            </div>
        </div>

        <Confirmation
            v-model="discardDialog"
            :header="$t('insured_overview.new_policy_sidebar.discard_changes')"
            :content="
                $t(
                    'insured_overview.new_policy_sidebar.discard_changes_dialog_content'
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
            cancelButtonTestid="discard-dialog-cancel-button"
            closeButtonTestid="discard-dialog-close-button"
            confirmButtonTestid="discard-dialog-confirm-button"
            @confirm="close"
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
        right: -21rem;
    }
}
</style>
