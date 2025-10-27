import { reactive } from 'vue';
import {
    isStringMatch,
    isStringValid,
    isValidEmail,
    matchHelper,
    isValidCountry,
    getAllAllowedGenderValues
} from './helpers';

export const systemFields = reactive({
    Plan: {
        value: 'Plan',
        text: 'Plan',
        sortable: false,
        align: 'start',
        headerIndex: null,
        alreadyMatched: false,
        category: 'select',
        inputType: 'plan',
        disabled: false,
        validator(props) {
            const plans = props.plans ?? [];
            const value = String(props.value)
                .toLocaleLowerCase()
                .replace(' ', '');
            const isValid = plans.some(
                (plan) =>
                    plan.description?.toLocaleLowerCase().replace(' ', '') ===
                        value ||
                    plan.name.toLocaleLowerCase().replace(' ', '') === value
            );

            return {
                ...props,
                name: 'Plan',
                isValid
            };
        },
        matcher({ columnName }) {
            const regex = [/product/i, /plan/i];

            return regex.some((regex) =>
                isStringMatch(
                    String(columnName).toLocaleLowerCase().trim(),
                    regex
                )
            );
        }
    },
    'First Name': {
        value: 'First Name',
        text: 'First Name',
        sortable: false,
        align: 'start',
        headerIndex: null,
        alreadyMatched: false,
        category: 'textField',
        inputType: 'text',
        disabled: false,
        validator(props) {
            const isValid = isStringValid(props.value);

            return {
                ...props,
                name: 'First Name',
                isValid
            };
        },
        matcher({ columnName }) {
            const regex = [/first/i, /first_name/i, /firstname/i];

            return regex.some((regex) =>
                isStringMatch(
                    String(columnName).toLocaleLowerCase().trim(),
                    regex
                )
            );
        }
    },
    'Last Name': {
        value: 'Last Name',
        text: 'Last Name',
        sortable: false,
        headerIndex: null,
        category: 'textField',
        inputType: 'text',
        alreadyMatched: false,
        disabled: false,
        align: 'start',
        validator(props) {
            const isValid = isStringValid(props.value);

            return {
                ...props,
                name: 'Last Name',
                isValid
            };
        },
        matcher({ columnName }) {
            const regex = [/last/i, /last_name/i, /lastname/i];

            return regex.some((regex) =>
                isStringMatch(
                    String(columnName).toLocaleLowerCase().trim(),
                    regex
                )
            );
        }
    },
    'Country of Residence': {
        value: 'Country of Residence',
        text: 'Country of Residence',
        sortable: false,
        category: 'select',
        inputType: 'country',
        headerIndex: null,
        alreadyMatched: false,
        disabled: false,
        align: 'start',
        validator(props) {
            const isValid = isValidCountry(props.countries, props.value);

            return {
                ...props,
                name: 'Country of Residence',
                isValid
            };
        },
        matcher({ columnName }) {
            const regex = [/country/i, /residence/i];

            return regex.some((regex) =>
                isStringMatch(
                    String(columnName).toLocaleLowerCase().trim(),
                    regex
                )
            );
        }
    },
    Nationality: {
        value: 'Nationality',
        text: 'Nationality',
        sortable: false,
        category: 'select',
        inputType: 'country',
        headerIndex: null,
        alreadyMatched: false,
        disabled: false,
        align: 'start',
        validator(props) {
            const isValid = isValidCountry(props.countries, props.value);

            return {
                ...props,
                name: 'Nationality',
                isValid
            };
        },
        matcher({ columnName }) {
            const regex = [/nationality/i];

            return regex.some((regex) =>
                isStringMatch(
                    String(columnName).toLocaleLowerCase().trim(),
                    regex
                )
            );
        }
    },
    'Country of Destination': {
        value: 'Country of Destination',
        text: 'Country of Destination',
        sortable: false,
        headerIndex: null,
        alreadyMatched: false,
        category: 'select',
        inputType: 'country',
        disabled: false,
        align: 'start',
        validator(props) {
            const isValid = isValidCountry(props.countries, props.value);

            return {
                ...props,
                name: 'Country of Destination',
                isValid
            };
        },
        matcher({ columnName }) {
            const regex = [/destination/i];

            return regex.some((regex) =>
                isStringMatch(
                    String(columnName).toLocaleLowerCase().trim(),
                    regex
                )
            );
        }
    },
    Type: {
        value: 'Type',
        text: 'Type',
        sortable: false,
        headerIndex: null,
        alreadyMatched: false,
        category: 'select',
        inputType: 'applicantType',
        disabled: false,
        align: 'start',
        validator(props) {
            const policyTypes = props.policyTypes ?? [];
            const isValid =
                typeof props.value &&
                policyTypes.some(
                    (policyType) =>
                        policyType.id == props.value.toLowerCase() ||
                        policyType.name.toLowerCase() ==
                            props.value.toLowerCase()
                );

            return {
                ...props,
                name: 'Type',
                isValid
            };
        },
        matcher({ columnName }) {
            const regex = [/type/i, /applicant/i];

            return regex.some((regex) =>
                isStringMatch(
                    String(columnName).toLocaleLowerCase().trim(),
                    regex
                )
            );
        }
    },
    'Email Address': {
        value: 'Email Address',
        text: 'Email Address',
        sortable: false,
        category: 'textField',
        inputType: 'email',
        headerIndex: null,
        alreadyMatched: false,
        disabled: false,
        align: 'start',
        validator(props) {
            const isValid = !props.value || isValidEmail(props.value);

            return {
                ...props,
                name: 'Email Address',
                isValid
            };
        },
        matcher({ columnName }) {
            const regex = [/email/i];

            return regex.some((regex) =>
                isStringMatch(
                    String(columnName).toLocaleLowerCase().trim(),
                    regex
                )
            );
        }
    },

    Gender: {
        value: 'Gender',
        text: 'Gender',
        sortable: false,
        align: 'start',
        category: 'select',
        inputType: 'gender',
        headerIndex: null,
        alreadyMatched: false,
        disabled: false,
        validator(props) {
            const isValid = props.genders
                .map((gender) => gender.name.toLowerCase())
                .includes(props.value.toLowerCase());

            return {
                ...props,
                name: 'Gender',
                isValid
            };
        },
        matcher({ columnName }) {
            const regex = [/gender/i];

            return regex.some((regex) =>
                isStringMatch(
                    String(columnName).toLocaleLowerCase().trim(),
                    regex
                )
            );
        }
    },

    'Date of Birth': {
        value: 'Date of Birth',
        text: 'Date of Birth',
        sortable: false,
        headerIndex: null,
        category: 'datePicker',
        inputType: 'date',
        alreadyMatched: false,
        disabled: false,
        align: 'start',
        validator(props) {
            const dateParser = props.dateParser;
            const parsedDate = dateParser ? dateParser(props.value) : null;
            const isValid = !!parsedDate && parsedDate.isValid();

            return {
                ...props,
                name: 'Date of Birth',
                isValid
            };
        },
        matcher({ columnName, rowField }) {
            const regex = [/birth/i, /dob/i];

            return regex.some((regex) =>
                isStringMatch(
                    String(columnName).toLocaleLowerCase().trim(),
                    regex
                )
            );
        }
    },

    'Passport Number': {
        value: 'Passport Number',
        text: 'Passport Number',
        sortable: false,
        headerIndex: null,
        category: 'textField',
        inputType: 'text',
        alreadyMatched: false,
        disabled: false,
        align: 'start',
        validator(props) {
            return {
                ...props,
                name: 'Passport Number',
                isValid: true
            };
        },
        matcher({ columnName }) {
            const regex = [/passport/i];

            return regex.some((regex) =>
                isStringMatch(
                    String(columnName).toLocaleLowerCase().trim(),
                    regex
                )
            );
        }
    },

    'Student Number': {
        value: 'Student Number',
        text: 'Student Number',
        sortable: false,
        category: 'textField',
        inputType: 'number',
        headerIndex: null,
        alreadyMatched: false,
        disabled: false,
        align: 'start',
        validator(props) {
            return {
                ...props,
                name: 'Student Number',
                isValid: true
            };
        },
        matcher({ columnName, rowField }) {
            return matchHelper(
                {
                    regexIncludes: [
                        /student/i,
                        /#/i,
                        /number/i,
                        /studentnumber/i,
                        /student_number/i
                    ],
                    regexExcludes: [
                        /phone/i,
                        /passport/i,
                        /country/i,
                        /policy/i,
                        /day/i
                    ]
                },
                columnName
            );
        }
    },

    'Group Name': {
        value: 'Group Name',
        text: 'Group Name',
        sortable: false,
        category: 'textField',
        inputType: 'text',
        headerIndex: null,
        alreadyMatched: false,
        disabled: false,
        align: 'start',
        validator(props) {
            return {
                ...props,
                name: 'Group Name',
                isValid: true
            };
        },
        matcher({ columnName, rowField }) {
            const regex = [/group/i, /groupname/i];

            return regex.some((regex) =>
                isStringMatch(
                    String(columnName).toLocaleLowerCase().trim(),
                    regex
                )
            );
        }
    },

    'Trip Start Date': {
        value: 'Trip Start Date',
        text: 'Trip Start Date',
        sortable: false,
        category: 'datePicker',
        inputType: 'date',
        align: 'start',
        headerIndex: null,
        alreadyMatched: false,
        disabled: false,
        validator(props) {
            const dateParser = props.dateParser;
            const parsedDate = dateParser ? dateParser(props.value) : null;
            const isValid = !!parsedDate && parsedDate.isValid();

            return {
                ...props,
                name: 'Trip Start Date',
                isValid
            };
        },
        matcher({ columnName, rowField }) {
            return matchHelper(
                {
                    regexIncludes: [/start/i, /date/i, /trip/i],
                    regexExcludes: [/end/i, /birth/i]
                },
                columnName
            );
        }
    },

    'Trip End Date': {
        value: 'Trip End Date',
        text: 'Trip End Date',
        category: 'datePicker',
        inputType: 'date',
        sortable: false,
        headerIndex: null,
        alreadyMatched: false,
        disabled: false,
        align: 'start',
        validator(props) {
            const dateParser = props.dateParser;
            const parsedDate = dateParser ? dateParser(props.value) : null;
            const isValid = !!parsedDate && parsedDate.isValid();

            return {
                ...props,
                name: 'Trip End Date',
                isValid
            };
        },
        matcher({ columnName, rowField }) {
            return matchHelper(
                {
                    regexIncludes: [/end/i, /date/i, /trip/i],
                    regexExcludes: [/start/i, /birth/i]
                },
                columnName
            );
        }
    }
});
