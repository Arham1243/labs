<script setup>
import { ref, onMounted, watch } from 'vue';

const content = ref({});
const newMail = ref({});

const emit = defineEmits(['save', 'update:dialogVisible']);
const props = defineProps({
    dialogVisible: {
        type: Boolean,
        default: false
    },
    mailDetail: {
        type: Object,
        default: null
    }
});

const displayMessage = ref(false);
const localDialogVisible = ref(false);

onMounted(() => {
    updateContent();
});

watch(
    () => props.mailDetail,
    () => {
        updateContent();
    }
);

const updateContent = () => {
    content.value = { ...props.mailDetail };
};

const sendMail = () => {
    const replyMail = setMailAction();

    emit('save', replyMail);
};

const setMailAction = () => {
    return {
        ...content.value,
        ...newMail.value,
        id: generateId(),
        to: props.mailDetail.to || props.mailDetail.from,
        sent: true,
        archived: false,
        trash: false,
        spam: false,
        starred: false,
        important: false,
        date: generateDate()
    };
};

const toggleMessage = () => {
    displayMessage.value = !displayMessage.value;
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
watch(
    () => props.dialogVisible,
    (newValue) => {
        localDialogVisible.value = newValue;
    }
);
watch(
    () => localDialogVisible.value,
    (newValue) => {
        emit('update:dialogVisible', newValue);
    }
);
</script>

<template>
    <Dialog v-model:visible="localDialogVisible" header="New Message" modal class="mx-12 sm:mx-0 sm:w-full md:w-8/12 lg:w-6/12" contentClass="rounded-b border-t border-surface p-0">
        <div class="p-0 m-0">
            <div class="bg-surface-0 dark:bg-surface-950 grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 grid-nogutter formgrid flex-col md:flex-row gap-12 p-20 rounded-border">
                <div class="col">
                    <label for="to" class="block text-surface-900 dark:text-surface-0 font-semibold mb-12">To</label>
                    <span class="p-input-icon-left w-full" style="height: 3.5rem">
                        <i class="pi pi-user" style="left: 1.5rem"></i>
                        <InputText disabled id="to" type="text" class="w-full pl-16 text-surface-900 dark:text-surface-0 font-semibold" style="height: 3.5rem" v-model="content.from" />
                    </span>
                </div>
                <div class="col">
                    <label for="Subject" class="block text-surface-900 dark:text-surface-0 font-semibold mb-12">Subject</label>
                    <span class="p-input-icon-left w-full" style="height: 3.5rem">
                        <i class="pi pi-pencil" style="left: 1.5rem"></i>
                        <InputText disabled id="subject" type="text" placeholder="Subject" class="w-full pl-16 text-surface-900 dark:text-surface-0 font-semibold" style="height: 3.5rem" v-model="content.title" />
                    </span>
                </div>
                <div v-if="displayMessage" class="col-span-12 field">
                    <div class="border border-surface rounded-border p-12">{{ content.message }}</div>
                </div>
                <div class="col-span-12 field">
                    <span class="bg-surface-50 dark:bg-surface-950 cursor-pointer rounded-border px-2" @click="toggleMessage()" v-tooltip="displayMessage ? 'Hide content' : 'Show content'"><i class="pi pi-ellipsis-h"></i></span>
                    <Editor :editorStyle="{ height: '250px' }" class="mt-12" v-model="newMail.message"></Editor>
                </div>
            </div>
            <div class="flex gap-x-4 justify-end p-20 border-t border-surface">
                <Button type="Button" class="p-Button-outlined" icon="pi pi-image"></Button>
                <Button type="Button" class="p-Button-outlined" icon="pi pi-paperclip"></Button>
                <Button type="Button" class="p-Button-primary h-12" icon="pi pi-send" label="Send" @click="sendMail()"></Button>
            </div>
        </div>
    </Dialog>
</template>
