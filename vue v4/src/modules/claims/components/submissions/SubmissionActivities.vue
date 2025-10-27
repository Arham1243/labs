<script setup>
import { ref } from 'vue';

// Activities
const activity_tabs = ref([
    'All',
    'Notes',
    'Documents',
    'Communication',
    'Tasks'
]);
const active_tab = ref('All');

// Levels
const level = ref('All');
const levels = ref([{ name: 'Level: All', id: 'All' }]);

// Search
const searchText = ref('');
const search = () => {};

// Activity Mock Data
const lorem =
    '<p>Lorem ipsum dolor sit amet consectetur. Arcu id leo hendrerit maecenas sit urna. Sapien neque magnis gravida cursus cursus. Amet ut odio vel tellus. Arcu rutrum in massa nunc in sagittis. Ac vestibulum in massa elit bibendum turpis cras tincidunt. Eu ac quam nisl quis imperdiet arcu sodales nisl. Cras netus risus porttitor diam mauris malesuada nulla tempor. Accumsan feugiat et ultrices tempus sollicitudin feugiat sodales libero semper. Lorem nisl in id neque ultrices mus. Arcu maecenas sed pharetra non adipiscing tristique ut lectus. A tempus et aliquam at.</p><p>Et suscipit habitant etiam vitae sed dictum. Libero ipsum in lacus elit sem nunc ipsum proin. Rhoncus fusce augue justo fringilla a augue lacus adipiscing. Aliquam at vel libero quis nec in a ullamcorper. Senectus maecenas habitasse nisl lacus nec sociis suspendisse. Porttitor fames dictumst nec tempus bibendum orci in purus ut. Vel maecenas tempor dictum tincidunt id. Amet neque in facilisi lectus. Semper neque massa porta quisque. Augue mi augue dui venenatis mauris diam.</p>';
const activity_data = ref([
    {
        id: 1,
        title: 'Activity Title',
        created_at: '2025-01-10 00:00:00',
        updated_at: '2025-01-11 00:00:00',
        type: 'Notes',
        refers_to: {
            name: 'Submission',
            id: '12345'
        },
        message: lorem,
        pinned: false,
        tags: ['pending', 'normal']
    }
]);
</script>
<template>
    <div>
        <!-- Tabs -->
        <div class="flex justify-between items-center py-12">
            <div>
                <Button
                    v-for="(tab, i) in activity_tabs"
                    :key="tab"
                    size="small"
                    :label="tab"
                    :outlined="active_tab !== tab"
                    :severity="active_tab !== tab ? 'secondary' : ''"
                    :class="[
                        { 'rounded-r-none': !i },
                        { 'border-surface-300 dark:border-surface-500 text-surface-800 dark:text-surface-50': tab !== active_tab },
                        {
                            'rounded-none border-l-0':
                                i && i < activity_tabs.length - 1
                        },
                        {
                            'rounded-l-none border-l-0':
                                i === activity_tabs.length - 1
                        }
                    ]"
                    @click="active_tab = tab"
                />
            </div>
            <div class="flex">
                <Button
                    label="New Activity"
                    icon="pi pi-plus"
                    size="small"
                    class="rounded-r-none"
                />
                <div class="border-l border-blue-600" />
                <Button
                    icon="pi pi-chevron-down"
                    size="small"
                    class="rounded-l-none"
                />
            </div>
        </div>

        <!-- Search & Sort -->
        <div
            class="flex justify-between items-center py-12 px-2 bg-gray-100"
        >
            <div class="flex gap-12">
                <Select
                    v-model="level"
                    :options="levels"
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Select Level"
                    class="w-40"
                />
                <Search
                    v-model="searchText"
                    @search="search"
                    data-testid="text-box-search-activities"
                />
                <Button
                    label="Filter"
                    icon="pi pi-filter"
                    size="small"
                    outlined
                />
            </div>
            <div class="flex items-center">
                <b class="-mr-2">Sort By:</b>
                <Button
                    label="Newest to oldest"
                    icon="pi pi-chevron-down"
                    icon-pos="right"
                    class="rounded-l-none font-bold"
                    text
                />
            </div>
        </div>

        <!-- Messages -->
        <div class="py-12">
            <Splitter style="height: 60vh" class="border-surface-0 dark:border-surface-900">
                <SplitterPanel class="pr-12">
                    <div>
                        <div class="flex gap-12 items-center py-12">
                            <a class="pi pi-chevron-right" />
                            <h4 class="m-0 font-normal">Pinned (1)</h4>
                        </div>
                        <div
                            class="flex items-start p-12 gap-12 bg-red-50 border-b border-gray-300"
                        >
                            <i
                                class="pi pi-pencil p-2 bg-primary text-primary-contrast text-primary-contrast text-primary-contrast text-white rounded-full"
                            />
                            <div>
                                <div class="flex justify-between">
                                    <div>
                                        <h6>Activity Title</h6>
                                        <div class="text-xs mt-1">
                                            Submission:
                                            <a>
                                                12345
                                                <i
                                                    class="pi pi-chevron-down text-xs"
                                                />
                                            </a>
                                        </div>
                                    </div>
                                    <div>
                                        <div
                                            class="flex gap-12 px-1 justify-end"
                                        >
                                            <a class="pi pi-trash text-lg" />
                                            <a class="pi pi-pencil text-lg" />
                                            <a class="pi pi-key text-lg" />
                                        </div>
                                        <div class="text-xs text-right mt-2">
                                            05-Dec-2024 10:30
                                        </div>
                                    </div>
                                </div>
                                <p class="text-sm mt-12">
                                    Lorem ipsum dolor sit amet consectetur. Arcu
                                    id leo hendrerit maecenas sit urna. Sapien
                                    neque magnis gravida cursus cursus. Amet ut
                                    odio vel tellus. Arcu rutrum in massa nunc
                                    in sagittis. Ac vestibulum in massa elit
                                    bibendum turpis cras tincidunt.
                                </p>
                            </div>
                        </div>
                    </div>
                </SplitterPanel>
                <SplitterPanel class="pl-12">
                    <div>
                        <!-- Employee Info -->
                        <div
                            class="flex justify-between border-b border-gray-300 pb-12"
                        >
                            <div class="flex gap-2 items-start">
                                <div
                                    class="rounded-full text-xs text-white bg-primary text-primary-contrast text-primary-contrast text-primary-contrast h-8 w-8/12 flex shrink-0 items-center justify-center"
                                >
                                    DH
                                </div>
                                <div>
                                    <h6>{Employee Name}</h6>
                                    <div class="text-xs mt-1">
                                        {Department Name}
                                    </div>
                                </div>
                            </div>
                            <div class="text-xs flex flex-col gap-2">
                                <div>Date Created: 09-Dec-2024</div>
                                <div>Last Modified: 09-Dec-2024</div>
                            </div>
                        </div>

                        <div class="mt-12">
                            <!-- Title -->
                            <div class="flex justify-between">
                                <div>
                                    <h6>Activity Title</h6>
                                    <div class="text-xs mt-1">
                                        Policy Number:
                                        <a class="text-blue-600 underline">
                                            1234567890UM
                                        </a>
                                    </div>
                                </div>
                                <div>
                                    <div
                                        class="flex gap-12 px-1 justify-end"
                                    >
                                        <a class="pi pi-trash text-lg" />
                                        <a class="pi pi-pencil text-lg" />
                                        <a class="pi pi-key text-lg" />
                                        <a class="pi pi-ellipsis-v text-lg" />
                                    </div>
                                    <div class="text-xs text-right mt-2">
                                        05-Dec-2024 10:30
                                    </div>
                                </div>
                            </div>

                            <!-- Tags -->
                            <div class="flex gap-2 mt-12 items-center">
                                <i class="pi pi-tags" />
                                <Tag
                                    icon="pi pi-spinner"
                                    value="Pending"
                                    severity="warning"
                                    rounded
                                />
                                <Tag
                                    icon="pi pi-info-circle"
                                    value="Normal"
                                    severity="info"
                                    rounded
                                />
                            </div>

                            <!-- Message -->
                            <div class="mt-12 text-sm">
                                <p>
                                    Lorem ipsum dolor sit amet consectetur. Arcu
                                    id leo hendrerit maecenas sit urna. Sapien
                                    neque magnis gravida cursus cursus. Amet ut
                                    odio vel tellus. Arcu rutrum in massa nunc
                                    in sagittis. Ac vestibulum in massa elit
                                    bibendum turpis cras tincidunt. Eu ac quam
                                    nisl quis imperdiet arcu sodales nisl. Cras
                                    netus risus porttitor diam mauris malesuada
                                    nulla tempor. Accumsan feugiat et ultrices
                                    tempus sollicitudin feugiat sodales libero
                                    semper. Lorem nisl in id neque ultrices mus.
                                    Arcu maecenas sed pharetra non adipiscing
                                    tristique ut lectus. A tempus et aliquam at.
                                </p>
                                <p>
                                    Et suscipit habitant etiam vitae sed dictum.
                                    Libero ipsum in lacus elit sem nunc ipsum
                                    proin. Rhoncus fusce augue justo fringilla a
                                    augue lacus adipiscing. Aliquam at vel
                                    libero quis nec in a ullamcorper. Senectus
                                    maecenas habitasse nisl lacus nec sociis
                                    suspendisse. Porttitor fames dictumst nec
                                    tempus bibendum orci in purus ut. Vel
                                    maecenas tempor dictum tincidunt id. Amet
                                    neque in facilisi lectus. Semper neque massa
                                    porta quisque. Augue mi augue dui venenatis
                                    mauris diam.
                                </p>
                            </div>

                            <!-- Reply -->
                            <div class="mt-20 flex gap-2">
                                <div
                                    class="rounded-full text-xs text-white bg-primary text-primary-contrast text-primary-contrast text-primary-contrast h-8 w-8/12 flex shrink-0 items-center justify-center"
                                >
                                    NS
                                </div>
                                <Textarea
                                    placeholder="Add a comment. Use @ to mention a person."
                                    class="w-full"
                                />
                            </div>

                            <!-- Replies -->
                            <div class="mt-12">
                                <div
                                    class="shadow-sm flex gap-2 w-8/12 bg-blue-100 rounded-xl p-12"
                                >
                                    <div
                                        class="rounded-full text-xs text-white bg-primary text-primary-contrast text-primary-contrast text-primary-contrast h-8 w-8/12 flex shrink-0 items-center justify-center"
                                    >
                                        NS
                                    </div>
                                    <div>
                                        <div class="text-sm">
                                            @ {Examiner Name} suscipit habitant
                                            etiam vitae sed dictum. Libero ipsum
                                            in lacus elit sem nunc
                                        </div>
                                        <div class="text-right text-xs mt-1">
                                            09-Dec-2024 09:15
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </SplitterPanel>
            </Splitter>
        </div>
    </div>
</template>

<style>
.font-bold .p-button-label {
    font-weight: bold;
}
.p-splitter .p-splitter-gutter {
    background: #ccc;
}
.p-splitter.p-splitter-horizontal
    > .p-splitter-gutter
    > .p-splitter-gutter-handle {
    background: #777;
    height: 100px;
}
</style>
