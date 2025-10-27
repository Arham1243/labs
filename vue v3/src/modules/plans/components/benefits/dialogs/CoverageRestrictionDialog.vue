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
        <div class="p-fluid mt-2">
            <p>{{ content }}</p>
            <div v-for="(rule, index) in rules" :key="index" class="gap-2 mb-2">
                <div class="col-12 flex align-items-center custom-card">
                    <div
                        class="col-11 flex flex-wrap justify-content-between align-items-center p-0"
                    >
                        <div class="flex gap-1 p-0 align-items-center">
                            <InputField
                                id="name"
                                variant="number"
                                placeholder="90"
                                v-model="rule.value"
                                class="w-4"
                            />
                            <Dropdown
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
                            <Dropdown
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
                                class="h-3rem mt-2"
                                variant="textarea"
                                placeholder="Enter Description"
                                v-model="rule.description"
                            />
                        </div>
                    </div>
                    <div class="col-1">
                        <Button
                            icon="pi pi-trash"
                            class="p-button-rounded p-button-outlined p-button-danger"
                            @click="removeRule(rule)"
                        />
                    </div>
                </div>

                <div class="mt-3" style="width: 200px">
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
            class="p-button-text mt-3"
            @click="addRule"
        />
        <template #footer>
            <input type="hidden" autofocus />
            <Button text :label="$t('buttons.cancel')" @click="closeDialog" />
            <Button :label="$t('buttons.save')" @click="confirm" />
        </template>
    </Dialog>
</template>
