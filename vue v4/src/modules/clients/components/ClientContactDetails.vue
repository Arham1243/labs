<script setup>
import { ref, onMounted, computed } from 'vue';

import { useRoute } from 'vue-router';
import { useClientStore } from '@/modules/clients/stores/Client';

import NewContact from '@/modules/clients/components/dialogs/NewContact.vue';
import { ability } from '@/plugins/ability';
import { useEditState } from '@/modules/clients/composables/useEditState';

const props = defineProps({
    data: {
        type: Array,
        required: true
    },
    variant: {
        type: String,
        default: 'client'
    },
    componentId: {
        type: String,
        required: true
    }
});

const route = useRoute();
const clientStore = useClientStore();

const { activeEditComponent, setActiveComponent, clearActiveComponent } =
    useEditState();

const items = ref([]);
const contactDialog = ref(false);
const selectedItem = ref(null);
const isEditing = ref(false);

const isEditDisabled = computed(() => {
    return (
        activeEditComponent.value &&
        activeEditComponent.value !==
            `${props.componentId}-${selectedItem.value?.id}`
    );
});

const isAddContactDisabled = computed(() => {
    return !!activeEditComponent.value;
});

onMounted(() => {
    setItem();
});

const setItem = () => {
    if (props.data) {
        items.value = props.data;
    }
};

const processData = (data) => {
    props.variant === 'client'
        ? clientStore.setCurrentClient(data)
        : props.variant === 'businessUnit'
        ? clientStore.setCurrentBusinessUnit(data)
        : clientStore.setCurrentHolding(data);
    if (data.contacts) {
        items.value = data.contacts;
    }
};

const getItem = async () => {
    const params =
        props.variant === 'client'
            ? {
                  include:
                      'clientSector,country,billingDetail,contacts.contactType'
              }
            : props.variant === 'businessUnit'
            ? {
                  include:
                      'client,accountManager,billingDetail.country,contacts.contactType'
              }
            : {
                  include: 'clients,country,contacts.contactType'
              };
    const res =
        props.variant === 'client'
            ? await clientStore.getClient(route.params.id, params)
            : props.variant === 'businessUnit'
            ? await clientStore.getBusinessUnit(route.params.id, params)
            : await clientStore.getHolding(route.params.id, params);
    processData(res.data);
    clearActiveComponent();
};

const addContact = () => {
    selectedItem.value = null;
    contactDialog.value = true;
};
const editContact = (contact) => {
    selectedItem.value = contact;
    setActiveComponent(`${props.componentId}-${contact.id}`);
    isEditing.value = true;
    contactDialog.value = true;
};

const handleDialogClose = () => {
    contactDialog.value = false;
    clearActiveComponent();
    isEditing.value = false;
    selectedItem.value = null;
};

const isCreateActionAllowed = computed(() => {
    switch (props.variant) {
        case 'client':
            return ability.can('create clients');
        case 'businessUnit':
            return ability.can('create business units');
        case 'holding':
            return ability.can('create holdings');
    }
});

const isUpdateActionAllowed = computed(() => {
    switch (props.variant) {
        case 'client':
            return ability.can('update clients');
        case 'businessUnit':
            return ability.can('update business units');
        case 'holding':
            return ability.can('update holdings');
    }
});
</script>

<template>
    <div>
        <div class="flex justify-between items-center">
            <h4 class="mb-2" data-testid="contacts-title">Contacts</h4>
            <Button
                label="Add Contact"
                class="w-2/12 p-button-outlined mr-2 mb-12 p-2"
                icon="pi pi-plus"
                :disabled="isAddContactDisabled"
                @click="addContact"
                v-if="isCreateActionAllowed"
            />
        </div>
        <div v-if="items.length > 0" class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12">
            <div class="col-span-4" v-for="contact in items" :key="contact.id">
                <Card>
                    <template #content>
                        <div
                            class="flex justify-between items-center"
                        >
                            <div
                                class="flex justify-start align-item-center gap-12 mb-2"
                            >
                                <div
                                    class="pb-1 pt-1 text-lg font-bold text-gray-700"
                                >
                                    {{ contact.contact_type?.name }}
                                </div>
                                <Tag
                                    v-if="contact.use_as_primary_contact"
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
                            <Button
                                size="small"
                                text
                                class="px-2 py-1"
                                label="Edit"
                                icon="pi pi-pencil"
                                :disabled="isEditDisabled"
                                @click="editContact(contact)"
                                v-if="isUpdateActionAllowed"
                            />
                        </div>
                        <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 mt-1">
                            <div class="col-span-3 text-sm font-semibold py-1">
                                Name
                            </div>
                            <div class="col-span-9 text-sm py-1 p-break-word">
                                {{ contact.first_name }} {{ contact.last_name }}
                            </div>
                            <div class="col-span-3 text-sm font-semibold py-1">
                                Email
                            </div>
                            <div class="p-break-word col-span-9 text-sm py-1">
                                {{ contact.email }}
                            </div>
                            <div class="col-span-3 text-sm font-semibold py-1">
                                Phone #
                            </div>
                            <div class="col-span-9 text-sm py-1">
                                {{ contact.phone_number }}
                            </div>
                        </div>
                    </template>
                </Card>
            </div>
        </div>
        <NewContact
            v-model="contactDialog"
            :variant="variant"
            :contactableId="route.params.id"
            :contact="selectedItem"
            @refresh="getItem"
            @update:modelValue="handleDialogClose"
            v-if="isCreateActionAllowed"
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
