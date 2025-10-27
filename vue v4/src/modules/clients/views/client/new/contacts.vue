<script setup>
import lodash from 'lodash';
import { ref, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { useClientStore } from '@/modules/clients/stores';

import NewContact from '@/modules/clients/components/dialogs/NewContact.vue';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});

const router = useRouter();
const clientStore = useClientStore();

const busy = ref(false);
const loading = ref(false);
const item = ref({});
const selectedItem = ref(null);
const contactDialog = ref(false);
const deleteDialog = ref(false);

onBeforeMount(() => {
    getData();
});

const getData = async () => {
    try {
        loading.value = true;
        await getItem();
    } finally {
        loading.value = false;
    }
};

const getItem = async () => {
    const params = { include: 'contacts.contactType' };
    const res = await clientStore.getClient(props.id, params);
    item.value = res.data;
};

const addContact = () => {
    selectedItem.value = null;
    contactDialog.value = true;
};

const editContact = (data) => {
    selectedItem.value = data;
    contactDialog.value = true;
};

const showDeleteDialog = (contact) => {
    selectedItem.value = contact;
    deleteDialog.value = true;
};

const deleteContact = async () => {
    await clientStore.deleteContact(selectedItem.value.id);
    await getItem();
};

const goBack = () => {
    router.push({ name: 'New Client Step 2', params: { id: props.id } });
};

const goNext = () => {
    router.push({ name: 'New Client Step 4', params: { id: props.id } });
};
</script>

<template>
    <Loader v-if="loading" />
    <div v-else>
        <div class="grid grid-cols-12 mt-12">
            <div class="col-span-8 col-start-3">
                <Card>
                    <template #content>
                        <div
                            class="flex justify-between items-center mb-4"
                        >
                            <h5 data-testid="contacts-title">
                                {{ $t('clients.contacts') }}
                            </h5>
                            <div>
                                <Button
                                    :label="$t('clients.add_contact')"
                                    class="p-button-outlined mr-2 p-2"
                                    icon="pi pi-plus"
                                    @click="addContact"
                                    data-testid="add-contact-button"
                                    v-if="$ability.can('create clients')"
                                />
                            </div>
                        </div>
                        <div
                            data-testid="clients-contact-info-label"
                            class="mb-4 message-info"
                        >
                            <i class="pi pi-info-circle"></i>
                            {{ $t('clients.client_contacts_info') }}
                        </div>
                        <div v-if="item.contacts.length > 0">
                            <div
                                v-for="(contact, index) in item.contacts"
                                :key="contact.id"
                            >
                                <div
                                    class="flex justify-between items-start"
                                >
                                    <div>
                                        <div
                                            class="flex justify-start align-item-center gap-12 mb-2"
                                        >
                                            <div
                                                class="pb-1 pt-1 text-lg font-bold text-gray-700"
                                            >
                                                {{ contact.contact_type?.name }}
                                            </div>
                                            <Tag
                                                v-if="
                                                    contact.use_as_primary_contact
                                                "
                                                icon="pi pi-user"
                                                value="PRIMARY"
                                                severity="success"
                                                class="custom-tag"
                                                :style="{
                                                    background: '#dcfce7',
                                                    color: '#15803d'
                                                }"
                                            />
                                        </div>
                                        <div
                                            class="mb-2 text-md text-gray-600 capitalize"
                                            v-tooltip.top="
                                                clientStore.showName(
                                                    contact,
                                                    false
                                                )
                                            "
                                        >
                                            {{
                                                clientStore.showName(
                                                    contact,
                                                    true
                                                )
                                            }}
                                        </div>
                                        <div class="mb-2 text-md text-gray-600">
                                            {{ contact.email }}
                                        </div>
                                        <div class="mb-2 text-md text-gray-600">
                                            {{ contact.phone_number }}
                                        </div>
                                    </div>
                                    <div class="flex gap-2">
                                        <Button
                                            icon="pi pi-pencil"
                                            class="p-button-rounded p-button-outlined"
                                            @click="editContact(contact)"
                                            v-if="
                                                $ability.can('update clients')
                                            "
                                        />
                                        <Button
                                            v-if="
                                                !contact.use_as_primary_contact &&
                                                $ability.can('delete clients')
                                            "
                                            icon="pi pi-trash"
                                            class="p-button-rounded p-button-outlined p-button-danger"
                                            @click="showDeleteDialog(contact)"
                                        />
                                    </div>
                                </div>

                                <Divider v-if="index !== item.contacts.length - 1" />

                            </div>
                        </div>
                        <div data-testid="no-contacts-added-label" v-else>
                            {{ $t('clients.no_contacts_added_yet') }}
                        </div>
                    </template>
                </Card>
            </div>
        </div>
        <div class="grid grid-cols-12 my-20">
            <div class="col-span-8 col-start-3">
                <div
                    class="mt-12 flex justify-between items-center edit-cancel-button"
                >
                    <Button
                        :label="$t('buttons.back')"
                        icon="pi pi-chevron-left"
                        class="p-button-outlined"
                        @click="goBack"
                        data-testid="back-button"
                    />
                    <Button
                        :label="$t('buttons.save_continue')"
                        :loading="busy"
                        icon-pos="right"
                        icon="pi pi-chevron-right"
                        @click="goNext"
                        data-testid="save-continue-button"
                    />
                </div>
            </div>
        </div>
        <NewContact
            v-model="contactDialog"
            variant="client"
            @refresh="getItem"
            :contactableId="props.id"
            :contact="selectedItem"
            v-if="
                $ability.can('create clients') || $ability.can('update clients')
            "
        />
        <Confirmation
            v-if="deleteDialog && $ability.can('delete clients')"
            v-model="deleteDialog"
            show-alert-icon
            :header="$t('clients.delete_contact_header')"
            :content="
                $t('clients.delete_contact_content', {
                    type: selectedItem?.contact_type?.name,
                    fullname: `${clientStore.showName(selectedItem, false)}`
                })
            "
            :confirm-button-text="$t('buttons.delete')"
            confirm-button-class="p-button-danger"
            @confirm="deleteContact"
        />
    </div>
</template>
<style>
.custom-tag > .p-tag-value,
.custom-tag > .p-tag-icon {
    font-size: 0.875rem !important;
    font-weight: 700 !important;
}
</style>
