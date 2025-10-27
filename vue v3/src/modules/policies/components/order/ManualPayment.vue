<script setup>
import { computed, ref } from 'vue';
import { useConfirm } from 'primevue/useconfirm';
import { useI18n } from 'vue-i18n';
import {
    useCartsStore,
    usePoliciesStore
} from '@/modules/policies/stores/index.js';
import VaporUploadToast from '@/components/VaporUploadToast.vue';
import { useToast } from 'primevue/usetoast';

const props = defineProps({
    paymentMethod: {
        type: Object,
        default: () => ({})
    }
});

const confirm = useConfirm();
const { t } = useI18n();
const cartStore = useCartsStore();
const policyStore = usePoliciesStore();

const paymentMethod = ref(props.paymentMethod);
const files = ref([]);
const note = ref('');
const toast = useToast();
const cloudFiles = ref([]);

const onFileSelected = (event) => {
    const file = event.files[0];
    files.value.push(file);
};

const handleFileUploaded = (file) => {
    cloudFiles.value.push(file);
};

const getFileSize = (file) => {
    const bytes = file.size;
    const kilobytes = bytes / 1024 / 1024;
    return kilobytes.toFixed(2) + ' MB';
};

const confirmRemoveFile = (index) => {
    confirm.require({
        message: t('policies.payment.confirm_remove_message'),
        header: t('policies.payment.confirmation'),
        icon: 'pi pi-exclamation-triangle',
        rejectClass: 'p-button-secondary p-button-outlined',
        rejectLabel: 'Cancel',
        acceptLabel: 'Confirm',
        accept: () => {
            removeFile(index);
        },
        reject: () => {}
    });
};
const removeFile = (index) => {
    files.value.splice(index, 1);
    cloudFiles.value.splice(index, 1);
};

const checkoutCart = async () => {
    try {
        if (!files.value?.length) {
            return;
        }

        const payload = {
            files: cloudFiles.value.map((file, index) => {
                return {
                    name: file?.name,
                    key: file?.key,
                    ref_number: files.value[index]?.ref_number
                };
            }),
            note: note.value,
            payment_method: paymentMethod.value.method,
            payment_type: 'cod'
        };

        const res = await cartStore.processCheckout(payload);
        policyStore.setOrder(res.data);

        return true;
    } catch (e) {
        return false;
    } finally {
    }
};

const showFileUploaderToast = (message) => {
    toast.add({
        severity: 'error',
        summary: t('vapor_file_uploader.upload_error'),
        detail: message,
        life: 6000
    });
};

const isReadyToConfirm = computed(() => {
    return cloudFiles.value?.length > 0;
});

defineExpose({ checkoutCart, isReadyToConfirm });
</script>

<template>
    <div class="grid justify-content-center mt-4">
        <div :class="'col-9'">
            <Card>
                <template #title
                    ><h5>
                        {{
                            $t(
                                `policies.payment.upload_section_desc_${paymentMethod.method}`
                            )
                        }}
                    </h5></template
                >
                <template #content>
                    <div
                        class="p-4 bg-gray-100 border-1 border-gray-300 border-round-md"
                    >
                        <VaporUploadToast
                            @onUploaded="handleFileUploaded"
                            @uploader="onFileSelected"
                            @showSeparateToast="showFileUploaderToast"
                            :label="$t('common.upload')"
                            data-testid="upload-file"
                            accept="application/pdf, image/png, image/jpeg, image/jpg"
                            class="p-button-outlined"
                            :disabled="files?.length > 0"
                        />
                    </div>

                    <div class="border-1 border-gray-300 border-round-md">
                        <div v-for="(file, index) in files" :key="index">
                            <div
                                class="flex flex-column sm:flex-row sm:align-items-center p-3"
                                :class="{
                                    'border-top-1 surface-border': index !== 0
                                }"
                            >
                                <div class="w-10rem text-center">
                                    <img
                                        v-if="file.objectURL"
                                        class="block xl:block mx-auto border-round w-8"
                                        :alt="file.name"
                                        :src="file.objectURL"
                                    />
                                    <i v-else class="pi pi-file-pdf text-5xl" />
                                </div>
                                <div
                                    class="flex flex-column justify-content-between gap-3"
                                >
                                    <div>
                                        <span class="text-md">{{
                                            file.name
                                        }}</span>
                                    </div>
                                    <div>
                                        <span class="text-md">{{
                                            getFileSize(file)
                                        }}</span>
                                    </div>
                                </div>
                                <div class="flex align-items-center ml-auto">
                                    <InputText
                                        v-model="file.ref_number"
                                        :placeholder="
                                            $t('policies.payment.enter_ref')
                                        "
                                    />
                                </div>
                                <div class="flex align-items-center ml-3">
                                    <Button
                                        class="px-4"
                                        icon="pi pi-times"
                                        severity="secondary"
                                        @click="confirmRemoveFile(index)"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex flex-column gap-2 mt-3">
                        <label for="payment-note">{{
                            $t('policies.payment.note')
                        }}</label>
                        <InputText id="payment-note" v-model="note" />
                    </div>

                    <ConfirmDialog />
                </template>
            </Card>
        </div>
    </div>
</template>

<style lang="scss"></style>
