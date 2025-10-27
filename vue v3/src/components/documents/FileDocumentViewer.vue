<script setup>
import { ref, watch, onMounted, nextTick } from 'vue';

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    fileData: {
        type: Object,
        default: () => null
    },
    getIconForFileType: {
        type: Function,
        required: true
    },
    downLoadDocument: {
        type: Function,
        required: true
    }
});

const emit = defineEmits(['update:visible', 'close']);

const fileUrl = ref('');
const fileName = ref('');
const fileType = ref('');
const isLoading = ref(false);
const error = ref(null);
const fileContent = ref(null);
const isMaximized = ref(false);
const dialogWidth = ref('90vw');
const dialogMaxWidth = ref('1200px');
const dialogHeight = ref('auto');

watch(
    () => props.visible,
    (newValue) => {
        if (newValue && props.fileData) {
            loadFile();
        } else {
            resetState();
        }
    }
);

watch(
    () => props.fileData,
    (newValue) => {
        if (newValue && props.visible) {
            loadFile();
        }
    },
    { deep: true }
);

onMounted(() => {
    if (props.visible && props.fileData) {
        loadFile();
    }
});

const loadFile = async () => {
    if (!props.fileData || !props.fileData.url) {
        error.value = 'No file data available';
        return;
    }

    fileUrl.value = props.fileData.url;
    fileName.value = props.fileData.name;
    fileType.value = props.fileData.type.toLowerCase();
    isLoading.value = true;
    error.value = null;

    try {
        const response = await fetch(fileUrl.value);

        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.status}`);
        }

        const blob = await response.blob();

        if (isImage()) {
            fileContent.value = URL.createObjectURL(blob);
        } else if (isPdf()) {
            fileContent.value = URL.createObjectURL(blob);
        } else {
            try {
                fileContent.value = await blob.text();
            } catch (err) {
                fileContent.value = URL.createObjectURL(blob);
                error.value = 'This file type cannot be previewed directly';
            }
        }
    } catch (err) {
        console.error('Error loading file:', err);
        error.value = `Error loading file: ${err.message}`;
    } finally {
        isLoading.value = false;
    }
};

const resetState = () => {
    if (fileContent.value && fileContent.value.startsWith('blob:')) {
        URL.revokeObjectURL(fileContent.value);
    }

    fileUrl.value = '';
    fileName.value = '';
    fileContent.value = null;
    error.value = null;
    isMaximized.value = false;
    dialogWidth.value = '90vw';
    dialogMaxWidth.value = '1200px';
    dialogHeight.value = 'auto';
};

const closeDialog = () => {
    resetState();
    emit('update:visible', false);
    emit('close');
};

const openInNewTab = () => {
    if (fileUrl.value) {
        window.open(fileUrl.value, '_blank');
    }
};

const toggleMaximize = () => {
    isMaximized.value = !isMaximized.value;

    if (isMaximized.value) {
        dialogWidth.value = '100vw';
        dialogMaxWidth.value = '100vw';
        dialogHeight.value = '100vh';
    } else {
        dialogWidth.value = '90vw';
        dialogMaxWidth.value = '1200px';
        dialogHeight.value = 'auto';
    }
    nextTick(() => {
        window.dispatchEvent(new Event('resize'));
    });
};

const isImage = () => {
    return ['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(fileType.value);
};

const isPdf = () => {
    return fileType.value === 'pdf';
};
</script>

<template>
    <Dialog
        v-model:visible="props.visible"
        modal
        :closable="false"
        :style="{
            width: dialogWidth,
            maxWidth: dialogMaxWidth,
            height: dialogHeight,
            margin: isMaximized ? '0' : 'auto',
            padding: '0'
        }"
        class="document-viewer-dialog"
        :class="{ 'maximized-dialog': isMaximized }"
    >
        <template #header>
            <div class="flex align-items-center justify-content-between w-full">
                <div class="flex align-items-center">
                    <i
                        :class="['mr-2 text-2xl', getIconForFileType(fileName)]"
                    ></i>
                    <h2 class="m-0 p-0">{{ fileName }}</h2>
                </div>
                <div>
                    <Button
                        icon="pi pi-download"
                        class="p-button-text"
                        @click="downLoadDocument"
                        v-tooltip.bottom="{ value: 'Download' }"
                    />
                    <Button
                        icon="pi pi-external-link"
                        class="p-button-text"
                        @click="openInNewTab"
                        v-tooltip.bottom="{ value: 'Open in new tab' }"
                    />
                    <Button
                        :icon="
                            isMaximized
                                ? 'pi pi-window-minimize'
                                : 'pi pi-window-maximize'
                        "
                        class="p-button-text"
                        @click="toggleMaximize"
                        v-tooltip.bottom="{
                            value: isMaximized ? 'Restore' : 'Maximize'
                        }"
                    />
                    <Button
                        icon="pi pi-times"
                        class="p-button-text"
                        @click="closeDialog"
                        v-tooltip.bottom="{ value: 'Close' }"
                    />
                </div>
            </div>
        </template>

        <div class="file-viewer" :class="{ maximized: isMaximized }">
            <div
                v-if="isLoading"
                class="flex align-items-center justify-content-center h-full"
            >
                <ProgressSpinner />
                <span class="ml-2">Loading file...</span>
            </div>

            <div
                v-else-if="error"
                class="flex align-items-center justify-content-center h-full"
            >
                <div class="text-center">
                    <i
                        class="pi pi-exclamation-triangle text-yellow-500"
                        style="font-size: 2rem"
                    ></i>
                    <p>{{ error }}</p>
                    <Button
                        label="Download"
                        icon="pi pi-download"
                        @click="downLoadDocument"
                    />
                </div>
            </div>

            <div v-else-if="fileContent" class="content-container">
                <!-- Image viewer -->
                <div
                    v-if="isImage()"
                    class="flex align-items-center justify-content-center h-full"
                >
                    <img
                        :src="fileContent"
                        :alt="fileName"
                        style="
                            max-width: 100%;
                            max-height: 100%;
                            object-fit: contain;
                        "
                    />
                </div>

                <!-- PDF viewer -->
                <div v-else-if="isPdf()" class="pdf-container">
                    <iframe
                        :src="fileContent"
                        class="pdf-iframe"
                        title="PDF Viewer"
                    ></iframe>
                </div>

                <!-- Other file types -->
                <div
                    v-else
                    class="flex flex-column align-items-center justify-content-center h-full"
                >
                    <i
                        :class="[
                            'document-icon text-6xl mb-3',
                            getIconForFileType(fileName)
                        ]"
                    ></i>
                    <p>This file type cannot be previewed directly.</p>
                    <Button
                        label="Download"
                        icon="pi pi-download"
                        @click="downLoadDocument"
                    />
                </div>
            </div>
        </div>
    </Dialog>
</template>

<style>
.document-viewer-dialog {
    padding: 0 !important;
    overflow: hidden !important;
}

.document-viewer-dialog .p-dialog-header {
    padding: 1rem !important;
    border-bottom: 1px solid #e9ecef !important;
    width: 100% !important;
}

.document-viewer-dialog .p-dialog-content {
    padding: 0 !important;
    overflow: hidden !important;
}

.document-viewer-dialog.maximized-dialog {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    max-width: 100vw !important;
    max-height: 100vh !important;
    margin: 0 !important;
    transform: none !important;
}

.document-viewer-dialog.maximized-dialog .p-dialog-content {
    height: calc(100vh - 60px) !important;
}

.file-viewer {
    background-color: #f8f9fa;
    border-radius: 4px;
    padding: 0.5rem;
    height: 70vh;
}

.file-viewer.maximized {
    height: calc(100vh - 60px);
    border-radius: 0;
}

.content-container {
    width: 100%;
    height: 100%;
    overflow: auto;
}

.pdf-container {
    width: 100%;
    height: 100%;
}

.pdf-iframe {
    width: 100%;
    height: 100%;
    border: none;
}
</style>
