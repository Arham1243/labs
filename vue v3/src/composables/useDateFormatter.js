import { computed, ref } from 'vue';
import { useSettingStore } from '@/modules/administration/stores/index.js';

const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];
const monthNamesShort = [
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
const dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
];
const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const FALLBACK_DATE_FORMAT = 'yyyy-MM-dd';
const FALLBACK_TIME_FORMAT = 'HH:mm';

let globalSettings = ref(null);
let isLoading = ref(false);
let isLoaded = ref(false);
let loadPromise = null;

/**
 * Enhanced date/datetime parser that preserves time information
 * @param {string} dateTimeString - Date or datetime string from API
 * @returns {Date|null} Date object or null if invalid
 */

function parseDateTimeSafely(dateTimeString) {
    if (!dateTimeString || typeof dateTimeString !== 'string') {
        return null;
    }

    dateTimeString = dateTimeString.trim();

    // Handle datetime format
    const datetimeMatch = dateTimeString.match(
        /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/
    );
    if (datetimeMatch) {
        // TREAT AS UTC, then convert to local
        const utcString = `${datetimeMatch[1]}-${datetimeMatch[2]}-${datetimeMatch[3]}T${datetimeMatch[4]}:${datetimeMatch[5]}:${datetimeMatch[6]}Z`;
        const date = new Date(utcString);
        return date;
    }

    // Handle ISO format with T separator
    const isoMatch = dateTimeString.match(
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/
    );
    if (isoMatch) {
        // Add Z if not present to force UTC interpretation
        const utcString = dateTimeString.endsWith('Z')
            ? dateTimeString
            : dateTimeString + 'Z';
        const date = new Date(utcString);
        return date;
    }

    // Handle date-only format
    const dateMatch = dateTimeString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateMatch) {
        const year = parseInt(dateMatch[1], 10);
        const month = parseInt(dateMatch[2], 10) - 1;
        const day = parseInt(dateMatch[3], 10);
        // For date-only, use local timezone
        const date = new Date(year, month, day, 12, 0, 0);
        return date;
    }

    // Fallback
    try {
        const date = new Date(dateTimeString);
        if (!isNaN(date.getTime())) {
            return date;
        }
    } catch (e) {
        //
    }

    return null;
}

/**
 * date formatter that parses character by character.
 * Avoids replacement conflicts.
 * @param {Date} date - The date object to format.
 * @param {string} formatString - The format string (e.g., 'd MMMM, yyyy').
 * @returns {string} The formatted date string.
 */

function customFormat(date, formatString) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const dayOfWeek = date.getDay();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;

    const pad = (num) => num.toString().padStart(2, '0');

    let result = '';
    let i = 0;

    while (i < formatString.length) {
        const char = formatString[i];

        if (i <= formatString.length - 4) {
            const fourChar = formatString.substr(i, 4);
            if (fourChar === 'yyyy') {
                result += year;
                i += 4;
                continue;
            }
            if (fourChar === 'MMMM') {
                result += monthNames[month];
                i += 4;
                continue;
            }
            if (fourChar === 'dddd') {
                result += dayNames[dayOfWeek];
                i += 4;
                continue;
            }
        }

        if (i <= formatString.length - 3) {
            const threeChar = formatString.substr(i, 3);
            if (threeChar === 'MMM') {
                result += monthNamesShort[month];
                i += 3;
                continue;
            }
            if (threeChar === 'ddd') {
                result += dayNamesShort[dayOfWeek];
                i += 3;
                continue;
            }
        }

        if (i <= formatString.length - 2) {
            const twoChar = formatString.substr(i, 2);
            if (twoChar === 'yy') {
                result += String(year).slice(-2);
                i += 2;
                continue;
            }
            if (twoChar === 'MM') {
                result += pad(month + 1);
                i += 2;
                continue;
            }
            if (twoChar === 'dd') {
                result += pad(day);
                i += 2;
                continue;
            }
            if (twoChar === 'hh') {
                result += pad(hours12);
                i += 2;
                continue;
            }
            if (twoChar === 'HH') {
                result += pad(hours);
                i += 2;
                continue;
            }
            if (twoChar === 'mm') {
                result += pad(minutes);
                i += 2;
                continue;
            }
            if (twoChar === 'ss') {
                result += pad(seconds);
                i += 2;
                continue;
            }
            if (twoChar === 'tt') {
                result += ampm;
                i += 2;
                continue;
            }
        }

        if (char === 'M') {
            result += month + 1;
            i += 1;
            continue;
        }
        if (char === 'd') {
            result += day;
            i += 1;
            continue;
        }
        if (char === 'h') {
            result += hours12;
            i += 1;
            continue;
        }
        if (char === 'H') {
            result += hours;
            i += 1;
            continue;
        }
        if (char === 'm') {
            result += minutes;
            i += 1;
            continue;
        }
        if (char === 's') {
            result += seconds;
            i += 1;
            continue;
        }

        result += char;
        i += 1;
    }

    return result;
}

async function loadSettings() {
    if (isLoaded.value) {
        return globalSettings.value;
    }

    if (isLoading.value && loadPromise) {
        return await loadPromise;
    }

    isLoading.value = true;

    loadPromise = (async () => {
        try {
            const settingStore = useSettingStore();
            const response = await settingStore.getSettings();

            globalSettings.value = response?.date_time ? response : null;
            isLoaded.value = true;

            return globalSettings.value;
        } catch (error) {
            globalSettings.value = null;
            isLoaded.value = true;
            return null;
        } finally {
            isLoading.value = false;
            loadPromise = null;
        }
    })();

    return await loadPromise;
}

export function useDateFormatter() {
    const shortDateFormat = computed(() => {
        const format =
            globalSettings.value?.date_time?.short_date || FALLBACK_DATE_FORMAT;
        return format;
    });

    const longDateFormat = computed(() => {
        const format =
            globalSettings.value?.date_time?.long_date || FALLBACK_DATE_FORMAT;
        return format;
    });

    const shortTimeFormat = computed(() => {
        const format =
            globalSettings.value?.date_time?.short_time || FALLBACK_TIME_FORMAT;
        return format;
    });

    const longTimeFormat = computed(() => {
        const format =
            globalSettings.value?.date_time?.long_time || FALLBACK_TIME_FORMAT;
        return format;
    });

    /**
     * Formats a date string using the application's configured formats.
     * @param {String} dateString - The date string from the API.
     * @param {Object} [options] - Options object.
     * @param {'date' | 'time'} [options.type='date'] - The type of value to format.
     * @param {'short' | 'long'} [options.format='short'] - The format length to use.
     * @returns {String} The formatted string.
     */

    const formatValue = (dateString, options = {}) => {
        const { type = 'date', format = 'short' } = options;

        if (!dateString) {
            return '';
        }

        try {
            const date = parseDateTimeSafely(dateString);

            if (!date) {
                console.warn(
                    'Could not parse date/datetime string:',
                    dateString
                );
                return '';
            }

            let formatString;
            if (type === 'date') {
                formatString =
                    format === 'long'
                        ? longDateFormat.value
                        : shortDateFormat.value;
            } else if (type === 'time') {
                formatString =
                    format === 'long'
                        ? longTimeFormat.value
                        : shortTimeFormat.value;
            } else if (type === 'datetime-short-long') {
                // Short date + Long time
                formatString = `${shortDateFormat.value} ${longTimeFormat.value}`;
            } else if (type === 'datetime-long-short') {
                // Long date + Short time
                formatString = `${longDateFormat.value} ${shortTimeFormat.value}`;
            } else if (type === 'datetime-short-short') {
                // Short date + Short time
                formatString = `${shortDateFormat.value} ${shortTimeFormat.value}`;
            } else if (type === 'datetime-long-long') {
                // Long date + Long time
                formatString = `${longDateFormat.value} ${longTimeFormat.value}`;
            }

            const result = customFormat(date, formatString);
            return result;
        } catch (error) {
            globalStore.showError('Date formatting error:', error);
            return dateString;
        }
    };

    /**
     * Initialize the formatter by loading settings
     * Call this in component's onMounted
     */

    const initialize = async () => {
        await loadSettings();
    };

    const formatEndDateDisplay = (endDate) => {
        if (!endDate || endDate === '9999-12-31' || endDate === '9999-12-30') {
            return 'No end date';
        }

        const date = parseDateTimeSafely(endDate);
        if (!date || date.getFullYear() === 9999) {
            return 'No end date';
        }

        return formatValue(endDate, { type: 'date', format: 'long' });
    };

    const formatEndDateDisplayTables = (endDate) => {
        if (!endDate || endDate === '9999-12-31' || endDate === '9999-12-30') {
            return 'No end date';
        }

        const date = parseDateTimeSafely(endDate);
        if (!date || date.getFullYear() === 9999) {
            return 'No end date';
        }

        return formatValue(endDate, { type: 'date', format: 'short' });
    };

    return {
        formatValue,
        initialize,
        formatEndDateDisplay,
        parseDateTimeSafely,
        formatEndDateDisplayTables,
        isLoading: computed(() => isLoading.value),
        isReady: computed(() => isLoaded.value),
        shortDateFormat,
        longDateFormat,
        shortTimeFormat,
        longTimeFormat
    };
}
