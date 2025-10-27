<script setup>
import { ref, onMounted, computed } from 'vue';
import { useClientStore } from '@/modules/clients/stores';
import { useHelpers } from '@/composables';
import lodash from 'lodash';

const props = defineProps({
    modelValue: {
        type: Array
    },
    associated: {
        type: Array
    },
    holding_id: {
        type: String,
        required: true
    }
});

const clientStore = useClientStore();
const helpers = useHelpers();
const emit = defineEmits(['update:modelValue', 'add', 'remove']);

const loading = ref(false);
const clients = ref([]);
const formData = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emit('update:modelValue', value);
    }
});

onMounted(() => {
    getClients();
});

const getClients = async (search) => {
    try {
        loading.value = true;
        const res = await clientStore.searchClients({
            search: {
                value: search
            },
            filters: [
                {
                    nested: [
                        {
                            field: 'holding.id',
                            operator: '!=',
                            value: props.holding_id
                        },
                        {
                            type: 'or',
                            field: 'holding_id',
                            operator: '=',
                            value: null
                        }
                    ]
                },
                {
                    type: 'and',
                    field: 'status',
                    operator: '=',
                    value: 'active'
                }
            ],
            includes: [
                { relation: 'country' },
                {
                    relation: 'holding'
                }
            ]
        });
        clients.value = res.data;
    } finally {
        loading.value = false;
    }
};

const getAddress = (client) => {
    const arr = [];
    if (client.address) {
        arr.push(client.address);
    }

    if (client.city) {
        arr.push(client.city);
    }

    if (client.postal_code) {
        arr.push(client.postal_code);
    }

    return arr.toString();
};

defineExpose({
    getClients
});
</script>

<template>
    <div class="flex align-items-center mb-2">
        <ApiMultiselect
            id="clients"
            localed
            option-label="name"
            :loading="loading"
            v-model="formData"
            :items="clients"
            @search="getClients"
        >
            <template #option="slotProps">
                <div class="flex flex-column gap-1 align-options-center">
                    <div
                        class="font-semibold"
                        v-tooltip.top="
                            helpers.getLocaleValue(slotProps.option.name)
                        "
                    >
                        {{
                            lodash.truncate(
                                helpers.getLocaleValue(slotProps.option.name),
                                { length: 60 }
                            )
                        }}
                    </div>
                    <div class="text-sm text-gray-600">
                        <template
                            v-if="
                                slotProps.option.address ||
                                slotProps.option.city ||
                                slotProps.option.postal_code
                            "
                        >
                            {{ getAddress(slotProps.option) }}
                        </template>
                        <template v-else> No address provided </template>
                    </div>
                    <div v-if="slotProps.option.holding">
                        <Tag
                            :value="
                                lodash.truncate(
                                    helpers.getLocaleValue(
                                        slotProps.option.holding.name
                                    ),
                                    { length: 60 }
                                )
                            "
                            icon="pi pi-link"
                            severity="secondary"
                            class="bg-gray-200 text-gray-900"
                        />
                    </div>
                </div>
            </template>
        </ApiMultiselect>
        <Button
            :loading="loading"
            :disabled="formData.length === 0"
            icon="pi pi-plus"
            style="width: 35px; height: 35px"
            class="p-button-rounded p-button-outlined ml-3"
            @click="emit('add')"
            data-testid="plus-button"
        />
    </div>
    <div class="mt-4 ml-1">
        <div v-for="(client, index) in associated" :key="client.id">
            <div class="flex justify-content-between">
                <div>
                    <div
                        class="mb-1 font-semibold"
                        v-tooltip.top="helpers.getLocaleValue(client.name)"
                    >
                        {{
                            lodash.truncate(
                                helpers.getLocaleValue(client.name),
                                { length: 60 }
                            )
                        }}
                    </div>
                    <div class="text-sm text-gray-600">
                        <template
                            v-if="
                                client.address ||
                                client.city ||
                                client.postal_code
                            "
                            v-tooltip.top="getAddress(client)"
                        >
                            {{
                                lodash.truncate(getAddress(client), {
                                    length: 65
                                })
                            }}
                        </template>
                        <template v-else> No address provided </template>
                    </div>
                </div>
                <Button
                    :loading="loading"
                    icon="pi pi-times"
                    class="p-button-rounded p-button-outlined ml-3"
                    @click="emit('remove', client)"
                />
            </div>

            <hr v-if="index !== associated.length - 1" />
        </div>
    </div>
</template>

<style lang="scss">
.p-multiselect-label-container {
    width: 500px !important;
}
</style>
