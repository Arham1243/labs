<script setup>
import { ref } from 'vue';

const showClientReassignmentWarning = ref(false);

const emit = defineEmits(['addClients']);

const beginAddClients = async (clients) => {
    if (clients.find((item) => item.holding?.name)) {
        showClientReassignmentWarning.value = true;
        return;
    }
    emit('addClients');
};

defineExpose({ beginAddClients });
</script>

<template>
    <Confirmation
        v-model="showClientReassignmentWarning"
        :confirm-button-text="$t('buttons.proceed')"
        :header="$t('holdings.client_reassignment_warning_confirmation_header')"
        :content="
            $t('holdings.client_reassignment_warning_confirmation_content')
        "
        @confirm="$emit('addClients')"
    />
</template>

<style lang="scss">
.p-break-all {
    word-break: break-word;
    white-space: pre-line;
}
</style>
