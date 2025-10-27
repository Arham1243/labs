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
        model.value = [{ items: mapMenu(sessionStore.menuItems) }];
    } catch (err) {
        console.error(err);
    }
};

const mapMenu = (items) =>
    items
        .sort((a, b) => a.order - b.order)
        .map((item) => {
            const hasChildren = item.children?.length > 0;
            const urlData = getItemUrl(item.url);

            return {
                label: item.name,
                icon: item.icon,
                items: hasChildren ? mapMenu(item.children) : undefined,
                ...urlData,
                target: urlData.url ? '_blank' : undefined
            };
        });

const getItemUrl = (url) => {
    if (!url) return {};
    const base = window.location.origin;

    if (url.startsWith(base)) {
        return { to: url.replace(base, '') };
    } else {
        return { url };
    }
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
