<script setup>
import { onBeforeMount, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useBenefitStore } from '@/modules/plans/stores/Benefit';
import BenefitGroupsDetailsForm from '@/modules/plans/components/benefit-groups/forms/BenefitGroupsDetailsForm.vue';
import Label from '@/components/common/Label.vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});

const router = useRouter();
const benefitStore = useBenefitStore();

const loading = ref(false);
const busy = ref(false);
const showUnsavedData = ref(false);
let formData = reactive({
    name: {
        [useI18n().locale.value]: ''
    },
    coverage: null,
    max_amount: null,
    end_date: null,
    effective_date: null,
    status: 'draft',
    bound: null,
    type: null
});

onBeforeMount(() => {
    getItem();
});

const getItem = async () => {
    if (props.id == -1) return;
    loading.value = true;
    const res = await benefitStore.getBenefitGroup(props.id);
    formData = benefitStore.processResponse(res.data);
    loading.value = false;
};

const handleBack = () => {
    showUnsavedData.value = true;
};

const goBack = () => {
    router.push({ name: 'Benefit Groups' });
};

const save = async () => {
    try {
        busy.value = true;
        props.id == '-1' ? await create() : await update();
    } finally {
        busy.value = false;
    }
};

const create = async () => {
    const res = await benefitStore.createBenefitGroup(
        benefitStore.processPayload(formData)
    );
    goNext(res);
};

const update = async () => {
    const res = await benefitStore.updateBenefitGroup(
        props.id,
        benefitStore.processPayload(formData)
    );
    goNext(res);
};

const goNext = (res) => {
    benefitStore.setCurrentBenefitGroup(res.data);
    router.push({
        name: 'New Benefit Group Step 2',
        params: { id: res.data.id }
    });
};
</script>

<template>
    <Loader v-if="loading" />
    <div v-else>
        <div class="p-fluid formgrid grid mt-4 mb-8">
            <div class="col-8 mx-auto">
                <Card>
                    <template #content>
                        <h5 class="mb-3">
                            <Label test-id="page-title">{{
                                $t('benefit_groups.benefit_group_details')
                            }}</Label>
                        </h5>
                        <BenefitGroupsDetailsForm is-new v-model="formData" />
                    </template>
                </Card>
            </div>
        </div>
        <div class="grid my-8">
            <div class="col-8 mx-auto">
                <div
                    class="mt-4 flex justify-content-between align-items-center"
                >
                    <Button
                        data-testid="cancel-button"
                        label="Cancel"
                        class="p-button-outlined"
                        @click="handleBack"
                    />
                    <Button
                        data-testid="save-continue-button"
                        label="Save & Continue"
                        :loading="busy"
                        @click="save"
                    />
                </div>
            </div>
        </div>
        <Confirmation
            v-model="showUnsavedData"
            :header="
                $t('common.cancel_creation_header', { item: 'Benefit Group' })
            "
            :content="$t('common.cancel_creation_content')"
            :confirm-button-text="$t('buttons.cancel')"
            :cancel-button-text="$t('buttons.close')"
            confirm-button-class="bg-red-500 border-red-500"
            @confirm="goBack"
        />
    </div>
</template>

<style lang="scss" scoped></style>
