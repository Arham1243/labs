<script setup>
import { onBeforeMount, ref } from 'vue';
import { useCommonStore } from '@/stores';
import AnnouncementItem from '@/components/announcements/AnnouncementItem.vue';

const commonStore = useCommonStore();
const announcements = ref([]);

const getAnnouncements = () => {
    announcements.value = commonStore.generalSettings?.announcements || [];
};

onBeforeMount(getAnnouncements);
</script>

<template>
    <div
        class="col-12"
        v-if="announcements.length"
        data-testid="announcement-list"
    >
        <div
            v-for="(announcement, index) in announcements"
            :key="announcement.id"
            :class="index !== announcements.length - 1 ? 'mb-3' : ''"
            :data-testid="`announcement-item-${index}`"
        >
            <AnnouncementItem :announcement="announcement" />
        </div>
    </div>
</template>
