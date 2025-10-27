<script setup>
import { ref } from 'vue';
const tags = ref(['Software', 'Web']);
const fileUploaderRef = ref(null);
const uploadFiles = ref([]);

const onChooseUploadFiles = () => {
    fileUploaderRef.value.choose();
};
const onSelectedFiles = (event) => {
    uploadFiles.value = event.files;
};
const onRemoveFile = (removeFile) => {
    uploadFiles.value = uploadFiles.value.filter((file) => file.name !== removeFile.name);
};
</script>

<template>
    <div class="card">
        <span class="block text-surface-900 dark:text-surface-0 font-bold text-xl mb-12">Create a new post</span>
        <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12">
            <div class="col-span-12 lg:col-span-8">
                <FileUpload ref="fileUploaderRef" id="files-fileupload" name="demo[]" accept="image/*" customUpload multiple auto class="border border-surface bg-surface-0 dark:bg-surface-900 p-0 rounded-border mb-12" :maxFileSize="1000000" @select="onSelectedFiles">
                    <template v-if="uploadFiles.length > 0" #content>
                        <div class="h-80 m-1 rounded-border">
                            <div v-for="file in uploadFiles" :key="file.name" class="w-full h-full relative rounded-border p-0" :style="{ cursor: 'copy' }">
                                <div class="remove-file-wrapper h-full relative border-4 border-transparent rounded-border hover:bg-primary hover:text-primary-contrast hover:text-primary-contrast hover:text-primary-contrast duration-100 cursor-auto" :style="{ padding: '1px' }">
                                    <img :src="file.objectURL" alt="{file.name}" class="w-full h-full rounded-border" />
                                    <Button
                                        icon="pi pi-times"
                                        class="remove-button p-button-rounded p-button-primary text-sm absolute justify-center items-center cursor-pointer"
                                        :style="{ top: '-10px', right: '-10px', display: 'none' }"
                                        @click="onRemoveFile(file)"
                                    ></Button>
                                </div>
                            </div>
                        </div>
                    </template>
                    <template #empty>
                        <div v-if="uploadFiles.length < 1" class="h-80 m-1 rounded-border">
                            <div @click="onChooseUploadFiles" class="flex flex-col w-full h-full justify-center items-center cursor-pointer" :style="{ cursor: 'copy' }">
                                <i class="pi pi-fw pi-file text-4xl text-primary"></i>
                                <span class="block font-semibold text-surface-900 dark:text-surface-0 text-lg mt-12">Drop or select a cover image</span>
                            </div>
                        </div>
                    </template>
                </FileUpload>
                <div class="flex flex-col p-fluid">
                    <div class="mb-12 mt-12">
                        <InputText type="text" placeholder="Title" />
                    </div>
                    <div class="mb-12">
                        <Textarea rows="6" placeholder="Content" autoResize></Textarea>
                    </div>

                    <Editor editorStyle="height: 320px"></Editor>
                </div>
            </div>
            <div class="col-span-12 lg:col-span-4">
                <div class="border border-surface rounded-border mb-12">
                    <span class="text-surface-900 dark:text-surface-0 font-bold block border-b border-surface p-12">Publish</span>
                    <div class="p-12">
                        <div class="bg-surface-100 dark:bg-surface-700 p-12 flex items-center rounded-border">
                            <span class="text-surface-900 dark:text-surface-0 font-semibold mr-12">Status:</span>
                            <span class="font-medium">Draft</span>
                            <Button type="button" icon="pi pi-fw pi-pencil" class="p-button-rounded p-button-text ml-auto"></Button>
                        </div>
                    </div>
                    <div class="p-12">
                        <div class="bg-surface-100 dark:bg-surface-700 p-12 flex items-center rounded-border">
                            <span class="text-surface-900 dark:text-surface-0 font-semibold mr-12">Visibility:</span>
                            <span class="font-medium">Private</span>
                            <Button type="button" icon="pi pi-fw pi-pencil" class="p-button-rounded p-button-text ml-auto"></Button>
                        </div>
                    </div>
                </div>
                <div class="border border-surface rounded-border mb-12">
                    <span class="text-surface-900 dark:text-surface-0 font-bold block border-b border-surface p-12">Tags</span>
                    <div class="p-12 flex gap-2"><Chip v-for="(tag, i) in tags" :key="i" :label="tag"></Chip></div>
                </div>
                <div class="border border-surface rounded-border p-fluid mb-12">
                    <span class="text-surface-900 dark:text-surface-0 font-bold block border-b border-surface p-12">Meta</span>
                    <div class="p-12">
                        <div class="mb-12">
                            <InputText type="text" placeholder="Title" />
                        </div>
                        <div><Textarea rows="6" placeholder="Description" autoResize></Textarea></div>
                    </div>
                </div>
                <div class="flex justify-between gap-12">
                    <Button class="p-button-danger flex-1 p-button-outlined" label="Discard" icon="pi pi-fw pi-trash"></Button>
                    <Button class="p-button-primary flex-1" label="Publish" icon="pi pi-fw pi-check"></Button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
:deep(#files-fileupload) {
    .p-fileupload-buttonbar {
        display: none;
    }
}

.remove-file-wrapper:hover {
    .remove-button {
        display: flex !important;
    }
}
</style>
