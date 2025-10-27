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
    <table class="mx-12 border-collapse">
        <tbody>
            <tr>
                <td style="width: 190px">
                    {{ $t('plans.eligible_to_apply') }} *
                </td>
                <td style="width: 150px">
                    <InputField
                        id="recent_graduate_eligible_days"
                        variant="number"
                        :addon-after="$t('common.days')"
                        :min="0"
                        v-model="formData.recent_graduate_eligible_days"
                    />
                </td>
                <td>
                    <span class="ml-2">{{
                        $t('plans.from_the_previous_policy_end_date')
                    }}</span>
                </td>
            </tr>
            <tr>
                <td>{{ $t('plans.maximum_policy_duration') }} *</td>
                <td>
                    <InputField
                        id="recent_graduate_max_days"
                        variant="number"
                        :addon-after="$t('common.days')"
                        :min="0"
                        v-model="formData.recent_graduate_max_days"
                    />
                </td>
                <td></td>
            </tr>
        </tbody>
    </table>
</template>
