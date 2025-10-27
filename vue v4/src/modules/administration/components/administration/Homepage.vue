<script setup>
import { computed, ref, watch } from 'vue';
import SettingItem from '@/modules/administration/components/administration/settings/SettingItem.vue';

const props = defineProps({
    settings: Array
});

const groupedSettings = computed(() => {
    if (!props.settings || props.settings.length === 0) {
        return [];
    }

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

const activeValues = ref([]);

watch(
    groupedSettings,
    (newGroups) => {
        if (newGroups.length > 0 && activeValues.value.length === 0) {
            activeValues.value = newGroups.map((group) => group.group);
        }
    },
    { immediate: true }
);
</script>

<template>
    <Accordion
        :multiple="true"
        v-model:value="activeValues"
        class="custom-accordion-adm"
    >
        <AccordionPanel
            v-for="group in groupedSettings"
            :key="group.group"
            :value="group.group"
            class="accordion"
        >
            <AccordionHeader class="p-accordionheader">
                <div class="flex justify-between items-center w-full gap-2">
                    <h5>{{ group.group }}</h5>
                </div>
            </AccordionHeader>
            <AccordionContent>
                <SettingItem
                    v-for="setting in group.items"
                    :key="setting.key"
                    :setting="setting"
                />
            </AccordionContent>
        </AccordionPanel>
    </Accordion>
</template>