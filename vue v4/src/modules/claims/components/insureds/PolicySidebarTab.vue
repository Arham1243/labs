<script setup>
import { ref } from 'vue';
import { useHelpers } from '@/composables';
import ClaimStatusTag from '@/modules/claims/components/shared/ClaimStatusTag.vue';

const props = defineProps({
    policies: {
        type: Array,
        required: true
    }
});

const helpers = useHelpers();
const menu = ref();
const menuItems = ref([
    {
        label: 'Policy Wording',
        command: () => showPolicyWordingDialog()
    },
    {
        label: 'Policy Summary',
        command: () => showPolicySummaryDialog()
    }
]);

const showPolicyWordingDialog = () => {};

const showPolicySummaryDialog = () => {};

const showMenu = (event, index) => {
    menu.value[index].toggle(event);
};
</script>

<template>
    <div
        v-for="(policy, index) in props.policies"
        class="mt-5 policy-items"
        :key="index"
    >
        <div class="flex justify-between items-center">
            <div
                class="cursor-pointer"
                @click="showMenu($event, index)"
                :data-testid="'btn-open-policy-menu-' + index"
            >
              <span class="mr-2 policy-button-text">{{'Policy # ' + policy.policy_number}}</span>
              <i class="pi pi-chevron-down"></i>
            </div>
            <Menu
                ref="menu"
                id="overlay_menu"
                :model="menuItems"
                :popup="true"
                :data-testid="'menu-policy-menu-' + index"
            />
            <ClaimStatusTag
                :status="policy.status"
                :data-testid="'tag-policy-status-' + index"
            />
        </div>
        <div class="flex justify-between items-center mt-5">
            <p class="m-0" :data-testid="'text-policy-title-' + index">
                GuardMe Policy
                <!-- CURRENTLY USING MOCK DATA -->
            </p>
            <p :data-testid="'text-policy-date-' + index">
                {{ helpers.formatDate(policy.start_date) }} -
                {{ helpers.formatDate(policy.end_date) }}
            </p>
        </div>
        <div class="flex justify-between items-center mt-1">
            <p class="m-0" :data-testid="'text-policy-terms-' + index">
                Policy Term: {{ policy.duration }} days
            </p>
        </div>
        <Divider />
    </div>
</template>
<style>
.policy-button-text {
  color: #14377d;
  font-weight: bold;
}
</style>
