<script setup>
import { ref, onMounted } from 'vue';
import { CountryService } from '@/services/Country.service';

const value = ref('');
const quantities = ref([1, 1, 1]);
const checked = ref(true);
const checked2 = ref(true);
const selectedCountry = ref('');
const countries = ref([]);
const countryService = new CountryService();

onMounted(() => {
    countryService.getCountries().then((data) => (countries.value = data));
});
</script>

<template>
    <div class="card">
        <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 grid-nogutter">
            <div class="col-span-12 px-12 mt-12 md:mt-12 md:px-12">
                <span class="text-surface-900 dark:text-surface-0 block font-bold text-xl">Checkout</span>
            </div>
            <div class="col-span-12 lg:col-span-6 h-full px-12 py-12 md:px-12">
                <ul class="flex list-none flex-wrap p-0 mb-12">
                    <li class="flex items-center text-primary mr-2">
                        Cart
                        <i
                            class="pi pi-chevron-right text-surface-500 dark:text-surface-300 text-xs ml-2"
                        ></i>
                    </li>
                    <li class="flex items-center text-surface-500 dark:text-surface-300 mr-2">
                        Information<i
                            class="pi pi-chevron-right text-surface-500 dark:text-surface-300 text-xs ml-2"
                        ></i>
                    </li>
                    <li class="flex items-center text-surface-500 dark:text-surface-300 mr-2">
                        Shipping<i
                            class="pi pi-chevron-right text-surface-500 dark:text-surface-300 text-xs ml-2"
                        ></i>
                    </li>
                    <li class="flex items-center text-surface-500 dark:text-surface-300 mr-2">
                        Payment
                    </li>
                </ul>
                <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 formgrid">
                    <div class="col-span-12 field mb-12">
                        <span class="text-surface-900 dark:text-surface-0 text-2xl block font-medium mb-20"
                            >Contact Information</span
                        >
                        <input
                            id="email"
                            placeholder="Email"
                            type="text"
                            class="p-inputtext w-full mb-12"
                        />
                        <div class="field-checkbox">
                            <Checkbox
                                name="checkbox-1"
                                v-model="checked"
                                binary
                                inputId="checkbox-1"
                            ></Checkbox>
                            <label htmlFor="checkbox-1"
                                >Email me with news and offers</label
                            >
                        </div>
                    </div>
                    <div class="col-span-12 field mb-12">
                        <span class="text-surface-900 dark:text-surface-0 text-2xl block font-medium mb-20"
                            >Shipping</span
                        >
                        <Select
                            :options="countries"
                            v-model="selectedCountry"
                            placeholder="Country / Region"
                            optionLabel="name"
                            showClear
                            class="w-full"
                        ></Select>
                    </div>
                    <div class="col-span-12 lg:col-span-6 field mb-12">
                        <input
                            id="name"
                            placeholder="Name"
                            type="text"
                            class="p-inputtext w-full"
                        />
                    </div>
                    <div class="col-span-12 lg:col-span-6 field mb-12">
                        <input
                            id="lastname"
                            placeholder="Last Name"
                            type="text"
                            class="p-inputtext w-full"
                        />
                    </div>
                    <div class="col-span-12 field mb-12">
                        <input
                            id="address"
                            placeholder="Address"
                            type="text"
                            class="p-inputtext w-full"
                        />
                    </div>
                    <div class="col-span-12 field mb-12">
                        <input
                            id="address2"
                            placeholder="Apartment, suite, etc"
                            type="text"
                            class="p-inputtext w-full"
                        />
                    </div>
                    <div class="col-span-12 lg:col-span-6 field mb-12">
                        <input
                            id="pc"
                            placeholder="Postal/Zip Code"
                            type="text"
                            class="p-inputtext w-full"
                        />
                    </div>
                    <div class="col-span-12 lg:col-span-6 field mb-12">
                        <input
                            id="city"
                            placeholder="City"
                            type="text"
                            class="p-inputtext w-full"
                        />
                    </div>
                    <div class="col-span-12 lg:col-span-6 field mb-12">
                        <div class="field-checkbox">
                            <Checkbox
                                name="checkbox-2"
                                v-model="checked2"
                                binary
                                inputId="checkbox-2"
                            ></Checkbox>
                            <label htmlFor="checkbox-2"
                                >Save for next purchase</label
                            >
                        </div>
                    </div>
                    <div
                        class="col-span-12 flex flex-col lg:flex-row justify-center items-center lg:justify-end my-12"
                    >
                        <Button
                            class="p-button-secondary p-button-outlined mt-12 lg:mt-0 w-full lg:w-auto order-2 lg:order-1 lg:mr-12"
                            label="Return to Cart"
                            icon="pi pi-fw pi-arrow-left"
                        ></Button>
                        <Button
                            class="p-button-primary w-full lg:w-auto order-1 lg:order-2"
                            label="Continue to Shipping"
                            icon="pi pi-fw pi-check"
                        ></Button>
                    </div>
                </div>
            </div>
            <div class="col-span-12 lg:col-span-6 px-12 py-12 md:px-12">
                <div class="pb-12 border-surface">
                    <span class="text-surface-900 dark:text-surface-0 font-medium text-xl">Your Cart</span>
                </div>
                <div
                    class="flex flex-col lg:flex-row flex-wrap lg:items-center py-2 mt-12 border-surface"
                >
                    <img
                        src="/demo/images/ecommerce/shop/shop-1.png"
                        class="w-32 h-32 shrink-0 mb-12"
                        alt="product"
                    />
                    <div class="flex-auto lg:ml-12">
                        <div
                            class="flex items-center justify-between mb-12"
                        >
                            <span class="text-surface-900 dark:text-surface-0 font-bold">Product Name</span>
                            <span class="text-surface-900 dark:text-surface-0 font-bold">$123.00</span>
                        </div>
                        <div class="text-surface-600 dark:text-surface-200 text-sm mb-12">Black | Large</div>
                        <div
                            class="flex flex-auto justify-between items-center"
                        >
                            <InputNumber
                                showButtons
                                buttonLayout="horizontal"
                                :min="0"
                                inputClass="w-8/12 text-center py-2 px-1 border-transparent outline-0 shadow-none"
                                v-model="quantities[0]"
                                class="border border-surface rounded-border"
                                decrementButtonClass="p-button-text text-surface-600 dark:text-surface-200 hover:text-primary py-1 px-1"
                                incrementButtonClass="p-button-text text-surface-600 dark:text-surface-200 hover:text-primary py-1 px-1"
                                incrementButtonIcon="pi pi-plus"
                                decrementButtonIcon="pi pi-minus"
                            ></InputNumber>
                            <Button
                                icon="pi pi-trash"
                                class="p-button-text p-button-rounded"
                            ></Button>
                        </div>
                    </div>
                </div>
                <div class="py-2 mt-12 border-surface">
                    <div class="p-inputgroup mb-12">
                        <InputText
                            type="text"
                            v-model="value"
                            placeholder="Promo code"
                            class="w-full"
                        />
                        <Button
                            type="button"
                            label="Apply"
                            :disabled="!value"
                        ></Button>
                    </div>
                </div>
                <div class="py-2 mt-12">
                    <div
                        class="flex justify-between items-center mb-12"
                    >
                        <span class="text-surface-900 dark:text-surface-0 font-medium">Subtotal</span>
                        <span class="text-surface-900 dark:text-surface-0">$123.00</span>
                    </div>
                    <div
                        class="flex justify-between items-center mb-12"
                    >
                        <span class="text-surface-900 dark:text-surface-0 font-medium">Shipping</span>
                        <span class="text-primary font-bold">Free</span>
                    </div>
                    <div
                        class="flex justify-between items-center mb-12"
                    >
                        <span class="text-surface-900 dark:text-surface-0 font-bold">Total</span>
                        <span class="text-surface-900 dark:text-surface-0 font-medium text-xl"
                            >$123.00</span
                        >
                    </div>
                </div>
                <div
                    class="py-2 mt-12 bg-yellow-100 flex items-center justify-center rounded-border"
                >
                    <img
                        src="/demo/images/ecommerce/shop/flag.png"
                        class="mr-2"
                        alt="Country Flag"
                    />
                    <span class="text-black/90 font-medium"
                        >No additional duties or taxes.</span
                    >
                </div>
            </div>
        </div>
    </div>
</template>
