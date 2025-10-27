<script setup>
import { onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import ActivityDialog from '@/components/activities/dialogs/ActivityDialog.vue';
import { useRoute, useRouter } from 'vue-router';
import { activityTypes } from '@/utils/activities';

const props = defineProps({
    clientId: { type: [String, Number] }
});

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const activeTab = ref();

// Dialog state
const dialogState = reactive({
    visible: false,
    type: ''
});

// Menu dropdown
const menu = ref();
const items = ref([
    {
        items: [
            {
                label: t('activities.note'),
                icon: 'pi pi-book',
                command: () => openDialog('note')
            },
            {
                label: t('activities.communication'),
                icon: 'pi pi-comments',
                command: () => openDialog('communication')
            },
            {
                label: t('activities.document'),
                icon: 'pi pi-file',
                command: () => openDialog('document')
            },
            {
                label: t('activities.task'),
                icon: 'pi pi-list-check',
                command: () => openDialog('task')
            }
        ]
    }
]);

const toggle = (event) => {
    menu.value.toggle(event);
};

const openDialog = (type) => {
    dialogState.type = type;
    dialogState.visible = true;
};

// Set tab based on URL param
const setTabFromRoute = (tabParam) => {
    const match = activityTypes.find((item) => item.value === tabParam);
    if (match) {
        activeTab.value = match.value;
    }
};

watch(
    () => route.query.tab,
    (newTab) => {
        setTabFromRoute(newTab);
    },
    { immediate: true }
);

onMounted(() => {
    const tabFromRoute = route.query.tab;
    if (tabFromRoute) {
        setTabFromRoute(tabFromRoute);
    } else {
        activeTab.value = 'All'; // Default tab
    }
});
</script>

<template>
    <div>
        <div class="flex justify-between items-center py-3">
            <!-- Tabs -->
            <div>
                <ButtonGroup>
                    <Button
                        v-for="(tab, i) in activityTypes"
                        :key="tab.value"
                        :label="tab.label"
                        :outlined="activeTab !== tab.value"
                        :severity="activeTab !== tab.value ? 'secondary' : ''"
                        @click="
                            () => {
                                activeTab = tab.value;
                                router.replace({
                                    query: {
                                        ...route.query,
                                        tab: activeTab
                                    }
                                });
                            }
                        "
                    />
                </ButtonGroup>
            </div>

            <!-- New Activity Button -->
            <div class="flex">
                <ButtonGroup>
                    <Button
                        label="New Activity"
                        icon="pi pi-plus"
                        class="rounded-r-none"
                        @click="toggle"
                    />
                    <Button
                        icon="pi pi-chevron-down"
                        class="rounded-l-none"
                    />
                </ButtonGroup>
                <Menu
                    ref="menu"
                    id="overlay_menu"
                    :model="items"
                    :popup="true"
                    data-testid="actions-menu"
                />
            </div>

            <!-- New Activity Dialog -->
            <ActivityDialog
                v-model:visible="dialogState.visible"
                :type="dialogState.type"
                :clientId="clientId"
            />
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
