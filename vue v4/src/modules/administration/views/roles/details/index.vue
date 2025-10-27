<script setup>
import { useRoute, useRouter } from 'vue-router';
import { ref, onBeforeMount, computed } from 'vue';
import { useRoleStore } from '@/modules/administration/stores';
import { useI18n } from 'vue-i18n';
import Tab from 'primevue/tab';
import TabList from 'primevue/tablist';
import Tabs from 'primevue/tabs';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const roleStore = useRoleStore();
const roleId = ref(route.params.id);
const loading = ref(false);

onBeforeMount(async () => {
    await getItem();
});

const tabItems = computed(() => {
    if (!roleId.value) return [];
    return [
        {
            label: t('common.permissions'),
            to: { name: 'RolePermissions', params: { id: roleId.value } }
        },
        {
            label: t('common.teams'),
            to: { name: 'RoleTeams', params: { id: roleId.value } }
        },
        {
            label: t('common.users'),
            to: { name: 'RoleUsers', params: { id: roleId.value } }
        }
    ];
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

// ADD CLICK HANDLER
const handleTabClick = (tab) => {
    router.push(tab.to);
};

const goBack = () => {
    router.push({ name: 'Roles' });
};

const getItem = async () => {
    if (!roleId.value) return;
    try {
        loading.value = true;
        const res = await roleStore.getRole(roleId.value);
        roleStore.setCurrentRole(res.data);
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
                        roleStore.currentRole?.name || ''
                    }}</span></template
                >
            </Header>
        </div>
        <div class="mt-5 mb-7">
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
