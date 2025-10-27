import { systemFields } from '@/modules/policies/composables/systemFields';
import { genders } from '@/config';

const GENDER_MAPPINGS = {
    male: ['male', 'm'],
    female: ['female', 'f'],
    other: ['other'],
    non_binary_or_non_conforming: [
        'non_binary_or_non_conforming',
        'non binary or non conforming',
        'non_binary',
        'non binary',
        'non_conforming',
        'non conforming'
    ],
    transgender: ['transgender'],
    prefer_not_to_respond: ['prefer_not_to_respond', 'prefer not to respond']
};

export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function isPassportNumber(str) {
    const passportRegex = /^[a-zA-Z0-9]{6,10}$/;
    return passportRegex.test(str);
}

export function isStringMatch(str, regex) {
    return regex.test(str);
}

export function matchHelper({ regexIncludes, regexExcludes }, str) {
    return (
        regexIncludes.some((regex) =>
            isStringMatch(String(str).toLocaleLowerCase().trim(), regex)
        ) &&
        !regexExcludes.some((regex) =>
            isStringMatch(String(str).toLocaleLowerCase().trim(), regex)
        )
    );
}

export function isStringValid(str) {
    return /^[\p{L}\/'\- ]+$/u.test(str) && str.length > 0 && str.length < 51;
}

export function getColumnType(props, index) {
    for (const systemField of Object.values(systemFields)) {
        if (
            systemField.alreadyMatched === false &&
            systemField.matcher &&
            systemField.matcher(props)
        ) {
            systemField.disabled = true;
            systemField.alreadyMatched = true;
            systemField.headerIndex = index;
            return systemField.value;
        }
    }

    return null;
}

export function getDateFields() {
    return Object.keys(systemFields).filter(
        (key) => systemFields[key].inputType === 'date'
    );
}

export function isValidCountry(countries, data) {
    const normalizedData = data.toLowerCase();

    return countries.some(
        (country) =>
            country.id.toLowerCase() === normalizedData ||
            country.name.toLowerCase() === normalizedData
    );
}

export function convertToTitleCase(str) {
    return str
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .split(' ')
        .map(function (word) {
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
}

export function convertToLowercase(str) {
    if (typeof str === 'string') {
        return str.toLowerCase();
    } else {
        return str;
    }
}

export function getAllAllowedGenderValues() {
    const mappedValues = Object.values(GENDER_MAPPINGS)
        .flat()
        .map((value) => value.toLowerCase());
    const genderValues = genders.flatMap((gender) => [
        gender.id.toLowerCase(),
        gender.name.toLowerCase()
    ]);

    return Array.from(new Set([...mappedValues, ...genderValues]));
}

export function getGenderByValue(value) {
    const lowerValue = value.toLowerCase();

    for (const gender in GENDER_MAPPINGS) {
        if (GENDER_MAPPINGS[gender].includes(lowerValue)) {
            return gender;
        }
    }

    return null;
}

let countries = [];
export const countriesCache = {
    get: () => countries,
    set: (value) => {
        countries = value;
    },
    getById: (countryId) => {
        const country = countries.find((c) => c.id === countryId);
        return country?.name || '-';
    }
};
