import { cfg_adjudication } from '@/modules/claims/utils/adjudication';
import { validator } from '@/modules/claims/utils/submissions.js';

/**
 * Format submission source
 * @param source
 * @returns {*}
 */
export const formatSubmissionSource = (source) => {
    // Remove "_" and replace with space, set the first letter to uppercase
    return source.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
};

/**
 * Sum amount of array
 * @param array
 * @param key
 * @returns {*}
 */
export const sumAmt = (array, key) => {
    return array.reduce((a, b) => a + (parseInt(b[key]) || 0), 0);
};

/**
 * Calculate age
 * @param birthdate
 * @returns {number|null}
 */
export function calculateAge(birthdate) {
    if (!birthdate) return null;

    const birthDate = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Adjust age if birthday hasn't occurred yet this year
    if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
        age--;
    }

    return age;
}

/**
 * Clone an object
 * @param data
 * @returns {any}
 */
export function cloneObj(data) {
    return JSON.parse(JSON.stringify(data));
}

/**
 * Get the start of the day
 * @param date
 * @returns {Date}
 */
export function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Get the end of the day
 * @param date
 * @returns {Date}
 */
export function endOfDay(date) {
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        23,
        59,
        59,
        999
    );
}

let specialComp = (field) =>
    [
        'InputNumber',
        'Dropdown',
        'ApiDropdown',
        'Calendar',
        'FileUpload',
        'MultiSelect'
    ].indexOf(field.type);

export const validate = (field, value) => {
    let res = { error: false, message: validator(field.props.validate, value) };
    let val = specialComp(field) > -1 ? value : value?.trim();

    if (field.required && !val)
        res.message = `${field.label || 'Field'} is required`;
    else if (
        specialComp < 0 &&
        !value?.trim() &&
        value !== value?.trim() &&
        field.validate
    )
        res.message = 'Please enter valid data';
    // else res.message = '';

    if (res.message) res.error = true;
    return res;
};

export const validateForm = (fields, formData) => {
    formData.validate = true;
    for (let i = 0; i < fields.length; i++) {
        let res = validate(fields[i], formData[fields[i].props.name]);
        if (res.error) return false;
    }
    return true;
};

export const formatLabel = (label) => {
    return label
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export const formatExaminerName = (examinerName) => {
    if (examinerName) {
        const names = examinerName.split(' ');
        return names[0].charAt(0) + names[1].charAt(0);
    }

    return '';
};
