<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useClientStore } from '@/modules/clients/stores';
import Label from '@/components/common/Label.vue';
import { useGlobalStore } from '@/stores';
import { useHelpers } from '@/composables';
import Tabs from 'primevue/tabs';
import Tab from 'primevue/tab';
import TabList from 'primevue/tablist';

const helpers = useHelpers();
const route = useRoute();
const router = useRouter();
const clientStore = useClientStore();

const menu = ref();
const allMenuItems = [
    {
        label: 'Holding',
        command: () => pushRoute('New Holding'),
        permission: 'create holdings'
    },
    {
        label: 'Client',
        command: () => pushRoute('New Client'),
        permission: 'create clients'
    }
];

const allTabItems = [
    {
        label: 'Clients',
        to: { name: 'Clients' },
        permission: 'view clients'
    },
    {
        label: 'Holdings',
        to: { name: 'Holdings' },
        permission: 'view holdings'
    }
];

const menuItems = computed(() => {
    return helpers.filterByPermission(allMenuItems);
});

const tabItems = computed(() => {
    return helpers.filterByPermission(allTabItems);
});

const showMenu = (event) => {
    menu.value.toggle(event);
};

const activeTab = computed(() => {
    const index = tabItems.value.findIndex((tab) => tab.to.name === route.name);
    return index >= 0 ? index : 0;
});

const handleTabClick = (tab) => {
    router.push(tab.to);
};

const pushRoute = (name) => {
    useGlobalStore().clearErrors();
    clientStore.setCurrentClient(null);
    clientStore.setCurrentHolding(null);
    router.push({ name, params: { id: -1 } });
};
</script>

<template>
    <div>
        <Header hide-back>
            <template #title>
                <Label test-id="page-title"> Clients </Label>
            </template>
            <template #actions>
                <Button
                    data-testid="add-new-clients-button"
                    label="New"
                    icon="pi pi-plus"
                    @click="showMenu"
                    v-if="
                        $ability.can('create holdings') ||
                        $ability.can('create clients')
                    "
                />
                <Menu
                    ref="menu"
                    id="overlay_menu"
                    :model="menuItems"
                    :popup="true"
                />
            </template>
        </Header>
        <Tabs :value="activeTab" data-testid="client-accordion-tabs">
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
        <router-view />
    </div>
</template>

<style lang="scss"></style>
