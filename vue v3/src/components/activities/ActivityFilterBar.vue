<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { activityLevels } from '@/config';
import { useActivityStore } from '@/stores/Activity';
import { activityDisplayMode } from '@/utils/activities';
import { useFeedStore } from '@/stores/Feed';
import { useRoute } from 'vue-router';

const props = defineProps({
    clientId: { type: [String, Number] }
});

const route = useRoute();
const { t } = useI18n();
const activeTab = computed(() => route.query.tab || 'All');

const {
    currentActivityDisplayMode,
    currentModule,
    currentModuleId,
    setCurrentActivityDisplayMode
} = useActivityStore();
const { getAllFeeds } = useFeedStore();

// Levels
const level = ref('All');

// Get index of current module, then slice the list
const filteredActivityLevels = computed(() => {
    const index = activityLevels.findIndex(
        (l) => l.id === currentModule?.value
    );
    return index !== -1 ? activityLevels.slice(index) : activityLevels;
});

// Sort dropdown
const buttonLabel = ref(t('activities.newest_to_oldest')); // default label
const menu = ref();
const items = ref([
    {
        items: [
            {
                label: t('activities.newest_to_oldest'),
                command: () => {
                    buttonLabel.value = t('activities.newest_to_oldest');
                    filterFeeds('desc');
                }
            },
            {
                label: t('activities.oldest_to_newest'),
                command: () => {
                    buttonLabel.value = t('activities.oldest_to_newest');
                    filterFeeds('asc');
                }
            }
        ]
    }
]);
const toggle = (event) => {
    menu.value.toggle(event);
};

// Display mode
const displayMode = ref(currentActivityDisplayMode.value);

// Search
const searchText = ref('');
const search = () => {};

// Sort by date function
const filterFeeds = (direction) => {
    const filters = [];

    if (activeTab.value === 'Communications')
        filters.push({
            field: 'feedable_type',
            operator: 'in',
            value: ['chat', 'phone', 'email', 'text']
        });

    if (activeTab.value !== 'All' && activeTab.value !== 'Communications') {
        let type = activeTab.value;
        if (type.endsWith('s')) {
            type = type.slice(0, -1);
        }

        filters.push({ field: 'feedable_type', value: type });
    }

    let scopes = [];
    if (level.value !== currentModule.value) {
        scopes = [
            {
                name: 'ForEntity',
                parameters: [currentModule.value, currentModuleId.value]
            },
            {
                name: 'ForLevel',
                parameters: [level.value]
            }
        ];
    } else {
        scopes = [
            {
                name: 'ForEntity',
                parameters: [currentModule.value, currentModuleId.value]
            }
        ];
    }

    getAllFeeds(props.clientId, {
        filters: filters,
        scopes: scopes,
        sort: [
            { field: 'is_pinned', direction: 'desc' },
            { field: 'created_at', direction }
        ],
        includes: ['entities']
    });
};
</script>

<template>
    <div
        class="flex justify-content-between align-items-center py-3 px-2 bg-gray-100"
    >
        <div class="flex gap-3">
            <Dropdown
                v-model="level"
                :options="filteredActivityLevels"
                optionLabel="name"
                optionValue="id"
                placeholder="Select Level"
                class="w-13rem"
                @change="filterFeeds('desc')"
            />
            <Search
                v-model="searchText"
                @search="search"
                data-testid="text-box-search-activities"
            />
        </div>
        <div class="flex align-items-center gap-2">
            <span class="font-semibold text-color-secondary"
                >{{ $t('common.sort_by') }}:</span
            >
            <Button
                :label="buttonLabel"
                icon="pi pi-chevron-down"
                icon-pos="right"
                class="border-noround-left font-bold pl-1 pr-1"
                text
                @click="toggle"
            />
            <Menu
                ref="menu"
                id="overlay_menu"
                :model="items"
                :popup="true"
                data-testid="sort-menu"
            />
            <SelectButton
                v-model="displayMode"
                :options="activityDisplayMode"
                optionLabel="label"
                optionValue="value"
                aria-labelledby="basic"
                class="ml-3"
                @click="setCurrentActivityDisplayMode(displayMode)"
            >
                <template #option="slotProps">
                    <i :class="slotProps.option.icon" />
                </template>
            </SelectButton>
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
