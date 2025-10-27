<script setup>
import { watch, ref } from 'vue';

const props = defineProps({
    modelValue: {
        type: Object
    },
    isNew: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue']);

const formData = ref(props.modelValue);

watch(formData, (value) => {
    emit('update:modelValue', value);
});
</script>
<template>
    <div class="mx-12 flex flex-col gap-y-4 ">
        <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
            <label for="recent_graduate_eligible_days" class="w-[190px] shrink-0">
                {{ $t('plans.eligible_to_apply') }} *
            </label>
            <div class="custom-number-input w-[150px] shrink-0">
                <InputField
                    id="recent_graduate_eligible_days"
                    variant="number"
                    :addon-after="$t('common.days')"
                    :min="0"
                    v-model="formData.recent_graduate_eligible_days"
                />
            </div>
            <span>
            {{ $t('plans.from_the_previous_policy_end_date') }}
        </span>
        </div>
        <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
            <label for="recent_graduate_max_days" class="w-[190px] shrink-0">
                {{ $t('plans.maximum_policy_duration') }} *
            </label>
            <div class="custom-number-input w-[150px] shrink-0">
                <InputField
                    id="recent_graduate_max_days"
                    variant="number"
                    :addon-after="$t('common.days')"
                    :min="0"
                    v-model="formData.recent_graduate_max_days"
                />
            </div>
        </div>
    </div>
</template>
