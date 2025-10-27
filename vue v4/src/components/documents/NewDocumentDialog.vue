<script setup>
import lodash from 'lodash';
import { ref, computed, onMounted } from 'vue';
import VaporUpload from '@/components/VaporUpload.vue';
import { useDocumentStore } from '@/stores';
import InputField from '../common/InputField.vue';
import { useHelpers } from '@/composables';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    },
    tree: {
        type: Object
    },
    isFile: {
        type: Boolean,
        default: false
    },
    localeList: {
        type: Array
    },
    currentLocale: {
        type: Object
    }
});

const emit = defineEmits(['confirm', 'update:modelValue']);

const helpers = useHelpers();
const documentStore = useDocumentStore();

const processing = ref(false);
const path = ref(null);
const folderName = ref(null);
const uploadedFiles = ref([]);
const directories = ref(lodash.cloneDeep(props.tree.directories) || []);

const isUploading = ref(false);

const dialog = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emit('update:modelValue', value);
    }
});

onMounted(() => {
    if (props.tree.directories && props.tree.directories.length > 0) {
        directories.value = props.tree.directories?.filter((item) => {
            if (
                item.key !== 'Attached Benefits' &&
                item.key !== 'Attached Benefit Groups'
            ) {
                return item;
            }
        });
    }
});

const fullPath = computed(() => {
    if (path.value) {
        let p = getPathFromTreeObject(path.value);

        if (props.isFile) {
            return p;
        }

        return `${p}/${folderName.value}`;
    }

    if (folderName.value) {
        return folderName.value;
    }

    return null;
});

const getPathFromTreeObject = (obj) => {
    if (!obj) {
        return '';
    }

    let p = Object.keys(obj)[0];

    return p;
};

const handleFileUpload = (e) => {
    e.locale = props.currentLocale;
    e.path = path.value;
    uploadedFiles.value.push({
        ...e,
        errorMessage: '',
        isUploading: 'waiting',
        isUploaded: false
    });
};

const getNewName = (file) => {
    const name = file.name.split('.');
    if (!name[0]) {
        return;
    }

    return name[0] + '.' + file.extension;
};

const confirm = async () => {
    processing.value = true;

    if (props.isFile) {
        let tasks = [];

        uploadedFiles.value.forEach((uploadedFile) => {
            if (!uploadedFile.isUploaded) {
                uploadedFile.name = getNewName(uploadedFile);
                tasks.push(
                    new Promise((resolve) => {
                        let data = {
                            path:
                                getPathFromTreeObject(uploadedFile.path) ||
                                fullPath.value,
                            locale: uploadedFile.locale.id,
                            file: uploadedFile
                        };
                        uploadedFile.isUploading = 'in-process';
                        uploadedFile.isUploaded = false;
                        documentStore
                            .storeDocument(props.type, props.id, data)
                            .then(() => {
                                uploadedFile.isUploaded = true;
                                setTimeout(
                                    () =>
                                        uploadedFiles.value.splice(
                                            uploadedFiles.value.indexOf(
                                                uploadedFile
                                            ),
                                            1
                                        ),
                                    1000
                                );
                            })
                            .catch((error) => {
                                uploadedFile.isUploaded = false;
                                uploadedFile.errorMessage =
                                    error.response.data.message;
                            })
                            .finally(() => {
                                uploadedFile.isUploading = 'done';
                                resolve();
                            });
                    })
                );
            }
        });

        await Promise.all(tasks);
        path.value = null;
        folderName.value = null;
        processing.value = false;

        emit('confirm');
    } else {
        try {
            await documentStore.storeDocument(props.type, props.id, {
                path: fullPath.value,
                locale: props.currentLocale.id,
                file: null
            });
            emit('confirm');
        } catch (error) {
            //
        } finally {
            processing.value = false;
        }
    }
};

const cancel = () => {
    uploadedFiles.value = [];
    path.value = null;
    folderName.value = null;
    processing.value = false;
    emit('cancel');
};

const handleUploading = (value) => {
    isUploading.value = value;
};

const deleteFile = (file) => {
    uploadedFiles.value.splice(uploadedFiles.value.indexOf(file), 1);
};
</script>

<template>
    <Dialog
        v-model:visible="dialog"
        modal
        :header="
            isFile
                ? $t('documents.create_new_file')
                : $t('documents.create_new_folder')
        "
        :style="{ width: '50vw' }"
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
        :closable="false"
    >
        <div class="grid grid-cols-12">
            <div class="col-span-12 mb-4" v-if="directories.length">
                <label for="path" class="mb-2">{{ $t('documents.parent_folder') }}</label>
                <TreeSelect
                    v-model="path"
                    :options="directories"
                    :placeholder="$t('documents.parent_folder')"
                    class="md:w-80 w-full"
                />
            </div>
            <template v-if="isFile">
                <div class="col-span-12">
                    <label for="path" class="mb-2">{{ $t('documents.upload_files') }}</label>
                    <VaporUpload
                        :label="$t('documents.upload_files')"
                        @onUploaded="handleFileUpload"
                        @onUploading="handleUploading"
                        :multiple="true"
                        accept="image/*,application/pdf"
                        data-testid="upload-files"
                    />
                </div>
                <div class="col-span-12" v-if="uploadedFiles.length">
                    <h5 class="my-4">{{ uploadedFiles.length }} Files</h5>
                    <Card
                        v-for="(file, i) in uploadedFiles"
                        :key="i"
                        class="mb-12"
                    >
                        <template #content>
                            <div class="mb-4">
                                <div
                                    class="flex justify-between items-center"
                                >
                                    <h5>
                                        {{ file.name }}
                                        <template
                                            v-if="file.isUploading === 'done'"
                                        >
                                            <Tag
                                                v-if="file.isUploaded"
                                                :value="
                                                    $t('documents.uploaded')
                                                "
                                                severity="success"
                                            />
                                            <Tag
                                                v-else
                                                :value="
                                                    $t('documents.not_uploaded')
                                                "
                                                severity="danger"
                                            />
                                        </template>
                                    </h5>
                                    <Button
                                        text
                                        size="small"
                                        icon="pi pi-trash"
                                        severity="danger"
                                        @click="deleteFile(file)"
                                        data-testid="delete-file"
                                    />
                                </div>
                                <div>
                                    <span class="text-sm">{{
                                        helpers.formatBytes(file.size)
                                    }}</span>
                                </div>
                            </div>
                            <div class="grid grid-cols-12 gap-4 mt-4">
                                <div
                                    class="col-span-4"
                                    v-if="directories.length"
                                >
                                    <label for="path" class="mb-2">Parent Folder</label>
                                    <TreeSelect
                                        v-model="uploadedFiles[i].path"
                                        :options="directories"
                                        placeholder="Parent Folder"
                                        class="w-full"
                                    />
                                </div>
                                <div class="col-span-4">
                                    <label for="language" class="mb-2"> Name </label>
                                    <InputText
                                        :id="`file-${i}`"
                                        v-model="uploadedFiles[i].name"
                                        label="Name"
                                        @keyup="
                                            uploadedFiles[i].name =
                                                uploadedFiles[i].name.replace(
                                                    /\//g,
                                                    ''
                                                )
                                        "
                                        type="text"
                                        variant="text"
                                        data-testid="file-name"
                                        class="w-full"
                                    />
                                </div>
                                <div class="col-span-4">
                                    <label for="language" class="mb-2">
                                        {{ $t('common.language') }}
                                    </label>
                                    <InputField
                                        label="Language"
                                        id="currentLocale"
                                        variant="select"
                                        v-model="uploadedFiles[i].locale"
                                        :options="props.localeList"
                                        optionLabel="name"
                                        :placeholder="$t('common.select')"
                                        data-testid="language"
                                        class="w-full"
                                    />
                                </div>
                            </div>
                            <ProgressBar
                                v-if="file.isUploading === 'in-process'"
                                mode="indeterminate"
                                style="height: 6px"
                                class="my-4"
                            ></ProgressBar>
                            <p
                                class="p-error block"
                                v-if="
                                    file.isUploading === 'done' &&
                                    !file.isUploaded
                                "
                            >
                                {{ file.errorMessage }}
                            </p>
                        </template>
                    </Card>
                </div>
            </template>
            <template v-else>
                <div class="col-span-12">
                    <label for="path" class="mb-2">{{ $t('documents.folder_name') }}</label>
                    <InputText
                        id="path"
                        v-model="folderName"
                        @keyup="folderName = folderName.replace(/\//g, '')"
                        :label="$t('documents.folder_name')"
                        type="text"
                        variant="text"
                        iconBefore="pi pi-folder"
                        data-testid="folder-name"
                        class="w-full"
                    />
                </div>
            </template>
        </div>
        <template #footer>
            <input type="hidden" autofocus />
            <div class="edit-cancel-button">
                <Button
                    text
                    autofocus
                    :label="$t('buttons.cancel')"
                    :disabled="processing || isUploading"
                    @click="cancel"
                    class="p-button-outlined mr-2"
                    data-testid="cancel-button"
                />
                <Button
                    :label="
                    isFile ? $t('documents.upload') : $t('documents.new_folder')
                "
                    :disabled="
                    processing ||
                    isUploading ||
                    (isFile && uploadedFiles.length === 0)
                "
                    :loading="processing || isUploading"
                    @click="confirm"
                    data-testid="confirm-button"
                />
            </div>
        </template>
    </Dialog>
</template>
