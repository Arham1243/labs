<script setup>
import { onMounted } from 'vue';
import Buttons from '@/template/uikit/Button.vue';
import Input from '@/template/uikit/Input.vue';
import Menu from '@/template/uikit/Menu.vue';
import Panels from '@/template/uikit/Panels.vue';
import Overlay from '@/template/uikit/Overlay.vue';
import Table from '@/template/uikit/Table.vue';

onMounted(() => {});
</script>

<template>
    <div>
        <Button
            label="Click here to load something"
            :loading="commonStore.loading"
            class="p-button-outlined mr-2 mb-2"
            @click="load"
        />
        <Buttons />
        <Input />
        <Menu />
        <Panels />
        <Overlay />
        <Table />
    </div>
</template>

<style lang="scss" scoped></style>
