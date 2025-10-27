export const open_end_date = '31-Dec-9999';
export const open_end_iso = '9999-12-31';

export const isValidDate = (dateStr) => {
    return dateStr && dateStr !== 'Invalid date';
};

export const ensureDateObject = (date) => {
    return typeof date === 'string' ? new Date(date) : date;
};

export const isOpenEndedDate = (dateStr) => {
    return dateStr === open_end_iso;
};

export const formatEndDateForDisplay = (dateStr, formatDateFn) => {
    if (!dateStr || isOpenEndedDate(dateStr)) {
        return 'No end date';
    }
    return formatDateFn(dateStr);
};

export const formatEndDateForDatepicker = (dateStr) => {
    if (isOpenEndedDate(dateStr)) {
        return null;
    }
    return dateStr;
};

export const getGapEndDate = (isOpenEnded, fallbackDate) => {
    return isOpenEnded ? null : fallbackDate;
};

export const getDisplayEndDate = (endDate, isOpenEnded) => {
    if (isOpenEnded || endDate === null) return null;
    return endDate === open_end_date ? null : endDate;
};

export const formatDateForGap = (dateStr, isOpenEnded = false) => {
    if (isOpenEnded && dateStr === null) return null;
    if (dateStr === null) return null;
    return dateStr === open_end_date ? open_end_iso : dateStr;
};
