<script setup>
import { ref } from 'vue';

const products = ref([
    {
        name: 'Cotton Sweatshirt',
        size: 'Medium',
        color: 'White',
        price: '$12',
        quantity: '1',
        image: 'demo/images/ecommerce/ordersummary/order-summary-1-1.png'
    },
    {
        name: 'Regular Jeans',
        size: 'Large',
        color: 'Black',
        price: '$24',
        quantity: '1',
        image: 'demo/images/ecommerce/ordersummary/order-summary-1-2.png'
    }
]);
</script>

<template>
    <div class="card">
        <span class="text-surface-700 dark:text-surface-100 text-xl">Thanks!</span>
        <div class="text-surface-900 dark:text-surface-0 font-bold text-4xl my-2">Successful Order 🚀</div>
        <p class="text-surface-700 dark:text-surface-100 text-xl mt-0 mb-12 p-0">Your order is on the way. It&lsquo;ll be shipped today. We&lsquo;ll inform you.</p>
        <div :style="{ height: '3px', background: 'linear-gradient(90deg, var(--primary-color) 0%, rgba(33, 150, 243, 0) 50%)' }"></div>

        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between py-20">
            <div class="mb-12 sm:mb-0">
                <span class="font-medium text-xl text-surface-900 dark:text-surface-0 mr-2">Order number:</span>
                <span class="font-medium text-xl text-blue-500">451234</span>
            </div>
            <div>
                <Button label="Details" icon="pi pi-list" class="p-button-outlined p-button-primary mr-2"></Button>
                <Button label="Print" icon="pi pi-print" class="p-button-outlined p-button-primary"></Button>
            </div>
        </div>
        <div class="rounded-border border-surface border">
            <ul class="list-none p-0 m-0">
                <li v-for="(product, i) in products" :key="i" class="p-12 border-surface flex items-start sm:items-center" :class="{ 'border-bottom-1': i !== products.length - 1 }">
                    <img :src="product.image" class="w-full sm:w-32 shrink-0 mr-12 shadow" :alt="product.name" />
                    <div class="flex flex-col">
                        <span class="text-surface-900 dark:text-surface-0 font-semibold text-xl mb-2">{{ product.name }}</span>
                        <span class="text-surface-700 dark:text-surface-100 font-medium mb-12"> {{ product.color }} | {{ product.size }} </span>
                        <span class="text-surface-900 dark:text-surface-0 font-medium">Quantity: {{ product.quantity }}</span>
                    </div>
                    <span class="text-surface-900 dark:text-surface-0 font-medium text-lg ml-auto">{{ product.price }}</span>
                </li>
            </ul>
        </div>
        <div class="flex flex-wrap mt-20 pb-12">
            <div class="w-full lg:w-6/12 pl-12">
                <span class="font-medium text-surface-900 dark:text-surface-0">Shipping Address</span>
                <div class="flex flex-col text-surface-900 dark:text-surface-0 mt-12 mb-20">
                    <span class="mb-1">Celeste Slater</span>
                    <span class="mb-1">606-3727 Ullamcorper. Roseville NH 11523</span>
                    <span>(786) 713-8616</span>
                </div>

                <span class="font-medium text-surface-900 dark:text-surface-0">Payment</span>
                <div class="flex items-center mt-12">
                    <img src="/demo/images/ecommerce/ordersummary/visa.png" class="w-16 mr-12" alt="visa" />
                    <div class="flex flex-col">
                        <span class="text-surface-900 dark:text-surface-0 mb-1">Visa Debit Card</span>
                        <span class="text-surface-900 dark:text-surface-0 font-medium">**** **** **** 1234</span>
                    </div>
                </div>
            </div>
            <div class="w-full lg:w-6/12 pl-12 lg:pl-0 lg:pr-12 flex items-end mt-20 lg:mt-0">
                <ul class="list-none p-0 m-0 w-full">
                    <li class="mb-12">
                        <span class="font-medium text-surface-900 dark:text-surface-0">Summary</span>
                    </li>
                    <li class="flex justify-between mb-12">
                        <span class="text-surface-900 dark:text-surface-0">Subtotal</span>
                        <span class="text-surface-900 dark:text-surface-0 font-medium text-lg">$36.00</span>
                    </li>
                    <li class="flex justify-between mb-12">
                        <span class="text-surface-900 dark:text-surface-0">Shipping</span>
                        <span class="text-surface-900 dark:text-surface-0 font-medium text-lg">$5.00</span>
                    </li>
                    <li class="flex justify-between mb-12">
                        <span class="text-surface-900 dark:text-surface-0">Tax</span>
                        <span class="text-surface-900 dark:text-surface-0 font-medium text-lg">$4.00</span>
                    </li>
                    <li class="flex justify-between border-t border-surface py-12">
                        <span class="text-surface-900 dark:text-surface-0 font-medium">Total</span>
                        <span class="text-surface-900 dark:text-surface-0 font-bold text-lg">$41.00</span>
                    </li>
                </ul>
            </div>
        </div>
    </div>

    <div class="card">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <span class="text-2xl font-medium text-surface-900 dark:text-surface-0">Thanks for your order!</span>
            <div class="flex mt-12 sm:mt-0">
                <div class="flex flex-col items-center">
                    <span class="text-surface-900 dark:text-surface-0 font-medium mb-2">Order ID</span>
                    <span class="text-surface-700 dark:text-surface-100">451234</span>
                </div>
                <div class="flex flex-col items-center ml-12 md:ml-20">
                    <span class="text-surface-900 dark:text-surface-0 font-medium mb-2">Order Date</span>
                    <span class="text-surface-700 dark:text-surface-100">7 Feb 2023</span>
                </div>
            </div>
        </div>
        <div class="flex flex-col md:flex-row md:items-center border-b border-surface py-20">
            <img src="/demo/images/ecommerce/ordersummary/order-summary-2-1.png" class="w-60 shrink-0 md:mr-12" alt="summary-1-2" />
            <div class="flex-auto mt-12 md:mt-0">
                <span class="text-xl text-surface-900 dark:text-surface-0">Product Name</span>
                <div class="font-medium text-2xl text-surface-900 dark:text-surface-0 mt-12 mb-20">Order Processing</div>
                <div class="rounded-border overflow-hidden bg-surface-300 dark:bg-surface-500 mb-12" :style="{ height: '7px' }">
                    <div class="bg-primary text-primary-contrast text-primary-contrast text-primary-contrast rounded-border w-4/12 h-full"></div>
                </div>
                <div class="flex w-full justify-between">
                    <span class="text-surface-900 dark:text-surface-0 text-xs sm:text-base">Ordered</span>
                    <span class="text-surface-900 dark:text-surface-0 font-medium text-xs sm:text-base">Processing</span>
                    <span class="text-surface-500 dark:text-surface-300 text-xs sm:text-base">Shipping</span>
                    <span class="text-surface-500 dark:text-surface-300 text-xs sm:text-base">Delivered</span>
                </div>
            </div>
        </div>
        <div class="py-20 flex justify-between flex-wrap">
            <div class="flex sm:mr-20 mb-20">
                <span class="font-medium text-surface-900 dark:text-surface-0 text-xl mr-20">Product Name</span>
                <span class="text-surface-900 dark:text-surface-0 text-xl">$21.00</span>
            </div>
            <div class="flex flex-col sm:mr-20 mb-20">
                <span class="font-medium text-surface-900 dark:text-surface-0 text-xl">Shipping Address</span>
                <div class="flex flex-col text-surface-900 dark:text-surface-0 mt-12">
                    <span class="mb-1">Celeste Slater</span>
                    <span class="mb-1">606-3727 Ullamcorper. Roseville NH 11523</span>
                    <span>(786) 713-8616</span>
                </div>
            </div>
            <div class="flex flex-col">
                <span class="font-medium text-surface-900 dark:text-surface-0 text-xl">Payment</span>
                <div class="flex items-center mt-12">
                    <img src="/demo/images/ecommerce/ordersummary/visa.png" class="w-16 mr-12" alt="visa-2" />
                    <div class="flex flex-col">
                        <span class="text-surface-900 dark:text-surface-0 mb-1">Visa Debit Card</span>
                        <span class="text-surface-900 dark:text-surface-0 font-medium">**** **** **** 1234</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
