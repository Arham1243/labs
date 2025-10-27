<script setup>
import { ref, onBeforeMount, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTeamStore } from '@/modules/administration/stores';
import { useI18n } from 'vue-i18n';
import Tab from 'primevue/tab';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const teamStore = useTeamStore();
const loading = ref(false);
const teamId = ref(route.params.id);

onBeforeMount(async () => {
    await getItem();
});

const tabItems = computed(() => {
    if (!teamId.value) return [];
    const tabs = [
        {
            label: t('common.users'),
            to: { name: 'TeamUsers', params: { id: teamId.value } }
        },
        {
            label: t('common.roles'),
            to: { name: 'TeamRoles', params: { id: teamId.value } }
        }
    ];

    if (teamStore.currentTeam?.type === 'company') {
        tabs.push({
            label: t('scopes.title'),
            to: { name: 'TeamScopes', params: { id: teamId.value } }
        });
    }

    return tabs;
});

const goBack = () => {
    router.push({ name: 'Teams' });
};

const getItem = async () => {
    try {
        loading.value = true;
        const res = await teamStore.getTeam(teamId.value);
        teamStore.setCurrentTeam(res.data);
    } finally {
        loading.value = false;
    }
};

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

// ADD CLICK HANDLER
const handleTabClick = (tab) => {
    router.push(tab.to);
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
                        teamStore.currentTeam?.name || ''
                    }}</span></template
                >
            </Header>
        </div>
        <div class="mt-6 mb-8">
            <Tabs :value="activeTab" data-testid="teams-menu-tabs">
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
