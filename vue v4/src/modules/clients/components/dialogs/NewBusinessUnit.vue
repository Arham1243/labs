<script setup>
import { ref, computed, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';

import { useClientStore } from '@/modules/clients/stores';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['confirm', 'update:modelValue']);

const router = useRouter();

const clientStore = useClientStore();

const client = ref({});
const clients = ref([]);
const loadingClients = ref(false);
const dialog = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emit('update:modelValue', value);
    }
});

onBeforeMount(() => {
    getClients();
});

const getClients = async (search) => {
    try {
        loadingClients.value = true;
        const res = await clientStore.searchClients(
            {
                search: {
                    value: search
                }
            },
            { limit: 100 }
        );
        clients.value = res.data;
    } finally {
        loadingClients.value = false;
    }
};

const confirm = () => {
    clientStore.setCurrentBusinessUnit(null);
    router.push({
        name: 'New Business Unit',
        params: { clientId: client.value.id, id: -1 }
    });
    dialog.value = false;
};
</script>

<template>
    <Dialog
        v-model:visible="dialog"
        modal
        header="New Business Unit"
        :style="{ width: '480px' }"
    >
        <div>
            <p data-testid="select-client-p">
                Select the client you would like to associate this business unit
                to:
            </p>
            <ApiDropdown
                option-label="name.en"
                v-model="client"
                @search="getClients"
                :loading="loadingClients"
                :items="clients"
            />
        </div>
        <template #footer>
            <Button text autofocus label="Cancel" @click="dialog = false" />
            <Button label="Confirm" @click="confirm" />
        </template>
    </Dialog>
</template>

<style lang="scss" scoped></style>
