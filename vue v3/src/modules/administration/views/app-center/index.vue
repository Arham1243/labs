<script setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { onBeforeMount, ref } from 'vue';
import AppCenter from '@/modules/administration/components/app-center/AppCenter.vue';
import { useAppCenterStore } from '@/modules/administration/stores';
import { computed } from 'vue';

const { t } = useI18n();
const router = useRouter();
const appCenterStore = useAppCenterStore();
const loading = ref(false);
const items = ref([]);

onBeforeMount(async () => {
    await getItems();
});

const categories = computed(() => {
    const cats = items.value.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = {
                label: item.category_label
            };
        }
        return acc;
    }, {});

    return {
        ...cats
    };
});

const groupedItems = computed(() => {
    return items.value.reduce((acc, item) => {
        const category = item.category;
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
    }, {});
});

const goBack = () => {
    router.push({ name: 'Administration' });
};

const getItems = async () => {
    try {
        loading.value = true;
        const res = await appCenterStore.getApps();
        items.value = res.data;
    } finally {
        loading.value = false;
    }
};
const reloadItems = async () => {
    const res = await appCenterStore.getApps();
    items.value = res.data;
};
</script>

<template>
    <div>
        <div class="flex align-items-center gap-4 mb-4">
            <Button
                data-testid="back-button"
                @click="goBack"
                icon="pi text-sm pi-chevron-left"
                severity="secondary"
                outlined
                class="px-4 mb-2"
            />
            <Header hide-back>
                <template #title>
                    <span data-testid="page-title">{{
                        t('app_center.title')
                    }}</span>
                </template>
            </Header>
        </div>
        <Loader v-if="loading" />
        <TabView v-else :lazy="true" data-testid="app-center-menu-tabs">
            <TabPanel :header="t('common.all')">
                <AppCenter @reloadItems="reloadItems" :items="items" />
            </TabPanel>
            <TabPanel
                v-for="(category, key) in categories"
                :key="key"
                :header="category.label"
            >
                <AppCenter
                    @reloadItems="reloadItems"
                    :items="groupedItems[key]"
                />
            </TabPanel>
        </TabView>
    </div>
</template>
