<script setup>
import { ProductService } from '@/services/Product.service';
import { PhotoService } from '@/services/Photo.service';
import { ref, onMounted } from 'vue';

const products = ref([]);
const images = ref([]);
const galleriaResponsiveOptions = ref([
    {
        breakpoint: '1024px',
        numVisible: 5
    },
    {
        breakpoint: '960px',
        numVisible: 4
    },
    {
        breakpoint: '768px',
        numVisible: 3
    },
    {
        breakpoint: '560px',
        numVisible: 1
    }
]);
const carouselResponsiveOptions = ref([
    {
        breakpoint: '1024px',
        numVisible: 3,
        numScroll: 3
    },
    {
        breakpoint: '768px',
        numVisible: 2,
        numScroll: 2
    },
    {
        breakpoint: '560px',
        numVisible: 1,
        numScroll: 1
    }
]);

const productService = new ProductService();
const photoService = new PhotoService();

onMounted(() => {
    productService.getProductsSmall().then((data) => (products.value = data));
    photoService.getImages().then((data) => (images.value = data));
});
</script>

<template>
    <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 p-fluid">
        <div class="col-span-12">
            <div class="card">
                <h5>Carousel</h5>
                <Carousel
                    :value="products"
                    :numVisible="3"
                    :numScroll="3"
                    :circular="false"
                    :responsiveOptions="carouselResponsiveOptions"
                >
                    <template #item="product">
                        <div
                            class="rounded-border m-2 text-center p-2"
                            style="border: 1px solid var(--surface-d)"
                        >
                            <div class="my-20">
                                <img
                                    :src="
                                        'demo/images/product/' +
                                        product.data.image
                                    "
                                    :alt="product.name"
                                    class="shadow-lg"
                                    style="width: 50%"
                                />
                            </div>
                            <div>
                                <h5 class="mb-1">{{ product.data.name }}</h5>
                                <h6 class="mt-0 mb-12">
                                    ${{ product.data.price }}
                                </h6>
                                <span
                                    :class="
                                        'product-badge status-' +
                                        product.data.inventoryStatus.toLowerCase()
                                    "
                                    >{{ product.data.inventoryStatus }}</span
                                >
                                <div class="my-20">
                                    <Button
                                        icon="pi pi-search"
                                        class="mr-2 p-button-rounded"
                                    ></Button>
                                    <Button
                                        icon="pi pi-star-fill"
                                        class="mr-2 p-button-rounded p-button-success"
                                    ></Button>
                                    <Button
                                        icon="pi pi-cog"
                                        class="p-button-rounded p-button-info"
                                    ></Button>
                                </div>
                            </div>
                        </div>
                    </template>
                </Carousel>
            </div>
        </div>

        <div class="col-span-12">
            <div class="card">
                <h5>Galleria</h5>
                <Galleria
                    :value="images"
                    :responsiveOptions="galleriaResponsiveOptions"
                    :numVisible="7"
                    :circular="true"
                    containerStyle="max-width: 800px; margin: auto"
                >
                    <template #item="slotProps">
                        <img
                            :src="slotProps.item.itemImageSrc"
                            :alt="slotProps.item.alt"
                            style="width: 100%; display: block"
                        />
                    </template>
                    <template #thumbnail="slotProps">
                        <img
                            :src="slotProps.item.thumbnailImageSrc"
                            :alt="slotProps.item.alt"
                            tyle="width: 100%; display: block;"
                        />
                    </template>
                </Galleria>
            </div>
        </div>

        <div class="col-span-12">
            <div class="card">
                <h5>Image</h5>
                <div class="flex justify-center">
                    <Image
                        :src="'demo/images/galleria/galleria11.jpg'"
                        alt="Image"
                        width="250"
                        preview
                    />
                </div>
            </div>
        </div>
    </div>
</template>
