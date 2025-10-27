<script setup>
import { ref, computed, watch } from 'vue';
import { useNonInsuranceProductStore } from '@/modules/plans/stores/NonInsuranceProduct';
import helpers from '@/utils/helpers';
import { useRouter } from 'vue-router';
import { useGlobalStore } from '@/stores';
import { useClientStore } from '@/modules/clients/stores';
import useEventsBus from '@/composables/event-bus';
import { useSearchNonInsuranceProduct } from '@/modules/plans/composables/non-insurance-product/searchNonInsuranceProduct';

const router = useRouter();

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    }
});

const emits = defineEmits(['update:modelValue']);
const { emit } = useEventsBus();

const nonInsuranceProductStore = useNonInsuranceProductStore();
const clientStore = useClientStore();

const busy = ref(false);

const dialog = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emits('update:modelValue', value);
    }
});

const selectedNonInsuranceProduct = ref([]);
const loading = ref(false);

watch(dialog, () => {
    getNonInsuranceProducts();
});

const {
    loadingNonInsuranceProducts,
    nonInsuranceProducts: initialNonInsuranceProducts,
    getNonInsuranceProducts
} = useSearchNonInsuranceProduct();

const nonInsuranceProducts = computed(() => {
    const item = clientStore.currentBusinessUnit;

    return initialNonInsuranceProducts.value?.filter(
        (resDataItem) =>
            !item.non_insurance_products
                ?.map((nonInsuranceProduct) => nonInsuranceProduct.id)
                ?.includes(resDataItem.id)
    );
});

const addNonInsuranceProduct = async () => {
    try {
        const item = clientStore.currentBusinessUnit;

        loading.value = true;

        await clientStore.attachNonInsuranceProductToBusinessUnit(item.id, {
            non_insurance_products: selectedNonInsuranceProduct.value.map(
                (m) => m.id
            )
        });

        emit('reloadBusinessUnit');
    } finally {
        loading.value = false;
    }
};

const pushRoute = (name) => {
    useGlobalStore().clearErrors();
    router.push({
        name,
        params: { id: -1 },
        query: { businessUnitId: clientStore.currentBusinessUnit.id }
    });
};
</script>

<template>
    <Dialog
        v-model:visible="dialog"
        modal
        :header="$t('non_insurance_products.add_non_insurance_product')"
        :style="{ width: '600px' }"
    >
        <div class="p-fluid grid">
            <div class="field col-12">
                <ApiMultiselect
                    id="non_insurance_products"
                    localed
                    option-label="name"
                    v-model="selectedNonInsuranceProduct"
                    @search="getNonInsuranceProducts"
                    :loading="loadingNonInsuranceProducts"
                    :items="nonInsuranceProducts"
                >
                    <template #option="slotProps">
                        <div>
                            {{ helpers.getLocaleValue(slotProps.option.name) }}
                        </div>
                    </template>
                </ApiMultiselect>
            </div>
        </div>
        <template #footer>
            <Button
                :disabled="busy"
                text
                :label="
                    $t(
                        'non_insurance_products.create_new_non_insurance_product'
                    )
                "
                icon="pi pi-plus"
                class="mr-auto"
                @click="pushRoute('New Non-Insurance Product')"
            />
            <Button
                :disabled="busy"
                text
                :label="$t('buttons.cancel')"
                @click="dialog = false"
            />
            <Button
                :loading="busy"
                :disabled="busy || selectedNonInsuranceProduct.length === 0"
                @click="addNonInsuranceProduct"
                :label="$t('buttons.confirm')"
            />
        </template>
    </Dialog>
</template>

<style>
.p-dialog-footer {
    display: flex;
}
</style>
