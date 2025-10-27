<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useBenefitStore } from '@/modules/plans/stores/Benefit';
import CategoryCreateDialog from '@/modules/plans/components/benefits/dialogs/CategoryCreateDialog.vue';
import Label from '@/components/common/Label.vue';
import { useGlobalStore } from '@/stores';
import { useHelpers } from '@/composables';

const router = useRouter();
const benefitStore = useBenefitStore();
const helpers = useHelpers();

const menu = ref();
const newCategoryDialog = ref(false);
const allMenuItems = [
    {
        label: 'Benefit',
        command: () => pushRoute('New Benefit'),
        permission: 'create benefits'
    },
    {
        label: 'Category',
        command: () => showNewCategoryDialog(),
        permission: 'create benefit categories'
    }
];

const allTabItems = [
    {
        label: 'Benefits',
        to: { name: 'Benefits' },
        permission: 'view benefits'
    },
    {
        label: 'Categories',
        to: { name: 'Categories' },
        permission: 'view benefit categories'
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

const showMenu = (event) => {
    menu.value.toggle(event);
};

const pushRoute = (name) => {
    useGlobalStore().clearErrors();
    benefitStore.setCurrentBenefit(null);
    router.push({ name, params: { id: -1 } });
};

const showNewCategoryDialog = () => {
    newCategoryDialog.value = true;
};

const benefitCategoryCreated = () => {
    router.push({ name: 'Categories' });
};
</script>

<template>
    <div>
        <Header hide-back>
            <template #title>
                <Label test-id="page-title"> Benefits </Label>
            </template>
            <template #actions>
                <Button
                    label="New"
                    icon="pi pi-plus"
                    v-if="menuItems.length > 0"
                    @click.stop="showMenu"
                    data-testid="add-new-benefit-button"
                />
                <Menu
                    ref="menu"
                    id="overlay_menu"
                    :model="menuItems"
                    :popup="true"
                />
            </template>
        </Header>
        <TabMenu :model="tabItems" data-testid="benefits-accordion-tabs" />
        <router-view />
        <CategoryCreateDialog
            v-if="
                newCategoryDialog && $ability.can('create benefit categories')
            "
            v-model="newCategoryDialog"
            @created="benefitCategoryCreated"
        />
    </div>
</template>
