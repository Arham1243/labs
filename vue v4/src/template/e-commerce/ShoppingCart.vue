<script setup>
import { ref } from 'vue';

const quantityOptions = [
    { label: '1', value: 1 },
    { label: '2', value: 2 },
    { label: '3', value: 3 },
    { label: '4', value: 4 }
];
const selectedQuantity = ref({ label: '1', value: 1 });
const selectedQuantity2 = ref({ label: '1', value: 1 });
</script>

<template>
    <div class="card">
        <div class="flex flex-col items-center mb-12">
            <div class="text-surface-900 dark:text-surface-0 text-4xl mb-12 font-medium">Your cart total is $82.00</div>
            <p class="text-surface-700 dark:text-surface-100 font-medium text-xl mt-0 mb-12">FREE SHIPPING AND RETURN</p>
            <Button label="Check Out" />
        </div>
        <ul class="list-none p-0 m-0">
            <li class="flex flex-col md:flex-row py-12 border-t border-b border-surface md:items-center">
                <img src="/demo/images/ecommerce/shopping-cart/shopping-cart-2-1.png" class="w-48 shrink-0 mx-auto md:mx-0" alt="shopping-cart-2-1" />
                <div class="flex-auto py-20 md:pl-20">
                    <div class="flex flex-wrap items-start sm:items-center sm:flex-row sm:justify-between border-surface pb-12">
                        <div class="w-full sm:w-6/12 flex flex-col">
                            <span class="text-surface-900 dark:text-surface-0 text-xl font-medium mb-12">Product Name</span>
                            <span class="text-surface-700 dark:text-surface-100">Medium</span>
                        </div>
                        <div class="w-full sm:w-6/12 flex items-start justify-between mt-12 sm:mt-0">
                            <div>
                                <Select :options="quantityOptions" v-model="selectedQuantity" optionLabel="label"></Select>
                            </div>
                            <div class="flex flex-col sm:items-end">
                                <span class="text-surface-900 dark:text-surface-0 text-xl font-medium mb-2 sm:mb-12">$20.00</span>
                                <a class="cursor-pointer text-pink-500 font-medium text-sm hover:text-pink-600 transition-colors duration-300" tabindex="0"> Remove </a>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col">
                        <span class="inline-flex items-center mb-12">
                            <i class="pi pi-envelope text-surface-700 dark:text-surface-100 mr-2"></i>
                            <span class="text-surface-700 dark:text-surface-100 mr-2">Order today.</span>
                        </span>
                        <span class="inline-flex items-center mb-12">
                            <i class="pi pi-send text-surface-700 dark:text-surface-100 mr-2"></i>
                            <span class="text-surface-700 dark:text-surface-100 mr-2"> Delivery by <span class="font-bold">Dec 23.</span> </span>
                        </span>
                        <span class="flex items-center">
                            <i class="pi pi-exclamation-triangle text-surface-700 dark:text-surface-100 mr-2"></i>
                            <span class="text-surface-700 dark:text-surface-100">Only 8 Available.</span>
                        </span>
                    </div>
                </div>
            </li>
            <li class="flex flex-col md:flex-row py-12 border-t border-b border-surface md:items-center">
                <img src="/demo/images/ecommerce/shopping-cart/shopping-cart-2-2.png" class="w-48 shrink-0 mx-auto md:mx-0" alt="shopping-cart-2-2" />
                <div class="flex-auto py-20 md:pl-20">
                    <div class="flex flex-wrap items-start sm:items-center sm:flex-row sm:justify-between border-surface pb-12">
                        <div class="w-full sm:w-6/12 flex flex-col">
                            <span class="text-surface-900 dark:text-surface-0 text-xl font-medium mb-12">Product Name</span>
                            <span class="text-surface-700 dark:text-surface-100">Medium</span>
                        </div>
                        <div class="w-full sm:w-6/12 flex items-start justify-between mt-12 sm:mt-0">
                            <div>
                                <Select :options="quantityOptions" v-model="selectedQuantity2" optionLabel="label"></Select>
                            </div>
                            <div class="flex flex-col sm:items-end">
                                <span class="text-surface-900 dark:text-surface-0 text-xl font-medium mb-2 sm:mb-12">$62.00</span>
                                <a class="cursor-pointer text-pink-500 font-medium text-sm hover:text-pink-600 transition-colors duration-300" tabindex="0"> Remove </a>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col">
                        <span class="inline-flex items-center mb-12">
                            <i class="pi pi-envelope text-surface-700 dark:text-surface-100 mr-2"></i>
                            <span class="text-surface-700 dark:text-surface-100 mr-2">Order today.</span>
                        </span>
                        <span class="inline-flex items-center mb-12">
                            <i class="pi pi-send text-surface-700 dark:text-surface-100 mr-2"></i>
                            <span class="text-surface-700 dark:text-surface-100 mr-2"> Delivery by <span class="font-bold">Dec 23.</span> </span>
                        </span>
                        <span class="flex items-center">
                            <i class="pi pi-exclamation-triangle text-surface-700 dark:text-surface-100 mr-2"></i>
                            <span class="text-surface-700 dark:text-surface-100">Only 2 Available.</span>
                        </span>
                    </div>
                </div>
            </li>
        </ul>
        <div class="flex">
            <div class="w-48 hidden md:block"></div>
            <ul class="list-none py-0 pr-0 pl-0 md:pl-20 mt-12 mx-0 mb-0 flex-auto">
                <li class="flex justify-between mb-12">
                    <span class="text-xl text-surface-900 dark:text-surface-0 font-semibold">Subtotal</span>
                    <span class="text-xl text-surface-900 dark:text-surface-0">$82.00</span>
                </li>
                <li class="flex justify-between mb-12">
                    <span class="text-xl text-surface-900 dark:text-surface-0 font-semibold">Shipping</span>
                    <span class="text-xl text-surface-900 dark:text-surface-0">Free</span>
                </li>
                <li class="flex justify-between mb-12">
                    <span class="text-xl text-surface-900 dark:text-surface-0 font-semibold">VAT</span>
                    <span class="text-xl text-surface-900 dark:text-surface-0">$8.00</span>
                </li>
                <li class="flex justify-between border-t border-surface mb-12 pt-12">
                    <span class="text-xl text-surface-900 dark:text-surface-0 font-bold text-3xl">Total</span>
                    <span class="text-xl text-surface-900 dark:text-surface-0 font-bold text-3xl">$90.00</span>
                </li>
                <li class="flex justify-end">
                    <Button label="Check Out"></Button>
                </li>
            </ul>
        </div>
    </div>
</template>
