import * as XLSX from 'xlsx';
import { ref, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import Worker from '@/modules/policies/workers/parseExcelWorker?worker';

import {
    getColumnType,
    convertToLowercase,
    convertToTitleCase,
    getGenderByValue,
    getDateFields
} from '@/modules/policies/composables/helpers';
import { systemFields } from '@/modules/policies/composables/systemFields';

const plans = ref([]);
const policyTypes = ref([]);
const genders = ref([]);
const countries = ref([]);

const uploadedFile = ref(null);
const selectedWorkflow = ref(null);
const parsingFileData = ref(false);
const isNotSpreadsheet = ref(false);
const isFileEmpty = ref(false);
const isSheetOver = ref(false);
const fileSheets = ref({});
const availableSheetNames = ref([]);
const selectedSheet = ref(null);
const selectedSheetHeaders = ref({});
const previewRow = ref({});
const selectedSheetRows = ref([]);
const fields = ref(systemFields);
const tableRows = ref([]);

const hasInvalidData = ref(false);

export function useSmartTemplate() {
    const checkoutTime = computed(() => {
        const deadline = moment()
            .endOf('day')
            .set({ hour: 23, minute: 59, second: 0 });
        return deadline.format('MMMM D, YYYY, h:mm A [GMT]');
    });

    const unmatchedSystemFieldsCount = computed(
        () =>
            Object.values(fields.value).filter((field) => !field.alreadyMatched)
                .length
    );

    const invalidTableRows = computed(() =>
        tableRows.value.filter((row) => !row._valid)
    );

    const isPlanIgnored = computed(() => {
        const planField = fields.value.Plan;

        return planField && planField.headerIndex === -1;
    });

    const exportTemplateHeaders = computed(() => {
        return {
            plan: 'Plan',
            first_name: 'First Name',
            last_name: 'Last Name',
            resident_country: 'Country of Residence',
            destination_country: 'Country of Destination',
            nationality: 'Nationality',
            type: 'Type',
            email: 'Email Address',
            gender: 'Gender',
            date_of_birth: 'Date of Birth',
            passport_number: 'Passport Number',
            student_number: 'Student Number',
            group_name: 'Group Name',
            start_date: 'Trip Start Date',
            end_date: 'Trip End Date'
        };
    });

    function setMetadata(
        availablePlans = [],
        availablePolicyTypes = [],
        availableGenders = [],
        availableCountries = []
    ) {
        plans.value = availablePlans;
        policyTypes.value = availablePolicyTypes;
        genders.value = availableGenders;
        countries.value = availableCountries;
    }

    function resetSystemFields() {
        for (const systemField of Object.values(fields.value)) {
            systemField.headerIndex = null;
            systemField.disabled = false;
            systemField.alreadyMatched = false;

            if ('manuallyMatched' in systemField) {
                delete systemField.manuallyMatched;
            }
        }
    }

    function getCountryId(countries, countryName) {
        const normalizedCountryName = countryName.toLowerCase();

        const country = countries.find(
            (country) =>
                country.id.toLowerCase() === normalizedCountryName ||
                country.name.toLowerCase() === normalizedCountryName
        );

        return country ? country.id : null;
    }

    function getPolicyTypeByName(policyTypes, typeName) {
        return policyTypes.find(
            (type) => type.name.toLowerCase() == typeName.toLowerCase()
        )?.id;
    }

    function getGenderTypeByName(genders, name) {
        const gender = genders.find(
            (gender) => gender.name.toLowerCase() == name.toLowerCase()
        )?.id;

        if (gender) {
            return gender;
        }

        return getGenderByValue(name);
    }

    function getPlanId(plans, name) {
        const selectedPlanName = String(name)
            .toLocaleLowerCase()
            .replace(' ', '');

        return plans.find(
            (plan) =>
                plan.name.toLocaleLowerCase().replace(' ', '') ==
                    selectedPlanName ||
                plan.description?.toLocaleLowerCase().replace(' ', '') ==
                    selectedPlanName
        )?.id;
    }

    function parseDateForEnrollment(date) {
        if (!date) {
            return null;
        }

        const dateObj = moment(
            date,
            ['DD/MM/YY', 'DD/MM/YYYY', 'DD/M/YYYY', 'DD.MM.YYYY'],
            true
        );
        if (dateObj.isValid()) {
            return dateObj;
        }

        for (const locale of ['en-gb', 'it', 'es', 'de']) {
            const result = moment(
                date,
                [
                    'DD/MMM/YY',
                    'DD MMM YYYY',
                    'DD/MMM/YYYY',
                    'DD.MMM.YYYY',
                    'DD. MMM YYYY'
                ],
                locale,
                true
            );

            if (result.isValid()) {
                return result;
            }
        }

        if (moment(date).isValid()) {
            return moment(date);
        }

        return null;
    }

    function convertDateString(dateParser, dateString) {
        const parsedDate = dateParser ? dateParser(dateString) : null;

        return parsedDate && parsedDate.isValid()
            ? parsedDate.format('YYYY-MM-DD')
            : '';
    }

    function parseAllData(data) {
        const newData = [];
        let rowObj = {};
        data.forEach((row) => {
            rowObj = {};
            rowObj.plan_id =
                row.Plan !== undefined
                    ? getPlanId(plans.value, row.Plan.value)
                    : '';
            rowObj.address =
                row['Destination Address'] !== undefined
                    ? convertToTitleCase(row['Destination Address'].value)
                    : '';
            rowObj.date_of_birth =
                row['Date of Birth'] !== undefined
                    ? convertDateString(
                          parseDateForEnrollment,
                          row['Date of Birth'].value
                      )
                    : '';
            rowObj.destination_country_id =
                row['Country of Destination'] !== undefined
                    ? getCountryId(
                          countries.value,
                          row['Country of Destination'].value
                      )
                    : '';
            rowObj.residence_country_id =
                row['Country of Residence'] !== undefined
                    ? getCountryId(
                          countries.value,
                          row['Country of Residence'].value
                      )
                    : '';
            rowObj.origin_country_id =
                row['Nationality'] !== undefined
                    ? getCountryId(countries.value, row['Nationality'].value)
                    : '';
            rowObj.email =
                row['Email Address'] !== undefined
                    ? convertToLowercase(row['Email Address'].value)
                    : '';
            rowObj.end_date =
                row['Trip End Date'] !== undefined
                    ? convertDateString(
                          parseDateForEnrollment,
                          row['Trip End Date'].value
                      )
                    : '';
            rowObj.first_name =
                row['First Name'] !== undefined
                    ? convertToTitleCase(row['First Name'].value)
                    : '';
            rowObj.gender_id =
                row.Gender !== undefined
                    ? getGenderTypeByName(genders.value, row.Gender.value)
                    : '';
            rowObj.applicant_type_id =
                row.Type !== undefined
                    ? getPolicyTypeByName(
                          policyTypes.value ?? [],
                          row.Type.value
                      )
                    : '';
            rowObj.group_name =
                row['Group Name'] !== undefined
                    ? convertToTitleCase(row['Group Name'].value)
                    : '';
            rowObj.last_name =
                row['Last Name'] !== undefined
                    ? convertToTitleCase(row['Last Name'].value)
                    : '';
            rowObj.passport_number =
                row['Passport Number'] !== undefined
                    ? String(row['Passport Number'].value)
                    : '';
            rowObj.start_date =
                row['Trip Start Date'] !== undefined
                    ? convertDateString(
                          parseDateForEnrollment,
                          row['Trip Start Date'].value
                      )
                    : '';
            rowObj.student_number =
                row['Student Number'] !== undefined
                    ? String(row['Student Number'].value)
                    : '';

            newData.push(rowObj);
        });

        return newData;
    }

    function parseFileData(inputFile) {
        uploadedFile.value = inputFile;
        parsingFileData.value = true;
        isNotSpreadsheet.value = false;
        resetSystemFields();

        const spreadsheetMimeTypes = [
            'application/vnd.ms-excel', // for .xls
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // for .xlsx
        ];

        if (!spreadsheetMimeTypes.includes(inputFile.type)) {
            isNotSpreadsheet.value = true;
            parsingFileData.value = false;
            return;
        }

        const xlsxWorker = new Worker();
        xlsxWorker.onmessage = (event) => {
            const data = event.data;
            const sheets = data.sheets;

            fileSheets.value = data.data;
            availableSheetNames.value = sheets;

            const sheet = sheets[0];
            if (
                fileSheets.value[sheet].length > 0 &&
                fileSheets.value[sheet].length < 5001
            ) {
                selectSheet(sheet);
            }
            if (fileSheets.value[sheet].length > 5000) {
                isSheetOver.value = true;
            }
            parsingFileData.value = false;
        };

        xlsxWorker.postMessage(inputFile);
    }

    function headerFoundInRow(values) {
        const headerValuesToSearch = [
            'plan',
            'student',
            'first',
            'name',
            'last',
            'gender',
            'country',
            'city',
            'state',
            'zip',
            'email',
            'start',
            'end',
            'destination',
            'birth',
            'address',
            'street',
            'nationality'
        ];

        const isInstructionRow = values.some((value) => {
            const text = String(value).toLowerCase();
            return text.split(/\s+/).length > 10 || text.length > 100;
        });

        if (isInstructionRow) {
            return false;
        }

        return (
            values.filter((value) =>
                headerValuesToSearch.some((searchKey) =>
                    String(value).toLowerCase().includes(searchKey)
                )
            ).length > 3
        );
    }

    function processHeaderAndRows(availableRows, index, offset = 0) {
        const dateFields = getDateFields();
        const row = availableRows[index];
        const newHeaders = {};
        const dateFieldKeys = [];

        Object.keys(row).forEach((key, index) => {
            const columnName = offset === 0 ? key : row[key];
            const rowField = previewRow.value[key];
            const match = getColumnType(
                {
                    rowField,
                    columnName
                },
                index
            );
            newHeaders[String(key)] = {
                original: columnName,
                match,
                index
            };

            if (dateFields.includes(match)) {
                dateFieldKeys.push(key);
            }
        });

        selectedSheetHeaders.value = newHeaders;
        selectedSheetRows.value = availableRows
            .slice(index + offset)
            .filter((row) => Object.keys(row).length > 1)
            .map((row) => {
                const formattedRow = { ...row };
                dateFieldKeys.forEach((key) => {
                    if (
                        formattedRow[key] &&
                        typeof formattedRow[key] === 'number'
                    ) {
                        const parsedDate = XLSX.SSF.parse_date_code(
                            formattedRow[key]
                        );
                        if (parsedDate) {
                            formattedRow[key] = `${String(
                                parsedDate.d
                            ).padStart(2, '0')}/${String(parsedDate.m).padStart(
                                2,
                                '0'
                            )}/${parsedDate.y}`;
                        }
                    }
                });
                return formattedRow;
            });

        previewRow.value = selectedSheetRows.value[0];
        if (selectedSheetRows.value.length === 0) {
            isFileEmpty.value = true;
            selectedSheet.value = null;
        } else {
            isFileEmpty.value = false;
        }
    }

    /**
     * Selects a sheet from the fileSheets object.
     * @param {string} sheetName
     */
    function selectSheet(sheetName) {
        if (fileSheets.value[sheetName].length < 1) {
            console.error('You cannot select an empty sheet!!');
            return;
        } else if (fileSheets.value[sheetName].length > 5000) {
            isSheetOver.value = true;
            return;
        } else {
            isSheetOver.value = false;
        }

        selectedSheet.value = sheetName;
        const _selectedSheetRows = fileSheets.value[selectedSheet.value];

        for (let index = 0; index < _selectedSheetRows.length; index++) {
            const row = _selectedSheetRows[index];

            if (index === 0) {
                const foundInHeader = headerFoundInRow(Object.keys(row));
                if (foundInHeader) {
                    processHeaderAndRows(_selectedSheetRows, index);
                    break;
                }
            }

            const foundInValues = headerFoundInRow(Object.values(row));
            if (foundInValues) {
                processHeaderAndRows(_selectedSheetRows, index, 1);
                break;
            }
        }
    }

    function setSystemField(field) {
        for (const systemField of Object.values(fields.value)) {
            if (systemField.headerIndex == field.index) {
                systemField.disabled = false;
                systemField.alreadyMatched = false;
                systemField.headerIndex = null;
            }

            if (systemField.value === field.match) {
                systemField.headerIndex = field.index;
                systemField.disabled = true;
                systemField.alreadyMatched = true;
                systemField.manuallyMatched = true;
            }
        }
    }

    function initializeTableRow(row) {
        for (const key in selectedSheetHeaders.value) {
            if (!(key in row)) {
                row[key] = '';
            }
        }
    }

    function applyPlan(plan) {
        tableRows.value.forEach((row) => {
            updateRowFieldValue(
                row._id,
                'Plan',
                plan?.description || plan?.name
            );
        });
    }

    function initializeMissingData(rows) {
        const requiredFields = [
            { field: 'Type', default: 'Student' },
            { field: 'Plan', default: '' },
            { field: 'First Name', default: '' },
            { field: 'Last Name', default: '' },
            { field: 'Passport Number', default: '' }
        ];

        requiredFields.forEach(({ field, default: defaultValue }) => {
            const fieldData = fields.value[field];

            if (fieldData.headerIndex === -1) {
                const value = defaultValue;
                const validator = fieldData.validator({
                    value,
                    plans: plans.value,
                    policyTypes: policyTypes.value,
                    dateParser: parseDateForEnrollment,
                    countries: countries.value,
                    genders: genders.value
                });

                rows.forEach((row) => {
                    row[field] = { ...validator, value };
                });
            }
        });

        return rows;
    }

    function prepareTableData() {
        const _rows = [];
        let _hasInvalidData = false;

        selectedSheetRows.value.forEach((row, rowIndex) => {
            initializeTableRow(row);

            const formattedRow = {
                _id: uuidv4(),
                _valid: true
            };
            let isValid = true;
            const rowValue = Object.values(row);

            Object.keys(row).forEach((_key, index) => {
                const key = String(_key);
                const value = getFormattedValue(row[_key]);
                const header = selectedSheetHeaders.value[key];

                if (header && header.match) {
                    let validator = null;
                    if (fields.value[header.match].validator) {
                        validator = fields.value[header.match].validator({
                            value,
                            row: rowValue,
                            plans: plans.value,
                            countries: countries.value,
                            genders: genders.value,
                            dateParser: parseDateForEnrollment,
                            policyTypes: policyTypes.value
                        });

                        if (!validator.isValid) {
                            isValid = false;
                        }
                    }

                    formattedRow[header.match] = {
                        ...validator,
                        value,
                        header
                    };
                } else {
                    const originalHeaderLabel = header.original;
                    formattedRow[
                        isAdditionalOptionalField(originalHeaderLabel)
                            ? originalHeaderLabel
                            : key
                    ] = { value, isValid: true };
                }
            });

            formattedRow._valid = isValid;

            if (!isValid) {
                _hasInvalidData = true;
            }

            _rows.push(formattedRow);
        });
        tableRows.value = initializeMissingData(_rows);

        hasInvalidData.value = _hasInvalidData;
    }

    function isAdditionalOptionalField(field) {
        const optionalFields = ['Destination Address'];

        return optionalFields.includes(field);
    }

    function updateRowFieldValue(rowId, field, value) {
        const index = tableRows.value.findIndex((_row) => _row._id === rowId);
        if (index === -1) return false;

        const row = tableRows.value[index];

        if (fields.value[field] && fields.value[field].validator) {
            const validationResult = fields.value[field].validator({
                ...row[field],
                value
            });
            if (!validationResult.isValid) {
                return false;
            }
        }

        row[field].value = value;

        if (fields.value[field].validator(row[field]).isValid == false) {
            return false;
        }

        if (fields.value[field] && fields.value[field].validator) {
            row[field] = {
                ...row[field],
                ...fields.value[field].validator(row[field]),
                isValid: true
            };
        }

        row._valid = Object.values(row).every(
            (field) => typeof field !== 'object' || field.isValid
        );

        tableRows.value[index] = row;
        return row[field];
    }

    function reset() {
        uploadedFile.value = null;
        selectedWorkflow.value = null;
        selectedSheet.value = null;
        fileSheets.value = {};
        availableSheetNames.value = [];
        selectedSheetHeaders.value = {};
        previewRow.value = {};
        selectedSheetRows.value = [];
        tableRows.value = [];
        hasInvalidData.value = false;
    }

    function getFormattedValue(value) {
        if (value === undefined) {
            return '';
        }

        if (value instanceof Date) {
            const date = moment(value);
            return date.isValid() ? date.format('DD MMM YYYY') : '';
        }

        return `${value}`.trim();
    }

    return {
        policyTypes,
        plans,
        countries,
        genders,
        checkoutTime,
        unmatchedSystemFieldsCount,
        selectedWorkflow,
        uploadedFile,
        parseFileData,
        isFileEmpty,
        parsingFileData,
        isNotSpreadsheet,
        fileSheets,
        selectedSheet,
        selectedSheetHeaders,
        previewRow,
        selectedSheetRows,
        availableSheetNames,
        selectSheet,
        setSystemField,
        prepareTableData,
        tableRows,
        setMetadata,
        parseAllData,
        parseDateForEnrollment,
        hasInvalidData,
        invalidTableRows,
        isSheetOver,
        updateRowFieldValue,
        reset,
        getFormattedValue,
        fields,
        isPlanIgnored,
        exportTemplateHeaders,
        applyPlan
    };
}
