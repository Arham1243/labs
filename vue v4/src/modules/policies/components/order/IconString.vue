<script setup>
import { computed, useSlots } from 'vue';

const slots = useSlots();

const props = defineProps({
    icon: { type: String, default: null },
    hideIcon: { type: Boolean, default: false }
});

const propsToPass = computed(() => {
    return props.iconColor ? { color: props.iconColor } : {};
});

const isSlotEmpty = computed(() => {
    return (
        !slots.default ||
        !slots.default().some((vnode) => vnode.children?.trim())
    );
});
</script>

<template>
    <div class="pr-2 flex items-center">
        <span class="whitespace-nowrap" v-if="!isSlotEmpty">
            <slot></slot>
        </span>
        <span class="w-full text-center" v-else> - </span>

        <i
            v-if="icon && !hideIcon"
            class="pl-1 icon pi"
            v-bind="propsToPass"
            :class="icon"
        ></i>
    </div>
</template>

<style lang="scss" scoped>
.icon {
    color: #b32b23;
    font-size: 18px;
}
</style>
