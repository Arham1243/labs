<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHelpers } from '@/composables';
import Details from '@/modules/policies/components/insureds/Details.vue';
import Settings from '@/modules/policies/components/insureds/Settings.vue';
import Address from '@/modules/policies/components/insureds/Address.vue';
import OtherDetails from '@/modules/policies/components/insureds/OtherDetails.vue';
import ItemCard from '@/modules/policies/components/insureds/ItemCard.vue';
import { provideEditState } from '@/modules/policies/composables/useEditState';
import NewPolicy from '@/modules/policies/components/insureds/NewPolicy.vue';
import PolicyDetails from '@/modules/policies/components/policies/PolicyDetails.vue';
import Dependents from '@/modules/policies/components/insureds/Dependents.vue';
import AddNonInsuranceProductDialog from '@/modules/policies/components/dialogs/AddNonInsuranceProductDialog.vue';
import { useInsuredsStore } from '@/modules/policies/stores/Insureds';
import { maskPolicyNumber } from '@/modules/policies/utils/policyUtils';
import { ability } from '@/plugins/ability';
import { useRouter } from 'vue-router';
import { useGlobalStore } from '@/stores';

import '@/modules/policies/assets/styles/style.css';
import AddDependent from '@/modules/policies/components/insureds/AddDependent.vue';
import Beneficiaries from '@/modules/policies/components/insureds/Beneficiaries.vue';
import { PolicyModulePermission } from '@/config';

const { t } = useI18n();
const helpers = useHelpers();
const router = useRouter();
const insuredsStore = useInsuredsStore();
const globalStore = useGlobalStore();
const { showUnsavedDialog, confirmDiscard, cancelDiscard } = provideEditState();

const props = defineProps({
    insured: {
        type: Object,
        default: () => ({})
    }
});

const emits = defineEmits(['close', 'refresh']);

const insured = ref(props.insured);
const showNewPolicySidebar = ref(false);
const showPolicyDetailDialog = ref(false);
const selectedPolicy = ref({});
const showPolicyNumberInDialog = ref(false);
const showAddNonInsuranceProductDialog = ref(false);
const showAddDependentDialog = ref(false);

const policies = computed(() => {
    return (insured.value?.policies || []).slice().sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
    });
});

const policiesCount = computed(() => {
    return policies.value.length;
});

const nonInsuranceProducts = computed(() => {
    const insuredNonInsuranceProducts =
        insured.value.non_insurance_products || [];
    const policyNonInsuranceProducts = policies.value.flatMap((policy) =>
        (policy.non_insurance_products || []).map((nonInsuranceProduct) => ({
            ...nonInsuranceProduct,
            status: policy.status
        }))
    );

    const allNonInsuranceProducts = [
        ...insuredNonInsuranceProducts,
        ...policyNonInsuranceProducts
    ];

    return allNonInsuranceProducts.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
});

const nonInsuranceProductsCount = computed(() => {
    return nonInsuranceProducts.value.length || 0;
});

const dependentsCount = computed(() => {
    return insured.value?.dependents?.length || 0;
});

const getPolicyNumberDisplay = (policyNumber, shouldShow) => {
    if (!policyNumber) return '';
    return `${t('insured_overview.policy_number')} ${
        shouldShow || !ability.can('view policy administrations')
            ? policyNumber
            : maskPolicyNumber(policyNumber)
    }`;
};

const policyTitle = (policy) => {
    return getPolicyNumberDisplay(
        policy.policy_number,
        policy.showPolicyNumber
    );
};

const policyDialogTitle = (policy) => {
    return getPolicyNumberDisplay(
        policy.policy_number,
        showPolicyNumberInDialog.value
    );
};

const periodLabel = (entity) => {
    return (
        helpers.formatDate(entity.start_date) +
        ' ' +
        t('insured_overview.to') +
        ' ' +
        helpers.formatDate(entity.end_date)
    );
};

const planName = (policy) => {
    return policy.plan ? helpers.getLocaleValue(policy.plan.name) : '';
};

const businessUnitName = (policy) => {
    return policy.business_unit
        ? helpers.getLocaleValue(policy.business_unit.name)
        : '';
};

const openNewPolicySidebar = (event) => {
    showNewPolicySidebar.value = true;
};

const closeNewPolicySidebar = (event) => {
    showNewPolicySidebar.value = false;
};

const showPolicy = (policy) => {
    selectedPolicy.value = policy;
    showPolicyNumberInDialog.value = false;
    showPolicyDetailDialog.value = true;
};

const showNonInsuranceProduct = (nonInsuranceProduct) => {
    window.open(
        `/non-insurance-products/${nonInsuranceProduct.id}/details`,
        '_blank'
    );
};

const toggleMaskPolicyNumber = (policy) => {
    policy.showPolicyNumber = !policy.showPolicyNumber;
};

const toggleMaskPolicyNumberInDialog = () => {
    showPolicyNumberInDialog.value = !showPolicyNumberInDialog.value;
};

const getStatus = (status) => {
    return status ? status.split('_').join(' ') : null;
};

const refreshInsured = () => {
    emits('refresh');
};

const getInsuredByClient = async () => {
    if (!insured.value.policies?.length) return;

    try {
        const clientId = insured.value.policies[0].client_id;
        const res = await insuredsStore.getInsuredByClient(
            clientId,
            insured.value.id
        );
        insured.value = {
            ...res.data,
            ...insured.value
        };
    } catch (error) {
    } finally {
    }
};

const goToPolicyDetailsPage = (policy) => {
    router.push({
        name: 'Policy Details',
        params: { policyId: policy.id, clientId: policy.client_id }
    });
};

const openAddNonInsuranceProductDialog = (event) => {
    showAddNonInsuranceProductDialog.value = true;
};

const closeAddDependentDialog = () => {
    showAddDependentDialog.value = false;
};

const clearErrorsAndDiscard = () => {
    globalStore.clearErrors();
    confirmDiscard();
};

onMounted(() => {
    getInsuredByClient();
});
</script>

<template>
    <div class="col-12">
        <Message class="mt-0" severity="info" :closable="false">
            <span data-testid="no-primary-email-consent">{{
                $t('insured_overview.primary_email_no_consent')
            }}</span>
        </Message>
        <div class="grid">
            <div class="col-6">
                <Card class="mb-4">
                    <template #content>
                        <Details :insured="insured" :key="insured.client_id" />
                    </template>
                </Card>
                <Card>
                    <template #content>
                        <Address
                            :insured="insured"
                            :key="insured.client_id"
                            component-id="address"
                        />
                    </template>
                </Card>
            </div>
            <div class="col-6">
                <Card class="mb-4">
                    <template #content>
                        <Settings :insured="insured" :key="insured.client_id" />
                    </template>
                </Card>
                <Card>
                    <template #content>
                        <OtherDetails
                            :insured="insured"
                            :key="insured.client_id"
                        />
                    </template>
                </Card>
            </div>
        </div>
    </div>

    <div
        class="col-12"
        v-if="ability.can(PolicyModulePermission.POLICIES.VIEW)"
    >
        <div class="flex justify-content-between align-items-center">
            <h5 data-testid="policies-count">
                {{
                    $t('insured_overview.policies_count', {
                        count: policiesCount
                    })
                }}
            </h5>
            <Button
                v-if="ability.can(PolicyModulePermission.POLICIES.CREATE)"
                data-testid="new-policy-button"
                type="button"
                class="p-button-outlined"
                :label="$t('insured_overview.new_policy')"
                icon="pi pi-plus"
                @click="openNewPolicySidebar"
            />
        </div>
        <div
            class="color-grey text-sm mt-3"
            v-if="policiesCount === 0"
            data-testid="no-policies-message"
        >
            {{ $t('insured_overview.no_policies') }}
        </div>
        <div class="mt-2 flex flex-column align-items-stretch gap-2" v-else>
            <ItemCard
                v-for="policy in policies"
                :key="policy.id"
                :status="getStatus(policy.status)"
                :subtitle="periodLabel(policy)"
                :detailsLeft="planName(policy)"
                :detailsRight="businessUnitName(policy)"
                :statusTestId="'policy-status-' + policy.id"
                :subtitleTestId="'policy-period-' + policy.id"
                :detailsLeftTestId="'policy-plan-' + policy.id"
                :detailsRightTestId="'policy-business-unit-' + policy.id"
                @click="showPolicy(policy)"
            >
                <template #title="{ onClick }">
                    <Button
                        data-testid="policy-title"
                        class="item-link p-0 shadow-none text-lg"
                        :label="policyTitle(policy)"
                        @click="onClick"
                        link
                    />
                    <i
                        v-if="$ability.can('view policy administrations')"
                        data-testid="toggle-policy-number"
                        class="pi text-primary cursor-pointer ml-1"
                        :class="
                            policy.showPolicyNumber ? 'pi-eye-slash' : 'pi-eye'
                        "
                        @click="toggleMaskPolicyNumber(policy)"
                    ></i>
                </template>
            </ItemCard>
        </div>
        <div>
            <Button
                v-if="false"
                data-testid="view-all-policies-button"
                type="button"
                :label="$t('insured_overview.view_all_policies')"
                class="p-button-outlined mt-2 text-sm"
                text
            ></Button>
        </div>
    </div>

    <div
        class="col-12"
        v-if="
            ability.can(
                PolicyModulePermission.INSUREDS.NON_INSURANCE_PRODUCTS.VIEW
            )
        "
    >
        <div class="flex justify-content-between align-items-center">
            <h5 data-testid="non-insurance-products-count">
                {{
                    $t('insured_overview.non_insurance_products_count', {
                        count: nonInsuranceProductsCount
                    })
                }}
            </h5>
            <Button
                v-if="
                    ability.can(
                        PolicyModulePermission.INSUREDS.NON_INSURANCE_PRODUCTS
                            .CREATE
                    )
                "
                data-testid="new-non-insurance-product-button"
                type="button"
                class="p-button-outlined"
                :label="$t('insured_overview.add_non_insurance_product')"
                icon="pi pi-plus"
                @click="openAddNonInsuranceProductDialog"
            />
        </div>
        <div
            class="color-grey text-sm mt-4"
            v-if="nonInsuranceProductsCount === 0"
            data-testid="no-non-insurance-product-message"
        >
            {{ $t('insured_overview.no_non_insurance_products') }}
        </div>
        <div class="mt-2 flex flex-column align-items-stretch gap-2" v-else>
            <ItemCard
                v-for="nonInsuranceProduct in nonInsuranceProducts"
                :key="nonInsuranceProduct.id"
                :title="helpers.getLocaleValue(nonInsuranceProduct.name)"
                :detailsLeft="nonInsuranceProduct.id"
                :status="getStatus(nonInsuranceProduct.status)"
                :subtitle="periodLabel(nonInsuranceProduct)"
                :titleTestId="
                    'non-insurance-product-title-' + nonInsuranceProduct.id
                "
                :subtitleTestId="
                    'non-insurance-product-period-' + nonInsuranceProduct.id
                "
                :statusTestId="
                    'non-insurance-product-status-' + nonInsuranceProduct.id
                "
                :detailsLeftTestId="
                    'non-insurance-product-id-' + nonInsuranceProduct.id
                "
                @click="showNonInsuranceProduct(nonInsuranceProduct)"
            />
        </div>
    </div>

    <div
        class="col-12"
        v-if="ability.can(PolicyModulePermission.INSUREDS.DEPENDENTS.VIEW)"
    >
        <div class="flex justify-content-between align-items-center">
            <h5 data-testid="dependents-count">
                {{
                    $t('insured_overview.dependents_count', {
                        count: dependentsCount
                    })
                }}
            </h5>
            <Button
                v-if="
                    ability.can(
                        PolicyModulePermission.INSUREDS.DEPENDENTS.CREATE
                    )
                "
                data-testid="new-dependent-button"
                type="button"
                class="p-button-outlined"
                :label="$t('insured_overview.new_dependent')"
                icon="pi pi-plus"
                @click="showAddDependentDialog = true"
            />
        </div>
        <div
            class="color-grey text-sm mt-3"
            v-if="dependentsCount === 0"
            data-testid="no-dependents-message"
        >
            {{ $t('insured_overview.no_dependents') }}
        </div>
        <div v-else class="mt-2 flex flex-column align-items-stretch gap-2">
            <Dependents :insured="insured" />
        </div>
    </div>

    <div
        class="col-12"
        v-if="ability.can(PolicyModulePermission.INSUREDS.BENEFICIARIES.VIEW)"
    >
        <Beneficiaries :insured="insured" :key="insured.client_id" />
    </div>

    <NewPolicy
        :is-open="showNewPolicySidebar"
        :insured="insured"
        @refresh="refreshInsured"
        @close="closeNewPolicySidebar"
    />

    <Dialog
        class="policy-detail-dialog"
        v-model:visible="showPolicyDetailDialog"
        modal
        :header="policyDialogTitle(selectedPolicy)"
        :style="{ width: '90rem' }"
    >
        <template #header>
            <div
                class="flex align-items-start justify-content-start gap-2 w-full"
            >
                <div class="font-bold text-xl">
                    {{ policyDialogTitle(selectedPolicy) }}
                </div>
                <i
                    v-if="$ability.can('view policy administrations')"
                    class="pi text-primary cursor-pointer ml-2"
                    :class="
                        showPolicyNumberInDialog ? 'pi-eye-slash' : 'pi-eye'
                    "
                    @click="toggleMaskPolicyNumberInDialog()"
                ></i>
            </div>

            <i
                class="pi pi-external-link mt-2 mr-3 cursor-pointer"
                @click="goToPolicyDetailsPage(selectedPolicy)"
            />
        </template>
        <PolicyDetails :data="selectedPolicy" />
    </Dialog>

    <AddNonInsuranceProductDialog
        v-model="showAddNonInsuranceProductDialog"
        :insured-id="insured.id"
        @refresh="refreshInsured"
    />

    <Dialog
        v-model:visible="showAddDependentDialog"
        modal
        :header="$t('insured_overview.new_dependent')"
        :style="{ width: '40rem' }"
    >
        <AddDependent :insured="insured" @close="closeAddDependentDialog" />
    </Dialog>

    <Confirmation
        v-model="showUnsavedDialog"
        show-alert-icon
        :header="$t('common.discard_header')"
        :content="$t('common.discard_content')"
        confirm-button-class="p-button-danger"
        :confirmButtonText="$t('common.discard_cancel')"
        :cancelButtonText="$t('common.discard_continue')"
        @confirm="clearErrorsAndDiscard"
        @cancel="cancelDiscard"
    />
</template>

<style scoped lang="scss">
.color-grey {
    color: #495057;
}
</style>
