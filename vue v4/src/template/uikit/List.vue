<script setup>
import { ref, onMounted } from 'vue';
import { ProductService } from '@/services/Product.service';

const picklistValue = ref([
    [
        { name: 'San Francisco', code: 'SF' },
        { name: 'London', code: 'LDN' },
        { name: 'Paris', code: 'PRS' },
        { name: 'Istanbul', code: 'IST' },
        { name: 'Berlin', code: 'BRL' },
        { name: 'Barcelona', code: 'BRC' },
        { name: 'Rome', code: 'RM' }
    ],
    []
]);

const orderlistValue = ref([
    { name: 'San Francisco', code: 'SF' },
    { name: 'London', code: 'LDN' },
    { name: 'Paris', code: 'PRS' },
    { name: 'Istanbul', code: 'IST' },
    { name: 'Berlin', code: 'BRL' },
    { name: 'Barcelona', code: 'BRC' },
    { name: 'Rome', code: 'RM' }
]);

const dataviewValue = ref(null);
const layout = ref('grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12');
const globalFilterValue = ref('');
const filteredValue = ref(null);
const sortKey = ref(null);
const sortOrder = ref(null);
const sortField = ref(null);
const sortOptions = ref([
    { label: 'Price High to Low', value: '!price' },
    { label: 'Price Low to High', value: 'price' }
]);

const productService = new ProductService();

onMounted(() => {
    productService
        .getProductsSmall()
        .then((data) => (dataviewValue.value = data));
});

const onSortChange = (event) => {
    const value = event.value.value;
    const sortValue = event.value;

    if (value.indexOf('!') === 0) {
        sortOrder.value = -1;
        sortField.value = value.substring(1, value.length);
        sortKey.value = sortValue;
    } else {
        sortOrder.value = 1;
        sortField.value = value;
        sortKey.value = sortValue;
    }
};

const onFilter = (e) => {
    const value = e.target.value;
    globalFilterValue.value = value;
    if (value.length === 0) {
        filteredValue.value = null;
    } else {
        const filtered = dataviewValue.value.filter((product) => {
            return product.name.toLowerCase().includes(value.toLowerCase());
        });
        filteredValue.value = filtered;
    }
};
const getBadgeSeverity = (status) => {
    const stockStatus = {
        OUTOFSTOCK: 'danger',
        LOWSTOCK: 'warning',
        INSTOCK: 'success'
    };

    return stockStatus[status];
};
</script>

<template>
    <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12">
        <div class="col-span-12">
            <div class="card">
                <h5>DataView</h5>
                <DataView
                    :value="filteredValue || dataviewValue"
                    :layout="layout"
                    :paginator="true"
                    :rows="9"
                    :sortOrder="sortOrder"
                    :sortField="sortField"
                >
                    <template #header>
                        <div
                            class="flex flex-col md:flex-row md:justify-between gap-2"
                        >
                            <div>
                                <Select
                                    v-model="sortKey"
                                    :options="sortOptions"
                                    optionLabel="label"
                                    placeholder="Sort By Price"
                                    @change="onSortChange($event)"
                                />
                            </div>
                            <span class="p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText
                                    v-model="globalFilterValue"
                                    @input="onFilter"
                                    placeholder="Search by Name"
                                />
                            </span>
                            <div>
                                <DataViewLayoutOptions v-model="layout" />
                            </div>
                        </div>
                    </template>
                    <template #list="slotProps">
                        <div class="col-span-12">
                            <div
                                class="flex flex-col md:flex-row items-center p-12 w-full"
                            >
                                <img
                                    :src="
                                        '/demo/images/product/' +
                                        slotProps.data.image
                                    "
                                    :alt="slotProps.data.name"
                                    class="my-12 md:my-0 w-9/12 md:w-40 shadow mr-20"
                                />
                                <div
                                    class="flex-1 flex flex-col items-center text-center md:text-left"
                                >
                                    <div class="font-bold text-2xl">
                                        {{ slotProps.data.name }}
                                    </div>
                                    <div class="mb-2">
                                        {{ slotProps.data.description }}
                                    </div>
                                    <Rating
                                        :modelValue="slotProps.data.rating"
                                        :readonly="true"
                                        :cancel="false"
                                        class="mb-2"
                                    ></Rating>
                                    <div class="flex items-center mt-1">
                                        <i class="pi pi-tag mr-2"></i>
                                        <span class="font-semibold">{{
                                            slotProps.data.category
                                        }}</span>
                                    </div>
                                </div>
                                <div
                                    class="flex flex-row md:flex-col justify-between w-full md:w-auto items-center md:items-end mt-20 md:mt-0"
                                >
                                    <span
                                        class="text-2xl font-semibold mb-2 self-center md:self-end"
                                        >${{ slotProps.data.price }}</span
                                    >
                                    <Button
                                        icon="pi pi-shopping-cart"
                                        label="Add to Cart"
                                        :disabled="
                                            slotProps.data.inventoryStatus ===
                                            'OUTOFSTOCK'
                                        "
                                        class="mb-2 p-button-sm"
                                    ></Button>
                                    <Badge
                                        :severity="
                                            getBadgeSeverity(
                                                slotProps.data.inventoryStatus
                                            )
                                        "
                                        >{{
                                            slotProps.data.inventoryStatus
                                        }}</Badge
                                    >
                                </div>
                            </div>
                        </div>
                    </template>

                    <template #grid="slotProps">
                        <div class="col-span-12 md:col-span-4">
                            <div class="card m-12 border border-surface">
                                <div
                                    class="flex flex-wrap gap-2 items-center justify-between mb-2"
                                >
                                    <div class="flex items-center">
                                        <i class="pi pi-tag mr-2"></i>
                                        <span class="font-semibold">{{
                                            slotProps.data.category
                                        }}</span>
                                    </div>
                                    <Badge
                                        :severity="
                                            getBadgeSeverity(
                                                slotProps.data.inventoryStatus
                                            )
                                        "
                                        >{{
                                            slotProps.data.inventoryStatus
                                        }}</Badge
                                    >
                                </div>
                                <div
                                    class="text-center flex items-center flex-col -mb-12"
                                >
                                    <img
                                        :src="
                                            '/demo/images/product/' +
                                            slotProps.data.image
                                        "
                                        :alt="slotProps.data.name"
                                        class="w-9/12 shadow my-12 mx-0"
                                    />
                                    <div class="text-2xl font-bold">
                                        {{ slotProps.data.name }}
                                    </div>
                                    <div class="mb-12">
                                        {{ slotProps.data.description }}
                                    </div>
                                    <Rating
                                        :modelValue="slotProps.data.rating"
                                        :readonly="true"
                                        :cancel="false"
                                    ></Rating>
                                </div>
                                <div
                                    class="flex items-center justify-between"
                                >
                                    <span class="text-2xl font-semibold"
                                        >${{ slotProps.data.price }}</span
                                    >
                                    <Button
                                        icon="pi pi-shopping-cart"
                                        :disabled="
                                            slotProps.data.inventoryStatus ===
                                            'OUTOFSTOCK'
                                        "
                                    ></Button>
                                </div>
                            </div>
                        </div>
                    </template>
                </DataView>
            </div>
        </div>

        <div class="col-span-12 xl:col-span-8">
            <div class="card">
                <h5>PickList</h5>
                <PickList
                    v-model="picklistValue"
                    listStyle="height:250px"
                    dataKey="code"
                >
                    <template #sourceheader> From </template>
                    <template #targetheader> To </template>
                    <template #item="slotProps">
                        <div>{{ slotProps.item.name }}</div>
                    </template>
                </PickList>
            </div>
        </div>

        <div class="col-span-12 xl:col-span-4">
            <div class="card">
                <h5>OrderList</h5>
                <OrderList
                    v-model="orderlistValue"
                    listStyle="height:250px"
                    dataKey="code"
                    :rows="10"
                >
                    <template #header> Cities </template>
                    <template #item="slotProps">
                        <div>{{ slotProps.item.name }}</div>
                    </template>
                </OrderList>
            </div>
        </div>
    </div>
</template>
