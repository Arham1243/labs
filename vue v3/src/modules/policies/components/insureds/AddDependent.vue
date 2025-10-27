<script setup>
import { ref, onBeforeMount, computed } from 'vue';
import { useHelpers } from '@/composables';

import { useI18n } from 'vue-i18n';
import { useInsuredsStore } from '@/modules/policies/stores/Insureds';
import { usePoliciesStore } from '@/modules/policies/stores/Policies';
import { useCartsStore } from '@/modules/policies/stores/Carts';
import { usePlanStore } from '@/modules/plans/stores/Plan';
import { countriesCache } from '@/modules/policies/composables/helpers';
import useEventsBus from '@/composables/event-bus';
import { useToast } from 'primevue/usetoast';
import { useGlobalStore } from '@/stores';
import { useAssociatedPlanStore } from '@/modules/plans/stores/AssociatedPlan';
import {
    useGenders,
    getGenderLabelById
} from '@/modules/policies/composables/Genders.js';
import moment from 'moment-timezone';

const props = defineProps({
    insured: {
        type: Object,
        default: () => ({})
    },
    dependent: {
        type: Object,
        default: () => ({})
    }
});

const emits = defineEmits(['close']);

const insuredsStore = useInsuredsStore();
const planStore = usePlanStore();
const policiesStore = usePoliciesStore();
const cartStore = useCartsStore();
const globalStore = useGlobalStore();
const { t } = useI18n();
const helpers = useHelpers();
const { emit } = useEventsBus();
const toast = useToast();
const associatedPlanStore = useAssociatedPlanStore();

const insured = ref(props.insured);
const dependent = ref(props.dependent);
const insureds = ref([]);
const isLoadingInsureds = ref(false);
const plan = ref({});
const cart = ref();
const isSaving = ref(false);
const associatedPlan = ref();
const genders = ref([]);

const dependentRelations = insuredsStore.getRelations();

const isFormValid = computed(() => {
    return (
        dependent.value &&
        dependent.value.parent_policy_id &&
        dependent.value.dependent_id &&
        dependent.value.associated_plan_id &&
        dependent.value.relation
    );
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
        const dependentIds = insured.value.dependents.map(
            (d) => d.dependent_id
        );
        insureds.value = (res?.data || []).filter((i) => {
            return i.id !== insured.value.id && !dependentIds.includes(i.id);
        });
    } catch (error) {
    } finally {
        isLoadingInsureds.value = false;
    }
};

const getPlan = async (planId) => {
    plan.value = {};
    const res = await planStore.getPlan(planId, {
        include: 'associatedPlans'
    });
    plan.value = res.data;
};

const getAssociatedPlan = async (planId, associatedPlanId) => {
    associatedPlan.value = {};
    const res = await associatedPlanStore.getPlan(planId, associatedPlanId, {
        include: 'dependantsSetting.dependantsSettingsPricingDiscounts'
    });
    associatedPlan.value = res.data;
};

const onPolicyChanged = async (e) => {
    const policyId = e.value;
    const policy = insured.value?.policies?.find(
        (policy) => policy.id === policyId
    );
    await getPlan(policy.plan_id);
    updateDependentTripDates();
};

const updateDependentTripDates = async () => {
    const dependantsSetting = associatedPlan.value?.dependantsSetting;
    if (!dependantsSetting) {
        return;
    }

    const policy = insured.value?.policies?.find(
        (policy) => policy.id === dependent.value.parent_policy_id
    );

    const today = moment().utc().startOf('day');
    const startDate = moment.utc(policy.start_date);
    dependent.value.start_date = today > startDate ? today : startDate;
    dependent.value.end_date = moment.utc(policy.end_date);

    if (
        dependantsSetting?.enforce_start_date ||
        dependantsSetting?.enforce_end_date
    ) {
        dependent.value.isEnforced = true;
    } else {
        dependent.value.isEnforced = false;
    }
};

const onAssociatedPlanChanged = async (e) => {
    const associatedPlanId = e.value;
    await getAssociatedPlan(plan.value.id, associatedPlanId);

    updateDependentTripDates();
};

const addDependent = async () => {
    try {
        isSaving.value = true;

        if (!cart.value) {
            await createCart();
        }

        const policy = insured.value?.policies?.find(
            (p) => p.id === dependent.value.parent_policy_id
        );
        const selectedDependent = insureds.value?.find(
            (i) => i.id === dependent.value.dependent_id
        );

        const enrollment = {
            first_name: selectedDependent.first_name,
            last_name: selectedDependent.last_name,
            date_of_birth: helpers.formatDate(
                selectedDependent.date_of_birth,
                'YYYY-MM-DD'
            ),
            applicant_type_id: policy.applicant_type_id,
            gender: selectedDependent.gender,
            gender_id: selectedDependent.gender_id,
            email: selectedDependent.email,
            passport_number: selectedDependent.passport_number,
            phone_number: selectedDependent.phone_number,
            residence_country_id: policy.residence_country_id,
            destination_country_id: policy.destination_country_id,
            origin_country_id: selectedDependent.country_id,
            plan_id: policy.plan_id,
            associated_plan_id: dependent.value.associated_plan_id,
            parent_policy_id: policy.id,
            relation: dependent.value.relation,
            address: null,
            name_of_school_attended: null,
            student_number: null,
            group_name: null,
            start_date: helpers.formatDate(
                dependent.value.start_date,
                'YYYY-MM-DD'
            ),
            end_date: helpers.formatDate(dependent.value.end_date, 'YYYY-MM-DD')
        };

        const res = await policiesStore.validateEnrollments([enrollment]);

        enrollment.is_duplicate = false;
        if (!res.isValid) {
            let message = t('insured_overview.dependents.save_error_message');
            if (res.isDuplicate) {
                enrollment.is_duplicate = true;
                enrollment.duplicate_enrollment = res.duplicateEnrollment;

                message = t('insured_overview.dependents.error_duplicate', {
                    start_date: helpers.formatDate(
                        enrollment.duplicate_enrollment['start_date']
                    ),
                    end_date: helpers.formatDate(
                        enrollment.duplicate_enrollment['end_date']
                    )
                });
            } else if (globalStore.errors) {
                const keys = Object.keys(globalStore.errors);
                message = globalStore.errors[keys[0]][0];
            }

            toast.add({
                severity: 'error',
                summary: t('insured_overview.dependents.save_error_title'),
                detail: message,
                life: 5000
            });

            return;
        }

        await policiesStore.createEnrollments([enrollment]);
        const billingDetails = await cartStore.getCheckout();
        await cartStore.processCheckout({
            payment_type: billingDetails.data.payment_type
        });
        await new Promise((resolve) => setTimeout(resolve, 2000));

        toast.add({
            severity: 'success',
            summary: t('insured_overview.dependents.save_success_title'),
            detail: t('insured_overview.dependents.save_success_message'),
            life: 5000
        });

        emit('refresh');
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: t('insured_overview.dependents.save_error_title'),
            detail: t('insured_overview.dependents.save_error_message'),
            life: 5000
        });
    } finally {
        isSaving.value = false;
    }
};

const createCart = async () => {
    try {
        const policy = insured.value?.policies?.find(
            (policy) => policy.id === dependent.value.parent_policy_id
        );
        policiesStore.setOrderDetails(
            policy.client ? policy.client : { id: policy.client_id },
            policy.business_unit
        );

        const res = await policiesStore.createCart({
            business_unit_id: policy.business_unit?.id
        });

        cart.value = res.data;
    } finally {
    }
};

const handleClose = () => {
    emits('close');
};

const onDependentChanged = () => {
    dependent.value.parent_policy_id = null;
    dependent.value.associated_plan_id = null;
    dependent.value.relation = null;
    dependent.value.isEnforced = false;
};

onBeforeMount(() => {
    searchInsureds();
    useGenders().then((data) => {
        genders.value = data.genders;
    });
});
</script>

<template>
    <div class="p-fluid grid">
        <div class="field col-12 mb-0">
            <label for="dependent-select" data-testid="dependent-select-label"
                >{{ $t('insured_overview.dependents.dependent') }} *</label
            >
            <Dropdown
                data-testid="dependent-select"
                filter
                @filter="searchInsureds"
                @change="onDependentChanged"
                v-model="dependent.dependent_id"
                option-value="id"
                :options="insureds"
                :loading="isLoadingInsureds"
                :optionLabel="(item) => `${item.first_name} ${item.last_name}`"
                :placeholder="
                    $t('insured_overview.dependents.select_dependent')
                "
            >
                <template #option="slotProps">
                    <div>
                        <label class="font-semibold">
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
            </Dropdown>
        </div>

        <div class="field col-12 mb-0" v-if="dependent?.dependent_id">
            <label
                for="insured-policy-select"
                data-testid="insured-policy-select-label"
                >{{
                    $t('insured_overview.dependents.select_primary_policy')
                }}
                *</label
            >
            <Dropdown
                data-testid="insured-policy-select"
                filter
                v-model="dependent.parent_policy_id"
                option-value="id"
                option-label="policy_number"
                @change="onPolicyChanged"
                :options="
                    insured.policies?.filter((p) =>
                        ['active', 'not_started'].includes(p.status)
                    )
                "
                :placeholder="$t('insured_overview.dependents.select_policy')"
            />
        </div>

        <div class="field col-12 mb-0" v-if="dependent?.parent_policy_id">
            <label
                for="dependent-plan-select"
                data-testid="dependent-plan-select-label"
                >{{
                    $t('insured_overview.dependents.select_associated_plan')
                }}
                *</label
            >
            <Dropdown
                filter
                data-testid="dependent-plan-select"
                v-model="dependent.associated_plan_id"
                option-value="id"
                :option-label="(item) => $t(`common.${item.category}`)"
                :options="
                    plan.associated_plans?.filter((p) =>
                        ['active'].includes(p.status)
                    )
                "
                :placeholder="
                    $t('insured_overview.dependents.select_a_associated_plan')
                "
                @change="onAssociatedPlanChanged"
            />
        </div>

        <div class="field col-12 mb-0" v-if="dependent?.parent_policy_id">
            <label
                for="dependent-relation-select"
                data-testid="dependent-relation-select-label"
                >{{ $t('insured_overview.dependents.relationship') }} *</label
            >
            <Dropdown
                data-testid="dependent-relation-select"
                v-model="dependent.relation"
                option-value="value"
                option-label="label"
                :options="dependentRelations"
                :placeholder="$t('insured_overview.dependents.select_relation')"
            />
        </div>

        <div class="col-12 mb-0" v-if="dependent.isEnforced">
            <Message :closable="false" class="my-0">{{
                $t('insured_overview.dependents.warning_enforce_date', {
                    start_date: helpers.formatDate(dependent.start_date),
                    end_date: helpers.formatDate(dependent.end_date),
                    num_of_days:
                        moment
                            .utc(dependent.end_date)
                            .diff(moment.utc(dependent.start_date), 'days') + 1
                })
            }}</Message>
        </div>

        <div class="col-12 flex justify-content-end">
            <div>
                <Button
                    data-testid="cancel-button"
                    type="button"
                    :label="$t('buttons.cancel')"
                    class="p-button-outlined"
                    text
                    @click="handleClose"
                />
            </div>
            <div>
                <Button
                    data-testid="add-button"
                    type="button"
                    :disabled="!isFormValid"
                    :loading="isSaving"
                    :label="$t('buttons.add')"
                    @click="addDependent"
                />
            </div>
        </div>
    </div>
</template>
