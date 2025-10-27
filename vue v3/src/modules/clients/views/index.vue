<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useClientStore } from '@/modules/clients/stores';
import Label from '@/components/common/Label.vue';
import { useGlobalStore } from '@/stores';
import { useHelpers } from '@/composables';

const helpers = useHelpers();
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
        <TabMenu :model="tabItems" data-testid="client-accordion-tabs" />
        <router-view />
    </div>
</template>

<style lang="scss"></style>
