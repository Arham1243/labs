<script setup>
import { useRouter } from 'vue-router';

const props = defineProps({
    id: {
        type: String,
        required: true
    },
    clientId: {
        type: String,
        required: true
    }
});

const router = useRouter();

const redirectToPlan = () => {
    router.push({
        name: 'New Plan',
        params: { id: -1 },
        query: { business_unit_id: props.id, client_id: props.clientId }
    });
};
</script>
<template>
    <Button
        @click="redirectToPlan"
        icon="pi pi-plus"
        iconPos="left"
        label="New Default Plan"
        data-testid="new-default-plan-button"
    />
</template>
