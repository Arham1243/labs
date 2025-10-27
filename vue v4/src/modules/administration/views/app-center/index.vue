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

// ADD COMPUTED FOR CATEGORY KEYS
const categoryKeys = computed(() => {
    return Object.keys(categories.value);
});
</script>

<template>
    <div>
        <div class="flex items-center gap-6 mb-6 custom-button-header-action">
            <Button
                data-testid="back-button"
                @click="goBack"
                icon="pi text-sm pi-chevron-left"
                class="mb-2"
                variant="outlined"
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
        <Tabs v-else :lazy="true" value="0" data-testid="app-center-menu-tabs">
            <TabList class="custom-tab">
                <Tab value="0">{{ t('common.all') }}</Tab>
                <Tab
                    v-for="(category, index) in categoryKeys"
                    :key="category"
                    :value="(index + 1).toString()"
                >
                    {{ categories[category].label }}
                </Tab>
            </TabList>
            <TabPanels class="!p-0">
                <TabPanel value="0">
                    <AppCenter @reloadItems="reloadItems" :items="items" />
                </TabPanel>
                <TabPanel
                    v-for="(category, index) in categoryKeys"
                    :key="category"
                    :value="(index + 1).toString()"
                >
                    <AppCenter
                        @reloadItems="reloadItems"
                        :items="groupedItems[category]"
                    />
                </TabPanel>
            </TabPanels>
        </Tabs>
    </div>
</template>
