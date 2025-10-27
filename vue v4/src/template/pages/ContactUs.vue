<script setup>
import { ref } from 'vue';
import { useLayout } from '@/layout/composables/layout';
const name = ref('');
const email = ref('');
const message = ref('');
const content = ref([
    { icon: 'pi pi-fw pi-phone', title: 'Phone', info: '1 (833) 597-7538' },
    { icon: 'pi pi-fw pi-map-marker', title: 'Our Head Office', info: 'Churchill-laan 16 II, 1052 CD, Amsterdam' },
    { icon: 'pi pi-fw pi-print', title: 'Fax', info: '3 (833) 297-1548' }
]);
const { layoutConfig } = useLayout();
</script>

<template>
    <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 card grid-nogutter" style="column-gap: 2rem; row-gap: 2rem">
        <div class="col-span-12">
            <p class="text-surface-900 dark:text-surface-0 font-bold">Contact Us</p>
        </div>
        <div class="col-span-12 mt-12 h-80 border border-surface p-0 w-full bg-cover rounded-border" :style="{ backgroundImage: `url('demo/images/contact/map-${layoutConfig.colorScheme.value === 'light' ? 'light' : 'dark'}.svg')` }"></div>
        <div class="col-span-12 mt-20">
            <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 grid-nogutter px-2 flex-col md:flex-row" :style="{ columnGap: '2rem', rowGap: '2rem' }">
                <div v-for="(item, i) in content" :key="i" class="col flex flex-col justify-center text-center items-center border border-surface py-20 px-12 rounded-border">
                    <i class="pi pi-fw text-2xl text-primary" :class="item.icon"></i>
                    <span class="text-surface-900 dark:text-surface-0 font-bold mt-12 mb-1">{{ item.title }}</span>
                    <span class="text-surface-500 dark:text-surface-300">{{ item.info }}</span>
                </div>
            </div>
        </div>

        <div class="col-span-12 mt-20">
            <p class="text-surface-900 dark:text-surface-0 font-bold">Send Us Email</p>
            <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 flex-col md:flex-row formgrid grid-nogutter mt-12" :style="{ rowGap: '2rem', columnGap: '2rem' }">
                <div class="field col">
                    <label htmlFor="name" class="block text-primary font-bold"> Name </label>
                    <span class="p-input-icon-left w-full" :style="{ height: '3.5rem' }">
                        <i class="pi pi-user" :style="{ left: '1.5rem' }"></i>
                        <InputText id="name" type="text" v-model="name" placeholder="Name" class="w-full px-16 text-surface-900 dark:text-surface-0 font-semibold" :style="{ height: '3.5rem' }" />
                    </span>
                </div>

                <div class="field col">
                    <label htmlFor="email" class="block text-primary font-bold"> Email Address </label>
                    <span class="p-input-icon-left w-full" :style="{ height: '3.5rem' }">
                        <i class="pi pi-envelope" :style="{ left: '1.5rem' }"></i>
                        <InputText type="text" v-model="email" placeholder="Email" class="w-full px-16 text-surface-900 dark:text-surface-0 font-semibold" :style="{ height: '3.5rem' }" />
                    </span>
                </div>

                <div class="field col-span-12 flex flex-col">
                    <label htmlFor="message" class="block text-primary font-bold"> Message </label>
                    <Textarea id="message" :rows="5" :cols="30" v-model="message" class="text-surface-900 dark:text-surface-0 font-semibold" />
                    <Button class="p-button-primary ml-auto mt-12 rounded-border" label="Send Message"></Button>
                </div>
            </div>
        </div>
    </div>
</template>
