<script setup>
const emit = defineEmits(['click']);

const handleClick = (event) => {
    emit('click', event);
};

const props = defineProps({
    title: String,
    status: String,
    statusSeverity: {
        type: String,
        default: 'success'
    },
    subtitle: String,
    detailsLeft: {
        type: String,
        default: null
    },
    detailsRight: {
        type: String,
        default: null
    },
    titleTestId: {
        type: String,
        default: null
    },
    statusTestId: {
        type: String,
        default: null
    },
    subtitleTestId: {
        type: String,
        default: null
    },
    detailsLeftTestId: {
        type: String,
        default: null
    },
    detailsRightTestId: {
        type: String,
        default: null
    },
    deleteAction: {
        type: Function,
        default: null
    }
});
</script>

<template>
    <Card>
        <template #content>
            <div class="flex justify-content-between align-items-center">
                <div class="flex align-items-center gap-1">
                    <slot name="title" :onClick="handleClick">
                        <Button
                            class="item-link p-0 shadow-none text-lg text-left p-break-all"
                            :data-testid="titleTestId"
                            :label="title"
                            @click="handleClick"
                            link
                        />
                    </slot>

                    <StatusTag
                        v-if="status"
                        :data-testid="statusTestId"
                        class="white-space-nowrap"
                        :status="status"
                    />
                </div>
                <div
                    v-if="subtitle"
                    class="text-sm font-semibold"
                    :data-testid="subtitleTestId"
                >
                    {{ subtitle }}
                </div>

                <div v-if="deleteAction" :data-testid="deleteAction">
                    <Button
                        class="p-button-rounded p-button-outlined ml-3"
                        style="color: red"
                        icon="pi pi-trash"
                        @click="deleteAction"
                        :data-testid="`btn-remove-beneficiary`"
                    />
                </div>
            </div>
            <div
                v-if="detailsLeft || detailsRight"
                class="flex justify-content-between align-items-center text-sm color-grey mt-2"
            >
                <div v-if="detailsLeft" :data-testid="detailsLeftTestId">
                    {{ detailsLeft }}
                </div>
                <div v-if="detailsRight" :data-testid="detailsRightTestId">
                    {{ detailsRight }}
                </div>
            </div>
        </template>
    </Card>
</template>

<style scoped lang="scss">
.color-grey {
    color: #495057;
}

.item-link {
    color: #14377d;
}
</style>
