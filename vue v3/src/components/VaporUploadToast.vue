<script setup>
import { ref } from 'vue';
import Vapor from '@/services/Vapor';
import { useSessionStore } from '@/stores';

const props = defineProps({
    label: {
        type: String,
        default: 'Upload'
    },
    accept: {
        type: String,
        default: ''
    },
    multiple: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits([
    'onUploaded',
    'onProgress',
    'onUploading',
    'showSeparateToast'
]);
const isUploading = ref(false);
const fileUploadRef = ref(null);
let validFiles = [];

const handleFileSelect = (event) => {
    const maxFileSizeMB = 10;
    validFiles = [];

    for (const file of event.files) {
        if (file.size > maxFileSizeMB * 1024 * 1024) {
            emit(
                'showSeparateToast',
                `The file "${file.name}" exceeds the maximum size of ${maxFileSizeMB} MB.`
            );
            fileUploadRef.value.clear();
            return;
        }
        validFiles.push(file);
    }

    if (validFiles.length > 0) {
        fileUploadRef.value.upload();
    }
};

const handleFileInfo = (event) => {
    emit('onUploading', true);
    isUploading.value = true;
    const signedStorageUrl = `${
        import.meta.env.VITE_API_BASE_URL
    }/api/v1/vapor/signed-storage-url`;
    const sessionStore = useSessionStore();
    const { access_token } = sessionStore.getCookie() || {};

    event.files.forEach((file) => {
        Vapor.store(file, {
            signedStorageUrl: signedStorageUrl,
            headers: {
                authorization: `Bearer ${access_token}`
            },
            progress: (progress) => {
                emit('onProgress', Math.round(progress * 100));
            }
        })
            .then((response) => {
                emit('onUploading', false);
                emit('onUploaded', response);
            })
            .catch((error) => {
                emit('showSeparateToast', error.message);
            })
            .finally(() => {
                isUploading.value = false;
            });
    });
};
</script>

<template>
    <FileUpload
        ref="fileUploadRef"
        @select="handleFileSelect"
        @uploader="handleFileInfo"
        customUpload
        mode="basic"
        cancelButtonClass="p-button-outlined"
        :auto="false"
        :chooseLabel="props.label"
        :accept="props.accept"
        :multiple="props.multiple"
        :disabled="isUploading"
    />
</template>
