<script setup>
import { useRouter } from 'vue-router';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useAssociatedPlanStore } from '@/modules/plans/stores/AssociatedPlan';

import AttachBenefitInit from '@/modules/plans/components/shared/AttachBenefit/AttachBenefitInit.vue';
import SyncPricesDialog from '@/modules/plans/components/shared/AttachBenefit/dialogs/SyncPricesDialog.vue';
import useEventsBus from '@/composables/event-bus';

const props = defineProps({
    id: {
        type: String,
        required: true
    },
    plan: {
        type: String,
        required: true
    }
});

const router = useRouter();
const associatedPlanStore = useAssociatedPlanStore();
const { bus } = useEventsBus();

const isChecked = ref();
const isStatementDialog = ref(false);
const isMissingCheckedDialog = ref(false);

onMounted(() => {
    getItem();
    if (bus.value.get('openSyncPricesDialog')) {
        bus.value.set('openSyncPricesDialog', null);
    }
});

onBeforeUnmount(() => {
    if (bus.value.get('openSyncPricesDialog')) {
        bus.value.set('openSyncPricesDialog', null);
    }
});

const goBack = () => {
    router.push({ name: 'New Associated Plan' });
};

const getItem = async () => {
    const res = await associatedPlanStore.getPlan(props.plan, props.id, {
        include: 'authorized',
        aggregates: [
            { relation: 'benefits', type: 'count' },
            { relation: 'benefitGroupBenefits', type: 'count' }
        ]
    });
    associatedPlanStore.setCurrentPlan(res.data);
    isChecked.value =
        associatedPlanStore.currentPlan?.accepted_statement_of_suitability;
};

const statementConfirmed = () => {
    if (isChecked.value) {
        isStatementDialog.value = false;
        goNext();
        return;
    }

    isMissingCheckedDialog.value = true;
};

const agreeAndContinue = () => {
    isChecked.value = true;
    isStatementDialog.value = false;
    goNext();
};

const acceptAgreement = () => {
    associatedPlanStore.acceptAgreement(props.id);
};

const goNext = () => {
    acceptAgreement();
    router.push({
        name: 'New Associated Plan Step 3',
        params: { id: props.id }
    });
};
</script>
<template>
    <div class="mt-4">
        <Card>
            <template #content>
                <AttachBenefitInit
                    is-new
                    is-copy
                    :id="props.id"
                    :title="$t('plans.plan_benefit_title')"
                    :store="associatedPlanStore"
                    component-id="attach-benefit-init"
                />
            </template>
        </Card>
        <div class="grid my-8">
            <div class="col-12 mx-auto">
                <div
                    class="mt-4 flex justify-content-between align-items-center"
                >
                    <Button
                        label="Back"
                        icon="pi pi-chevron-left"
                        class="p-button-outlined"
                        @click="goBack"
                        data-testid="back-button"
                    />
                    <div class="flex flex-wrap justify-content-center gap-3">
                        <div class="flex align-items-center">
                            <InputField
                                id="is_checked"
                                variant="checkbox"
                                binary
                                v-model="isChecked"
                                data-testid="statement-of-suitability-input"
                            />
                            <label
                                for="is_checked"
                                data-testid="statement-of-suitability-label"
                                class="ml-2"
                            >
                                Statement of Suitability
                                <i
                                    class="pi pi-info-circle"
                                    @click="isStatementDialog = true"
                                ></i>
                            </label>
                        </div>
                        <Button
                            label="Save & Continue"
                            icon-pos="right"
                            icon="pi pi-chevron-right"
                            @click="statementConfirmed"
                            data-testid="save-continue-button"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
    <Dialog
        v-model:visible="isMissingCheckedDialog"
        modal
        :header="$t('plans.statement_of_suitability')"
        :style="{ width: '480px' }"
    >
        <div>
            {{ $t('plans.must_agree_statement_of_suitability') }}
        </div>
        <div class="flex justify-content-end gap-2 mt-5">
            <Button
                type="button"
                :label="$t('buttons.close')"
                @click="isMissingCheckedDialog = false"
            ></Button>
        </div>
    </Dialog>
    <Dialog
        v-model:visible="isStatementDialog"
        modal
        :header="$t('plans.statement_of_suitability')"
        :style="{ width: '480px' }"
    >
        <div>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Omnis
            laborum nam necessitatibus corporis aliquam tempora? Doloremque
            nesciunt aperiam omnis provident architecto minus ut, eaque et quis?
            Dolorum cupiditate voluptatibus sit!
        </div>
        <div class="flex justify-content-end gap-2 mt-5">
            <Button
                type="button"
                :label="$t('buttons.cancel')"
                class="p-button-outlined"
                text
                @click="isStatementDialog = false"
            ></Button>
            <Button
                type="button"
                :label="$t('buttons.agree_continue')"
                @click="agreeAndContinue"
            ></Button>
        </div>
    </Dialog>
</template>
