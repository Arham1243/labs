import moment from 'moment-timezone';
import { fallbackLocale, locale, t } from '@/plugins/i18n';
import { ability } from '@/plugins/ability';

export default {
    moneyFormat(number, currency = 'usd') {
        if (isNaN(number)) {
            number = '';
        } else {
            const formatter = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency
            });
            number = formatter.format(number);
        }
        return number.charAt(0) + number.substr(1);
    },
    getDisplayValue(code, list, key = 'code') {
        const item = list.find((item) => item[key] == code);
        return item ? item.name : '';
    },
    isValidDate(date) {
        return moment(date).isValid();
    },
    formatDate(date, filterFormat = 'DD-MMM-YYYY') {
        if (date === 'Invalid date' || !date) return '-';
        return moment.utc(date).format(filterFormat);
    },
    formatPhoneNumber(number) {
        const digits = number.replace(/\D/g, '');
        const countryCode = digits.slice(0, digits.length - 10);
        const areaCode = digits.slice(-10, -7);
        const middle = digits.slice(-7, -4);
        const last = digits.slice(-4);
        return `+${countryCode} (${areaCode}) ${middle}-${last}`;
    },
    localDate(date, filterFormat = 'DD-MMM-YYYY') {
        if (!date || date === 'Invalid date') return '-';

        return moment.utc(date).local().format(filterFormat);
    },
    parseDate(date, filterFormat = 'YYYY-MM-DD') {
        return moment(date).format(filterFormat);
    },
    getJsDate(date, filterFormat = 'DD-MMM-YYYY') {
        return moment.utc(date).format(filterFormat);
    },
    getUTCDate() {
        return this.parseDate(moment.utc());
    },
    buildIdNamePair(items) {
        return items.map((item) => {
            return {
                ...item,
                name: t(item.name)
            };
        });
    },
    getMappedText(map, value) {
        return t(`common.${map[value]}`);
    },
    getLocaleValue(value) {
        if (!value) return;
        return value[locale.value]
            ? value[locale.value]
            : value[fallbackLocale.value]
              ? value[fallbackLocale.value]
              : '';
    },
    readAsBinaryString(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                resolve(event.target.result);
            };
            reader.onerror = (error) => {
                reject(error);
            };
            reader.readAsBinaryString(file);
        });
    },
    formatBytes(bytes, decimals = 2) {
        if (!+bytes) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = [
            'Bytes',
            'KiB',
            'MiB',
            'GiB',
            'TiB',
            'PiB',
            'EiB',
            'ZiB',
            'YiB'
        ];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${
            sizes[i]
        }`;
    },
    formatDateForDisplay(date) {
        if (!date) return '';
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        const formattedParts = new Intl.DateTimeFormat(
            'en-US',
            options
        ).formatToParts(new Date(date));
        const day = formattedParts.find((part) => part.type === 'day')?.value;
        const month = formattedParts.find(
            (part) => part.type === 'month'
        )?.value;
        const year = formattedParts.find((part) => part.type === 'year')?.value;
        return `${day}-${month}-${year}`;
    },
    formatDateForSave(date) {
        if (!date) return null;
        if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return date;
        }
        const formats = ['DD-MMM-YYYY', 'YYYY-MM-DD', moment.ISO_8601];
        const localDate = moment(date, formats, true);
        if (localDate.isValid()) {
            localDate.hour(12).minute(0).second(0);
        }
        const utcDate = localDate.utc();
        return utcDate.isValid() ? utcDate.format('YYYY-MM-DD') : null;
    },
    filterByPermission(items) {
        return items.filter((item) => {
            const permissions = item.permission;
            if (permissions == null) {
                return true;
            } else if (Array.isArray(permissions)) {
                return permissions.some((permission) =>
                    ability.can(permission)
                );
            } else if (typeof permissions === 'string') {
                return ability.can(permissions);
            }
            return false;
        });
    },
    capitalizeWords(str) {
        return str.replace(/\b\w/g, (char) => char.toUpperCase());
    },
    filterCountries(newRegions, oldRegions, formData) {
        const currentRegionIds = newRegions.map((region) => region.id);
        const removedRegionIds = oldRegions
            .filter((region) => !currentRegionIds.includes(region.id))
            .map((region) => region.id);

        formData.value.countries = formData.value.countries.filter(
            (country) => !removedRegionIds.includes(country.region_id)
        );
    },
    getShortEntityType(fullType) {
        return fullType.split('\\').pop();
    },
    extractTypeFromCommunicationClass(className) {
        const base = className.split('\\').pop(); // e.g., "PhoneCommunication"
        return base.replace('Communication', '').toLowerCase(); // e.g., "phone"
    }
};
