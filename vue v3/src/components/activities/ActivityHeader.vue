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
        <div class="flex justify-content-between align-items-center py-4">
            <!-- Tabs -->
            <div>
                <Button
                    v-for="(tab, i) in activityTypes"
                    :key="tab.value"
                    size="small"
                    :label="tab.label"
                    :outlined="activeTab !== tab.value"
                    :severity="activeTab !== tab.value ? 'secondary' : ''"
                    :class="[
                        { 'border-noround-right': !i },
                        { 'border-300 text-800': tab.value !== activeTab },
                        {
                            'border-noround border-left-none':
                                i && i < activityTypes.length - 1
                        },
                        {
                            'border-noround-left border-left-none':
                                i === activityTypes.length - 1
                        }
                    ]"
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
            </div>

            <!-- New Activity Button -->
            <div class="flex">
                <Button
                    label="New Activity"
                    icon="pi pi-plus"
                    size="small"
                    class="border-noround-right"
                    @click="toggle"
                />
                <div class="border-left-1 border-blue-600" />
                <Button
                    icon="pi pi-chevron-down"
                    size="small"
                    class="border-noround-left"
                />
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
