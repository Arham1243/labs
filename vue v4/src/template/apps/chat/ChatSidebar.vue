<script setup>
import UserCard from './UserCard.vue';
import { ref, watch } from 'vue';

const props = defineProps({
    users: {
        type: Array,
        default: () => []
    }
});

const filteredUsers = ref([]);
const searchedUser = ref('');
const emit = defineEmits(['change:active:user']);

watch(
    () => props.users,
    (newUsers) => {
        filteredUsers.value = newUsers;
    },
    { immediate: true }
);

const onChangeActiveUser = (user) => {
    emit('change:active:user', user);
};

const filter = async () => {
    if (searchedUser.value === '') {
        filteredUsers.value = props.users;

        return;
    }

    const filteredArr = filteredUsers.value.filter((user) => user.name.toLowerCase().includes(searchedUser.value.toLowerCase()));

    filteredUsers.value = [...filteredArr];
};
</script>
<template>
    <div class="flex flex-col items-center border-b border-surface p-12">
        <img src="/demo/images/avatar/circle/avatar-f-1@2x.png" class="w-24 h-24 rounded-full shadow-lg" alt="Asiya Javayant" />
        <span class="text-surface-900 dark:text-surface-0 text-xl font-semibold mt-12">Asiya Javayant</span>
    </div>
    <div class="w-full flex gap-y-6 flex-col border-surface p-12">
        <span class="p-input-icon-left w-full">
            <i class="pi pi-search"></i>
            <InputText id="search" type="text" placeholder="Search" class="w-full" v-model="searchedUser" @input="filter" />
        </span>
        <div class="flex flex-row gap-12 md:flex-col overflow-auto">
            <UserCard v-for="user in filteredUsers" :key="user" :user="user" @click="onChangeActiveUser(user)"></UserCard>
        </div>
    </div>
</template>
