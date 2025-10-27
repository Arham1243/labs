<script setup>
import PermissionsGroup from '@/modules/administration/components/roles/PermissionsGroup.vue';
import { onBeforeMount } from 'vue';
import useEventsBus from '@/composables/event-bus';
import { useRoleStore } from '@/modules/administration/stores';

const roleStore = useRoleStore();
const { emit } = useEventsBus();

onBeforeMount(async () => {
    emit('updateDetailsBreadcrumb', roleStore.currentRole?.name || '');
});
</script>

<template>
    <PermissionsGroup />
</template>
