<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCodeSetStore } from '../../../../stores/CodeSet';
import { useHelpers } from '@/composables';
import CodeSetDetailsForm from '../../../../components/services/forms/CodeSetDetailsForm.vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});

const helpers = useHelpers();
const router = useRouter();
const codeSetStore = useCodeSetStore();

const busy = ref(false);
const loading = ref(false);
let formData = reactive({
    name: {
        [useI18n().locale.value]: ''
    },
    status: 'draft',
    description: {},
    effective_date: helpers.getUTCDate()
});

onMounted(async () => {
    await getItem();
});

const getItem = async () => {
    if (props.id == -1) return;
    loading.value = true;
    const res = await codeSetStore.getCodeSet(props.id);
    formData = res.data;
    loading.value = false;
};

const goBack = () => {
    router.push({ name: 'Code Sets' });
};

const create = async () => {
    const res = await codeSetStore.createCodeSet(formData);
    goNext(res);
};

const update = async () => {
    const res = await codeSetStore.updateCodeSet(props.id, formData);
    goNext(res);
};

const goNext = (res) => {
    codeSetStore.setCurrentCodeSet(res.data);
    router.push({
        name: 'New Code Set Step 2',
        params: { id: res.data.id }
    });
};

const save = async () => {
    try {
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
            <div class="col-span-8 col-start-3">
                <Card>
                    <template #content>
                        <h5 class="mb-12" data-testid="details-title">
                            Code Set Details
                        </h5>
                        <CodeSetDetailsForm is-new v-model="formData" />
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

<style lang="scss" scoped></style>
