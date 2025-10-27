<script setup>
import lodash from 'lodash';
import { computed, onMounted, ref } from 'vue';
import { ruleTimeline, ruleSupply, joinTypes } from '@/config';
import { useGlobalStore } from '@/stores';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    header: {
        type: String,
        default: 'Confirm'
    },
    content: {
        type: String,
        default: ''
    },
    currentRules: {
        type: Array
    }
});

const emit = defineEmits(['confirm', 'update:modelValue']);

const dialog = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emit('update:modelValue', value);
    }
});

const rules = ref([]);

onMounted(() => {
    if (props.currentRules && props.currentRules.length > 0) {
        rules.value = lodash.cloneDeep(props.currentRules);
    } else {
        rules.value = [
            {
                value: null,
                timeline: null,
                supply: null,
                join_type: null,
                timeline_unit: null
            }
        ];
    }
});

const removeRule = (item) => {
    if (rules.value.length > 0) {
        rules.value.splice(rules.value.indexOf(item), 1);
    }
};

const addRule = () => {
    if (rules.value?.length > 0) {
        rules.value[rules.value.length - 1].join_type = 'and';
    }
    rules.value.push({
        value: null,
        timeline: null,
        supply: null,
        timeline_unit: null
    });
};

const confirm = () => {
    if (rules.value.length === 0) {
        emit('confirm', null);
        return;
    }

    rules.value[rules.value.length - 1].join_type = null;
    emit('confirm', rules.value);
};

const closeDialog = () => {
    useGlobalStore().clearErrors();
    dialog.value = false;
};

const handleSelectBtnChange = (event, index) => {
    rules.value[index].join_type =
        event.event.target.textContent?.toLowerCase();
};
</script>

<template>
    <Dialog
        v-model:visible="dialog"
        modal
        header="Apply Coverage Restrictions"
        :style="{ width: '580px' }"
        @after-hide="useGlobalStore().clearErrors()"
    >
        <div class="p-fluid">
            <p>{{ content }}</p>
            <div v-for="(rule, index) in rules" :key="index" class="mb-2">
                <div class="col-span-12 flex items-center custom-card">
                    <div
                        class="col-span-10 flex flex-wrap justify-between"
                    >
                        <div class="flex gap-1 p-0 items-center">
                            <InputField
                                id="name"
                                variant="number"
                                placeholder="90"
                                v-model="rule.value"
                                class="w-4/12"
                            />
                            <Select
                                :options="ruleSupply"
                                optionLabel="name"
                                optionValue="code"
                                placeholder="Supply"
                                v-model="rule.supply"
                            />
                            <div class="ml-2">Every</div>
                            <InputField
                                id="name"
                                variant="number"
                                placeholder="#"
                                v-model="rule.timeline_unit"
                            />
                            <Select
                                :options="ruleTimeline"
                                optionLabel="name"
                                optionValue="code"
                                placeholder="Duration"
                                v-model="rule.timeline"
                            />
                        </div>
                        <div class="w-full">
                            <InputField
                                :id="`description`"
                                class="h-12 mt-2 w-full"
                                variant="textarea"
                                placeholder="Enter Description"
                                v-model="rule.description"
                            />
                        </div>
                    </div>
                    <div class="ml-4">
                        <Button
                            icon="pi pi-trash"
                            class="p-button-rounded p-button-outlined p-button-danger"
                            @click="removeRule(rule)"
                        />
                    </div>
                </div>

                <div class="my-4 custom-select-button-xsm">
                    <SelectButton
                        v-if="index < rules.length - 1"
                        v-model="rule.join_type"
                        :options="joinTypes"
                        optionLabel="name"
                        optionValue="code"
                        datakey="code"
                        :allowEmpty="false"
                        :unselectable="false"
                        :multiple="false"
                        @change="(event) => handleSelectBtnChange(event, index)"
                    />
                </div>
            </div>
        </div>
        <Button
            :label="$t('benefits.new_limit')"
            icon="pi pi-plus"
            class="p-button-text"
            @click="addRule"
        />
        <template #footer>
            <div class="edit-cancel-button">
                <input type="hidden" autofocus />
                <Button text class="mr-2" :label="$t('buttons.cancel')" @click="closeDialog" />
                <Button :label="$t('buttons.save')" @click="confirm" />
            </div>
        </template>
    </Dialog>
</template>
