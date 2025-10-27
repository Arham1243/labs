<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import lodash from 'lodash';
import { useClientStore } from '@/modules/clients/stores';
import AddressDetailsForm from '@/modules/clients/components/forms/AddressDetailsForm.vue';
import { useEditState } from '@/modules/clients/composables/useEditState';
import { useEmptyFields } from '@/modules/clients/composables/useEmptyFields';
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

const clientStore = useClientStore();
const emit = defineEmits(['update:data']);

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

watch(
    () => itemToUpdate.value.is_location_details_same_as_client,
    async (isSameAsClient) => {
        if (isSameAsClient) {
            if (
                props.variant === 'businessUnit' &&
                (!client.value || Object.keys(client.value).length === 0)
            ) {
                await getClientData();
            }

            if (client.value && Object.keys(client.value).length > 0) {
                if (!itemToUpdate.value.location_details) {
                    itemToUpdate.value.location_details = {};
                }

                itemToUpdate.value.location_details.country_id =
                    client.value.country_id;
                itemToUpdate.value.location_details.province_id =
                    client.value.province_id;
                itemToUpdate.value.location_details.address =
                    client.value.address;
                itemToUpdate.value.location_details.address2 =
                    client.value.address2;
                itemToUpdate.value.location_details.city = client.value.city;
                itemToUpdate.value.location_details.postal_code =
                    client.value.postal_code;

                if (client.value.country) {
                    itemToUpdate.value.location_details.country =
                        lodash.cloneDeep(client.value.country);
                }
                if (client.value.province) {
                    itemToUpdate.value.location_details.province =
                        lodash.cloneDeep(client.value.province);
                }
            } else {
                console.warn('Checkbox checked but client data not available');
            }
        }
    },
    { immediate: true }
);

onMounted(() => {
    setItem();
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

const { isNotChanged } = useEmptyFields(item, itemToUpdate);

const setItem = () => {
    if (props.data) item.value = lodash.cloneDeep(props.data);
};

const getClientData = async () => {
    if (props.variant === 'businessUnit' && itemToUpdate.value.client_id) {
        try {
            loading.value = true;
            const params = { include: 'country,province' };
            const res = await clientStore.getClient(
                itemToUpdate.value.client_id,
                params
            );
            client.value = res.data;
        } catch (error) {
            console.error('Error fetching client data:', error);
        } finally {
            loading.value = false;
        }
    }
};

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

const handleEdit = async () => {
    itemToUpdate.value = lodash.cloneDeep(item.value);
    if (props.variant === 'businessUnit') {
        await getClientData();

        if (!itemToUpdate.value.location_details) {
            itemToUpdate.value.location_details = {};
        }
    }
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
            if (itemToUpdate.value.client_sector) {
                itemToUpdate.value.client_sector_id =
                    itemToUpdate.value.client_sector.id;
            }

            if (itemToUpdate.value.preferred_language) {
                itemToUpdate.value.preferred_language_id =
                    itemToUpdate.value.preferred_language.id;
                delete itemToUpdate.value.preferred_language;
            }
        }

        if (props.variant === 'client' || props.variant === 'holding') {
            itemToUpdate.value.country_id = itemToUpdate.value.country?.id;
            itemToUpdate.value.province_id = itemToUpdate.value.province?.id;

            delete itemToUpdate.value.country;
            delete itemToUpdate.value.province;

            if (
                props.variant === 'client' &&
                itemToUpdate.value.client_sector
            ) {
                delete itemToUpdate.value.client_sector;
            }
        }

        if (props.variant === 'businessUnit') {
            itemToUpdate.value.location_details.country_id =
                itemToUpdate.value.location_details.country?.id;
            itemToUpdate.value.location_details.province_id =
                itemToUpdate.value.location_details.province?.id;
            itemToUpdate.value.account_manager_user_id =
                itemToUpdate.value.account_manager_user?.id;

            delete itemToUpdate.value.location_details.country;
            delete itemToUpdate.value.location_details.province;
            delete itemToUpdate.value.account_manager_user;

            if (itemToUpdate.value.preferred_language) {
                itemToUpdate.value.preferred_language_id =
                    itemToUpdate.value.preferred_language.id;
                delete itemToUpdate.value.preferred_language;
            }
        }

        if (
            props.variant === 'client' &&
            !itemToUpdate.value.client_sector_id
        ) {
            throw new Error('Client sector ID is required');
        }

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
                          'clientSector,country,billingDetail,contacts,defaultBusinessUnit,province'
                  }
                : props.variant === 'businessUnit'
                ? {
                      include:
                          'client,accountManager,billingDetail.country,contacts,country,province'
                  }
                : {
                      include: 'clients,country,contacts,province'
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
        <div class="flex justify-between items-center edit-cancel-button">
            <div class="flex items-center mb-4 gap-4">
                <h5 data-testid="mailing-address-title">Mailing Address</h5>
                <div
                    v-if="
                        variant === 'businessUnit' &&
                        item.is_location_details_same_as_client
                    "
                >
                    <Tag
                        class="custom-tag"
                        severity="secondary"
                        value="Secondary"
                        >SAME AS CLIENT</Tag
                    >
                </div>
            </div>
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

        <div v-if="isEditing && variant === 'businessUnit'">
            <div class="flex items-center my-12">
                <InputField
                    id="is_location_details_same_as_client"
                    variant="checkbox"
                    binary
                    v-model="itemToUpdate.is_location_details_same_as_client"
                    data-testid="same-as-client-checkbox"
                />
                <label
                    for="is_location_details_same_as_client"
                    class="ml-2 mt-1"
                    data-testid="same-as-client-label"
                    >Same as Client's Mailing Address</label
                >
            </div>
            <AddressDetailsForm
                :isNew="isNew"
                v-model="itemToUpdate.location_details"
                :disabled="itemToUpdate.is_location_details_same_as_client"
            />
        </div>

        <AddressDetailsForm
            v-if="isEditing && variant !== 'businessUnit'"
            :isNew="isNew"
            v-model="itemToUpdate"
        />

        <div v-if="!isEditing">
            <div v-if="variant !== 'businessUnit'" class="grid grid-cols-12 gap-2 mt-1">
                <div
                    data-testid="address-label"
                    class="col-span-3 text-sm font-semibold"
                >
                    Address:
                </div>
                <div class="col-span-9 text-sm p-break-all">
                    {{ item.address }}
                </div>
                <div
                    data-testid="address2-label"
                    class="col-span-3 text-sm font-semibold"
                >
                    Address 2:
                </div>
                <div class="col-span-9 text-sm p-break-all">
                    {{ item.address2 }}
                </div>
                <div
                    data-testid="country-label"
                    class="col-span-3 text-sm font-semibold"
                >
                    Country:
                </div>

                <div class="col-span-9 text-sm p-break-all">
                    {{ item.country?.name }}
                </div>
                <div
                    data-testid="province-label"
                    class="col-span-3 text-sm font-semibold"
                >
                    Province/State:
                </div>
                <div class="col-span-9 text-sm p-break-all">
                    {{ item.province?.name }}
                </div>
                <div
                    data-testid="city-label"
                    class="col-span-3 text-sm font-semibold"
                >
                    City:
                </div>
                <div class="col-span-9 text-sm p-break-all">
                    {{ item.city }}
                </div>
                <div
                    data-testid="postal-code-label"
                    class="col-span-3 text-sm font-semibold"
                >
                    Postal/Zip Code:
                </div>
                <div class="col-span-9 text-sm p-break-all">
                    {{ item.postal_code }}
                </div>
            </div>
            <div v-if="variant === 'businessUnit'" class="grid grid-cols-12 gap-4 mt-1">
                <div class="col-span-3 text-sm font-semibold">Address:</div>
                <div class="col-span-9 text-sm p-break-all">
                    {{ item.location_details?.address }}
                </div>
                <div class="col-span-3 text-sm font-semibold">Address 2:</div>
                <div class="col-span-9 text-sm p-break-all">
                    {{ item.location_details?.address2 }}
                </div>
                <div class="col-span-3 text-sm font-semibold">Country:</div>
                <div class="col-span-9 text-sm p-break-all">
                    {{ item.location_details?.country?.name }}
                </div>
                <div class="col-span-3 text-sm font-semibold">
                    Province/State:
                </div>
                <div class="col-span-9 text-sm py-1 p-break-all">
                    {{ item.location_details?.province?.name }}
                </div>
                <div class="col-span-3 text-sm font-semibold">City:</div>
                <div class="col-span-9 text-sm p-break-all">
                    {{ item.location_details?.city }}
                </div>
                <div class="col-span-3 text-sm font-semibold">
                    Postal/Zip Code:
                </div>
                <div class="col-span-9 text-sm p-break-all">
                    {{ item.location_details?.postal_code }}
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
