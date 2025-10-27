<script setup>
import { computed, ref } from 'vue';
import { useActivityStore } from '@/stores/Activity';
import { useFeedStore } from '@/stores/Feed';
import { activityDisplayModes } from '@/config';
import { useHelpers } from '@/composables';
import ActivityMessage from '@/components/activities/feedables/ActivityMessage.vue';
import ActivityContent from '@/components/activities/feedables/ActivityContent.vue';

const props = defineProps({
    clientId: { type: [String, Number], required: true },
    activeTab: { type: String, default: 'All' }
});

const sections = ref([
    { key: 'pinned', label: 'Pinned', collapsed: false },
    { key: 'today', label: 'Today', collapsed: false },
    { key: 'others', label: 'Older Activities', collapsed: true }
]);

const helpers = useHelpers();
const activeFeed = ref();

const { currentActivityDisplayMode } = useActivityStore();
const { currentFeeds } = useFeedStore();

const isFeedEmpty = computed(() => {
    return (
        currentFeeds.value?.today?.length === 0 &&
        currentFeeds.value?.others?.length === 0 &&
        currentFeeds.value?.pinned?.length === 0
    );
});
</script>

<template>
    <div
        :class="currentActivityDisplayMode === activityDisplayModes.one_column ? 'bg-gray-100' : ''"
        v-if="!isFeedEmpty"
    >
        <div v-if="currentActivityDisplayMode === activityDisplayModes.two_column">
            <Splitter style="height: 60vh; border: 0 !important;">
                <SplitterPanel class="pr-4">
                    <div class="scroll-container h-full overflow-y-auto pr-2">
                        <div v-for="section in sections" :key="section.key">
                            <div class="flex gap-3 items-center py-4">
                                <a
                                    class="cursor-pointer"
                                    :class="
                                        section.collapsed
                                            ? 'pi pi-chevron-right'
                                            : 'pi pi-chevron-down'
                                    "
                                    @click="
                                        section.collapsed = !section.collapsed
                                    "
                                />
                                <h4 class="m-0 font-normal">
                                    {{ section.label }}
                                </h4>
                            </div>

                            <div
                                v-for="feed in currentFeeds[section.key]"
                                :key="feed.id"
                                v-if="!section.collapsed"
                            >

                                <ActivityMessage
                                    class="cursor-pointer"
                                    :class="activeFeed === feed ? 'bg-sky-50' : ''"
                                    :feed="feed"
                                    @click="() => {
                                        activeFeed = feed
                                    }"
                                />
                            </div>
                        </div>
                    </div>
                </SplitterPanel>

                <SplitterPanel class="pl-4">
                    <ActivityContent
                        v-if="activeFeed"
                        :feed="activeFeed"
                        :clientId="clientId"
                        @delete:feed="activeFeed = null"
                    />
                </SplitterPanel>
            </Splitter>
        </div>

        <div v-else>
            <div v-for="section in sections" :key="section.key">
                <div
                    class="grid grid-cols-6 gap-2 p-2"
                    v-for="feed in currentFeeds[section.key]"
                    :key="feed.id"
                >
                    <div class="flex pl-2 pt-1 font-semibold">
                        {{
                            helpers.formatDate(
                                feed.created_at,
                                'DD-MMM-YYYY  h:mma'
                            )
                        }}
                    </div>
                    <div class="flex col-span-5 p-0 border border-gray-100">
                        <ActivityMessage :clientId="clientId" :feed="feed" />
                    </div>
                </div>
            </div>
        </div>
    </div>
<!--    <div v-else class="flex flex-col">-->
<!--        <div class="flex justify-center items-center h-full">-->
<!--            <span class="text-gray-500 text-2xl p-12 text-center">{{-->
<!--                $t('activities.no_activities_found', {-->
<!--                    activity:-->
<!--                        props.activeTab === 'All'-->
<!--                            ? 'Activities'-->
<!--                            : props.activeTab-->
<!--                })-->
<!--            }}</span>-->
<!--        </div>-->
<!--    </div>-->
</template>

<style scoped lang="scss">
.scroll-container {
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE 10+ */
}

.scroll-container::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Edge */
}
</style>
