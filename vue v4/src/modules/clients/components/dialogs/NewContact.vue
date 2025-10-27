<script setup>
import { ref, computed, reactive, watch, onMounted } from 'vue';
import { useClientStore } from '@/modules/clients/stores';
import { useGlobalStore, useCommonStore } from '@/stores';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    variant: {
        type: String,
        default: 'client'
    },
    contact: {
        type: Object
    },
    contactableId: {
        type: String
    }
});

const emit = defineEmits(['refresh', 'update:modelValue']);

const clientStore = useClientStore();
const commonStore = useCommonStore();
const busy = ref(false);
const loading = ref(false);
const contactTypes = ref([]);

onMounted(() => {
    getContactTypes();
});

let formData = reactive({
    use_as_primary_contact: false,
    first_name: null,
    last_name: null,
    email: null,
    phone_number: null,
    contact_type_id: null
});

const dialog = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emit('update:modelValue', value);
    }
});

watch(
    () => [props.modelValue],
    () => {
        onShow();
    }
);

const getContactTypes = async () => {
    const res = await commonStore.searchContactTypes();
    contactTypes.value = res.data;
};

const reset = () => {
    formData.use_as_primary_contact = false;
    formData.first_name = null;
    formData.last_name = null;
    formData.email = null;
    formData.phone_number = null;
    formData.contact_type_id = null;
};

const onShow = () => {
    if (!props.modelValue) return;
    if (props.contact) {
        formData = reactive({
            ...props.contact,
            contact_type_id: props.contact?.contact_type?.id
        });
    } else {
        reset();
    }
};

const processPayload = (data) => {
    return props.variant === 'client'
        ? {
              ...data,
              client_id: props.contactableId
          }
        : props.variant === 'businessUnit'
        ? {
              ...data,
              business_unit_id: props.contactableId
          }
        : {
              ...data,
              holding_id: props.contactableId
          };
};

const create = async () => {
    const payload = processPayload(formData);
    await clientStore.createContact(payload);
    dialog.value = false;
    emit('refresh');
};

const update = async () => {
    const payload = processPayload(formData);
    await clientStore.updateContact(props.contact?.id, payload);
    dialog.value = false;
    emit('refresh');
};

const deleteContact = async () => {
    await clientStore.deleteContact(props.contact?.id);
    dialog.value = false;
    emit('refresh');
};

const deleteDialog = ref(false);

const saveAndAddAnother = async () => {
    try {
        loading.value = true;
        const payload = processPayload(formData);
        await clientStore.createContact(payload);
        reset();
        emit('refresh');
    } finally {
        loading.value = false;
    }
};

const save = async () => {
    try {
        busy.value = true;
        props.contact ? await update() : await create();
        dialog.value = false;
    } finally {
        busy.value = false;
    }
};

const hideDialog = () => {
    useGlobalStore().clearErrors();
};
</script>

<template>
    <Dialog
        v-model:visible="dialog"
        modal
        @update:visible="onShow"
        :header="props.contact ? 'Edit Contact' : 'New Contact'"
        :style="{ width: '480px' }"
        @hide="hideDialog"
    >
        <div class="grid grid-cols-12 gap-4">
            <div class="col-span-12">
                <label for="contact_type_id" data-testid="contact-type-label"
                    >{{ $t('clients.contact_type') }} *</label
                >
                <InputField
                    id="contact_type_id"
                    variant="select"
                    :options="contactTypes"
                    optionLabel="name"
                    optionValue="id"
                    :placeholder="$t('common.select')"
                    v-model="formData.contact_type_id"
                    data-testid="contact-type-input"
                    class="w-full"
                />
            </div>
            <div class="col-span-12 flex">
                <InputField
                    variant="checkbox"
                    binary
                    v-model="formData.use_as_primary_contact"
                    data-testid="use-as-primary-contact-input"
                    class="w-full"
                />
                <span class="ml-2 mt-1 flex items-center"
                    >{{ $t('clients.use_as_primary_contact') }}
                    <i
                        v-tooltip="$t('clients.use_as_primary_contact')"
                        class="pl-2 mt-1 pi pi-info-circle"
                    ></i
                ></span>
            </div>
            <div class="col-span-6">
                <label for="first_name">{{ $t('clients.first_name') }} *</label>
                <InputField
                    id="first_name"
                    variant="text"
                    v-model="formData.first_name"
                    class="w-full"
                />
            </div>
            <div class="col-span-6">
                <label for="last_name">{{ $t('clients.last_name') }} *</label>
                <InputField
                    id="last_name"
                    variant="text"
                    v-model="formData.last_name"
                    class="w-full"
                />
            </div>
            <div class="col-span-12">
                <label for="email">{{ $t('clients.email_address') }}</label>
                <InputField
                    id="email"
                    variant="text"
                    v-model="formData.email"
                    class="w-full"
                />
            </div>
            <div class="col-span-12">
                <label for="phone_number">{{ $t('clients.phone') }} #</label>
                <InputField
                    id="phone_number"
                    variant="phone"
                    v-model="formData.phone_number"
                    class="w-full"
                />
            </div>
            <div class="col-span-12" v-if="!formData.use_as_primary_contact">
                <div class="message-info">
                    <i class="pi pi-info-circle"></i>
                    {{ $t('clients.new_client_email_or_phone_required') }}
                </div>
            </div>
        </div>
        <template #footer>
            <div class="flex justify-between edit-cancel-button">
                <div>
                    <Button
                        v-if="
                            props.contact &&
                            !props.contact?.use_as_primary_contact
                        "
                        text
                        :label="$t('clients.delete_contact')"
                        class="p-button-danger"
                        @click="deleteDialog = true"
                    />
                </div>
                <div>
                    <Button text label="Cancel" class="mr-2" @click="dialog = false" />
                    <Button
                        v-if="!props.contact"
                        :loading="loading"
                        :label="$t('buttons.save_add_other')"
                        class="p-button-outlined mr-2"
                        icon="pi pi-plus"
                        @click="saveAndAddAnother"
                    />
                    <Button
                        :label="
                            props.contact
                                ? $t('buttons.update')
                                : $t('buttons.save')
                        "
                        :loading="busy"
                        @click="save"
                    />
                </div>
            </div>
        </template>

        <Confirmation
            v-model="deleteDialog"
            show-alert-icon
            :header="$t('clients.delete_contact_header')"
            :content="
                $t('clients.delete_contact_content', {
                    type: props.contact?.contact_type?.name,
                    fullname: `${props.contact?.first_name} ${
                        props.contact?.last_name ?? ''
                    }`
                })
            "
            :confirm-button-text="$t('buttons.delete')"
            confirm-button-class="p-button-danger"
            @confirm="deleteContact"
        />
    </Dialog>
</template>
<style>
.p-dialog-content {
    overflow-y: visible !important;
}
</style>
