<script>
export default {
    inheritAttrs: false
};
</script>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const emit = defineEmits(['new:mail']);
const newMail = ref({});
const router = useRouter();

const goBack = () => {
    router.push({ name: 'mail-inbox' });
};

const sendMail = () => {
    const mail = {
        ...newMail.value,
        id: generateId(),
        sent: true,
        archived: false,
        trash: false,
        spam: false,
        starred: false,
        important: false,
        date: generateDate()
    };

    emit('new:mail', mail);
    router.push({ name: 'mail-inbox' });
};
const generateId = () => {
    let text = '';
    let possible = '0123456789';

    for (let i = 0; i < 5; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
};

const generateDate = () => {
    return new Date().toDateString().split(' ').slice(1, 4).join(' ');
};
</script>

<template>
    <div class="flex items-center px-12 md:px-0 border-t border-surface md:border-0 pt-12 md:pt-0">
        <Button type="Button" icon="pi pi-chevron-left" class="p-button-outlined p-button-secondary border-surface text-surface-900 dark:text-surface-0 w-full h-12 mr-12" @click="goBack()"></Button>
        <span class="block text-surface-900 dark:text-surface-0 font-bold text-xl">Compose Message</span>
    </div>
    <div class="bg-surface-0 dark:bg-surface-950 grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 mt-12 grid-nogutter formgrid p-12 gap-12 md:border-surface md:border rounded-border">
        <div class="col-span-12 field">
            <label for="to" class="text-surface-900 dark:text-surface-0 font-semibold">To</label>
            <span class="p-input-icon-left w-full" style="height: 3.5rem">
                <i class="pi pi-user" style="left: 1.5rem"></i>
                <InputText id="to" type="text" v-model="newMail.to" class="w-full pl-16 text-surface-900 dark:text-surface-0 font-semibold" style="height: 3.5rem" />
            </span>
        </div>
        <div class="col-span-12 field">
            <label for="Subject" class="text-surface-900 dark:text-surface-0 font-semibold">Subject</label>
            <span class="p-input-icon-left w-full" style="height: 3.5rem">
                <i class="pi pi-pencil" style="left: 1.5rem"></i>
                <InputText id="subject" type="text" pInputText v-model="newMail.title" placeholder="Subject" class="w-full pl-16 text-surface-900 dark:text-surface-0 font-semibold" style="height: 3.5rem" />
            </span>
        </div>
        <div class="col-span-12 field">
            <Editor :style="{ height: '250px' }" v-model="newMail.message"></Editor>
        </div>
        <div class="col-span-12 flex gap-x-4 justify-end mt-16">
            <Button type="Button" class="p-button-primary h-12 w-full sm:w-auto" icon="pi pi-send" label="Send Message" @click="sendMail()"></Button>
        </div>
    </div>
</template>
