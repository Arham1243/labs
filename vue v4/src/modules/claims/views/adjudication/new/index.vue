<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { cfg_adjudication } from '@/modules/claims/utils/adjudication';
import { useAdjudicationQueueStore } from '@/modules/claims/stores/AdjudicationQueue';
import ClaimTag from '@/modules/claims/components/shared/ClaimTag.vue';
import { cloneObj } from '@/modules/claims/utils/helper';
import { useGeneralStore } from '@/modules/claims/stores/General';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const {
    mutateAdjudicationQueue,
    getAdjudicationQueue,
    currentAdjudicationQueue
} = useAdjudicationQueueStore();
const { mutate, loading, status } = mutateAdjudicationQueue();
getAdjudicationQueue(route.query.id);

const { plans, getPlans } = useGeneralStore();
getPlans();

let backBtn = reactive({ label: t('buttons.back'), icon: true });
let cancel = ref(false);

const qForm = ref(null);

let review = reactive({
    pop: false,
    publish: false,
    loading: false
});

const link = (path) =>
    `/claims/adjudication/new/${path}${
        route.query.id ? `?id=${route.query.id}` : ''
    }`;

//FOR PRIMEVUE NEW STEPPER

const routeToStepMap = computed(() => {
    const map = {};
    cfg_adjudication.forEach((step, index) => {
        map[step.path] = String(index + 1);
    });
    return map;
});

const stepToRouteMap = computed(() => {
    const map = {};
    cfg_adjudication.forEach((step, index) => {
        map[String(index + 1)] = step.path;
    });
    return map;
});

// Get current step based on route path
const currentStep = computed(() => {
    const path = route.path.split('/').pop();
    return routeToStepMap.value[path] || '1';
});

// Handle step navigation
const onStepChange = (stepValue) => {
    const routePath = stepToRouteMap.value[stepValue];
    if (routePath) {
        router.push(link(routePath));
    }
};

// Dynamic stepper items for PrimeVue 4
const stepperItems = computed(() => {
    return cfg_adjudication.map((step, index) => ({
        value: String(index + 1),
        label: step.title
    }));
});

// OLD CODE FOR PRIMEVUE 3
// const stepperItems = ref(
//     cfg_adjudication.map((step) => ({ label: step.title, to: link(step.path) }))
// );

const next = (dir) => {
    let path = route.path.split('/').pop();
    let routes =
        dir === -1 ? [...cfg_adjudication].reverse() : cfg_adjudication;
    const index = routes.findIndex((r) => r.path === path);

    if (index !== -1 && routes[index + 1])
        router.push(link(routes[index + 1].path));
    else router.push('/claims/adjudication');
};

const nextBtn = () => {
    let path = route.path.split('/').pop();
    let step =
        cfg_adjudication[cfg_adjudication.findIndex((r) => r.path === path)];
    return step ?? { btnLabel: 'Continue' };
};

const back = () => {
    if (!backBtn.icon) {
        cancel.value = true;
    } else next(-1);
};

// Handling Redirects on success submission
watch(
    () => qForm?.value?.loading,
    () => {
        let path = route.path.split('/').pop();
        if (path === 'review') review.loading = qForm?.value?.loading;

        if (qForm?.value?.status === 'success') {
            // if (path === 'review') {
            //     review.publish = false;
            //     review.pop = false;
            // }
            if (!route.query.id && currentAdjudicationQueue?.value)
                route.query.id = currentAdjudicationQueue.value.id;
            next();
        }
    }
);

// Handling Redirects from /new to  /new/details as entry page
watch(
    () => route,
    () => {
        let path = route.path.split('/').pop();
        if (path === 'details') {
            backBtn.label = t('buttons.cancel');
            backBtn.icon = false;
        } else {
            backBtn.label = t('buttons.back');
            backBtn.icon = true;
        }

        if (route.path.split('/').pop() === 'new')
            router.push('/claims/adjudication/new/details');
    },
    { immediate: true, deep: true }
);
</script>

<template>
    <div class="pt-12 pb-12 flex justify-between">
        <div class="flex gap-12 items-center">
            <h3
                v-text="
                    route.query.id
                        ? currentAdjudicationQueue?.name
                        : t('adjudication.new_queue')
                "
                data-testid="text-title"
            />
            <ClaimTag
                v-if="route.query.id && currentAdjudicationQueue?.status"
                :value="currentAdjudicationQueue.status"
                class="uppercase"
            />
        </div>
        <Button
            @click="cancel = true"
            class="px-12"
            icon="pi pi-times"
            outlined
        />
    </div>

    <!-- OLD CODE FOR PRIMEVUE 3 -->
    <!--<Steps :model="stepperItems" />-->

    <!-- NEW CODE FOR PRIMEVUE 4 -->
    <Stepper :value="currentStep" linear class="w-full vertical-stepper">
        <StepList>
            <Step
                v-for="item in stepperItems"
                :key="item.value"
                :value="item.value"
                @click="onStepChange(item.value)"
                :class="{ 'cursor-pointer': true }"
            >
                {{ item.label }}
            </Step>
        </StepList>
    </Stepper>
    <div v-if="plans" class="mt-12 mb-12">
        <router-view v-model:form="qForm" />
    </div>

    <div
        class="mx-auto flex px-0 pb-20 justify-between"
        :class="{ 'col-8': route.path.split('/').pop() !== 'review' }"
    >
        <Button
            data-testid="btn-back"
            :icon="backBtn.icon ? 'pi pi-chevron-left' : ''"
            :label="backBtn.label"
            outlined
            @click="back"
        />
        <Button
            :label="nextBtn().btnLabel"
            data-testid="btn-next"
            @click="qForm.submit()"
            :iconPos="nextBtn().btnIcon ? 'left' : 'right'"
            :disabled="qForm?.disable ?? false"
            :icon="nextBtn().btnIcon ?? 'pi pi-chevron-right'"
            :loading="loading"
        />
    </div>

    <Dialog
        v-model:visible="cancel"
        modal
        :header="t('adjudication.leave_creation_page_title')"
        :style="{ width: '32rem' }"
        data-testid="dialog-queue-cancellation"
    >
        <div
            class="flex mb-0 flex-wrap"
            data-testid="dialog-message"
            v-text="t('dialogs.do_you_want_to_cancel')"
        />

        <div class="flex justify-end gap-2 mt-20">
            <Button
                type="button"
                :label="t('button.stay_on_this_page')"
                link
                @click="cancel = false"
                data-testid="dialog-btn-cancel"
            />
            <Button
                type="button"
                :label="t('button.leave_page')"
                data-testid="dialog-btn-back"
                @click="router.push('/claims/adjudication')"
            />
        </div>
    </Dialog>
</template>
