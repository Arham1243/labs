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

const emit = defineEmits(['onUploaded', 'onProgress', 'onUploading']);

const file = ref(null);
const isUploading = ref(false);

const handleFileUpload = () => {
    emit('onUploading', true);
    isUploading.value = true;
    const signedStorageUrl = `${
        import.meta.env.VITE_API_BASE_URL
    }/api/v1/vapor/signed-storage-url`;

    const sessionStore = useSessionStore();

    const authCookie = sessionStore.getCookie() || {};

    const { access_token } = authCookie;

    file.value.files.forEach((file) => {
        Vapor.store(file, {
            signedStorageUrl: signedStorageUrl,
            headers: {
                authorization: `Bearer ${access_token}`
            },
            progress: (progress) => {
                emit('onProgress', Math.round(progress * 100));
            }
        }).then((response) => {
            isUploading.value = false;
            emit('onUploading', false);
            emit('onUploaded', response);
        });
    });
};
</script>

<template>
    <FileUpload
        @uploader="handleFileUpload"
        ref="file"
        customUpload
        auto
        mode="basic"
        cancelButtonClass="p-button-outlined "
        :chooseLabel="props.label"
        :accept="props.accept"
        :multiple="props.multiple"
        :disabled="isUploading"
        :maxFileSize="100000 * 100"
    />

    <!-- maxFileSize 100 MB -->
</template>
