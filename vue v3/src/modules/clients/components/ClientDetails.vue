<script setup>
import { ref, computed, onMounted, watchEffect, onUnmounted } from 'vue';
import lodash from 'lodash';
import { useClientStore } from '@/modules/clients/stores/Client';
import { useHelpers } from '@/composables';
import ClientDetailsForm from '@/modules/clients/components/forms/ClientDetailsForm.vue';
import { useEditState } from '@/modules/clients/composables/useEditState';
import { availableLocale } from '@/config';
import { ability } from '@/plugins/ability';

const props = defineProps({
    data: {
        type: Object,
        required: true
    },
    isNew: {
        type: Boolean,
        default: false
    },
    variant: {
        type: String,
        default: 'client'
    },
    componentId: {
        type: String,
        required: true
    },
    isReview: {
        type: Boolean,
        default: false
    }
});

const helpers = useHelpers();
const clientStore = useClientStore();

const {
    activeEditComponent,
    setActiveComponent,
    clearActiveComponent,
    handleUnsavedChanges,
    registerCancelCallback,
    unregisterCancelCallback
} = useEditState();

const busy = ref(false);
const loading = ref(false);
const isEditing = ref(false);
const item = ref({});
const itemToUpdate = ref({});
const client = ref({});

watchEffect(() => {
    if (props.variant === 'businessUnit') {
        if (itemToUpdate.value.is_phone_number_same_as_client) {
            itemToUpdate.value.phone_number = client.value.phone_number;
        }
        if (itemToUpdate.value.is_website_url_same_as_client) {
            itemToUpdate.value.website_url = client.value.website_url;
        }
    }
});

onMounted(() => {
    setItem();
    getClient();
    registerCancelCallback(props.componentId, handleCancel);
});

onUnmounted(() => {
    unregisterCancelCallback(props.componentId);
});

const isNotChanged = computed(() => {
    return lodash.isEqual(item.value, itemToUpdate.value);
});

const isEditDisabled = computed(() => {
    return (
        activeEditComponent.value &&
        activeEditComponent.value !== props.componentId
    );
});

const setItem = () => {
    if (props.data) item.value = lodash.cloneDeep(props.data);
};

const getClient = async () => {
    if (props.variant === 'client' || props.variant === 'holding') return;
    const params = { include: 'country' };
    const res = await clientStore.getClient(item.value.client_id, params);
    client.value = res.data;
};

const emit = defineEmits(['update:data']);

const processData = (data) => {
    props.variant === 'client'
        ? clientStore.setCurrentClient(data)
        : props.variant === 'businessUnit'
          ? clientStore.setCurrentBusinessUnit(data)
          : clientStore.setCurrentHolding(data);
    item.value = lodash.cloneDeep(data);
    itemToUpdate.value = lodash.cloneDeep(item.value);
    emit('update:data', itemToUpdate.value);
};

const handleEdit = () => {
    itemToUpdate.value = lodash.cloneDeep(item.value);
    isEditing.value = true;
    setActiveComponent(props.componentId);
};

const handleCancel = () => {
    if (props.isReview) {
        isEditing.value = false;
        clearActiveComponent();
    } else {
        if (!isNotChanged.value) {
            handleUnsavedChanges(() => {
                isEditing.value = false;
                clearActiveComponent();
            });
        } else {
            isEditing.value = false;
            clearActiveComponent();
        }
    }
};

const save = async () => {
    try {
        busy.value = true;
        if (props.variant === 'client') {
            itemToUpdate.value.client_sector_id =
                itemToUpdate.value.client_sector?.id;
        }
        if (props.variant === 'businessUnit') {
            itemToUpdate.value.account_manager_user_id =
                itemToUpdate.value.account_manager_user?.id;
        }
        itemToUpdate.value.country_id = itemToUpdate.value.country?.id;
        itemToUpdate.value.preferred_language =
            itemToUpdate.value.preferred_language?.id;
        props.variant === 'client'
            ? await clientStore.updateClient(
                  itemToUpdate.value.id,
                  itemToUpdate.value
              )
            : props.variant === 'businessUnit'
              ? await clientStore.updateBusinessUnit(
                    itemToUpdate.value.id,
                    itemToUpdate.value
                )
              : await clientStore.updateHolding(
                    itemToUpdate.value.id,
                    itemToUpdate.value
                );
        const params =
            props.variant === 'client'
                ? {
                      include:
                          'clientSector,country,billingDetail,contacts,defaultBusinessUnit'
                  }
                : props.variant === 'businessUnit'
                  ? {
                        include:
                            'client,accountManager,billingDetail.country,contacts'
                    }
                  : {
                        include: 'clients,country,contacts'
                    };
        const res =
            props.variant === 'client'
                ? await clientStore.getClient(itemToUpdate.value.id, params)
                : props.variant === 'businessUnit'
                  ? await clientStore.getBusinessUnit(
                        itemToUpdate.value.id,
                        params
                    )
                  : await clientStore.getHolding(itemToUpdate.value.id, params);
        processData(res.data);
        isEditing.value = false;
        clearActiveComponent();
    } finally {
        busy.value = false;
    }
};

const isActionAllowed = computed(() => {
    switch (props.variant) {
        case 'client':
            return ability.can('update clients');
        case 'businessUnit':
            return ability.can('update business units');
        case 'holding':
            return ability.can('update holdings');
        default:
            return false;
    }
});
</script>

<template>
    <Loader v-if="loading" />
    <div v-else>
        <div class="flex justify-content-between align-items-center">
            <h5 class="mb-2" data-testid="client-details-title">
                {{
                    variant === 'client'
                        ? 'Client Details'
                        : variant === 'businessUnit'
                          ? 'Business Unit Details'
                          : 'Holding Details'
                }}
            </h5>
            <div v-if="isEditing">
                <Button
                    label="Cancel"
                    class="p-button-outlined mr-2"
                    @click="handleCancel"
                />
                <Button
                    label="Save"
                    :loading="busy"
                    :disabled="isNotChanged"
                    @click="save"
                    v-if="isActionAllowed"
                />
            </div>
            <Button
                v-else
                size="small"
                text
                class="px-2 py-1"
                label="Edit"
                icon="pi pi-pencil"
                :disabled="isEditDisabled"
                @click="handleEdit"
                data-testid="edit-button"
            />
        </div>

        <ClientDetailsForm
            v-if="isEditing"
            :isNew="isNew"
            :variant="variant"
            v-model="itemToUpdate"
        />

        <div v-else class="grid mt-1">
            <div
                data-testid="name-label"
                class="col-3 text-sm font-semibold py-1"
            >
                Name:
            </div>
            <div class="col-9 text-sm py-1 p-break-word">
                {{ helpers.getLocaleValue(item.name) }}
            </div>
            <div
                data-testid="short-name-label"
                class="col-3 text-sm font-semibold py-1"
            >
                Short Name:
            </div>
            <div class="col-9 text-sm py-1 p-break-word">
                {{ helpers.getLocaleValue(item.short_name) }}
            </div>
            <div
                data-testid="enrollment-type-label"
                class="col-3 text-sm font-semibold py-1"
            >
                User Billing Access:
            </div>
            <div class="col-9 text-sm py-1 gap-1">
                <i
                    :class="
                        item.billing_access_status
                            ? 'pi pi-check'
                            : 'pi pi-times'
                    "
                >
                </i>
                {{ item.billing_access_status ? 'Yes' : 'No' }}
            </div>
            <div
                v-if="variant === 'client'"
                data-testid="client-sector-label"
                class="col-3 text-sm font-semibold py-1"
            >
                Client Sector:
            </div>
            <div v-if="variant === 'client'" class="col-9 text-sm py-1">
                {{ item.client_sector?.name }}
            </div>
            <div
                data-testid="business-phone-label"
                class="col-3 text-sm font-semibold py-1"
            >
                Business Phone:
            </div>
            <div class="col-9 text-sm py-1">{{ item.phone_number }}</div>
            <div
                data-testid="business-website-label"
                class="col-3 text-sm font-semibold py-1"
            >
                Business Website:
            </div>
            <div class="col-9 text-sm py-1">{{ item.website_url }}</div>
            <div
                v-if="variant === 'businessUnit'"
                class="col-3 text-sm font-semibold py-1"
            >
                Account Manager:
            </div>
            <div v-if="variant === 'businessUnit'" class="col-9 text-sm py-1">
                {{ item.account_manager_user?.name }}
            </div>
            <div
                v-if="variant !== 'holding'"
                class="col-3 text-sm font-semibold py-1"
                data-testid="preferred-language-label"
            >
                Preferred Language:
            </div>
            <div v-if="variant === 'client'" class="col-9 text-sm py-1">
                {{ item.preferred_language?.name }}
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
