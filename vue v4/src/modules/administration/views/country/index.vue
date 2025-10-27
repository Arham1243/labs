<script setup>
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import { computed } from 'vue';
import { useHelpers } from '@/composables';

const helpers = useHelpers();
const { t } = useI18n();
const router = useRouter();
const route = useRoute();
import Label from '@/components/common/Label.vue';
import Tab from 'primevue/tab';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';

const goBack = () => {
    router.push({ name: 'Administration' });
};

const allTabItems = [
    {
        label: t('country.country'),
        to: { name: 'Country/Regions' },
        permission: 'view countries'
    },
    {
        label: t('country.region'),
        to: { name: 'Region' },
        permission: 'view regions'
    },
    {
        label: t('country.province_state'),
        to: { name: 'Province' },
        permission: 'view provinces'
    }
];

const tabItems = computed(() => {
    return helpers.filterByPermission(allTabItems);
});

// ADD ACTIVE TAB TRACKING
const activeTab = computed(() => {
    const activeIndex = tabItems.value.findIndex(tab => {
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
                    <Label test-id="page-title">{{ t('country.title') }}</Label>
                </template>
            </Header>
        </div>
        <Tabs :value="activeTab" data-testid="country-menu-tabs">
            <TabList class='custom-tab'>
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
        <router-view />
    </div>
</template>
