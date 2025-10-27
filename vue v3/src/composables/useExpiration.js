import { computed } from 'vue';

export function useExpiration(endDate, days = 30) {
    const isAboutToExpire = computed(() => {
        if (!endDate.value) {
            return false;
        }

        const currentDate = new Date();
        const expirationDate = new Date(endDate.value);
        const thresholdDate = new Date();
        thresholdDate.setDate(currentDate.getDate() + days);

        return expirationDate <= thresholdDate && expirationDate > currentDate;
    });

    const daysRemaining = computed(() => {
        if (!endDate.value) {
            return 0;
        }
        const currentDate = new Date();
        const expirationDate = new Date(endDate.value);
        const timeDiff = expirationDate.getTime() - currentDate.getTime();

        if (timeDiff < 0) return 0;

        return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    });

    const expirationMessage = computed(() => {
        if (!isAboutToExpire.value) {
            return '';
        }

        const remaining = daysRemaining.value;
        if (remaining <= 0) {
            return 'Plan expires today';
        }
        if (remaining === 1) {
            return 'Plan expires in 1 day';
        }
        return `Plan expires in ${remaining} days`;
    });

    return { isAboutToExpire, daysRemaining, expirationMessage };
}
