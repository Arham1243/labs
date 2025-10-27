<script setup>
import { onMounted, ref, watch } from 'vue';
import { useGlobalStore, useUserStore } from '@/stores';
import { useI18n } from 'vue-i18n';

import ViewPricingDialogComponent from '@/modules/plans/components/plans/associated/dialogs/ViewPricingDialog.vue';

const props = defineProps({
    modelValue: {
        type: Object
    },
    isNew: {
        type: Boolean,
        default: false
    },
    id: {
        type: String,
        required: true
    }
});

const emit = defineEmits(['update:modelValue']);

const userStore = useUserStore();
const { t } = useI18n();

const loadingUsers = ref(false);
const viewPricingDialog = ref(false);
const users = ref([]);
const selectedItem = ref(null);
const formData = ref(props.modelValue);
const conditions = [
    { name: t('plans.more_than'), code: 'more_than' },
    { name: t('plans.less_than'), code: 'less_than' },
    { name: t('plans.equal_to'), code: 'equal_to' }
];

onMounted(() => {
    getUsers();
});

watch(formData, (value) => {
    emit('update:modelValue', value);
});

const getUsers = async (search) => {
    try {
        loadingUsers.value = true;
        const res = await userStore.searchUsers(
            {
                search: {
                    value: search
                }
            },
            { limit: 100 }
        );
        users.value = res.data;
    } finally {
        loadingUsers.value = false;
    }
};

const removePricingDiscount = (item) => {
    formData.value.pricing_discounts.splice(
        formData.value.pricing_discounts.indexOf(item),
        1
    );
};

const addPricingDiscount = () => {
    formData.value.pricing_discounts.push({
        percentage: 0,
        condition: { name: t('plans.more_than'), code: 'more_than' },
        num_of_dependants: 1
    });
};

const setViewPricingDialog = (item) => {
    selectedItem.value = item;
    viewPricingDialog.value = true;
};

const globalStore = useGlobalStore();

const handleApplyPricingSwitch = () => {
    if (formData.value.apply_pricing_discount) {
        formData.value.pricing_discounts = [
            {
                percentage: 0,
                condition: { name: t('plans.more_than'), code: 'more_than' },
                num_of_dependants: 1
            }
        ];
    } else {
        formData.value.pricing_discounts = [];
    }
};
</script>
<template>
    <div class="p-fluid formgrid grid mt-4">
        <div class="field col-12">
            <label for="maximum_dependant"
                >{{ $t('plans.maximum_dependant') }}
                <i
                    v-tooltip="`lorem ipsum lorem ipsum lorem ipsum`"
                    class="pi pi-info-circle"
                ></i
            ></label>
            <InputNumber
                id="max_num_of_dependants"
                v-model="formData.max_num_of_dependants"
                showButtons
                buttonLayout="horizontal"
                style="width: 10rem"
                class="ml-5 text-center"
                :min="0"
                :max="99"
                data-testid="max_num_of_dependants"
            >
                <template #incrementbuttonicon>
                    <span class="pi pi-plus" />
                </template>
                <template #decrementbuttonicon>
                    <span class="pi pi-minus" />
                </template>
            </InputNumber>
            <small
                class="p-error block mb-2"
                id="text-error"
                v-if="
                    globalStore?.errors &&
                    globalStore?.errors['max_num_of_dependants']
                "
                data-testid="validation-error"
            >
                {{ globalStore?.errors['max_num_of_dependants'][0] }}
            </small>
        </div>
        <div class="field col-12">
            <div class="flex mt-3">
                <InputSwitch
                    v-model="formData.apply_pricing_discount"
                    :falseValue="0"
                    :trueValue="1"
                    @change="handleApplyPricingSwitch"
                    data-testid="apply_pricing_discount"
                />
                <span class="ml-2 mt-1">{{
                    $t('plans.apply_pricing_discount')
                }}</span>
            </div>
        </div>
        <div class="field col-12 mt-3" v-if="formData.apply_pricing_discount">
            <div
                class="ml-6 flex align-items-end"
                v-for="(item, i) in formData.pricing_discounts"
                :key="i"
            >
                <div class="flex align-items-start gap-2">
                    <div class="field">
                        <InputField
                            :id="`pricing_discounts.${i}.percentage`"
                            v-model="item.percentage"
                            :min="0"
                            :max="100"
                            variant="number"
                            icon-after="pi pi-percentage"
                        />
                    </div>
                    <div class="field mx-2">
                        <div class="mt-2">
                            {{ $t('plans.discount_for_of_dependant') }}
                        </div>
                    </div>
                    <div class="field">
                        <InputField
                            :id="`pricing_discounts.${i}.condition`"
                            variant="dropdown"
                            v-model="item.condition"
                            :options="conditions"
                            optionLabel="name"
                            style="width: 20vw"
                        />
                    </div>
                    <div class="field mr-2">
                        <InputField
                            :id="`pricing_discounts.${i}.num_of_dependants`"
                            v-model="item.num_of_dependants"
                            style="width: 80px"
                            :min="1"
                            :max="formData.max_num_of_dependants"
                            variant="number"
                        />
                    </div>
                    <div class="field">
                        <Button
                            label="View Pricing"
                            @click="setViewPricingDialog(item)"
                            class="p-button-outlined"
                            data-testid="view-pricing-button"
                        />
                    </div>
                    <div class="field">
                        <Button
                            outlined
                            :disabled="formData.pricing_discounts.length == 1"
                            icon="pi pi-trash"
                            class="p-button-rounded p-button-danger p-button-outlined"
                            @click="removePricingDiscount(item)"
                            data-testid="remove-discount-button"
                        />
                    </div>
                </div>
            </div>

            <div class="flex justify-content-end">
                <div>
                    <Button
                        @click="addPricingDiscount"
                        text
                        icon="pi pi-plus"
                        class="mx-10"
                        :label="$t('plans.new_price_condition')"
                        data-testid="add-discount-button"
                    />
                </div>
            </div>
        </div>
        <div
            class="w-full mx-4 my-5"
            style="border-bottom: solid 2px #dfe2e8; padding-bottom: 1px"
        ></div>
        <div class="field col-12">
            <div class="flex mt-3">
                <InputSwitch
                    v-model="formData.enforce_start_date"
                    :falseValue="0"
                    :trueValue="1"
                    data-testid="enforce_start_date"
                />
                <span class="ml-2 mt-1">{{
                    $t('plans.enforce_main_applicant_start_date')
                }}</span>
            </div>
        </div>
        <div class="field col-12">
            <div class="flex mt-3">
                <InputSwitch
                    v-model="formData.enforce_end_date"
                    :falseValue="0"
                    :trueValue="1"
                    data-testid="enforce_end_date"
                />
                <span class="ml-2 mt-1">{{
                    $t('plans.enforce_main_applicant_end_date')
                }}</span>
            </div>
        </div>
    </div>
    <ViewPricingDialogComponent
        v-if="viewPricingDialog"
        v-model="viewPricingDialog"
        :item="selectedItem"
        :id="id"
    />
</template>
<style>
.p-button-label {
    font-weight: 1000;
}
.p-inputnumber-buttons-horizontal .p-inputnumber-input {
    text-align: center;
}
</style>
