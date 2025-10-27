<script setup>
import { ref } from 'vue';

const isDialog = ref(false);
</script>

<template>
    <div>
        <div @click.stop="isDialog = true">
            <slot />
        </div>

        <Confirmation
            v-bind="$attrs"
            v-model="isDialog"
            show-alert-icon
            confirm-button-class="p-button-danger"
            @confirm="deleteItem"
        />
    </div>
</template>

<style lang="scss" scoped></style>
