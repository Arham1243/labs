<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue']);

const unitTerm = ref(null);
const unitTerms = [
    { name: 'Daily', code: 'daily' },
    { name: 'Weekly', code: 'weekly' },
    { name: 'Monthly', code: 'monthly' }
];

const isVisible = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emit('update:modelValue', value);
    }
});

const save = () => {
    isVisible.value = false;
};
</script>

<template>
    <Drawer
        v-model:visible="isVisible"
        position="right"
        class="w-full md:w-80 lg:w-[30rem]"
    >
        <h4>New Benefit Pricing</h4>
        <div class="mt-12 grid grid-cols-12">
            <div class="field col-span-12">
                <label for="category">Unit Term</label>
                <Select
                    v-model="unitTerm"
                    :options="unitTerms"
                    optionLabel="name"
                    placeholder="Select"
                />
            </div>
            <div class="field col-span-12">
                <label for="category">Region</label>
                <InputText id="category" type="text" class="w-full" />
            </div>
            <div class="field col-span-12">
                <label for="category">Country</label>
                <InputText id="category" type="text" class="w-full" />
            </div>
            <div class="field col-span-12">
                <label for="name">Net Price</label>
                <div class="p-inputgroup">
                    <span class="p-inputgroup-addon">
                        <i class="pi pi-dollar"></i>
                    </span>
                    <InputText id="name" type="text" class="w-full" />
                    <span class="p-inputgroup-addon">CAD</span>
                </div>
            </div>
            <div class="field col-span-12">
                <label for="name">Sale Price</label>
                <div class="p-inputgroup">
                    <span class="p-inputgroup-addon">
                        <i class="pi pi-dollar"></i>
                    </span>
                    <InputText id="name" type="text" class="w-full" />
                    <span class="p-inputgroup-addon">CAD</span>
                </div>
            </div>
            <div class="field col-span-12">
                <label for="category">Min Period</label>
                <div class="p-inputgroup">
                    <InputText id="name" type="text" class="w-full" />
                    <span class="p-inputgroup-addon">Days</span>
                </div>
            </div>
            <div class="field col-span-12">
                <label for="category">Max Period</label>
                <div class="p-inputgroup">
                    <InputText id="name" type="text" class="w-full" />
                    <span class="p-inputgroup-addon">Days</span>
                </div>
            </div>
            <div class="field col-span-12">
                <label for="category">Effective Date</label>
                <span class="p-input-icon-left">
                    <i class="pi pi-calendar" />
                    <DatePicker  :showButtonBar="true" />
                </span>
            </div>
            <div class="field col-span-12">
                <label for="category">End Date</label>
                <span class="p-input-icon-left">
                    <i class="pi pi-calendar" />
                    <DatePicker  :showButtonBar="true" />
                </span>
            </div>
        </div>
        <div class="w-full text-right mt-12">
            <Button
                label="Cancel"
                class="p-button-outlined mr-12"
                @click="isVisible = false"
            />
            <Button label="Save" icon="pi pi-check" @click="save" />
        </div>
    </Drawer>
</template>

<style lang="scss" scoped></style>
