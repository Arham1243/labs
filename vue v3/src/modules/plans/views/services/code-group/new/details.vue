<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCodeSetStore } from '../../../../stores/CodeSet';
import { useHelpers } from '@/composables';
import CodeGroupDetailsForm from '../../../../components/services/forms/CodeGroupDetailsForm.vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});

const router = useRouter();
const codeSetStore = useCodeSetStore();
const helpers = useHelpers();

const busy = ref(false);
const loading = ref(false);
let formData = reactive({
    name: {
        [useI18n().locale.value]: ''
    },
    description: {},
    status: 'draft',
    effective_date: helpers.getUTCDate(),
    service_code_set: null,
    service_code_set_id: null
});

onMounted(async () => {
    await getItem();
});

const getItem = async () => {
    if (props.id == -1) return;
    try {
        loading.value = true;
        const res = await codeSetStore.getCodeGroup(props.id);
        formData = res.data;
    } finally {
        loading.value = false;
    }
};

const goBack = () => {
    router.push({ name: 'Code Groups' });
};

const create = async () => {
    const res = await codeSetStore.createCodeGroup(formData);
    goNext(res);
};

const update = async () => {
    const res = await codeSetStore.updateCodeGroup(props.id, formData);
    goNext(res);
};

const goNext = (res) => {
    codeSetStore.setCurrentCodeGroup(res.data);
    router.push({
        name: 'New Code Group Step 2',
        params: { id: res.data.id }
    });
};

const save = async () => {
    try {
        busy.value = true;
        formData.service_code_set_id = formData.service_code_set?.id || null;
        props.id == -1 ? await create() : await update();
    } finally {
        busy.value = false;
    }
};
</script>

<template>
    <Loader v-if="loading" />
    <div v-else>
        <div class="p-fluid formgrid grid my-8">
            <div class="col-8 mx-auto">
                <Card>
                    <template #content>
                        <h5 class="mb-3" data-testid="details-title">
                            Code Group Details
                        </h5>
                        <CodeGroupDetailsForm is-new v-model="formData" />
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
                        label="Cancel"
                        class="p-button-outlined"
                        @click="goBack"
                        data-testid="cancel-button"
                    />
                    <Button
                        label="Save & Continue"
                        :loading="busy"
                        @click="save"
                        data-testid="save-continue-button"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
