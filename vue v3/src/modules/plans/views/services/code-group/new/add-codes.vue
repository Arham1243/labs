<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCodeSetStore } from '../../../../stores/CodeSet';
import CodeGroupsServiceCodes from '../../../../components/services/CodeGroupsServiceCodes.vue';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});

const router = useRouter();
const codeSetStore = useCodeSetStore();

const item = ref({});
const loading = ref(true);

onMounted(async () => {
    await getItem();
});

const getItem = async () => {
    if (props.id == -1) return;
    if (codeSetStore.currentCodeGroup && codeSetStore.currentCodeGroup.id) {
        item.value = codeSetStore.currentCodeGroup;
        loading.value = false;
        return;
    }
    try {
        const res = await codeSetStore.getCodeGroup(props.id);
        item.value = res.data;
    } finally {
        loading.value = false;
    }
};

const goBack = () => {
    router.push({ name: 'New Code Group', params: { id: props.id } });
};

const goNext = () => {
    router.push({
        name: 'New Code Group Step 3',
        params: { id: props.id }
    });
};
</script>

<template>
    <Loader v-if="loading" />
    <div v-else class="mt-4">
        <Card>
            <template #content>
                <CodeGroupsServiceCodes
                    isNew
                    :id="id"
                    :code-set-id="item.service_code_set?.id"
                    componentId="code-group-service-codes"
                />
            </template>
        </Card>

        <div class="mt-4 flex justify-content-between align-items-center">
            <Button
                label="Back"
                icon="pi pi-chevron-left"
                class="p-button-outlined"
                @click="goBack"
                data-testid="back-button"
            />
            <div>
                <Button
                    label="Save & Continue"
                    icon="pi pi-chevron-right"
                    iconPos="right"
                    @click="goNext"
                    data-testid="continue-button"
                />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
