<script setup>
import { onBeforeMount, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useBenefitStore } from '@/modules/plans/stores/Benefit';
import BenefitDetailsForm from '@/modules/plans/components/benefits/forms/BenefitDetailsForm.vue';
import BenefitRestrictionsForm from '@/modules/plans/components/benefits/forms/BenefitRestrictionsForm.vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});

const { t } = useI18n();
const router = useRouter();
const benefitStore = useBenefitStore();

const showUnsavedData = ref(false);
const busy = ref(false);
const loading = ref(false);
let formData = reactive({
    name: {
        [useI18n().locale.value]: ''
    },
    coverage: null,
    code: null,
    description: null,
    max_amount: null,
    effective_date: null,
    end_date: null,
    is_individual: null,
    bound: null,
    type: null,
    underwriter: null,
    underwriter_id: null,
    benefit_category: null,
    benefit_category_id: null,
    isTimeRequirement: false,
    min_time_req: {},
    isIncludeSupply: false,
    rules: [
        {
            value: null,
            timeline: null,
            supply: null,
            join_type: null,
            timeline_unit: null,
            description: null
        }
    ],
    is_reportable_to_vendors: false,
    vendors: [],
    vendor_ids: [],
    status: 'draft'
});

onBeforeMount(() => {
    getItem();
});

const getItem = async () => {
    if (props.id == -1) return;
    loading.value = true;
    const params = { include: 'category,underwriter,vendors' };
    const res = await benefitStore.getBenefit(props.id, params);
    processResponse(res.data);
    loading.value = false;
};

const handleBack = () => {
    showUnsavedData.value = true;
};

const goBack = () => {
    router.push({ name: 'Benefits' });
};

const create = async () => {
    const res = await benefitStore.createBenefit({
        ...formData,
        end_date: formData.end_date != 'Invalid date' ? formData.end_date : null
    });
    await goNext(res.data.id);
};

const update = async () => {
    const res = await benefitStore.updateBenefit(props.id, {
        ...formData,
        end_date: formData.end_date != 'Invalid date' ? formData.end_date : null
    });
    await goNext(res.data.id);
};

const goNext = async (benefitId) => {
    const res = await benefitStore.getBenefit(benefitId, {
        include: 'category,underwriter,vendors'
    });
    benefitStore.setCurrentBenefit(res.data);
    router.push({
        name: 'New Benefit Step 2',
        params: { id: res.data.id }
    });
};

const processResponse = (data) => {
    formData = data;
    formData.min_time_req = data.min_time_req ? data.min_time_req : {};
    formData.rules = data.rules ? data.rules : [];
    formData.is_individual = formData.is_individual ? 1 : 0;
    data.bound = {
        name: t(`plans.${data.bound?.value || data.bound || ''}`),
        value: data.bound?.value || data.bound
    };

    data.type = {
        name: t(`plans.${data.type?.value || data.type || ''}`),
        value: data.type?.value || data.type
    };
    formData.isTimeRequirement =
        data.min_time_req && Object.keys(data.min_time_req).length > 0
            ? true
            : false;
    formData.isIncludeSupply = data.rules?.length > 0 ? true : false;
    formData.is_reportable_to_vendors = data.is_reportable_to_vendors;
};

const processPayload = () => {
    formData.benefit_category_id = formData.benefit_category?.id;
    formData.underwriter_id = formData.underwriter?.id;
    formData.vendor_ids = formData.is_reportable_to_vendors
        ? formData.vendors?.map((item) => item.id)
        : [];
    formData.is_individual = !!formData.is_individual;
    formData.bound = formData.bound?.value;
    formData.type = formData.type?.value;

    if (!formData.isTimeRequirement) {
        formData.min_time_req = null;
    }

    formData.rules = formData.isIncludeSupply
        ? formData.rules?.map((item) => ({
              ...item,
              benefit_category_id: formData.benefit_category_id
          }))
        : [];
};

const save = async () => {
    try {
        processPayload();
        busy.value = true;
        props.id == -1 ? await create() : await update();
    } finally {
        busy.value = false;
    }
};
</script>

<template>
    <Loader v-if="loading" />
    <div v-else>
        <div class="grid grid-cols-12 mt-10">
            <div class="col-span-8 col-start-3 mb-4">
                <Card>
                    <template #content>
                        <h5 data-testid="details-title">
                            Benefit Details
                        </h5>
                        <BenefitDetailsForm is-new v-model="formData" />
                    </template>
                </Card>
            </div>
            <div class="col-span-8 col-start-3">
                <Card>
                    <template #content>
                        <h5 data-testid="restrictions-title" class="mb-12">
                            Benefit Restrictions & Reporting
                        </h5>
                        <BenefitRestrictionsForm is-new v-model="formData" />
                    </template>
                </Card>
            </div>
        </div>
        <div class="grid grid-cols-12 my-20">
            <div class="col-span-8 col-start-3">
                <div
                    class="mt-12 flex justify-between items-center edit-cancel-button"
                >
                    <Button
                        :label="$t('buttons.cancel')"
                        class="p-button-outlined"
                        @click="handleBack"
                        data-testid="cancel-button"
                    />
                    <Button
                        :label="$t('buttons.save_continue')"
                        :loading="busy"
                        icon-pos="right"
                        icon="pi pi-chevron-right"
                        @click="save"
                        data-testid="save-continue-button"
                    />
                </div>
            </div>
        </div>
        <Confirmation
            v-model="showUnsavedData"
            :header="$t('common.cancel_creation_header', { item: 'Benefit' })"
            :content="$t('common.cancel_creation_content')"
            :confirm-button-text="$t('buttons.cancel')"
            :cancel-button-text="$t('buttons.close')"
            confirm-button-class="bg-red-500 border-red-500"
            @confirm="goBack"
        />
    </div>
</template>
