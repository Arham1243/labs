<script setup>
import { ref } from 'vue';

const products = ref([
    {
        price: '$140.00',
        image: '/demo/images/ecommerce/product-list/product-list-4-1.png'
    },
    {
        price: '$82.00',
        image: '/demo/images/ecommerce/product-list/product-list-4-2.png'
    },
    {
        price: '$54.00',
        image: '/demo/images/ecommerce/product-list/product-list-4-3.png'
    },
    {
        price: '$72.00',
        image: '/demo/images/ecommerce/product-list/product-list-4-4.png'
    },
    {
        price: '$99.00',
        image: '/demo/images/ecommerce/product-list/product-list-4-5.png'
    },
    {
        price: '$89.00',
        image: '/demo/images/ecommerce/product-list/product-list-4-6.png'
    }
]);

const products2 = ref([
    {
        color: 'Bluegray',
        image: '/demo/images/ecommerce/product-list/product-list-2-1.png'
    },
    {
        color: 'Indigo',
        image: '/demo/images/ecommerce/product-list/product-list-2-2.png'
    },
    {
        color: 'Purple',
        image: '/demo/images/ecommerce/product-list/product-list-2-3.png'
    },
    {
        color: 'Cyan',
        image: '/demo/images/ecommerce/product-list/product-list-2-4.png'
    }
]);
</script>

<template>
    <div class="bg-surface-0 dark:bg-surface-950 px-12 py-20 md:px-12 lg:px-20 border border-surface rounded-border">
        <div class="text-surface-900 dark:text-surface-0 font-medium text-4xl mb-12">Popular Products</div>
        <p class="mt-0 p-0 mb-20 text-surface-700 dark:text-surface-100 text-2xl">Exclusive Selection</p>
        <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 -mt-12 -ml-12 -mr-12">
            <div v-for="(product, i) in products" :key="i" class="col-span-12 md:col-span-6 lg:col-span-4">
                <div class="p-2">
                    <div class="shadow p-12 bg-surface-0 dark:bg-surface-900 rounded-border">
                        <div class="relative mb-12">
                            <span class="bg-surface-0 dark:bg-surface-900 text-surface-900 dark:text-surface-0 shadow px-12 py-2 absolute" :style="{ borderRadius: '1.5rem', left: '1rem', top: '1rem' }"> Category </span>
                            <img :src="product.image" class="w-full" :alt="i" />
                        </div>
                        <div class="flex justify-between items-center mb-12">
                            <span class="text-surface-900 dark:text-surface-0 font-medium text-xl">Product Name</span>
                            <span>
                                <i class="pi pi-star-fill text-yellow-500 mr-1"></i>
                                <span class="font-medium">5.0</span>
                            </span>
                        </div>
                        <p class="mt-0 mb-12 text-surface-700 dark:text-surface-100 leading-normal">Enim nec dui nunc mattis enim ut tellus. Tincidunt arcu.</p>
                        <span class="text-primary text-xl font-medium">{{ product.price }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="bg-surface-0 dark:bg-surface-950 px-12 py-20 md:px-12 lg:px-20 mt-12 border border-surface rounded-border">
        <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 -mt-12 -ml-12 -mr-12">
            <div v-for="(product, i) in products2" :key="i" class="col-span-12 md:col-span-6 lg:col-span-3 mb-20 lg:mb-0">
                <div class="mb-12 relative">
                    <img :src="product.image" class="w-full" alt="{i}" />
                    <Button
                        type="button"
                        class="border border-white rounded-border py-2 px-12 absolute bg-black/30 text-white inline-flex items-center justify-center hover:bg-black/40 transition-colors duration-300 cursor-pointer"
                        :style="{ bottom: '1rem', left: '1rem', width: 'calc(100% - 2rem)' }"
                    >
                        <i class="pi pi-shopping-cart mr-12 text-base"></i>
                        <span class="text-base">Add to Cart</span>
                    </Button>
                </div>
                <div class="flex flex-col items-center">
                    <span class="text-xl text-surface-900 dark:text-surface-0 font-medium mb-12">Product Name</span>
                    <span class="text-xl text-surface-900 dark:text-surface-0 mb-12">$150.00</span>
                    <div class="flex items-center mb-12">
                        <div
                            class="w-8/12 h-8 shrink-0 rounded-full bg-slate-500 mr-12 cursor-pointer border-2 border-surface transition-all duration-300"
                            :style="{ 'box-shadow': product.color === 'Bluegray' ? '0 0 0 0.2rem var(--bluegray-500)' : null }"
                            @click="product.color = 'Bluegray'"
                        ></div>
                        <div
                            class="w-8/12 h-8 shrink-0 rounded-full bg-indigo-500 hover:border-indigo-500 mr-12 cursor-pointer border-2 border-surface transition-all duration-300"
                            :style="{ 'box-shadow': product.color === 'Indigo' ? '0 0 0 0.2rem var(--indigo-500)' : null }"
                            @click="product.color = 'Indigo'"
                        ></div>
                        <div
                            class="w-8/12 h-8 shrink-0 rounded-full bg-purple-500 hover:border-purple-500 mr-12 cursor-pointer border-2 border-surface transition-all duration-300"
                            :style="{ 'box-shadow': product.color === 'Purple' ? '0 0 0 0.2rem var(--purple-500)' : null }"
                            @click="product.color = 'Purple'"
                        ></div>
                        <div
                            class="w-8/12 h-8 shrink-0 rounded-full bg-cyan-500 hover:border-cyan-500 cursor-pointer border-2 border-surface transition-all duration-300"
                            :style="{ 'box-shadow': product.color === 'Cyan' ? '0 0 0 0.2rem var(--cyan-500)' : null }"
                            @click="product.color = 'Cyan'"
                        ></div>
                    </div>
                    <span class="text-surface-700 dark:text-surface-100">{{ product.color }}</span>
                </div>
            </div>
        </div>
    </div>
</template>
