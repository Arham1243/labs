<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import CodeSetsServiceCodes from '../../../../components/services/CodeSetsServiceCodes.vue';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});

const router = useRouter();

const busy = ref(false);

const goBack = () => {
    router.push({ name: 'New Code Set', params: { id: props.id } });
};

const goNext = () => {
    router.push({
        name: 'New Code Set Step 3',
        params: { id: props.id }
    });
};
</script>

<template>
    <div class="mt-4">
        <Card>
            <template #content>
                <CodeSetsServiceCodes
                    is-new
                    :id="id"
                    component-id="code-sets-service-codes"
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
            <Button
                label="Continue"
                icon="pi pi-chevron-right"
                iconPos="right"
                :loading="busy"
                @click="goNext"
                data-testid="continue-button"
            />
        </div>
    </div>
</template>
