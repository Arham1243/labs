<script setup>
import { ref } from 'vue';

const colorOptions = ref([
    { name: 'Black', background: 'bg-gray-900' },
    { name: 'Orange', background: 'bg-orange-500' },
    { name: 'Navy', background: 'bg-blue-500' }
]);
const product = ref({
    name: '',
    price: '',
    code: '',
    sku: '',
    status: 'Draft',
    tags: ['Nike', 'Sneaker'],
    category: 'Sneakers',
    colors: [],
    stock: 'Sneakers',
    inStock: true,
    description: '',
    images: []
});
const selectedCategory = ref(null);
const selectedStock = ref(null);
const categoryOptions = ['Sneakers', 'Apparel', 'Socks'];
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

const toggleColor = (color) => {
    const index = product.value.colors.indexOf(color);
    if (index > -1) {
        product.value.colors.splice(index, 1);
    } else {
        product.value.colors.push(color);
    }
};
const onRemoveTags = (tag) => {
    product.value.tags = product.value.tags.filter((t) => t !== tag);
};
</script>

<template>
    <div class="card">
        <span class="block text-surface-900 dark:text-surface-0 font-bold text-xl mb-12">Create Product</span>
        <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 grid-nogutter flex-wrap gap-12 p-fluid">
            <div class="col-span-12 lg:col-span-8">
                <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 formgrid">
                    <div class="col-span-12 field">
                        <InputText type="text" placeholder="Product Name" v-model="product.name" />
                    </div>
                    <div class="col-span-12 lg:col-span-4 field">
                        <InputText type="text" placeholder="Price" label="Price" v-model="product.price" />
                    </div>
                    <div class="col-span-12 lg:col-span-4 field">
                        <InputText type="text" placeholder="Product Code" label="Product Code" v-model="product.code" />
                    </div>
                    <div class="col-span-12 lg:col-span-4 field">
                        <InputText type="text" placeholder="Product SKU" label="SKU" v-model="product.sku" />
                    </div>
                    <div class="col-span-12">
                        <Editor editorStyle="height: 320px"></Editor>
                    </div>
                    <div class="col-span-12 mt-12">
                        <FileUpload ref="fileUploaderRef" id="files-fileupload" name="demo[]" accept="image/*" customUpload multiple auto class="border border-surface bg-surface-0 dark:bg-surface-900 p-0 rounded-border" :maxFileSize="1000000" @select="onSelectedFiles">
                            <template v-if="uploadFiles.length > 0" #content>
                                <div class="h-80 m-1 rounded-border">
                                    <div v-for="file in uploadFiles" :key="file.name" class="w-full h-full relative rounded-border p-0" :style="{ cursor: 'copy' }">
                                        <div class="remove-file-wrapper h-full relative border-4 border-transparent rounded-border hover:bg-primary hover:text-primary-contrast hover:text-primary-contrast hover:text-primary-contrast duration-100 cursor-auto">
                                            <img :src="file.objectURL" alt="{file.name}" class="w-full h-full rounded-border" />
                                            <Button
                                                icon="pi pi-times"
                                                class="remove-button p-button-rounded p-button-primary text-sm absolute justify-center items-center cursor-pointer"
                                                :style="{ top: '-10px', right: '-10px', display: 'none', width: '3rem' }"
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
                    </div>
                </div>
            </div>
            <div class="flex-1 w-full lg:w-3/12 xl:w-4/12 flex flex-col gap-y-4">
                <div class="border border-surface rounded-border">
                    <span class="text-surface-900 dark:text-surface-0 font-bold block border-b border-surface p-12">Publish</span>
                    <div class="p-12">
                        <div class="bg-surface-100 dark:bg-surface-700 py-2 px-12 flex items-center rounded-border">
                            <span class="text-black/90 font-bold mr-12">Status:</span>
                            <span class="text-black/60 font-semibold">Draft</span>
                            <Button type="button" icon="pi pi-fw pi-pencil" class="p-button-rounded p-button-text ml-auto"></Button>
                        </div>
                    </div>
                </div>
                <div class="border border-surface rounded-border">
                    <span class="text-surface-900 dark:text-surface-0 font-bold block border-b border-surface p-12">Tags</span>
                    <div class="p-12 flex flex-wrap gap-1">
                        <Chip v-for="(tag, i) in product.tags" :key="i" :label="tag" class="mr-2 py-2 px-12 text-surface-900 dark:text-surface-0 font-bold bg-surface-0 dark:bg-surface-900 border border-surface" style="border-radius: 20px">
                            <span class="mr-12">{{ tag }}</span>
                            <span class="chip-remove-icon flex items-center justify-center border border-surface bg-gray-100 rounded-full cursor-pointer" @click="onRemoveTags(tag)">
                                <i class="pi pi-fw pi-times text-black/60"></i> </span
                        ></Chip>
                    </div>
                </div>
                <div class="border border-surface rounded-border">
                    <span class="text-surface-900 dark:text-surface-0 font-bold block border-b border-surface p-12">Category</span>
                    <div class="p-12">
                        <Select :options="categoryOptions" v-model="selectedCategory" placeholder="Select a category"></Select>
                    </div>
                </div>

                <div class="border border-surface rounded-border">
                    <span class="text-surface-900 dark:text-surface-0 font-bold block border-b border-surface p-12">Colors</span>
                    <div class="p-12 flex">
                        <div
                            v-for="(color, i) in colorOptions"
                            :key="i"
                            class="w-8/12 h-8 mr-2 border border-surface rounded-full cursor-pointer flex justify-center items-center"
                            :class="color.background"
                            @click="toggleColor(color.name)"
                        >
                            <i v-if="product.colors.includes(color.name)" :key="i" class="pi pi-check text-sm text-white z-50"></i>
                        </div>
                    </div>
                </div>

                <div class="border border-surface rounded-border">
                    <span class="text-surface-900 dark:text-surface-0 font-bold block border-b border-surface p-12">Stock</span>
                    <div class="p-12">
                        <Select :options="categoryOptions" v-model="selectedStock" placeholder="Select stock"></Select>
                    </div>
                </div>
                <div class="border border-surface flex justify-between items-center px-12 rounded-border">
                    <span class="text-surface-900 dark:text-surface-0 font-bold p-12">In stock</span>
                    <InputField
                        variant="switch"
                        v-model="product.inStock" />
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
