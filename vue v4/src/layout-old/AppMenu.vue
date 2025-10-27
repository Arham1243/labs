<script setup>
import { onBeforeMount, ref, watch } from 'vue';
import AppSubMenu from './AppSubMenu.vue';
import useEventsBus from '@/composables/event-bus';
import { useSessionStore } from '@/stores';

const { bus } = useEventsBus();
const menuLoading = ref(false);
const model = ref([{ items: [] }]);
const sessionStore = useSessionStore();

const renderMenu = async () => {
    try {
        const mappedItems = sessionStore.menuItems
            .sort((a, b) => a.order - b.order)
            .map((item) => ({
                id: item.id,
                label: item.name,
                icon: item.icon,
                ...getItemUrl(item.url),
                target: item.system === 0 ? '_blank' : undefined
            }));

        model.value[0].items = [...mappedItems];
    } catch (error) {
        console.error(error);
    }
};
const getItemUrl = (url) => {
    const currentUrl = window.location.origin;
    return url.includes(currentUrl)
        ? { to: url.replace(currentUrl, '') }
        : { url };
};

onBeforeMount(async () => {
    await renderMenu();
});

watch(
    () => bus.value.get('reloadMenu'),
    async () => {
        try {
            menuLoading.value = true;
            await sessionStore.me();
            renderMenu();
        } finally {
            menuLoading.value = false;
        }
    }
);
</script>

<template>
    <AppSubMenu :model="model" :loading="menuLoading" />
</template>

<style lang="scss" scoped></style>
