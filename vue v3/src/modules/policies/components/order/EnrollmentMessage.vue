<script setup>
import { computed } from 'vue';

const TYPE_INFO = 'info';
const TYPE_WARNING = 'warning';
const TYPE_ERROR = 'error';

const emit = defineEmits(['close']);

const props = defineProps({
    type: {
        type: String,
        default: TYPE_INFO
    },
    icon: {
        type: String,
        default: 'mdi-information-variant'
    },
    sticky: {
        type: Boolean,
        default: false
    },
    closable: {
        type: Boolean,
        default: false
    }
});

const bannerClass = computed(() => {
    switch (props.type) {
        case TYPE_INFO:
            return 'info-banner';
        case TYPE_WARNING:
            return 'warning-banner';
        case TYPE_ERROR:
            return 'error-banner';
        default:
            return '';
    }
});
</script>

<template>
    <div>
        <Message
            :icon="`pi ${icon}`"
            class="banner"
            :class="[bannerClass, { sticky: sticky }]"
            :closable="closable"
            @close="emit('close')"
        >
            <p>
                <slot></slot>
            </p>
        </Message>
    </div>
</template>

<style lang="scss" scoped>
::v-deep(.banner) {
    font-weight: 600;

    .p-message-text {
        font-weight: 600 !important;
    }
}
::v-deep(.warning-banner) {
    color: #ae510f;
    border-left-color: #ae510f;
    background: #fff2e2;

    .p-message-icon,
    .p-message-close {
        color: #ae510f;
    }
}
::v-deep(.info-banner) {
    color: #055a8c;
    border-left-color: #17a2b8;
    background: #d2eafb;

    .p-message-icon,
    .p-message-close {
        color: #055a8c;
    }
}
::v-deep(.error-banner) {
    color: #ff5757;
    border-left-color: #ff5252;
    background: #ffe7e6;

    .p-message-icon,
    .p-message-close {
        color: #ff5757;
    }
}

.sticky {
    position: sticky;
    top: 3px;
    z-index: 999;
}
</style>
