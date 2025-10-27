<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useDateFormatter } from '@/composables/useDateFormatter.js';
import {
    open_end_date,
    open_end_iso,
    isValidDate,
    ensureDateObject,
    getGapEndDate,
    getDisplayEndDate,
    formatDateForGap
} from '@/modules/plans/utils/end_date_utils.js';

const props = defineProps({
    planPrices: {
        type: Array,
        required: true
    },
    planStartDate: {
        type: String,
        default: null
    },
    planEndDate: {
        type: String,
        default: null
    },
    defaultEndYear: {
        type: [Number, String],
        default: () => null
    }
});

const emits = defineEmits(['create-price']);
const { formatValue, initialize } = useDateFormatter();
const priceGaps = ref([]);

const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
];

const month_map = Object.fromEntries(
    months.map((month, index) => [month, index])
);

const parseDate = (dateStr) => {
    if (!dateStr) return null;

    if (typeof dateStr === 'string' && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    return new Date(dateStr);
};

const formatDisplayDate = (date) => {
    if (!date) return '';
    date = ensureDateObject(date);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const isoString = `${year}-${month}-${day}`;
    return formatValue(isoString, { type: 'date', format: 'long' });
};

const formatFormDate = (date) => {
    if (!date) return '';
    date = ensureDateObject(date);

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const parseDisplayDate = (dateStr) => {
    if (!dateStr) return new Date();

    const [day, month, year] = dateStr.split('-');
    return new Date(parseInt(year), month_map[month], parseInt(day));
};

const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

const isOpenEndedPlan = () => {
    return props.planEndDate === null || props.planEndDate === open_end_iso;
};

const extractPriceDates = (prices, dateField) => {
    return prices
        .map((price) => parseDate(price[dateField] || price.start_date))
        .filter(Boolean);
};

const effectivePlanStart = computed(() => {
    if (props.planStartDate) {
        return parseDate(props.planStartDate);
    }

    if (props.planPrices?.length > 0) {
        const priceDates = extractPriceDates(
            props.planPrices,
            'effective_date'
        );
        const earliestPrice = priceDates.sort((a, b) => a - b)[0];
        return earliestPrice || new Date();
    }

    return new Date();
});

const effectivePlanEnd = computed(() => {
    if (isOpenEndedPlan()) {
        return new Date(9999, 11, 31);
    }

    if (props.planEndDate) {
        return parseDate(props.planEndDate);
    }

    if (props.defaultEndYear) {
        return new Date(parseInt(props.defaultEndYear), 11, 31);
    }

    if (props.planPrices?.length > 0) {
        const endDates = props.planPrices
            .map((price) => (price.end_date ? parseDate(price.end_date) : null))
            .filter(Boolean);

        if (endDates.length > 0) {
            const latestPriceEnd = endDates.sort((a, b) => b - a)[0];
            return addDays(latestPriceEnd, 30);
        }
    }

    return addDays(effectivePlanStart.value, 365 * 5);
});

const calculatePeriodBounds = (period, planStart, planEnd) => {
    return {
        start: new Date(Math.max(period.start.getTime(), planStart.getTime())),
        end: new Date(Math.min(period.end.getTime(), planEnd.getTime()))
    };
};

const getPricePeriods = () => {
    const planStart = effectivePlanStart.value;
    const planEnd = effectivePlanEnd.value;

    return props.planPrices
        .map((price) => ({
            start: parseDate(price.effective_date || price.start_date),
            end: price.end_date ? parseDate(price.end_date) : planEnd
        }))
        .filter((period) => period.start && period.end)
        .filter((period) => period.start <= planEnd && period.end >= planStart)
        .map((period) => ({
            start: new Date(
                Math.max(period.start.getTime(), planStart.getTime())
            ),
            end: new Date(Math.min(period.end.getTime(), planEnd.getTime()))
        }))
        .sort((a, b) => a.start - b.start);
};

const mergePeriods = (periods) => {
    const merged = [];

    for (const period of periods) {
        const lastMerged = merged[merged.length - 1];

        if (!lastMerged || lastMerged.end < addDays(period.start, -1)) {
            merged.push({ ...period });
        } else {
            lastMerged.end = new Date(Math.max(lastMerged.end, period.end));
        }
    }

    return merged;
};

const createGap = (startDate, endDate, isOpenEnded = false) => {
    return {
        start_date: formatDisplayDate(startDate),
        end_date: getGapEndDate(isOpenEnded, formatDisplayDate(endDate)),
        is_open_ended: isOpenEnded
    };
};

const findGaps = (mergedPeriods) => {
    const gaps = [];
    const planStart = effectivePlanStart.value;
    const planEnd = effectivePlanEnd.value;
    let currentDate = new Date(planStart);
    const isOpenEnded = isOpenEndedPlan();

    for (const period of mergedPeriods) {
        if (period.start > currentDate) {
            gaps.push(createGap(currentDate, addDays(period.start, -1)));
        }
        currentDate = new Date(Math.max(currentDate, addDays(period.end, 1)));
    }

    if (currentDate <= planEnd) {
        gaps.push(createGap(currentDate, planEnd, isOpenEnded));
    }
    return gaps;
};

const findPriceGaps = () => {
    const planStart = effectivePlanStart.value;
    const planEnd = effectivePlanEnd.value;
    const isOpenEnded = isOpenEndedPlan();

    if (!props.planPrices?.length) {
        priceGaps.value = [createGap(planStart, planEnd, isOpenEnded)];
        return;
    }

    const pricePeriods = getPricePeriods();
    const mergedPeriods = mergePeriods(pricePeriods);
    const gaps = findGaps(mergedPeriods);

    priceGaps.value = gaps;
};

const handleCreatePrice = (gap, event) => {
    event.preventDefault();

    emits('create-price', {
        start_date: formatDateForGap(gap.start_date),
        end_date: formatDateForGap(gap.end_date, gap.is_open_ended)
    });
};

const watchTargets = [
    () => props.planPrices,
    () => props.planStartDate,
    () => props.planEndDate
];

watchTargets.forEach((target) => watch(target, findPriceGaps, { deep: true }));

onMounted(async () => {
    await initialize();
    findPriceGaps();
});
</script>

<template>
    <div v-if="priceGaps.length > 0" class="my-5">
        <div v-for="(gap, index) in priceGaps" :key="index">
            <div
                class="flex align-items-center my-2 bg-orange-100 p-2 text-orange-800 border-round"
            >
                <div class="flex align-items-center mr-2 gap-2">
                    <i class="pi pi-exclamation-triangle"></i>
                    <strong>Pricing Gap Found:</strong>
                </div>
                No pricing exists for the period
                <strong class="mx-2">{{ gap.start_date }}</strong> to
                <strong class="ml-2">{{
                    getDisplayEndDate(gap.end_date, gap.is_open_ended) === null
                        ? 'no end date'
                        : gap.end_date
                }}</strong
                >. Please
                <a
                    href="#"
                    @click="(e) => handleCreatePrice(gap, e)"
                    class="underline font-bold text-orange-800 mx-2"
                    >create pricing</a
                >
                to fill the gap.
            </div>
        </div>
    </div>
</template>
