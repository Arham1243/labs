<script setup>
import { useRoute, useRouter } from 'vue-router';
import { ref, onBeforeMount, computed } from 'vue';
import { useUserStore } from '@/modules/administration/stores';
import { useI18n } from 'vue-i18n';
import Tab from 'primevue/tab';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);
const userId = ref(route.params.id);

onBeforeMount(async () => {
    await getItem();
});

const tabItems = computed(() => {
    if (!userId.value) return [];
    const tabs = [
        {
            label: t('common.teams'),
            to: { name: 'User Teams', params: { id: userId.value } }
        },
        {
            label: t('common.roles'),
            to: { name: 'User Roles', params: { id: userId.value } }
        }
    ];

    if (userStore.currentUser?.type === 'company') {
        tabs.push({
            label: t('scopes.title'),
            to: { name: 'User Scopes', params: { id: userId.value } }
        });
    }

    return tabs;
});

// ADD ACTIVE TAB TRACKING
const activeTab = computed(() => {
    const activeIndex = tabItems.value.findIndex((tab) => {
        if (tab.to.name === route.name) return true;

        const tabWords = tab.to.name.split(' ');
        const routeWords = route.name?.split(' ') || [];

        if (tabWords.length <= 1 || routeWords.length <= 1) return false;

        const tabKey = tabWords[1].replace(/s$/, '');
        const routeKey = routeWords[1].replace(/s$/, '');

        return tabKey === routeKey;
    });

    return activeIndex >= 0 ? activeIndex : 0;
});

// ADD TAB CLICK HANDLER
const handleTabClick = (tab) => {
    router.push(tab.to);
};

const goBack = () => {
    router.push({ name: 'Users' });
};

const getItem = async () => {
    if (!userId.value) return;
    try {
        loading.value = true;
        const res = await userStore.getUser(userId.value);
        userStore.setCurrentUser(res?.data);
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <Loader v-if="loading" />
    <div v-else>
       <div class="flex items-center gap-6 custom-button-header-action">
           <Button
                data-testid="back-button"
                @click="goBack"
                icon="pi text-sm pi-chevron-left"
                class="mb-2"
                variant="outlined"
            />
            <Header hide-back>
                <template #title
                    ><span data-testid="page-title">{{
                        userStore.currentUser?.name || ''
                    }}</span></template
                >
            </Header>
        </div>
        <div class="mt-6 mb-8">
            <Tabs :value="activeTab" data-testid="roles-menu-tabs">
                <TabList class="custom-tab">
                    <Tab
                        v-for="(tab, index) in tabItems"
                        :key="tab.label"
                        :value="index"
                        @click="handleTabClick(tab)"
                    >
                        {{ tab.label }}
                    </Tab>
                </TabList>
            </Tabs>
        </div>
        <router-view />
    </div>
</template>
