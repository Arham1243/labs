<script setup>
import { onBeforeMount, ref } from 'vue';
import { useRouter } from 'vue-router';
import lodash from 'lodash';
import { useI18n } from 'vue-i18n';
import { usePlanStore } from '@/modules/plans/stores/Plan';
import AlternateInsurance from '@/modules/plans/components/plans/AlternateInsurance.vue';
import OptOutNotificationsEmails from '@/modules/plans/components/plans/OptOutNotificationsEmails.vue';
import DeclarationText from '@/modules/plans/components/plans/DeclarationText.vue';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});

const router = useRouter();
const planStore = usePlanStore();
const loading = ref(false);
const busy = ref(false);
const { t } = useI18n();

let formData = ref({});

const getItem = async () => {
    loading.value = true;

    try {
        const res = await planStore.getPlan(props.id, {
            include:
                'authorized,periods,alternateInsurance,alternateInsurance.fixedWindowPeriods,alternateInsurance.eligibilityPeriods'
        });

        const planData = res.data;
        planStore.setCurrentPlan(lodash.cloneDeep(planData));
        formData.value = planStore.getAlternateInsuranceFormData();
    } finally {
        loading.value = false;
    }
};

const updateFormData = (key, value) => {
    formData.value = {
        ...formData.value,
        [key]: value
    };
};

const saveAlternateInsurance = async () => {
    try {
        busy.value = true;

        await planStore.createOrUpdateAlternateInsurance(formData.value);

        await goNext();
    } finally {
        busy.value = false;
    }
};

onBeforeMount(async () => {
    await getItem();
});

const goNext = async () => {
    await router.push({
        name: 'New Plan Step 5 Documents',
        params: { id: props.id }
    });
};

const goBack = () => {
    router.push({
        name: 'New Plan Step 3',
        params: { id: props.id }
    });
};
</script>

<template>
    <div class="mt-4">
        <Loader v-if="loading" />
        <div v-else>
            <Card class="mb-3">
                <template #content>
                    <h5 data-testid="set-period-dates-title" class="my-3">
                        {{ $t('plans.opt_out_settings') }}
                    </h5>
                    <TabView>
                        <TabPanel :header="t('plans.alternate_insurance')">
                            <Card>
                                <template #content>
                                    <AlternateInsurance
                                        is-new
                                        v-model="formData"
                                    />
                                </template>
                            </Card>

                            <Card class="mt-4">
                                <template #content>
                                    <h5
                                        data-testid="opt-out-notifications-emails-title"
                                        class="mb-5"
                                    >
                                        {{
                                            t(
                                                'plans.opt_out_notifications_emails'
                                            )
                                        }}
                                    </h5>
                                    <OptOutNotificationsEmails
                                        v-model="formData.send_notifications"
                                    />
                                </template>
                            </Card>

                            <Card class="mt-4">
                                <template #content>
                                    <h5 class="mb-5">
                                        {{ t('plans.declaration_text') }}
                                    </h5>
                                    <DeclarationText
                                        :model-value="
                                            formData.declaration || {}
                                        "
                                        @update:model-value="
                                            updateFormData(
                                                'declaration',
                                                $event
                                            )
                                        "
                                    />
                                </template>
                            </Card>
                        </TabPanel>
                        <TabPanel :header="t('plans.outside_canada')">
                            <div class="col-12 p-3"></div>
                        </TabPanel>
                    </TabView>
                </template>
            </Card>

            <div class="grid my-8">
                <div class="col-12 mx-auto">
                    <div
                        class="mt-4 flex justify-content-between align-items-center"
                    >
                        <Button
                            :label="t('buttons.back')"
                            icon="pi pi-chevron-left"
                            class="p-button-outlined"
                            data-testid="back-button"
                            @click="goBack"
                        />
                        <div>
                            <Button
                                :label="t('buttons.save_continue')"
                                icon-pos="right"
                                icon="pi pi-chevron-right"
                                :loading="busy"
                                data-testid="save-continue-button"
                                @click="saveAlternateInsurance"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
