<script setup>
import { reactive, ref } from 'vue';
import AdjudicationConfirmDialog from '@/modules/claims/components/adjudication/AdjudicationConfirmDialog.vue';

const props = defineProps({
    data: {
        type: Object,
        required: true
    },
    index: {
        type: Number
    },
    buttonOutline: {
        type: Boolean,
        default: false
    }
});

const dialogState = reactive({
    visible: false,
    mode: ''
});

const menuItems = ref([]);
const menuRef = ref();

const actions = {
    active: [
        {
            label: 'Deactivate',
            icon: 'pi pi-times',
            command: (event) => openDialog('inactive', event.itemData)
        }
    ],
    draft: [
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            command: (event) => openDialog('delete', event.itemData)
        },
        {
            label: 'Activate',
            icon: 'pi pi-check',
            command: (event) => openDialog('active', event.itemData)
        }
    ],
    inactive: [
        {
            label: 'Activate',
            icon: 'pi pi-check',
            command: (event) => openDialog('active', event.itemData)
        }
    ]
};

const showActions = (event) => {
    // inject row data into menu item commands
    menuItems.value = actions[props.data.status].map((item) => ({
        ...item,
        command: () => item.command({ itemData: props.data }) // inject the row's data
    }));
    menuRef.value.toggle(event);
};

const openDialog = (mode) => {
    dialogState.mode = mode;
    dialogState.visible = true;
};

const handleConfirm = () => {
    dialogState.visible = false;
};
</script>

<template>
    <Button
        :label="$t('common.actions')"
        icon="pi pi-chevron-down"
        iconPos="right"
        size="small"
        :class="buttonOutline ? 'p-button-outlined' : ''"
        @click="showActions($event)"
        :data-testid="'actions-button-' + index"
    />
    <Menu
        ref="menuRef"
        id="overlay_menu"
        :model="menuItems"
        :popup="true"
        data-testid="actions-menu"
    />

    <AdjudicationConfirmDialog
        v-model:visible="dialogState.visible"
        :mode="dialogState.mode"
        :queue="data"
        @confirm="handleConfirm"
    />
</template>

<style scoped lang="scss"></style>
