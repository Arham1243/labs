<script setup>
import { reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useHelpers } from '@/composables';
import { useFeedStore } from '@/stores/Feed';
import ActivityDialog from '@/components/activities/dialogs/ActivityDialog.vue';

const route = useRoute();
const helpers = useHelpers();
const showExpenseNotes = ref(true);

const localFeeds = ref([]);

// Dialog state
const dialogState = reactive({
    visible: false,
    type: 'note',
    feed: null
});

const openDialog = (feed = null) => {
    dialogState.visible = true;
    dialogState.feed = feed;
};

const { searchFeeds } = useFeedStore();
const payload = {
    clientId: route.params.clientId,
    filters: [{ field: 'feedable_type', value: 'note' }],
    scopes: [
        { name: 'ForEntity', parameters: ['expense', route.params.expenseId] }
    ]
};
const {
    data: feeds,
    meta,
    pagination,
    mutate: loadFeeds,
    onPageChange
} = searchFeeds();
loadFeeds(payload);

// Watch for changes in feeds to reset expanded state
const expandedFeeds = ref(new Set());
const isExpanded = (id) => expandedFeeds.value.has(id);
const toggleExpanded = (id) => {
    if (expandedFeeds.value.has(id)) {
        expandedFeeds.value.delete(id);
    } else {
        expandedFeeds.value.add(id);
    }
};

// Remove HTML tags for preview length check
const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
};

const handleFeedUpdated = (updatedFeed) => {
    if (!updatedFeed) return;
    const index = localFeeds.value.findIndex(
        (f) => f.feedable_id === updatedFeed.id
    );

    // Normalize the `body` regardless of whether it's an update or a creation
    const normalizedFeed = {
        ...updatedFeed,
        body: updatedFeed.body || updatedFeed.content || '',
        created_at: updatedFeed.created_at,
        feedable_id: updatedFeed.id
    };

    if (index !== -1) {
        localFeeds.value[index] = normalizedFeed;
    } else {
        localFeeds.value.unshift(normalizedFeed);
    }
};

watch(
    () => feeds?.value,
    (newFeeds) => {
        localFeeds.value = [...localFeeds.value, ...(newFeeds || [])];
    },
    { immediate: true }
);
</script>

<template>
    <Card class="mt-4">
        <template #header>
            <div class="flex justify-content-between align-items-center">
                <div>
                    <p class="font-semibold" data-testid="title-expense-notes">
                        <span
                            class="p-button-icon pi pi-chevron-down pr-4 cursor-pointer"
                            data-pc-section="icon"
                            data-testid="btn-show-expense-notes"
                            v-if="showExpenseNotes"
                            @click="showExpenseNotes = !showExpenseNotes"
                        ></span>
                        <span
                            class="p-button-icon pi pi-chevron-right pr-4 cursor-pointer"
                            data-pc-section="icon"
                            data-testid="btn-show-expense-notes"
                            v-else
                            @click="showExpenseNotes = !showExpenseNotes"
                        ></span>
                        {{ $t('expenses.expense_notes') }}
                        <Badge
                            v-if="localFeeds?.length"
                            class="ml-2 bg-gray-300 text-black"
                            style="color: black !important"
                            :value="localFeeds?.length"
                        ></Badge>
                    </p>
                </div>
                <div class="cursor-pointer">
                    <i class="pi pi-plus" @click="openDialog(null)"></i>
                </div>
            </div>

            <!-- Activity Dialog -->
            <ActivityDialog
                v-model:visible="dialogState.visible"
                :type="dialogState.type"
                :clientId="route.params.clientId"
                :feed="dialogState.feed"
                @update:feed="handleFeedUpdated"
            />
        </template>

        <template #content v-if="showExpenseNotes">
            <div v-for="feed in localFeeds" :key="feed.id" class="mt-4">
                <div class="flex justify-content-between pb-2">
                    <div class="flex gap-2 align-items-start">
                        <div
                            class="border-circle text-xs text-black bg-gray-300 h-2rem w-2rem flex flex-shrink-0 align-items-center justify-content-center"
                        >
                            <i class="pi pi-user"></i>
                        </div>
                        <div>
                            <h6 class="text-sm">{Employee Name}</h6>
                            <div class="text-xs mt-1">
                                {{
                                    helpers.formatDate(
                                        feed.created_at,
                                        'DD-MMM-YYYY HH:ss'
                                    )
                                }}
                            </div>
                        </div>
                    </div>

                    <div>
                        <div class="flex gap-3 px-1 justify-content-end">
                            <i
                                class="pi pi-pencil cursor-pointer text-lg p-1"
                                @click="openDialog(feed)"
                            />
                        </div>
                    </div>
                </div>

                <div class="mt-2 text-sm">
                    <span v-if="isExpanded(feed.id)">
                        <span>
                            {{ stripHtml(feed.body) }}
                        </span>
                        <span
                            v-if="stripHtml(feed.body).length > 100"
                            class="text-primary cursor-pointer ml-2 underline"
                            style="display: inline"
                            @click="toggleExpanded(feed.id)"
                        >
                            {{ $t('notes.read_less') }}
                        </span>
                    </span>
                    <span v-else>
                        <span>
                            {{ stripHtml(feed.body).slice(0, 100) }}
                        </span>
                        <span
                            v-if="stripHtml(feed.body).length > 100"
                            class="text-primary cursor-pointer ml-2 underline"
                            @click="toggleExpanded(feed.id)"
                        >
                            {{ $t('notes.read_more') }}
                        </span>
                    </span>
                </div>
            </div>
            <div v-if="!localFeeds?.length" class="mt-4">
                <p class="text-gray-900">{{ $t('notes.no_notes') }}</p>
            </div>

            <!-- Load More Button -->
            <div
                v-if="meta?.current_page < meta?.last_page"
                class="mt-3 text-center cursor-pointer text-primary font-bold"
            >
                <p
                    @click="
                        onPageChange({
                            page: pagination.page,
                            rows: pagination.limit,
                            payload
                        })
                    "
                >
                    <i class="pi pi-spinner" />
                    {{ $t('expenses.loading_more') }}
                </p>
            </div>
        </template>
    </Card>
</template>

<style scoped lang="scss"></style>
