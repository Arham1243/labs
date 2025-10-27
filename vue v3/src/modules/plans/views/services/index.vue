<script setup>
import { useRouter } from 'vue-router';
import { ref, computed } from 'vue';
import { useCodeSetStore } from '../../stores/CodeSet';
import { useI18n } from 'vue-i18n';
import Label from '@/components/common/Label.vue';
import { useGlobalStore } from '@/stores';
import { useHelpers } from '@/composables';

const router = useRouter();
const codeSetStore = useCodeSetStore();
const { t } = useI18n();
const helpers = useHelpers();

const allMenuItems = [
    {
        label: t('services.code_set'),
        command: () => pushRoute('New Code Set'),
        permission: 'create service code sets'
    },
    {
        label: t('services.code_group'),
        command: () => pushRoute('New Code Group'),
        permission: 'create service code groups'
    }
];

const allTabItems = [
    {
        label: t('services.code_sets'),
        to: { name: 'Code Sets' },
        permission: 'view service code sets'
    },
    {
        label: t('services.code_groups'),
        to: { name: 'Code Groups' },
        permission: 'view service code groups'
    }
];

// Filter menuItems based on permissions
const menuItems = computed(() => {
    return helpers.filterByPermission(allMenuItems);
});

// Filter tabItems based on permissions
const tabItems = computed(() => {
    return helpers.filterByPermission(allTabItems);
});

const menu = ref();

const showMenu = (event) => {
    menu.value.toggle(event);
};

const pushRoute = (name) => {
    useGlobalStore().clearErrors();
    codeSetStore.setCurrentCodeSet(null);
    codeSetStore.setCurrentCodeGroup(null);
    router.push({ name, params: { id: -1 } });
};
</script>

<template>
    <div>
        <div>
            <Header hide-back>
                <template #title>
                    <Label test-id="page-title">{{
                        $t('services.services')
                    }}</Label>
                </template>
                <template #actions>
                    <Button
                        data-testid="add-new-service-button"
                        label="New"
                        icon="pi pi-plus"
                        v-if="menuItems.length > 0"
                        @click="showMenu"
                    />
                    <Menu
                        ref="menu"
                        id="overlay_menu"
                        :model="menuItems"
                        :popup="true"
                    />
                </template>
            </Header>
            <TabMenu :model="tabItems" data-testid="services-accordion-tabs" />
            <router-view />
        </div>
    </div>
</template>
