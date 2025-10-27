<script setup>
import { useI18n } from 'vue-i18n';
import { computed, onMounted, ref, reactive, watch } from 'vue';
import { useCodeSetStore } from '@/modules/plans/stores/CodeSet';
import { useBenefitStore } from '@/modules/plans/stores/Benefit';
import useEventsBus from '@/composables/event-bus';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});

const { t, locale } = useI18n();
const codeSetStore = useCodeSetStore();
const benefitStore = useBenefitStore();
const { emit } = useEventsBus();

const busy = ref(false);
const loadingCodeSets = ref(false);
const loadingResources = ref(false);
const codeSets = ref([]);
const resources = ref([]);
const types = [
    { name: t('common.code_services'), code: 'code_services' },
    { name: t('common.code_groups'), code: 'code_groups' }
];

let formData = reactive({
    code_set: null,
    type: null,
    resources: []
});

onMounted(() => {
    getCodeSets();
});

watch(
    () => formData.code_set,
    () => {
        resetForm();
    }
);

const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength
        ? text.substring(0, maxLength) + '...'
        : text;
};

const resourcesTitle = computed(() => {
    if (formData.type?.code === 'code_services') {
        return t('common.code_services');
    }
    if (formData.type?.code === 'code_groups') {
        return t('common.code_groups');
    }

    return '';
});

const resourcesOption = computed(() => {
    if (formData.type?.code === 'code_services') {
        return 'code';
    }
    if (formData.type?.code === 'code_groups') {
        return 'name';
    }

    return '';
});

const getCodeSets = async (search) => {
    try {
        loadingCodeSets.value = true;
        const res = await codeSetStore.searchCodeSets(
            {
                search: {
                    value: search
                },
                filters: [{ field: 'status', operator: '=', value: 'active' }]
            },
            { limit: 100 }
        );
        codeSets.value = res.data;
    } finally {
        loadingCodeSets.value = false;
    }
};

const getResources = async (value) => {
    if (formData.type.code === 'code_services') {
        getCodeSetsServices(value);
    } else {
        getCodeSetsGroups(value);
    }
};

const getCodeSetsServices = async (value) => {
    try {
        loadingResources.value = true;
        const res = await codeSetStore.getExcludedServicesCodesForBenefit(
            props.id,
            formData.code_set.id,
            {
                search: {
                    value: value
                }
            },
            { limit: 100 }
        );
        resources.value = res.data;
    } finally {
        loadingResources.value = false;
    }
};

const getCodeSetsGroups = async (value) => {
    try {
        loadingResources.value = true;
        const res = await codeSetStore.searchCodeGroupsExclude(
            props.id,
            formData.code_set.id,
            {
                search: {
                    value: value
                },
                filters: [{ field: 'status', operator: '=', value: 'active' }]
            },
            { limit: 100 }
        );
        resources.value = res.data;
    } finally {
        loadingResources.value = false;
    }
};

const resetForm = () => {
    formData.type = null;
    formData.resources = [];
};

const syncBenefitServices = async () => {
    if (formData.resources.length == 0) return;

    try {
        const resources = formData.resources.map((item) => item.id);
        busy.value = true;
        formData.type.code === 'code_services'
            ? await benefitStore.attachBenefitWithCodeServices(
                  props.id,
                  resources
              )
            : await benefitStore.attachBenefitWithCodeServicesGroup(
                  props.id,
                  resources
              );

        formData.code_set = null;
        resetForm();
        emit('reloadBenefitCodeGroups');
        emit('reloadBenefitServices');
        emit('reloadBenefit');
    } finally {
        busy.value = false;
    }
};
</script>
<template>
    <div class="grid grid-cols-12 gap-4 mb-4 items-end">
        <div class="col-span-3">
            <label for="type" class="mb-2">{{ $t('common.code_set') }}</label>
            <ApiDropdown
                option-label="name"
                localed
                v-model="formData.code_set"
                @search="getCodeSets"
                :loading="loadingCodeSets"
                :items="codeSets"
                :tooltip="true"
                :tooltipLength="30"
                class="w-full"
            />
        </div>
        <div class="col-span-3">
            <label for="type" class="mb-2">{{ $t('common.type') }}</label>
            <InputField
                id="type"
                variant="select"
                v-model="formData.type"
                :disabled="busy || !formData.code_set"
                :options="types"
                optionLabel="name"
                class="w-full"
                :placeholder="$t('common.select')"
                @change="
                    () => {
                        formData.resources = [];
                        getResources('');
                    }
                "
            />
        </div>
        <div class="col-span-5">
            <label for="resources" class="mb-2">{{ resourcesTitle }}</label>
            <ApiMultiselect
                id="resources"
                :localed="formData.type?.code === 'code_groups'"
                :option-label="resourcesOption"
                :disabled="busy || !formData.type"
                v-model="formData.resources"
                @search="getResources"
                :loading="loadingResources"
                :items="resources"
                :tooltip="true"
                :tooltipLength="70"
            />
        </div>
        <div class="col-span-1 edit-cancel-button">
            <Button
                icon="pi pi-plus"
                :loading="busy"
                :disabled="formData.resources.length === 0 || busy"
                class="mt-2 p-button-rounded p-button-outlined"
                @click="syncBenefitServices"
            />
        </div>
    </div>
</template>
