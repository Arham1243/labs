<script setup>
const props = defineProps({
    item: {
        type: null,
        required: true
    },
    index: {
        type: Number,
        required: false
    },
    icon: {
        type: String,
        required: false
    },
    label: {
        type: String,
        required: true
    },
    selected: {
        type: Boolean,
        default: false
    },
    disabled: {
        type: Boolean,
        default: false
    },
    labelClasses: {
        type: String,
        default: ''
    },
    iconClasses: {
        type: String,
        default: ''
    },
    avatarIcon: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['click']);

const handleClick = () => {
    if (!props.disabled) {
        emit('click', props.item);
    }
};
</script>

<template>
    <card
        @click="handleClick"
        class="selectable-icon-button"
        :class="{ selected: selected, disabled: disabled }"
    >
        <template #content>
            <div
                class="flex items-center justify-center flex-gap-20"
            >
                <Avatar
                    :data-testid="`selectable-icon-button-avatar-${props.index}`"
                    v-if="avatarIcon"
                    shape="circle"
                    size="xlarge"
                    :icon="`pi ${icon}`"
                    :class="iconClasses"
                    class="green-icon icon-bg-color"
                />
                <i
                    v-else
                    :class="[icon, iconClasses]"
                    :data-testid="`selectable-icon-button-icon-${props.index}`"
                    class="text-3xl green-icon"
                ></i>
                <div class="text-base font-semibold">
                    <div :class="labelClasses">
                        <span
                            :data-testid="`selectable-icon-button-label-${props.index}`"
                        >
                            {{ label }}
                        </span>
                    </div>
                </div>
            </div>
        </template>
    </card>
</template>

<style lang="scss" scoped>
.selectable-icon-button {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    align-items: flex-start;
    padding: 16px 24px;
    gap: 10px;
    box-shadow: 0px 1px 3px 0px #0000004d !important;
    border-radius: 8px;
    border: 2px solid transparent;
    color: #0a4d8d;
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;

    &:not(.selected):hover {
        border: 2px solid #0a4d8d;
        cursor: pointer;
    }

    &.selected {
        border: 2px solid #0a4d8d;
        background: #f2f5f8;
    }

    &.disabled {
        pointer-events: none;
        opacity: 0.6;
        background-color: #e9ecef;
    }
}

.flex-gap-20 {
    gap: 20px;
}

.green-icon {
    color: #16a34a;
}

.icon-bg-color {
    background-color: #f4fcf7;
}
</style>
