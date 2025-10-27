<script setup>
defineProps({
    announcement: {
        type: Object,
        required: true
    }
});

const mapTypeToSeverity = (type) => {
    if (type === 'critical') return 'error';
    else if (type === 'warning') return 'warn';
    return type;
};
</script>

<template>
    <Message
        :closable="false"
        :severity="mapTypeToSeverity(announcement.type)"
        class="announcement-message border-none my-0 line-height-3"
        data-testid="announcement-message"
    >
        <div
            class="px-2"
            v-html="announcement.message"
            data-testid="announcement-message-content"
        />
    </Message>
</template>

<style>
.announcement-message.p-message-info {
    background: #b6d3f4;
    color: #14377c;
}
.announcement-message .p-message-icon {
    color: inherit !important;
}
</style>
