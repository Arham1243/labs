import { computed } from 'vue';
import lodash from 'lodash';

export function useEmptyFields(originalObject, comparedObject) {
    const normalizeEmptyValues = (obj) => {
        const result = lodash.cloneDeep(obj);
        const processObject = (object) => {
            if (!object || typeof object !== 'object') return;
            Object.keys(object).forEach((key) => {
                const value = object[key];
                if (value === null || value === undefined || value === '') {
                    object[key] = '';
                } else if (value === 0) {
                } else if (typeof value === 'object' && !Array.isArray(value)) {
                    if (!value || Object.keys(value).length === 0) {
                        object[key] = null;
                    } else if (key === 'province' || key === 'country') {
                        if (!value.id) {
                            object[key] = null;
                        }
                    } else {
                        processObject(value);
                    }
                } else if (Array.isArray(value)) {
                    value.forEach((item) => {
                        if (typeof item === 'object') {
                            processObject(item);
                        }
                    });
                }
            });
        };

        processObject(result);
        return result;
    };

    const normalizeObjectReferences = (obj) => {
        if (!obj) return obj;

        const result = lodash.cloneDeep(obj);

        if (
            result.province === undefined ||
            result.province === null ||
            (typeof result.province === 'object' && !result.province.id)
        ) {
            result.province = null;
        }

        if (result.location_details) {
            if (
                result.location_details.province === undefined ||
                result.location_details.province === null ||
                (typeof result.location_details.province === 'object' &&
                    !result.location_details.province.id)
            ) {
                result.location_details.province = null;
            }
        }

        return result;
    };

    const isNotChanged = computed(() => {
        if (!originalObject.value || !comparedObject.value) return true;

        const normalizedOriginalRefs = normalizeObjectReferences(
            originalObject.value
        );
        const normalizedComparedRefs = normalizeObjectReferences(
            comparedObject.value
        );

        const normalizedOriginal = normalizeEmptyValues(normalizedOriginalRefs);
        const normalizedCompared = normalizeEmptyValues(normalizedComparedRefs);

        return lodash.isEqual(normalizedOriginal, normalizedCompared);
    });

    const resetToOriginal = () => {
        comparedObject.value = lodash.cloneDeep(originalObject.value);
    };

    return {
        isNotChanged,
        resetToOriginal
    };
}
