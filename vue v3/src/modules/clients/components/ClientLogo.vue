<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useSessionStore } from '@/stores';
import { useClientStore } from '@/modules/clients/stores';
import Vapor from '@/services/Vapor';
import { useToast } from 'primevue/usetoast';
import { useEditState } from '@/modules/clients/composables/useEditState';

const props = defineProps({
    modelValue: {
        type: Object
    },
    isNew: {
        type: Boolean,
        default: false
    },
    variant: {
        type: String,
        required: true,
        validator(value) {
            return ['client', 'holding'].includes(value);
        }
    },
    componentId: {
        type: String,
        required: true
    }
});

const {
    activeEditComponent,
    setActiveComponent,
    clearActiveComponent,
    registerCancelCallback,
    unregisterCancelCallback
} = useEditState();

const formData = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emit('update:modelValue', value);
    }
});

const fileError = ref(null);
const selectedFile = ref(props.modelValue.logo);
const previewUrl = ref(null);
const clientStore = useClientStore();
const emit = defineEmits([
    'update:modelValue',
    'getItem',
    'loading',
    'onProgress'
]);
const toast = useToast();
const loading = ref(false);
const isEditing = ref(props.isNew);

const updateAction = {
    client: 'updateClient',
    holding: 'updateHolding'
}[props.variant];

watch(formData, (value) => {
    emit('update:modelValue', value);
});

watch(loading, () => {
    emit('loading', loading.value);
});

onMounted(() => {
    registerCancelCallback(props.componentId, handleCancel);
});

onUnmounted(() => {
    unregisterCancelCallback(props.componentId);
});

const isEditDisabled = computed(() => {
    return (
        activeEditComponent.value &&
        activeEditComponent.value !== props.componentId
    );
});

const handleEdit = () => {
    isEditing.value = true;
    setActiveComponent(props.componentId);
};

const handleCancel = () => {
    isEditing.value = false;
    clearActiveComponent();
    fileError.value = null;
};

const handleDragOver = (event) => {
    event.dataTransfer.dropEffect = 'copy';
};

// Process the payload to ensure preferred_language is in the correct format
const processPayload = (data) => {
    const processedData = { ...data };
    if (
        processedData.preferred_language &&
        typeof processedData.preferred_language === 'object'
    ) {
        processedData.preferred_language = processedData.preferred_language.id;
    }
    return processedData;
};

// Validate the file name to ensure it contains only valid characters before uploading
const validateFileName = (fileName) => {
    const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, '');
    const invalidPattern = /[^a-zA-Z0-9 _-]/;

    if (!nameWithoutExtension.trim()) {
        return false;
    }
    return !invalidPattern.test(nameWithoutExtension);
};

const handleDrop = (event) => {
    const files = event.dataTransfer.files;
    fileError.value = null;
    selectedFile.value = null;
    previewUrl.value = null;

    const file = files[0];

    if (!file) {
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        fileError.value = 'File size should not exceed 10 MB.';
        return;
    }

    if (!validateFileName(file.name)) {
        fileError.value = 'The logo name field format is invalid.';
        return;
    }

    selectedFile.value = file;

    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewUrl.value = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    handleFileUpload(file);
};

const handleFileChange = (event) => {
    fileError.value = null;
    selectedFile.value = null;
    previewUrl.value = null;

    const file = event.target.files[0];

    if (!file) {
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        fileError.value = 'File size should not exceed 10 MB.';
        return;
    }

    if (!validateFileName(file.name)) {
        fileError.value = 'The logo name field format is invalid.';
        return;
    }

    if (
        !['image/gif', 'image/jpeg', 'image/png', 'image/jpg'].includes(
            file.type
        )
    ) {
        fileError.value = 'Invalid file type.';
        return;
    }

    selectedFile.value = file;

    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewUrl.value = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    handleFileUpload(file);
};

const reset = () => {
    fileError.value = null;
    selectedFile.value = null;
    previewUrl.value = null;

    formData.value.logo = null;

    if (!props.isNew) {
        (async () => {
            // Process the payload to ensure preferred_language is in the correct format
            const processedData = processPayload(formData.value);
            await clientStore[updateAction](formData.value.id, processedData);
        })();
        isEditing.value = false;
        clearActiveComponent();
    }
};

const handleFileUpload = (file) => {
    loading.value = true;
    const signedStorageUrl = `${
        import.meta.env.VITE_API_BASE_URL
    }/api/v1/vapor/signed-storage-url`;

    const sessionStore = useSessionStore();

    const authCookie = sessionStore.getCookie() || {};

    const { access_token } = authCookie;

    Vapor.store(file, {
        signedStorageUrl: signedStorageUrl,
        headers: {
            authorization: `Bearer ${access_token}`
        },
        progress: (progress) => {
            emit('onProgress', Math.round(progress * 100));
        }
    }).then((response) => {
        formData.value.logo = response;

        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Logo uploaded successfully.',
            life: 2000
        });

        if (!props.isNew) {
            (async () => {
                // Process the payload to ensure preferred_language is in the correct format
                const processedData = processPayload(formData.value);
                await clientStore[updateAction](
                    formData.value.id,
                    processedData
                );
                emit('getItem');
            })();
            isEditing.value = false;
            clearActiveComponent();
        }
        loading.value = false;
    });
};

const handleUpload = () => {
    fileError.value = null;
    selectedFile.value = null;
    previewUrl.value = null;

    formData.value.logo = null;

    setTimeout(() => {
        document.getElementById('file-upload-label')?.click();
    }, 500);
};
</script>

<template>
    <div>
        <div class="flex justify-content-between align-items-center mb-3">
            <h5 class="mb-3" data-testid="client-logo-title">
                {{
                    variant === 'client'
                        ? $t('clients.client_logo')
                        : $t('clients.holding_logo')
                }}
            </h5>
            <div v-if="!isNew">
                <Button
                    v-if="isEditing"
                    label="Done"
                    class="p-button mr-2"
                    icon="pi pi-check"
                    @click="handleCancel"
                />
                <Button
                    v-else
                    size="small"
                    text
                    class="px-2 py-1"
                    label="Edit"
                    icon="pi pi-pencil"
                    :disabled="isEditDisabled"
                    @click="handleEdit"
                />
            </div>
        </div>

        <div
            @dragover.prevent="handleDragOver"
            @drop.prevent="handleDrop"
            v-if="!selectedFile && isEditing"
            class="file-upload-container"
        >
            <label
                for="file-upload"
                class="custom-file-upload"
                id="file-upload-label"
                data-testid="client-logo-label"
            >
                <i class="pi pi-cloud-upload mb-4" style="font-size: 3rem"></i>
                <p style="color: #202020">
                    Drag and drop or
                    <span class="font-md" style="font-weight: bold; color: #000"
                        >select</span
                    >
                    your file
                </p>
            </label>
            <input
                id="file-upload"
                type="file"
                @change="handleFileChange"
                accept="image/*"
                data-testid="client-logo-input"
            />
            <div v-if="fileError" class="w-full">
                <Message severity="error" :closable="false">
                    {{ fileError }}
                </Message>
            </div>
        </div>
        <div class="text-center" v-if="!selectedFile && !isNew && !isEditing">
            <img
                src="@/assets/images/image_not_available.png"
                alt="Image preview"
                :width="isNew ? '450' : '300'"
                style="border-radius: 20px"
            />
        </div>
        <div v-if="selectedFile" class="file-preview flex col-12 p-0">
            <div class="col-7 p-0">
                <img
                    v-if="previewUrl || selectedFile"
                    :src="previewUrl ?? selectedFile"
                    alt="Image preview"
                    :class="[
                        'image-thumbnail',
                        isNew ? 'image-large' : 'image-medium'
                    ]"
                />
            </div>
            <div
                v-if="isEditing || isNew"
                class="col-5 p-0 flex flex-row gap-2 align-items-center justify-content-center"
            >
                <Button
                    label="Re-upload"
                    class="p-button-outlined w-12rem"
                    icon="pi pi-refresh"
                    @click="handleUpload"
                />
                <Button
                    label="Delete"
                    severity="danger"
                    icon="pi pi-trash"
                    @click="reset"
                    class="w-10rem"
                />
            </div>
        </div>
    </div>
</template>

<style scoped>
.file-upload-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
}

.custom-file-upload {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    cursor: pointer;
    border: 2px dashed #ccc;
    border-radius: 5px;
    width: 100%;
    height: 150px;
    text-align: center;
    font-size: 16px;
    color: #888;
    background-color: #f9f9f9;
    transition: background-color 0.3s ease;
}

.custom-file-upload:hover {
    background-color: #f1f1f1;
}

input[type='file'] {
    display: none;
}

.error-message {
    color: red;
    margin-top: 10px;
}

.file-preview img {
    max-width: 100%;
    max-height: auto;
    margin-top: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    object-fit: cover;
}

::v-deep .p-button-label {
    font-weight: bold;
}

.image-thumbnail {
    height: auto;
    border-radius: 20px;
    object-fit: cover;
}

.image-large {
    max-width: 450px;
    max-height: 300px;
}

.image-medium {
    max-width: 300px;
    max-height: 200px;
}
</style>
