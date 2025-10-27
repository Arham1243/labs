<script setup>
import { ref, onBeforeMount, onMounted, onUnmounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useHelpers } from '@/composables';
import { useSmartTemplate } from '@/modules/policies/composables/smartTemplate.js';

import { usePoliciesStore } from '@/modules/policies/stores/Policies';

const router = useRouter();
const route = useRoute();
const policiesStore = usePoliciesStore();
const { t } = useI18n();
const helpers = useHelpers();
const { selectedWorkflow, uploadedFile, unmatchedSystemFieldsCount, reset } =
    useSmartTemplate();

const openOrderDetailsDialog = ref(false);
const discardDialog = ref(false);
const persistedSteps = ref(new Set());

const STEP_ADD_APPLICANTS = {
    id: 1,
    to: { name: 'Add Applicants' },
    label: 'policies.order.stepper.add_applicants'
};

const STEP_MATCH_COLUMNS = {
    id: 2,
    to: { name: 'Match Columns' },
    label: 'policies.order.stepper.match_columns'
};

const STEP_FIX_FORMAT = {
    id: 3,
    to: { name: 'Fix Format' },
    label: 'policies.order.stepper.fix_format'
};

const STEP_REVIEW = {
    id: 4,
    to: { name: 'Review' },
    label: 'policies.order.stepper.review'
};

const STEP_SUMMARY = {
    id: 5,
    to: { name: 'Summary' },
    label: 'policies.order.stepper.summary'
};

const STEP_PAYMENT = {
    id: 6,
    to: { name: 'Payment' },
    label: 'policies.order.stepper.payment'
};

const STEP_SUCCESS = {
    id: 7,
    to: { name: 'Success' },
    label: 'policies.order.stepper.success'
};

const stepperItems = computed(() => {
    const steps = [
        STEP_ADD_APPLICANTS,
        STEP_REVIEW,
        STEP_SUMMARY,
        STEP_PAYMENT,
        STEP_SUCCESS
    ];

    if (selectedWorkflow.value?.method == 'bulk') {
        if (uploadedFile.value) {
            var index = 1;
            if (persistedSteps.value.has(STEP_MATCH_COLUMNS.id)) {
                steps.splice(index, 0, STEP_MATCH_COLUMNS);
                index++;
            } else if (unmatchedSystemFieldsCount.value !== 0) {
                steps.splice(index, 0, STEP_MATCH_COLUMNS);
                persistedSteps.value.add(STEP_MATCH_COLUMNS.id);
                index++;
            }
            steps.splice(index, 0, STEP_FIX_FORMAT);
        } else {
            steps.splice(1, 0, ...[STEP_MATCH_COLUMNS, STEP_FIX_FORMAT]);
        }
    }

    if (policiesStore.isPayLater) {
        const paymentIndex = steps.findIndex(
            (step) => step.id === STEP_PAYMENT.id
        );
        if (paymentIndex !== -1) {
            steps.splice(paymentIndex, 1);
        }
    }

    // Return with both formats: original for logic + PrimeVue 4 format
    return steps.map((step, index) => ({
        ...step,
        label: t(step.label),
        value: String(index + 1) // Add PrimeVue 4 value property
    }));
});

// PrimeVue 4 Stepper mappings using the single stepperItems
const routeToStepMap = computed(() => {
    const map = {};
    stepperItems.value.forEach((step) => {
        map[step.to.name] = step.value;
    });
    return map;
});

const stepToRouteMap = computed(() => {
    const map = {};
    stepperItems.value.forEach((step) => {
        map[step.value] = step.to.name;
    });
    return map;
});

const currentStep = computed(() => {
    return routeToStepMap.value[route.name] || '1';
});

const onStepChange = (stepValue) => {
    const routeName = stepToRouteMap.value[stepValue];
    if (routeName && routeName !== route.name) {
        router.push({ name: routeName });
    }
};

const getItem = async () => {};

const closePolicyWorkflow = (event) => {
    discardDialog.value = true;
};

const confirmCloseOrderPoliciesWorkflow = () => {
    router.push({
        name: policiesStore.exitOrderTo,
        query: policiesStore.exitOrderToQuery
    });
    reset();
};

const openOrderPoliciesDialog = (event) => {
    openOrderDetailsDialog.value = true;
};

const handleBeforeUnload = (event) => {
    event.preventDefault();
    event.returnValue = '';
};

onBeforeMount(() => {
    getItem();
});

onMounted(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
});

onUnmounted(() => {
    reset();
    policiesStore.clearOrderDetails();
    window.removeEventListener('beforeunload', handleBeforeUnload);
});
</script>

<template>
    <div class="relative container">
        <Header hide-back>
            <template #title>
                <div>
                    <div class="flex flex-col">
                        <div class="p-break-word" data-testid="page-title">
                            {{ $t('policies.order.title') }}
                        </div>
                        <div class="flex items-start">
                            <Button
                                class="no-outline no-padding text-primary"
                                data-testid="order-details-button"
                                @click="openOrderPoliciesDialog"
                                :label="
                                    helpers.getLocaleValue(
                                        policiesStore.client?.name
                                    )
                                "
                                link
                            />
                        </div>
                    </div>
                </div>
            </template>
            <template #actions>
                <Button
                    @click="closePolicyWorkflow"
                    icon="pi pi-times"
                    severity="secondary"
                    outlined
                    class="px-12 py-2"
                    data-testid="close-button"
                />
            </template>
        </Header>

        <Dialog
            data-testid="order-dialog"
            v-if="openOrderDetailsDialog"
            v-model:visible="openOrderDetailsDialog"
            modal
            header="Order Details"
            :style="{ width: '480px' }"
            :closable="false"
        >
            <template #header>
                <div class="flex items-center justify-between w-full">
                    <div
                        class="p-dialog-title"
                        data-testid="order-dialog-title"
                    >
                        Order Details
                    </div>
                    <Button
                        icon="pi pi-times"
                        text
rounded
                        data-testid="order-dialog-close"
                        @click="openOrderDetailsDialog = false"
                        aria-label="Close"
                    />
                </div>
            </template>
            <div class="text-sm">
                <div>
                    <div class="details">
                        <p>
                            <span data-testid="order-client-label"
                                >Client Name</span
                            >
                        </p>
                        <p>
                            <span data-testid="order-client-value">
                                {{
                                    helpers.getLocaleValue(
                                        policiesStore.client.name
                                    )
                                }}
                            </span>
                        </p>
                    </div>

                    <div class="details">
                        <p>
                            <span data-testid="order-business-unit-label"
                                >Business Unit</span
                            >
                        </p>
                        <p>
                            <span data-testid="order-business-unit-value">
                                {{
                                    helpers.getLocaleValue(
                                        policiesStore.businessUnit.name
                                    )
                                }}
                            </span>
                        </p>
                    </div>

                    <div class="details">
                        <p>
                            <span data-testid="order-contact-source-label"
                                >Contact Source</span
                            >
                        </p>
                        <p>
                            <span data-testid="order-contact-source-value">
                                {{ policiesStore.contactSource.name }}
                            </span>
                        </p>
                    </div>
                </div>

                <template
                    v-if="policiesStore.contactSource == 'message_center'"
                >
                    <Divider />
                    <div>
                        <div class="flex justify-between font-semibold">
                            <span data-testid="order-message-sender-name"
                                >First Name Last Name</span
                            >
                            <span data-testid="order-message-timestamp"
                                >16 Nov 2023 • 11:33 AM</span
                            >
                        </div>
                        <div class="mt-2">
                            <span data-testid="order-message-content">
                                Reference site about Lorem Ipsum, giving
                                information on its origins, as well as a random
                                Lipsum generator. Reference site about Lorem
                                Ipsum, giving information on its origins, as
                                well as a random Lipsum generator....
                            </span>
                        </div>
                    </div>
                </template>
            </div>
        </Dialog>

        <div class="mt-6">
            <!-- PrimeVue 4 Stepper -->
            <Stepper :value="currentStep" class="w-full vertical-stepper">
                <StepList>
                    <Step
                        v-for="item in stepperItems"
                        :key="item.value"
                        :value="item.value"
                        @click="onStepChange(item.value)"
                        :class="{ 'cursor-pointer': true }"
                    >
                        {{ item.label }}
                    </Step>
                </StepList>
            </Stepper>
            <router-view v-slot="{ Component, route }">
                <component
                    :is="Component"
                    v-bind="route.params"
                    @close-workflow="closePolicyWorkflow"
                />
            </router-view>
        </div>

        <Confirmation
            v-model="discardDialog"
            :header="$t('policies.confirmation_dialog.header')"
            :content="$t('policies.confirmation_dialog.content')"
            confirm-button-class="p-button-danger"
            :confirmButtonText="
                $t('policies.confirmation_dialog.confirm_button_label')
            "
            :cancelButtonText="
                $t('policies.confirmation_dialog.cancel_button_label')
            "
            @confirm="confirmCloseOrderPoliciesWorkflow"
            dialog-testid="discard-order-dialog"
            close-button-testid="discard-order-close-button"
            cancel-button-testid="discard-order-cancel-button"
            confirm-button-testid="discard-order-confirm-button"
            header-testid="discard-order-title"
            content-testid="discard-order-content"
        />
    </div>
</template>

<style lang="scss" scoped>
.no-outline:focus {
    background: transparent !important;
    box-shadow: none !important;
    border-color: transparent !important;
}

.no-padding {
    padding: 0 !important;
}

.details {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;

    p {
        text-align: left;
        width: 100%;
        padding-top: 0.5rem;
        margin-bottom: 2px;
    }

    p:first-of-type {
        font-weight: bold;
        width: 186px;
        margin-bottom: 2px;
    }
}
</style>
