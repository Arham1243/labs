import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

import { useGlobalStore } from '@/stores';
import * as PoliciesService from '../services/Policies.service';

export const usePoliciesStore = defineStore('PoliciesStore', () => {
    const globalStore = useGlobalStore();

    const orderFlowPages = {
        orders: 'Orders',
        carts: 'Carts',
        policies: 'Policies'
    };

    const client = ref(null);
    const businessUnit = ref(null);
    const contactSource = ref(null);
    const message = ref(null);
    const cart = ref(null);
    const order = ref(null);

    const exitOrderTo = ref(orderFlowPages.policies);
    const exitOrderToQuery = ref({});

    const tenantId = computed(() => client.value?.id);
    const cartId = computed(() => cart.value?.id);

    const isOrderDetailsIncomplete = computed(() => {
        if (!client.value || !businessUnit.value || !contactSource.value) {
            return true;
        }

        if (contactSource.value === 'message_center' && !message.value) {
            return true;
        }

        return false;
    });

    const isPayLater = computed(() => {
        return businessUnit.value?.billing_detail?.payment_type === 'later';
    });

    function setOrderDetails(
        selectedClient,
        selectedBusinessUnit,
        selectedContactSource,
        selectedMessage = null
    ) {
        client.value = selectedClient;
        businessUnit.value = selectedBusinessUnit;
        contactSource.value = selectedContactSource;
        message.value = selectedMessage;
    }

    function setCart(createdCart) {
        cart.value = createdCart;
    }

    function clearOrderDetails() {
        cart.value = null;
        client.value = null;
        businessUnit.value = null;
        contactSource.value = null;
        message.value = null;
        order.value = null;
    }

    const createCart = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await PoliciesService.createCart(payload);
            const data = res.data;
            setCart(data.data);
            return data;
        });
    };

    function getFormattedErrors(errors) {
        return Object.fromEntries(
            Object.entries(errors).map(([key, value]) => [
                key,
                value.messages?.length ? [value.messages[0]] : []
            ])
        );
    }

    const validateEnrollments = async (payload) => {
        try {
            const res = await PoliciesService.validateEnrollments(
                tenantId.value,
                cartId.value,
                payload
            );
            const enrollmentData = res.data.data[0];
            const errors = enrollmentData.errors;

            const rearrangedErrors = getFormattedErrors(errors);

            var isValid,
                isDuplicate = false;
            if (Object.keys(rearrangedErrors).length > 0) {
                globalStore.errors = rearrangedErrors;
                isValid = false;
                isDuplicate = enrollmentData.is_duplicate;
            } else {
                isValid = true;
                isDuplicate = false;
            }

            return {
                isValid,
                isDuplicate,
                duplicateEnrollment: enrollmentData.duplicate_enrollment
            };
        } catch (err) {
            throw err;
        }
    };

    const createEnrollments = async (enrollments) => {
        return globalStore.actionWrapper(async () => {
            const res = await PoliciesService.createEnrollments(
                tenantId.value,
                cartId.value,
                {
                    enrollments: enrollments,
                    business_unit_id: businessUnit.value
                        ? businessUnit.value.id
                        : null,
                    contact_source: contactSource.value
                        ? contactSource.value.id
                        : null
                }
            );
            return res.data;
        });
    };

    const updateEnrollment = (enrollmentId, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await PoliciesService.updateEnrollment(
                tenantId.value,
                cartId.value,
                enrollmentId,
                payload
            );
            return res.data;
        });
    };

    const deleteEnrollments = (enrollmentIds) => {
        return globalStore.actionWrapper(async () => {
            const res = await PoliciesService.deleteEnrollments(
                tenantId.value,
                cartId.value,
                enrollmentIds
            );
            return res.data;
        });
    };

    const deleteEnrollmentByPlan = (planId) => {
        return globalStore.actionWrapper(async () => {
            const res = await PoliciesService.deleteEnrollmentByPlan(
                tenantId.value,
                cartId.value,
                planId
            );
            return res.data;
        });
    };

    const changeEnrollmentsPlan = (newPlan, enrollmentIds) => {
        return globalStore.actionWrapper(async () => {
            const res = await PoliciesService.changeEnrollmentsPlan(
                tenantId.value,
                cartId.value,
                newPlan,
                enrollmentIds
            );
            return res.data;
        });
    };

    const replaceEnrollmentsPlan = (currentPlan, newPlan) => {
        return globalStore.actionWrapper(async () => {
            const res = await PoliciesService.replaceEnrollmentsPlan(
                tenantId.value,
                cartId.value,
                currentPlan,
                newPlan
            );
            return res.data;
        });
    };

    const searchEnrollments = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await PoliciesService.searchEnrollments(
                tenantId.value,
                cartId.value,
                payload,
                params
            );
            return res.data;
        });
    };

    const getCart = async (clientId, cartId) => {
        return await globalStore.actionWrapper(async () => {
            const response = await PoliciesService.getCart(clientId, cartId);
            return response.data;
        });
    };

    const getOrder = async (orderId) => {
        return await globalStore.actionWrapper(async () => {
            const response = await PoliciesService.getOrder(orderId);
            return response.data;
        });
    };

    const getCartOverview = async () => {
        return await globalStore.actionWrapper(async () => {
            const response = await PoliciesService.getCartOverview(
                tenantId.value,
                cartId.value
            );
            return response.data;
        });
    };

    const searchPolicies = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            try {
                const res = await PoliciesService.searchPolicies(
                    payload,
                    params
                );
                return res.data;
            } catch (e) {
                throw e;
            }
        });
    };

    const getPolicy = (clientId, policyId) => {
        return globalStore.actionWrapper(async () => {
            const res = await PoliciesService.getPolicy(clientId, policyId);
            return res.data;
        });
    };

    const generatePolicyDocument = (clientId, policyId, documentId) => {
        return globalStore.actionWrapper(async () => {
            const res = await PoliciesService.generatePolicyDocument(
                clientId,
                policyId,
                documentId
            );
            return res.data;
        });
    };

    const generatePolicyZipPackage = (clientId, policyId, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await PoliciesService.generatePolicyZipPackage(
                clientId,
                policyId,
                payload
            );

            return res.blob();
        });
    };

    const sendDocumentEmail = (clientId, policyId, payload) => {
        return globalStore.actionWrapper(async () => {
            await PoliciesService.sendDocumentEmail(
                clientId,
                policyId,
                payload
            );
        });
    };

    const searchEnrollmentTypes = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            try {
                const res = await PoliciesService.searchEnrollmentTypes(
                    payload,
                    params
                );
                return res.data;
            } catch (e) {
                throw e;
            }
        });
    };

    function setOrder(_order) {
        order.value = _order;
    }

    const setExitOrderTo = (pageOfOrigin, query = {}) => {
        exitOrderTo.value = pageOfOrigin;
        exitOrderToQuery.value = query;
    };

    return {
        client,
        businessUnit,
        contactSource,
        message,
        cart,
        isOrderDetailsIncomplete,
        isPayLater,
        setOrderDetails,
        setCart,
        clearOrderDetails,
        createCart,
        getFormattedErrors,
        validateEnrollments,
        createEnrollments,
        updateEnrollment,
        deleteEnrollments,
        deleteEnrollmentByPlan,
        changeEnrollmentsPlan,
        replaceEnrollmentsPlan,
        searchEnrollments,
        getCart,
        getCartOverview,
        searchPolicies,
        getPolicy,
        generatePolicyDocument,
        generatePolicyZipPackage,
        sendDocumentEmail,
        getOrder,
        searchEnrollmentTypes,
        setOrder,
        order,
        setExitOrderTo,
        exitOrderTo,
        exitOrderToQuery,
        orderFlowPages
    };
});
