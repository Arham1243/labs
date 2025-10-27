<script setup>
import { computed } from 'vue';
import SettingItem from '@/modules/administration/components/administration/settings/SettingItem.vue';

const props = defineProps({
    settings: Array
});

const groupedSettings = computed(() => {
    const grouped = {};

    props.settings.forEach((setting) => {
        if (setting.name) {
            if (!grouped[setting.group]) {
                grouped[setting.group] = [];
            }
            grouped[setting.group].push(setting);
        }
    });

    const allGroups = Array.from(
        new Set(props.settings.map((setting) => setting.group))
    );

    return allGroups.map((group) => ({
        group,
        items: grouped[group] || []
    }));
});

const activeIndexes = computed(() => {
    return groupedSettings.value
        .map((group, index) => (group.items.length > 0 ? index : -1))
        .filter((index) => index !== -1);
});
</script>

<template>
    <Accordion
        :multiple="true"
        :activeIndex="activeIndexes"
        expandIcon="pi pi-chevron-right font-semibold"
        collapseIcon="pi pi-chevron-down font-semibold"
    >
        <AccordionTab v-for="group in groupedSettings" :key="group.group">
            <template #header>
                <div
                    class="custom-accordian-title font-bold text-color text-xl"
                >
                    {{ group.group }}
                </div>
            </template>
            <ul class="settings p-0 m-0">
                <SettingItem
                    v-for="setting in group.items"
                    :key="setting.key"
                    :setting="setting"
                />
            </ul>
        </AccordionTab>
    </Accordion>
</template>

<style scoped>
.custom-accordian-title {
    padding-left: 0.7rem;
}
</style>
