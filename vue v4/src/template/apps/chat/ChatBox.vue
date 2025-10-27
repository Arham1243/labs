<script setup>
import { ref } from 'vue';

defineProps({
    user: {
        type: Object,
        required: true
    }
});

const defaultUserId = ref(123);
const emit = defineEmits(['send:message']);
const op = ref(null);
const textContent = ref('');

const emojis = [
    '😀',
    '😃',
    '😄',
    '😁',
    '😆',
    '😅',
    '😂',
    '🤣',
    '😇',
    '😉',
    '😊',
    '🙂',
    '🙃',
    '😋',
    '😌',
    '😍',
    '🥰',
    '😘',
    '😗',
    '😙',
    '😚',
    '🤪',
    '😜',
    '😝',
    '😛',
    '🤑',
    '😎',
    '🤓',
    '🧐',
    '🤠',
    '🥳',
    '🤗',
    '🤡',
    '😏',
    '😶',
    '😐',
    '😑',
    '😒',
    '🙄',
    '🤨',
    '🤔',
    '🤫',
    '🤭',
    '🤥',
    '😳',
    '😞',
    '😟',
    '😠',
    '😡',
    '🤬',
    '😔',
    '😟',
    '😠',
    '😡',
    '🤬',
    '😔',
    '😕',
    '🙁',
    '😬',
    '🥺',
    '😣',
    '😖',
    '😫',
    '😩',
    '🥱',
    '😤',
    '😮',
    '😱',
    '😨',
    '😰',
    '😯',
    '😦',
    '😧',
    '😢',
    '😥',
    '😪',
    '🤤'
];

const parseDate = (timestamp) => {
    return new Date(timestamp).toTimeString().split(':').slice(0, 2).join(':');
};

const sendMessage = () => {
    if (textContent.value == '' || textContent.value === ' ') {
        return;
    }
    let message = {
        text: textContent.value,
        ownerId: 123,
        createdAt: new Date().getTime()
    };

    emit('send:message', message);
    textContent.value = '';
};

const addEmoji = (emoji) => {
    textContent.value = textContent.value + emoji;
    op.value.hide();
};
</script>

<template>
    <div class="flex flex-col h-full">
        <div class="flex items-center border-b border-surface p-12 lg:p-12">
            <div class="relative flex items-center mr-12">
                <img :src="'demo/images/avatar/' + user.image" :alt="user.name" class="w-16 h-16 rounded-full shadow-lg" />
                <span class="w-4/12 h-4 rounded-full border-2 border-surface absolute bottom-0 right-0" :class="{ 'bg-green-400': user.status === 'active', 'bg-red-400': user.status === 'busy', 'bg-yellow-400': user.status === 'away' }"></span>
            </div>
            <div class="mr-2">
                <span class="text-surface-900 dark:text-surface-0 font-semibold block">{{ user.name }}</span>
                <span class="text-surface-700 dark:text-surface-100">Last active 1 hour ago</span>
            </div>
            <div class="flex items-center ml-auto">
                <Button type="button" icon="pi pi-phone" class="p-button-rounded p-button-outlined p-button-secondary mr-12"></Button>
                <Button type="button" icon="pi pi-ellipsis-v" class="p-button-rounded p-button-outlined p-button-secondary"></Button>
            </div>
        </div>
        <div class="p-12 md:px-12 lg:px-12 lg:py-12 mt-2 overflow-y-auto" style="max-height: 53vh">
            <div v-for="message in user.messages" :key="message">
                <div v-if="message.ownerId !== 123" class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 grid-nogutter mb-12">
                    <div class="mr-12 mt-1">
                        <img :src="'demo/images/avatar/' + user.image" :alt="user.name" class="w-full h-12 rounded-full shadow-lg" />
                    </div>
                    <div class="col mt-12">
                        <p class="text-surface-900 dark:text-surface-0 font-semibold mb-12">{{ user.name }}</p>
                        <span class="text-surface-700 dark:text-surface-100 inline-block font-medium border border-surface p-12 whitespace-normal rounded-border" style="word-break: break-word; max-width: 80%">{{ message.text }}</span>
                        <p class="text-surface-700 dark:text-surface-100 mt-12">{{ parseDate(message.createdAt) }}<i class="pi pi-check ml-2 text-green-400"></i></p>
                    </div>
                </div>

                <div v-if="message.ownerId === defaultUserId" class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 grid-nogutter mb-12">
                    <div class="col mt-12 text-right">
                        <span class="inline-block text-left font-medium border border-surface bg-primary-100 text-primary-900 p-12 whitespace-normal rounded-border" style="word-break: break-word; max-width: 80%">{{ message.text }}</span>
                        <p class="text-surface-700 dark:text-surface-100 mt-12">{{ parseDate(message.createdAt) }} <i class="pi pi-check ml-2 text-green-400"></i></p>
                    </div>
                </div>
            </div>
        </div>
        <div class="p-12 md:p-12 lg:p-12 flex flex-col sm:flex-row items-center mt-auto border-t border-surface gap-12">
            <InputText id="message" type="text" placeholder="Type a message" class="flex-1 w-full sm:w-auto rounded-border" v-model="textContent" @keydown.enter="sendMessage()" />
            <div class="flex w-full sm:w-auto gap-12">
                <Button class="p-button p-button-secondary w-full sm:w-auto justify-center text-xl" @click="(event) => $refs.op.toggle(event)">😀</Button>
                <Button label="Send" icon="pi pi-send" class="w-full sm:w-auto" @click="sendMessage()"></Button>
            </div>
        </div>
    </div>

    <OverlayPanel ref="op" class="w-full sm:w-[30rem]">
        <Button v-for="emoji in emojis" :key="emoji" @click="addEmoji(emoji)" type="button" :label="emoji" class="p-2 p-button-text text-2xl"></Button>
    </OverlayPanel>
</template>
