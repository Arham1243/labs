<script setup>
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const emit = defineEmits(['send:message']);
const props = defineProps({
    allMails: {
        type: Array,
        default: () => []
    }
});

const mail = ref({});
const newMail = ref({
    message: ''
});
const route = useRoute();
const router = useRouter();

const getMail = async () => {
    return props.allMails.find((mail) => parseInt(mail.id) === parseInt(route.params.id));
};

watch(
    () => props.allMails,
    async () => {
        mail.value = await getMail();
    },
    { immediate: true }
);

const sendMail = () => {
    const sendMail = {
        ...mail.value,
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
    emit('send:message', sendMail);
    router.push('/apps/mail/sent');
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

const goBack = () => {
    router.push({ name: 'mail-inbox' });
};
</script>

<template>
    <div>
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-20 pt-20 md:pt-0 gap-12 md:border-t-0 border-t border-surface">
            <div class="flex items-center md:justify-start">
                <Button type="button" icon="pi pi-chevron-left" class="p-button-text p-button-plain md:mr-12" @click="goBack()"></Button>
                <Avatar v-if="mail && mail.image" :image="'/demo/images/avatar/' + mail.image" size="large" shape="circle" class="border-2 border-surface"></Avatar>
                <div class="flex flex-col mx-12">
                    <span class="block text-surface-900 dark:text-surface-0 font-bold text-lg">{{ mail?.from }}</span>
                    <span class="block text-surface-900 dark:text-surface-0 font-semibold">To: {{ mail?.email || mail?.to }}</span>
                </div>
            </div>
            <div class="flex items-center justify-end gap-x-4 px-12 md:px-0">
                <span class="text-surface-900 dark:text-surface-0 font-semibold whitespace-nowrap mr-auto">{{ mail?.date }}</span>
                <Button type="button" icon="pi pi-reply" class="p-button-text p-button-plain shrink-0"></Button>
                <Button type="button" icon="pi pi-ellipsis-v" class="p-button-text p-button-plain shrink-0"></Button>
            </div>
        </div>
        <div class="border-surface border rounded-border p-12">
            <div class="text-surface-900 dark:text-surface-0 font-semibold text-lg mb-12">{{ mail?.title }}</div>
            <div class="leading-normal mt-0 mb-12" v-html="mail?.message"></div>

            <Editor v-model="newMail.message" class="editor"></Editor>

            <div class="flex gap-x-4 justify-end mt-12">
                <Button type="button" class="p-button-outlined" icon="pi pi-image"></Button>
                <Button type="button" class="p-button-outlined" icon="pi pi-paperclip"></Button>
                <Button type="button" class="p-button-primary" icon="pi pi-send" label="Send" @click="sendMail()"></Button>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
:deep(.editor) {
    .p-editor-content {
        height: 250px;
    }
}
</style>
