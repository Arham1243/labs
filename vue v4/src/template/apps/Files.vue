<script setup>
import { ref } from 'vue';
import { FileService } from '@/services/File.service';

const metrics = ref([]);
const files = ref([]);
const folders = ref([]);
const chartData = ref([]);
const chartOptions = ref({});
const chartPlugins = ref({});
const menuItems = ref([
    { label: 'View', icon: 'pi pi-search' },
    { label: 'Refresh', icon: 'pi pi-refresh' }
]);
const menuRef = ref(null);
const fileUploaderRef = ref(null);
const uploadFiles = ref([]);
const fileService = new FileService();
fileService.getFiles().then((data) => (files.value = data));
fileService.getMetrics().then((data) => (metrics.value = data));
fileService.getFoldersLarge().then((data) => (folders.value = data));

const documentStyle = getComputedStyle(document.documentElement);
const textColor = documentStyle.getPropertyValue('--text-color');

chartPlugins.value = [
    {
        beforeDraw: function (chart) {
            let ctx = chart.ctx;
            let width = chart.width;
            let height = chart.height;
            let fontSize = 1.5;
            let oldFill = ctx.fillStyle;

            ctx.restore();
            ctx.font = fontSize + 'rem sans-serif';
            ctx.textBaseline = 'middle';

            let text = 'Free Space';
            let text2 = 50 + 'GB / ' + 80 + 'GB';
            let textX = Math.round((width - ctx.measureText(text).width) / 2);
            let textY = (height + chart.chartArea.top) / 2.25;

            let text2X = Math.round(
                (width - ctx.measureText(text).width) / 2.1
            );
            let text2Y = (height + chart.chartArea.top) / 1.75;

            ctx.fillStyle = chart.config.data.datasets[0].backgroundColor[0];
            ctx.fillText(text, textX, textY);
            ctx.fillText(text2, text2X, text2Y);
            ctx.fillStyle = oldFill;
            ctx.save();
        }
    }
];
chartData.value = {
    datasets: [
        {
            data: [300, 100],
            backgroundColor: [
                documentStyle.getPropertyValue('--primary-600'),
                documentStyle.getPropertyValue('--primary-100')
            ],
            hoverBackgroundColor: [
                documentStyle.getPropertyValue('--primary-700'),
                documentStyle.getPropertyValue('--primary-200')
            ],
            borderColor: 'transparent',
            fill: true
        }
    ]
};

chartOptions.value = {
    animation: {
        duration: 0
    },
    responsive: true,
    maintainAspectRatio: false,
    cutout: '90%',
    plugins: {
        legend: {
            labels: {
                color: textColor
            }
        }
    }
};

const toggleMenuItem = (event, index) => {
    menuRef.value[index].toggle(event);
};

const onChooseUploadFiles = () => {
    fileUploaderRef.value.choose();
};
const onSelectedFiles = (event) => {
    uploadFiles.value = event.files;
};
const onRemoveFile = (removeFile) => {
    uploadFiles.value = uploadFiles.value.filter(
        (file) => file.name !== removeFile.name
    );
};
</script>

<template>
    <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12">
        <div
            v-for="(metric, i) in metrics"
            :key="i"
            class="col-span-12 md:col-span-6 lg:col-span-3"
        >
            <div class="card h-full">
                <div
                    class="flex items-center justify-between mb-12"
                >
                    <span class="text-surface-900 dark:text-surface-0 text-xl font-semibold">{{
                        metric.title
                    }}</span>
                    <div>
                        <Button
                            @click="toggleMenuItem($event, i)"
                            :icon="metric.icon"
                            class="p-button-text p-button-sm p-button-rounded"
                        ></Button>
                        <Menu ref="menuRef" popup :model="menuItems"></Menu>
                    </div>
                </div>
                <div>
                    <div
                        class="rounded-border"
                        :class="metric.color"
                        :style="{ height: '6px' }"
                    >
                        <div
                            class="h-full rounded-border"
                            :class="metric.fieldColor"
                            :style="{ width: '34%' }"
                        ></div>
                    </div>
                    <div class="flex align-item-center justify-between">
                        <span class="text-surface-900 dark:text-surface-0 mt-12 text-md font-medium">{{
                            metric.files
                        }}</span>
                        <span class="text-surface-900 dark:text-surface-0 mt-12 text-md font-medium">{{
                            metric.fileSize
                        }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-span-12 md:col-span-5 xl:col-span-3">
            <div class="card">
                <div class="text-surface-900 dark:text-surface-0 text-xl font-semibold mb-12">
                    Account Storage
                </div>
                <div
                    class="flex flex-row justify-center"
                    style="height: 200px"
                >
                    <Chart
                        type="doughnut"
                        :plugins="chartPlugins"
                        id="country-chart"
                        :data="chartData"
                        :options="chartOptions"
                        :style="{ width: '75%' }"
                    ></Chart>
                </div>
                <div class="mt-20 flex gap-12">
                    <Button
                        icon="pi pi-search"
                        class="p-button-outlined flex-1"
                        label="Details"
                    ></Button>
                    <Button
                        icon="pi pi-upload"
                        class="flex-1"
                        label="Upgrade"
                    ></Button>
                </div>
            </div>

            <div class="card">
                <div class="text-surface-900 dark:text-surface-0 text-xl font-semibold mb-12">
                    Categories
                </div>
                <ul class="list-none p-0 m-0">
                    <li
                        class="p-12 mb-12 flex items-center justify-between cursor-pointer rounded-border bg-indigo-50 text-indigo-900"
                    >
                        <div class="flex items-center">
                            <i class="pi pi-image text-2xl mr-12"></i>
                            <span class="ext-lg font-medium">Images</span>
                        </div>
                        <span class="text-lg font-bold">85</span>
                    </li>
                    <li
                        class="p-12 mb-12 flex items-center justify-between cursor-pointer rounded-border bg-purple-50 text-purple-900"
                    >
                        <div class="flex items-center">
                            <i class="pi pi-file text-2xl mr-12"></i>
                            <span class="ext-lg font-medium">Documents</span>
                        </div>
                        <span class="text-lg font-bold">231</span>
                    </li>
                    <li
                        class="p-12 flex items-center justify-between cursor-pointer rounded-border bg-teal-50 text-teal-900"
                    >
                        <div class="flex items-center">
                            <i class="pi pi-video text-2xl mr-12"></i>
                            <span class="ext-lg font-medium">Videos</span>
                        </div>
                        <span class="text-lg font-bold">40</span>
                    </li>
                </ul>
            </div>

            <div class="card p-0">
                <Toast key="fu"></Toast>
                <div class="card">
                    <FileUpload
                        ref="fileUploaderRef"
                        id="files-fileupload"
                        name="demo[]"
                        url="./upload.php"
                        accept="image/*"
                        customUpload
                        multiple
                        auto
                        class="upload-button-hidden w-full"
                        invalidFileSizeMessage="Invalid File Size"
                        invalidFileTypeMessage="Invalid File Type"
                        :maxFileSize="1000000"
                        @select="onSelectedFiles"
                    >
                        <template #content>
                            <div
                                v-if="uploadFiles.length > 0"
                                class="w-full py-12"
                                :style="{ cursor: 'copy' }"
                            >
                                <div
                                    v-for="file in uploadFiles"
                                    :key="file.name"
                                    class="flex flex-wrap gap-20"
                                >
                                    <div
                                        class="remove-file-wrapper h-full relative w-28 h-28 border-4 border-transparent rounded-border hover:bg-primary hover:text-primary-contrast hover:text-primary-contrast hover:text-primary-contrast duration-100 cursor-auto"
                                        :style="{ padding: '1px' }"
                                    >
                                        <img
                                            :src="file.objectURL"
                                            alt="{file.name}"
                                            class="w-full h-full rounded-border shadow"
                                        />
                                        <Button
                                            icon="pi pi-times"
                                            class="remove-button p-button-rounded p-button-primary text-sm absolute justify-center items-center cursor-pointer"
                                            :style="{
                                                top: '-10px',
                                                right: '-10px',
                                                display: 'none'
                                            }"
                                            @click="onRemoveFile(file)"
                                        ></Button>
                                    </div>
                                </div>
                            </div>
                        </template>
                        <template #empty>
                            <div
                                v-if="uploadFiles.length < 1"
                                @click="onChooseUploadFiles"
                                class="w-full py-12"
                                :style="{ cursor: 'copy' }"
                            >
                                <div
                                    class="h-full flex flex-col justify-center items-center"
                                >
                                    <i
                                        class="pi pi-upload text-surface-900 dark:text-surface-0 text-2xl mb-12"
                                    ></i>
                                    <span
                                        class="font-bold text-surface-900 dark:text-surface-0 text-xl mb-12"
                                        >Upload Files</span
                                    >
                                    <span
                                        class="font-medium text-surface-600 dark:text-surface-200 text-md text-center"
                                        >Drop or select files</span
                                    >
                                </div>
                            </div>
                        </template>
                    </FileUpload>
                </div>
            </div>
        </div>
        <div class="col-span-12 md:col-span-7 xl:col-span-9">
            <div class="card">
                <div class="text-surface-900 dark:text-surface-0 text-xl font-semibold mb-12">Folders</div>
                <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12">
                    <div
                        v-for="(folder, i) in folders"
                        :key="i"
                        class="col-span-12 md:col-span-6 xl:col-span-4"
                    >
                        <div
                            class="p-12 border border-surface flex items-center justify-between hover:bg-surface-100 dark:hover:bg-surface-700 cursor-pointer rounded-border"
                        >
                            <div class="flex items-center">
                                <i
                                    class="text-2xl mr-12"
                                    :class="folder.icon"
                                ></i>
                                <span class="text-surface-900 dark:text-surface-0 text-lg font-medium">{{
                                    folder.name
                                }}</span>
                            </div>
                            <span class="text-surface-600 dark:text-surface-200 text-lg font-semibold">{{
                                folder.size
                            }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="text-surface-900 dark:text-surface-0 text-xl font-semibold mb-12">
                    Recent Uploads
                </div>
                <DataTable
                    :value="files"
                    dataKey="id"
                    paginator
                    :rows="8"
                    responsiveLayout="scroll"
                >
                    <Column
                        field="name"
                        header="Name"
                        sortable
                        :headerStyle="{ minWidth: '12rem' }"
                    >
                        <template #body="{ data }">
                            <div class="flex items-center">
                                <i
                                    class="text-xl text-primary mr-2"
                                    :class="data.icon"
                                ></i>
                                <span>{{ data.name }}</span>
                            </div>
                        </template>
                    </Column>
                    <Column
                        field="date"
                        header="Date"
                        headerClass="whitespace-nowrap"
                        :headerStyle="{ minWidth: '12rem' }"
                    >
                    </Column>
                    <Column
                        field="fileSize"
                        header="File Size"
                        sortable
                        :headerStyle="{ minWidth: '12rem' }"
                    ></Column>
                    <Column :style="{ width: '10rem' }">
                        <template #body>
                            <div class="text-center">
                                <Button
                                    icon="pi pi-times"
                                    class="p-button-danger p-button-text p-button-rounded mr-2"
                                ></Button>
                                <Button
                                    icon="pi pi-search"
                                    class="p-button-text p-button-rounded"
                                ></Button>
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
:deep(#files-fileupload) {
    .p-fileupload-buttonbar {
        display: none;
    }

    .p-fileupload-content {
        border: none;
    }
}

.remove-file-wrapper:hover {
    .remove-button {
        display: flex !important;
    }
}
.upload-button-hidden {
    &.p-fileupload {
        padding: 0;

        .p-fileupload-buttonbar {
            display: none;
        }

        .p-fileupload-content {
            border: 0 none;
        }

        .p-progressbar {
            display: none;
        }
    }
}
</style>
