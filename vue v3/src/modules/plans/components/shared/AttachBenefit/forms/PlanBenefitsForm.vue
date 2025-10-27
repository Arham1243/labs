<script setup>
import { useI18n } from 'vue-i18n';
import { reactive, ref } from 'vue';
import useEventsBus from '@/composables/event-bus';

const props = defineProps({
    id: {
        type: String,
        required: true
    },
    store: {
        type: Object,
        required: true
    }
});

const { t } = useI18n();
const { emit } = useEventsBus();

const busy = ref(false);
const loadingResources = ref(false);
const benefits = ref([]);
const types = [
    { name: t('common.benefits'), code: 'benefits' },
    { name: t('benefit_groups.title'), code: 'benefit_groups' }
];
let formData = reactive({
    type: null,
    resources: []
});

const getResources = async () => {
    resetSelected();

    if (formData.type.code === 'benefits') {
        getBenefits();
    } else if (formData.type.code === 'benefit_groups') {
        getBenefitGroups();
    }
};

const searchResources = async (value) => {
    if (formData.type.code === 'benefits') {
        getBenefits(value);
    } else if (formData.type.code === 'benefit_groups') {
        getBenefitGroups(value);
    }
};

const getSearchFilters = () => {
    let boundValue = null;
    let typeValue = null;

    if (props.store.$id === 'PlanStore' && props.store.currentPlan) {
        const currentPlan = props.store.currentPlan;

        boundValue = currentPlan.bound;
        typeValue = currentPlan.type;

        return [
            { field: 'bound', operator: '=', value: boundValue },
            {
                type: 'and',
                field: 'type',
                operator: '=',
                value: typeValue
            }
        ];
    }

    return false;
};

const getBenefits = async (search = '') => {
    try {
        loadingResources.value = true;
        const res = await props.store.searchBenefits(props.id, {
            search: {
                value: search
            },
            ...(getSearchFilters() ? { filters: getSearchFilters() } : {}),
            limit: 100
        });

        benefits.value = res.data;
    } finally {
        loadingResources.value = false;
    }
};

const getBenefitGroups = async (search = '') => {
    try {
        loadingResources.value = true;
        const res = await props.store.searchBenefitGroups(props.id, {
            search: {
                value: search
            },
            ...(getSearchFilters() ? { filters: getSearchFilters() } : {}),
            limit: 100
        });

        benefits.value = res.data;
    } finally {
        loadingResources.value = false;
    }
};

const syncBenefit = async () => {
    if (formData.resources.length == 0) return;
    emit('openSyncPricesDialog');

    if (formData.type.code === 'benefits') {
        attachBenefits();
    } else if (formData.type.code === 'benefit_groups') {
        attachBenefitGroups();
    }
};

const attachBenefits = async () => {
    try {
        busy.value = true;
        await props.store.attachBenefits(
            props.id,
            formData.resources.map((item) => item.id)
        );

        emit('reloadPlanBenefitGroups');
        emit('reloadPlanBenefits');
        emit('reloadPlanDetails');
        emit('reloadAssociatedPlanDetails');
        emit('setHasIndividualBenefits', true);

        resetData();
    } finally {
        busy.value = false;
    }
};

const attachBenefitGroups = async () => {
    try {
        busy.value = true;
        await props.store.attachBenefitGroups(
            props.id,
            formData.resources.map((item) => item.id)
        );
        emit('reloadPlanBenefitGroups');
        emit('reloadPlanBenefits');
        emit('reloadAssociatedPlanDetails');

        emit('reloadPlanDetails');
        resetData();
    } finally {
        busy.value = false;
    }
};

const resetData = () => {
    benefits.value = [];
    formData.type = null;
    formData.resources = [];
};

const resetSelected = () => {
    benefits.value = [];
    formData.resources = [];
};
</script>
<template>
    <div class="flex gap-4 align-items-center mb-4">
        <InputField
            id="type"
            variant="dropdown"
            class="w-2"
            v-model="formData.type"
            :disabled="busy"
            :options="types"
            optionLabel="name"
            :placeholder="$t('common.select')"
            @change="
                () => {
                    formData.resources = [];
                    getResources('');
                }
            "
            data-testid="type"
        />
        <ApiMultiselect
            id="resources"
            localed
            option-label="name"
            :loading="loadingResources"
            :disabled="busy"
            v-model="formData.resources"
            :items="benefits"
            @search="searchResources"
            :tooltip="true"
            :tooltipLength="120"
            data-testid="resources"
        />
        <div style="width: 30px">
            <Button
                icon="pi pi-plus"
                :loading="busy"
                class="p-button-rounded p-button-outlined"
                @click="syncBenefit"
                data-testid="sync-benefit"
            />
        </div>
    </div>
</template>
<style lang="scss">
.p-multiselect-label-container {
    width: 500px !important;
}
</style>
